import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const status = JSON.parse(execFileSync('supabase', ['--workdir', 'integration', 'status', '-o', 'json'], {
  encoding: 'utf8',
}));
const url = status.API_URL || status.api_url;
const anonKey = status.ANON_KEY || status.anon_key;
const serviceKey = status.SERVICE_ROLE_KEY || status.service_role_key;
assert.ok(url && anonKey && serviceKey, 'Local Supabase API credentials are unavailable');

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
const testId = crypto.randomUUID();
const password = `Sales-${crypto.randomUUID()}!`;

async function account(role) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signUp({
    email: `${role}-${testId}@example.test`, password,
  });
  assert.ifError(error);
  assert.ok(data.user?.id && data.session?.access_token, `${role} did not receive a session`);
  return { client, id: data.user.id };
}

async function ok(promise, label) {
  const result = await promise;
  assert.ifError(result.error, label);
  return result.data;
}

const seller = await account('seller');
const buyer = await account('buyer');
const outsider = await account('outsider');
const staff = await account('staff');
const manager = await account('manager');
const secondManager = await account('second-manager');
await ok(admin.from('sale_staff').insert({ user_id: staff.id, role: 'reviewer' }), 'staff provisioning');
await ok(admin.from('sale_staff').insert([{ user_id: manager.id, role: 'manager' }, { user_id: secondManager.id, role: 'manager' }]), 'manager provisioning');

const property = await ok(seller.client.from('properties').insert({
  seller_id: seller.id, title: 'Integration sale', price: 1000000,
  country: 'Egypt', state: 'Cairo', property_type: 'sale', seller_phone: '01000000000',
}).select('property_id,review_status,seller_phone').single(), 'create sale listing');
assert.equal(property.review_status, 'pending');
assert.equal(property.seller_phone, null);
const propertyId = property.property_id;

const publicListing = await ok(publicClient.from('properties').select('property_id').eq('property_id', propertyId), 'anonymous listing read');
assert.equal(publicListing.length, 0, 'Pending sale leaked publicly');
const privatePhone = await ok(outsider.client.from('seller_contacts').select('phone').eq('property_id', propertyId), 'outsider phone read');
assert.equal(privatePhone.length, 0, 'Seller phone leaked');
const ownPhone = await ok(seller.client.from('seller_contacts').select('phone').eq('property_id', propertyId), 'seller phone read');
assert.equal(ownPhone[0]?.phone, '01000000000');

const authorityPath = `${propertyId}/${seller.id}/authority.pdf`;
await ok(seller.client.storage.from('listing-authority').upload(authorityPath, Buffer.from('test evidence'), {
  contentType: 'application/pdf',
}), 'authority upload');
const authority = await ok(seller.client.from('listing_authority_documents').insert({
  property_id: propertyId, owner_id: seller.id, object_path: authorityPath,
}).select('id').single(), 'authority record');
const outsiderAuthority = await ok(outsider.client.from('listing_authority_documents').select('id').eq('id', authority.id), 'outsider authority read');
assert.equal(outsiderAuthority.length, 0);
await ok(staff.client.rpc('review_listing_authority', { p_document: authority.id, p_approved: true, p_note: 'Seller authority reviewed' }), 'review authority');
await ok(staff.client.rpc('review_sale_listing', { p_property: propertyId, p_approved: true }), 'approve sale listing');
const approvedListing = await ok(publicClient.from('properties').select('property_id,seller_phone').eq('property_id', propertyId).single(), 'approved listing read');
assert.equal(approvedListing.property_id, propertyId);
assert.equal(approvedListing.seller_phone, null);

const conversation = await ok(buyer.client.from('property_conversations').insert({
  property_id: propertyId, seeker_id: buyer.id, seller_id: seller.id,
}).select('id').single(), 'create conversation');
const dealId = await ok(buyer.client.rpc('propose_sale_deal', {
  p_conversation: conversation.id, p_price: 950000, p_conditions: 'Subject to title review',
  p_expires_at: new Date(Date.now() + 86400000).toISOString(),
}), 'propose offer');
const outsiderDeal = await ok(outsider.client.from('sale_deals').select('id').eq('id', dealId), 'outsider deal read');
assert.equal(outsiderDeal.length, 0);
const outsiderAccept = await outsider.client.rpc('accept_sale_deal', { p_deal: dealId, p_version: 1 });
assert.ok(outsiderAccept.error, 'Outsider accepted offer');
await ok(buyer.client.rpc('accept_sale_deal', { p_deal: dealId, p_version: 1 }), 'buyer acceptance');
await ok(seller.client.rpc('accept_sale_deal', { p_deal: dealId, p_version: 1 }), 'seller acceptance');
const accepted = await ok(buyer.client.from('sale_deals').select('status').eq('id', dealId).single(), 'accepted deal read');
assert.equal(accepted.status, 'accepted');

const documentPath = `${dealId}/${buyer.id}/identity.pdf`;
await ok(buyer.client.storage.from('sale-documents').upload(documentPath, Buffer.from('test identity'), {
  contentType: 'application/pdf',
}), 'deal document upload');
const document = await ok(buyer.client.from('sale_documents').insert({
  deal_id: dealId, uploaded_by: buyer.id, kind: 'identity', object_path: documentPath,
}).select('id').single(), 'document record');
const outsiderDocuments = await ok(outsider.client.from('sale_documents').select('id').eq('id', document.id), 'outsider document read');
assert.equal(outsiderDocuments.length, 0);
const staffDocuments = await ok(staff.client.from('sale_documents').select('id').eq('id', document.id), 'staff document read');
assert.equal(staffDocuments.length, 1);
const outsiderDownload = await outsider.client.storage.from('sale-documents').createSignedUrl(documentPath, 60);
assert.ok(outsiderDownload.error, 'Outsider obtained a document URL');
await ok(staff.client.rpc('review_sale_document', { p_document: document.id, p_approved: true, p_note: 'Identity reviewed' }), 'document review');

async function approvedEvidence(owner, kind) {
  const path = `${dealId}/${owner.id}/${kind}-${crypto.randomUUID()}.pdf`;
  await ok(owner.client.storage.from('sale-documents').upload(path, Buffer.from('test evidence'), { contentType: 'application/pdf' }), `${kind} upload`);
  const row = await ok(owner.client.from('sale_documents').insert({ deal_id: dealId, uploaded_by: owner.id, kind, object_path: path }).select('id').single(), `${kind} record`);
  await ok(staff.client.rpc('review_sale_document', { p_document: row.id, p_approved: true, p_note: `${kind} reviewed` }), `${kind} review`);
}
for (const kind of ['identity', 'seller_authority', 'title', 'encumbrance', 'agreement']) await approvedEvidence(seller, kind);
await ok(staff.client.rpc('advance_sale_review', { p_deal: dealId, p_next: 'reviewing' }), 'start review');
await ok(staff.client.rpc('advance_sale_review', { p_deal: dealId, p_next: 'ready_for_partner' }), 'finish review');
const outsiderStart = await outsider.client.rpc('start_sale_simulation', { p_deal: dealId });
assert.ok(outsiderStart.error, 'Outsider started a simulation');
await ok(staff.client.rpc('start_sale_simulation', { p_deal: dealId }), 'start demo');
const forgedDemo = await buyer.client.from('sale_simulations').update({ state: 'demo_released' }).eq('deal_id', dealId);
assert.ok(forgedDemo.error, 'Buyer changed demo state directly');
const outsiderDemo = await ok(outsider.client.from('sale_simulations').select('deal_id').eq('deal_id', dealId), 'outsider demo read');
assert.equal(outsiderDemo.length, 0);
const failedKey = crypto.randomUUID();
assert.equal(await ok(buyer.client.rpc('simulate_sale_payment', { p_deal: dealId, p_event_key: failedKey, p_outcome: 'failure' }), 'failed demo payment'), 'payment_failed');
assert.equal(await ok(buyer.client.rpc('simulate_sale_payment', { p_deal: dealId, p_event_key: failedKey, p_outcome: 'failure' }), 'duplicate demo payment'), 'payment_failed');
const successfulKey = crypto.randomUUID();
assert.equal(await ok(buyer.client.rpc('simulate_sale_payment', { p_deal: dealId, p_event_key: successfulKey, p_outcome: 'success' }), 'demo funding'), 'demo_held');
const lateFailure = await buyer.client.rpc('simulate_sale_payment', { p_deal: dealId, p_event_key: crypto.randomUUID(), p_outcome: 'failure' });
assert.ok(lateFailure.error, 'Delayed failure changed held demo');
const earlyRelease = await staff.client.rpc('request_sale_simulation_outcome', { p_deal: dealId, p_action: 'release' });
assert.ok(earlyRelease.error, 'Release skipped registration and handover');
const dispute = await ok(buyer.client.from('sale_disputes').insert({ deal_id: dealId, opened_by: buyer.id, reason: 'Please investigate this simulated sale before any outcome.' }).select('id').single(), 'open dispute');
const disputedRefund = await staff.client.rpc('request_sale_simulation_outcome', { p_deal: dealId, p_action: 'refund' });
assert.ok(disputedRefund.error, 'Open dispute did not hold demo funds');
await ok(staff.client.rpc('resolve_sale_dispute', { p_dispute: dispute.id, p_resolution: 'Reviewed the demonstration and agreed to refund.' }), 'resolve dispute');
await ok(staff.client.rpc('request_sale_simulation_outcome', { p_deal: dealId, p_action: 'refund' }), 'request demo refund');
const reviewerApprove = await staff.client.rpc('approve_sale_simulation_outcome', { p_deal: dealId, p_action: 'refund' });
assert.ok(reviewerApprove.error, 'Reviewer approved refund as manager');
assert.equal(await ok(manager.client.rpc('approve_sale_simulation_outcome', { p_deal: dealId, p_action: 'refund' }), 'first manager approval'), 1);
assert.equal(await ok(manager.client.rpc('approve_sale_simulation_outcome', { p_deal: dealId, p_action: 'refund' }), 'duplicate manager approval'), 1);
assert.equal(await ok(secondManager.client.rpc('approve_sale_simulation_outcome', { p_deal: dealId, p_action: 'refund' }), 'second manager approval'), 2);
const refunded = await ok(buyer.client.from('sale_simulations').select('state,amount_egp,seller_fee_egp,seller_net_egp').eq('deal_id', dealId).single(), 'read refund');
assert.equal(refunded.state, 'demo_refunded');
assert.equal(Number(refunded.amount_egp), Number(refunded.seller_fee_egp) + Number(refunded.seller_net_egp));
const reconciliation = await ok(buyer.client.rpc('reconcile_sale_simulation', { p_deal: dealId }), 'reconcile demo');
assert.equal(reconciliation.balanced, true);
assert.equal(reconciliation.real_money_moved, false);
const realMoney = await ok(admin.from('sale_payment_references').select('id').eq('deal_id', dealId), 'read real payment references');
assert.equal(realMoney.length, 0, 'Demo wrote a real payment reference');

// A separate synthetic case exercises the evidence-gated release branch.
const releaseProperty = await ok(admin.from('properties').insert({
  seller_id: seller.id, title: 'Release demonstration', price: 500000,
  country: 'Egypt', state: 'Cairo', property_type: 'sale', review_status: 'approved',
}).select('property_id').single(), 'seed release property');
const releaseConversation = await ok(admin.from('property_conversations').insert({
  property_id: releaseProperty.property_id, seeker_id: buyer.id, seller_id: seller.id,
}).select('id').single(), 'release conversation');
const releaseDeal = await ok(admin.from('sale_deals').insert({
  conversation_id: releaseConversation.id, property_id: releaseProperty.property_id,
  buyer_id: buyer.id, seller_id: seller.id, status: 'ready_for_partner',
  price_egp: 500000, conditions: 'Synthetic registration and handover',
  expires_at: new Date(Date.now() + 86400000).toISOString(),
}).select('id').single(), 'seed reviewed release deal');
await ok(staff.client.rpc('start_sale_simulation', { p_deal: releaseDeal.id }), 'start release demo');
await ok(buyer.client.rpc('simulate_sale_payment', {
  p_deal: releaseDeal.id, p_event_key: crypto.randomUUID(), p_outcome: 'success',
}), 'fund release demo');
for (const kind of ['registration', 'handover']) {
  await ok(admin.from('sale_documents').insert({
    deal_id: releaseDeal.id, uploaded_by: seller.id, kind,
    object_path: `${releaseDeal.id}/${seller.id}/${kind}.pdf`,
    review_status: 'approved', reviewed_by: staff.id,
  }), `seed reviewed ${kind}`);
}
await ok(staff.client.rpc('request_sale_simulation_outcome', { p_deal: releaseDeal.id, p_action: 'release' }), 'request release demo');
assert.equal(await ok(manager.client.rpc('approve_sale_simulation_outcome', { p_deal: releaseDeal.id, p_action: 'release' }), 'approve release 1'), 1);
assert.equal(await ok(secondManager.client.rpc('approve_sale_simulation_outcome', { p_deal: releaseDeal.id, p_action: 'release' }), 'approve release 2'), 2);
const released = await ok(buyer.client.from('sale_simulations').select('state').eq('deal_id', releaseDeal.id).single(), 'read release');
assert.equal(released.state, 'demo_released');

const paymentWrite = await buyer.client.from('sale_payment_references').insert({
  deal_id: dealId, provider: 'fake', provider_reference: 'fake', state: 'funded', amount_egp: 950000,
});
assert.ok(paymentWrite.error, 'Browser forged a payment state');
const listingAudit = await ok(staff.client.from('listing_events').select('event_type').eq('property_id', propertyId), 'staff listing audit');
assert.ok(listingAudit.some((event) => event.event_type === 'authority_reviewed'));
assert.ok(listingAudit.some((event) => event.event_type === 'listing_review_changed'));

console.log('Real Supabase Auth, Storage, RLS, offer, staff review, and payment guard checks passed.');
