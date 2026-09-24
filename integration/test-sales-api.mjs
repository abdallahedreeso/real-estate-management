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
await ok(admin.from('sale_staff').insert({ user_id: staff.id, role: 'reviewer' }), 'staff provisioning');

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

const paymentWrite = await buyer.client.from('sale_payment_references').insert({
  deal_id: dealId, provider: 'fake', provider_reference: 'fake', state: 'funded', amount_egp: 950000,
});
assert.ok(paymentWrite.error, 'Browser forged a payment state');
const listingAudit = await ok(staff.client.from('listing_events').select('event_type').eq('property_id', propertyId), 'staff listing audit');
assert.ok(listingAudit.some((event) => event.event_type === 'authority_reviewed'));
assert.ok(listingAudit.some((event) => event.event_type === 'listing_review_changed'));

console.log('Real Supabase Auth, Storage, RLS, offer, staff review, and payment guard checks passed.');
