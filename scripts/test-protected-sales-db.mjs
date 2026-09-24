import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db = new PGlite();
const migration = readFileSync(new URL('../supabase/migrations/20260924074555_protected_sales_foundation.sql', import.meta.url),'utf8');
try {
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create schema storage; create schema app_private;
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
 create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1, '/') $$;
 create table public.properties (property_id uuid primary key default gen_random_uuid(), seller_id text not null, property_type text not null, seller_phone text not null, price numeric, address text, is_available boolean default true);
 create table public.property_conversations (id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(property_id), seeker_id text not null, seller_id text not null);
 create table storage.buckets(id text primary key, name text not null, public boolean, file_size_limit bigint, allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
 alter table storage.objects enable row level security;
 alter table public.properties enable row level security;
 create policy base_read on public.properties for select to anon,authenticated using (true);
 grant select,insert,update,delete on public.properties, public.property_conversations to authenticated;
 grant select on public.properties to anon;
 grant usage on schema auth,storage,app_private to authenticated,anon;
 grant execute on all functions in schema auth,storage to authenticated,anon;
 grant select,insert,delete on storage.objects to authenticated;
 `);
 await db.exec(migration);
 console.log('MIGRATION_OK');
 const property = (await db.query(`insert into public.properties(seller_id,property_type,seller_phone,price,address) values ('seller','sale','01000000000',1000000,'Cairo') returning property_id,review_status,seller_phone`)).rows[0];
 if (property.review_status !== 'pending' || property.seller_phone !== null) throw new Error('New sale review or phone redaction failed');
 const propertyId = property.property_id;
 const conversation = (await db.query(`insert into public.property_conversations(property_id,seeker_id,seller_id) values ($1,'buyer','seller') returning id`,[propertyId])).rows[0].id;
 async function as(sub,sql,params=[]) { await db.exec(`set role authenticated; select set_config('request.jwt.claims', '{"sub":"${sub}"}', false);`); try { return await db.query(sql,params); } finally { await db.exec('reset role;'); } }
 const outsiderListing = await as('outsider',`select property_id from public.properties where property_id=$1`,[propertyId]);
 if (outsiderListing.rows.length !== 0) throw new Error('Pending sale visible to outsider');
 const sellerListing = await as('seller',`select property_id from public.properties where property_id=$1`,[propertyId]);
 if (sellerListing.rows.length !== 1) throw new Error('Seller cannot see pending sale');
 const outsiderPhone = await as('outsider',`select * from public.seller_contacts where property_id=$1`,[propertyId]);
 if (outsiderPhone.rows.length !== 0) throw new Error('Seller phone exposed to outsider');
 const sellerPhone = await as('seller',`select phone from public.seller_contacts where property_id=$1`,[propertyId]);
 if (sellerPhone.rows[0]?.phone !== '01000000000') throw new Error('Seller cannot see private phone');
 console.log('LISTING_RLS_OK');
 await db.query(`update public.properties set review_status='approved' where property_id=$1`,[propertyId]);
 const deal = (await as('buyer',`select public.propose_sale_deal($1,950000,'Subject to title review',now()+ interval '7 days') as id`,[conversation])).rows[0].id;
 const outsiderDeal = await as('outsider',`select id from public.sale_deals where id=$1`,[deal]);
 if (outsiderDeal.rows.length !== 0) throw new Error('Outsider can read deal');
 let denied=false; try { await as('outsider',`select public.accept_sale_deal($1,1)`,[deal]); } catch { denied=true; }
 if (!denied) throw new Error('Outsider accepted deal');
 await as('buyer',`select public.accept_sale_deal($1,1)`,[deal]);
 await as('seller',`select public.accept_sale_deal($1,1)`,[deal]);
 const accepted=(await db.query(`select status,buyer_accepted_version,seller_accepted_version from public.sale_deals where id=$1`,[deal])).rows[0];
 if (accepted.status !== 'accepted' || accepted.buyer_accepted_version !== 1 || accepted.seller_accepted_version !== 1) throw new Error('Mutual acceptance failed');
 console.log('DEAL_RLS_AND_ACCEPTANCE_OK');
 let staleDenied=false; try { await as('buyer',`select public.accept_sale_deal($1,0)`,[deal]); } catch { staleDenied=true; }
 if (!staleDenied) throw new Error('Stale offer version accepted');
 let auditDenied=false; try { await db.query(`update public.sale_events set event_type='tampered' where deal_id=$1`,[deal]); } catch { auditDenied=true; }
 if (!auditDenied) throw new Error('Audit event mutated');
 const paymentGrant=(await db.query(`select has_table_privilege('authenticated','public.sale_payment_references','INSERT') as allowed`)).rows[0].allowed;
 if (paymentGrant) throw new Error('Browser can write payment state');
 await as('outsider',`insert into public.listing_reports(property_id,reporter_id,reason,details) values ($1,'outsider','fraud','Test report with enough detail')`,[propertyId]);
 const another=(await db.query(`insert into public.properties(seller_id,property_type,seller_phone,price,address) values ('another','sale','01111111111',2000000,'Giza') returning property_id`)).rows[0].property_id;
 let spoofDenied=false; try { await as('outsider',`insert into public.listing_reports(property_id,reporter_id,reason,details) values ($1,'buyer','fraud','Test report with enough detail')`,[another]); } catch { spoofDenied=true; }
 if (!spoofDenied) throw new Error('Reporter spoofing allowed');
 const listingAudit=await as('seller',`select event_type from public.listing_events where property_id=$1 order by id`,[propertyId]);
 if (!listingAudit.rows.some((event) => event.event_type === 'listing_created') ||
     !listingAudit.rows.some((event) => event.event_type === 'listing_review_changed') ||
     !listingAudit.rows.some((event) => event.event_type === 'report_opened')) throw new Error('Listing audit is incomplete');
 const outsiderAudit=await as('outsider',`select id from public.listing_events where property_id=$1`,[propertyId]);
 if (outsiderAudit.rows.length !== 0) throw new Error('Listing audit exposed to outsider');
 let listingAuditMutationDenied=false; try { await db.query(`delete from public.listing_events where property_id=$1`,[propertyId]); } catch { listingAuditMutationDenied=true; }
 if (!listingAuditMutationDenied) throw new Error('Listing audit was deleted');
 console.log('AUDIT_PAYMENT_AND_REPORT_CONTROLS_OK');
 const competingConversation=(await db.query(`insert into public.property_conversations(property_id,seeker_id,seller_id) values ($1,'buyer2','seller') returning id`,[propertyId])).rows[0].id;
 const competingDeal=(await as('buyer2',`select public.propose_sale_deal($1,980000,'Subject to survey results',now()+ interval '7 days') as id`,[competingConversation])).rows[0].id;
 await as('buyer2',`select public.accept_sale_deal($1,1)`,[competingDeal]);
 let competingDenied=false; try { await as('seller',`select public.accept_sale_deal($1,1)`,[competingDeal]); } catch { competingDenied=true; }
 if (!competingDenied) throw new Error('Second accepted deal allowed for one property');
 const competingStatus=(await db.query(`select status from public.sale_deals where id=$1`,[competingDeal])).rows[0].status;
 if (competingStatus !== 'proposed') throw new Error('Failed acceptance changed competing deal');
 await db.query(`update public.sale_deals set expires_at=now()-interval '1 minute' where id=$1`,[competingDeal]);
 let expiredDenied=false; try { await as('buyer2',`select public.accept_sale_deal($1,1)`,[competingDeal]); } catch { expiredDenied=true; }
 if (!expiredDenied) throw new Error('Expired offer accepted');
 console.log('COMPETING_AND_EXPIRED_OFFERS_OK');
 await db.query(`insert into public.sale_staff(user_id,role) values ('reviewer','reviewer'),('manager','manager')`);
 let unauthorizedReviewDenied=false; try { await as('buyer',`select public.advance_sale_review($1,'reviewing')`,[deal]); } catch { unauthorizedReviewDenied=true; }
 if (!unauthorizedReviewDenied) throw new Error('Buyer advanced staff review');
 await as('reviewer',`select public.advance_sale_review($1,'reviewing')`,[deal]);
 let evidenceDenied=false; try { await as('reviewer',`select public.advance_sale_review($1,'ready_for_partner')`,[deal]); } catch { evidenceDenied=true; }
 if (!evidenceDenied) throw new Error('Partner-ready state allowed without reviewed evidence');
 const documentPath=`${deal}/buyer/identity.pdf`;
 await db.query(`insert into storage.objects(bucket_id,name) values ('sale-documents',$1)`,[documentPath]);
 const document=(await as('buyer',`insert into public.sale_documents(deal_id,uploaded_by,kind,object_path) values ($1,'buyer','identity',$2) returning id`,[deal,documentPath])).rows[0].id;
 let outsiderDocumentDenied=false; try { await as('outsider',`select id from public.sale_documents where id=$1`,[document]); } catch { outsiderDocumentDenied=true; }
 const outsiderDocumentRows=await as('outsider',`select id from public.sale_documents where id=$1`,[document]);
 if (outsiderDocumentDenied || outsiderDocumentRows.rows.length !== 0) throw new Error('Outsider read private document');
 await as('reviewer',`select public.review_sale_document($1,true,'Identity checked')`,[document]);
 const reviewed=(await db.query(`select review_status,reviewed_by from public.sale_documents where id=$1`,[document])).rows[0];
 if (reviewed.review_status !== 'approved' || reviewed.reviewed_by !== 'reviewer') throw new Error('Staff document review failed');
 const dispute=(await as('buyer',`insert into public.sale_disputes(deal_id,opened_by,reason) values ($1,'buyer','Title information needs further review') returning id`,[deal])).rows[0].id;
 let outsiderResolutionDenied=false; try { await as('outsider',`select public.resolve_sale_dispute($1,'Verified and resolved by staff')`,[dispute]); } catch { outsiderResolutionDenied=true; }
 if (!outsiderResolutionDenied) throw new Error('Outsider resolved dispute');
 await as('manager',`select public.resolve_sale_dispute($1,'Verified and resolved by staff')`,[dispute]);
 console.log('STAFF_DOCUMENT_AND_DISPUTE_CONTROLS_OK');
 let listingChangeDenied=false; try { await db.query(`update public.properties set price=800000 where property_id=$1`,[propertyId]); } catch { listingChangeDenied=true; }
 if (!listingChangeDenied) throw new Error('Accepted listing price changed');
 let listingDeleteDenied=false; try { await db.query(`delete from public.properties where property_id=$1`,[propertyId]); } catch { listingDeleteDenied=true; }
 if (!listingDeleteDenied) throw new Error('Accepted listing deleted');
 for (const [kind,uploader] of [['identity','seller'],['seller_authority','seller'],['title','seller'],['encumbrance','seller'],['agreement','buyer']]) {
  const path=`${deal}/${uploader}/${kind}.pdf`;
  await db.query(`insert into storage.objects(bucket_id,name) values ('sale-documents',$1)`,[path]);
  const id=(await as(uploader,`insert into public.sale_documents(deal_id,uploaded_by,kind,object_path) values ($1,$2,$3,$4) returning id`,[deal,uploader,kind,path])).rows[0].id;
  await as('reviewer',`select public.review_sale_document($1,true,'Evidence reviewed')`,[id]);
 }
 await as('reviewer',`select public.advance_sale_review($1,'ready_for_partner')`,[deal]);
 const readyStatus=(await db.query(`select status from public.sale_deals where id=$1`,[deal])).rows[0].status;
 if (readyStatus !== 'ready_for_partner') throw new Error('Reviewed deal did not reach partner-ready state');
 console.log('EVIDENCE_GATE_AND_LISTING_LOCK_OK');
 await db.query(`update public.sale_deals set status='release_pending' where id=$1`,[deal]);
 let closingEvidenceDenied=false; try { await as('manager',`select public.approve_sale_money_action($1,'release')`,[deal]); } catch { closingEvidenceDenied=true; }
 if (!closingEvidenceDenied) throw new Error('Release approval allowed without registration and handover evidence');
 for (const kind of ['registration','handover']) {
  const path=`${deal}/seller/${kind}.pdf`;
  await db.query(`insert into storage.objects(bucket_id,name) values ('sale-documents',$1)`,[path]);
  const id=(await as('seller',`insert into public.sale_documents(deal_id,uploaded_by,kind,object_path) values ($1,'seller',$2,$3) returning id`,[deal,kind,path])).rows[0].id;
  await as('reviewer',`select public.review_sale_document($1,true,'Closing evidence reviewed')`,[id]);
 }
 let buyerApprovalDenied=false; try { await as('buyer',`select public.approve_sale_money_action($1,'release')`,[deal]); } catch { buyerApprovalDenied=true; }
 if (!buyerApprovalDenied) throw new Error('Buyer approved release');
 const firstApproval=(await as('manager',`select public.approve_sale_money_action($1,'release') as count`,[deal])).rows[0].count;
 const duplicateApproval=(await as('manager',`select public.approve_sale_money_action($1,'release') as count`,[deal])).rows[0].count;
 if (firstApproval !== 1 || duplicateApproval !== 1) throw new Error('One manager counted twice');
 await db.query(`insert into public.sale_staff(user_id,role) values ('manager2','manager')`);
 const secondApproval=(await as('manager2',`select public.approve_sale_money_action($1,'release') as count`,[deal])).rows[0].count;
 if (secondApproval !== 2) throw new Error('Second manager approval was not counted');
 const paymentReferences=(await db.query(`select count(*)::integer as count from public.sale_payment_references`)).rows[0].count;
 if (paymentReferences !== 0) throw new Error('Test created a live payment reference');
 console.log('DUAL_APPROVAL_WITHOUT_PAYOUT_OK');
} catch(e) { console.error('MIGRATION_FAILED:',e.message); process.exitCode=1; } finally { await db.close(); }



