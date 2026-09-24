-- Protected sales are prepared on site. No client or database command can mark money as held.
create table public.sale_staff (
  user_id text primary key,
  role text not null check (role in ('reviewer', 'manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.sale_staff enable row level security;
revoke all on public.sale_staff from anon, authenticated;
grant select on public.sale_staff to authenticated;
create policy "Staff read their own role" on public.sale_staff for select to authenticated
using (user_id = (select auth.jwt()->>'sub'));

alter table public.properties add column review_status text not null default 'approved'
  check (review_status in ('pending', 'approved', 'rejected'));
alter table public.properties add column reviewed_at timestamptz;
alter table public.properties add column refreshed_at timestamptz not null default now();
alter table public.properties add column archived_at timestamptz;

create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(property_id),
  reporter_id text not null,
  reason text not null check (reason in ('fraud', 'duplicate', 'wrong_details', 'other')),
  details text not null check (length(btrim(details)) between 10 and 2000),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_by text,
  resolution_note text
);
create index listing_reports_status_idx on public.listing_reports(status, created_at);
alter table public.listing_reports enable row level security;
revoke all on public.listing_reports from anon, authenticated;
grant select, insert on public.listing_reports to authenticated;
create policy "Reporters and staff read reports" on public.listing_reports for select to authenticated
using (reporter_id = (select auth.jwt()->>'sub') or exists
  (select 1 from public.sale_staff s where s.user_id = (select auth.jwt()->>'sub') and s.active));
create policy "Members report listings" on public.listing_reports for insert to authenticated
with check (reporter_id = (select auth.jwt()->>'sub') and status = 'open' and reviewed_by is null and resolution_note is null
  and exists (select 1 from public.properties p where p.property_id = listing_reports.property_id and p.property_type = 'sale'));
create unique index one_open_listing_report_per_user on public.listing_reports(property_id, reporter_id) where status = 'open';

create table public.listing_authority_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(property_id),
  owner_id text not null,
  object_path text not null unique,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by text,
  review_note text,
  created_at timestamptz not null default now()
);
alter table public.listing_authority_documents enable row level security;
revoke all on public.listing_authority_documents from anon, authenticated;
grant select, insert on public.listing_authority_documents to authenticated;
create policy "Owner and staff read authority evidence" on public.listing_authority_documents for select to authenticated
using (owner_id = (select auth.jwt()->>'sub') or exists
  (select 1 from public.sale_staff s where s.user_id = (select auth.jwt()->>'sub') and s.active));
create policy "Owner uploads authority evidence" on public.listing_authority_documents for insert to authenticated
with check (owner_id = (select auth.jwt()->>'sub') and status = 'pending' and reviewed_by is null and review_note is null
  and object_path like property_id::text || '/' || owner_id || '/%'
  and exists (select 1 from public.properties p where p.property_id = listing_authority_documents.property_id and p.seller_id = listing_authority_documents.owner_id)
  and exists (select 1 from storage.objects o where o.bucket_id = 'listing-authority' and o.name = object_path));

create table public.listing_events (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(property_id),
  actor_id text not null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index listing_events_property_idx on public.listing_events(property_id, id);
alter table public.listing_events enable row level security;
revoke all on public.listing_events from anon, authenticated;
grant select on public.listing_events to authenticated;
create policy "Owner and staff read listing audit" on public.listing_events for select to authenticated
using (exists (select 1 from public.properties p where p.property_id = listing_events.property_id
  and p.seller_id = (select auth.jwt()->>'sub')) or exists
  (select 1 from public.sale_staff s where s.user_id = (select auth.jwt()->>'sub') and s.active));

create table public.sale_deals (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references public.property_conversations(id),
  property_id uuid not null references public.properties(property_id),
  buyer_id text not null,
  seller_id text not null,
  status text not null default 'proposed' check (status in
    ('proposed', 'accepted', 'reviewing', 'verification_failed', 'ready_for_partner',
     'awaiting_funding', 'funded', 'registration_pending', 'handover_pending',
     'release_pending', 'refund_pending', 'disputed', 'completed', 'refunded',
     'cancelled', 'expired')),
  offer_version integer not null default 1 check (offer_version > 0),
  price_egp numeric(16,2) not null check (price_egp > 0),
  conditions text not null check (length(btrim(conditions)) between 10 and 5000),
  expires_at timestamptz not null,
  seller_fee_bps integer not null default 100 check (seller_fee_bps between 0 and 1000),
  buyer_accepted_version integer,
  seller_accepted_version integer,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);
create unique index one_active_sale_per_property on public.sale_deals(property_id)
where status in ('accepted', 'reviewing', 'ready_for_partner', 'awaiting_funding',
  'funded', 'registration_pending', 'handover_pending', 'release_pending',
  'refund_pending', 'disputed');
create index sale_deals_buyer_idx on public.sale_deals(buyer_id, updated_at desc);
create index sale_deals_seller_idx on public.sale_deals(seller_id, updated_at desc);

create table public.sale_offer_versions (
  deal_id uuid not null references public.sale_deals(id),
  version integer not null,
  proposed_by text not null,
  price_egp numeric(16,2) not null,
  conditions text not null,
  expires_at timestamptz not null,
  seller_fee_bps integer not null,
  created_at timestamptz not null default now(),
  primary key (deal_id, version)
);
create table public.sale_events (
  id bigint generated always as identity primary key,
  deal_id uuid not null references public.sale_deals(id),
  actor_id text not null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index sale_events_deal_idx on public.sale_events(deal_id, id);

create table public.sale_documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.sale_deals(id),
  uploaded_by text not null,
  kind text not null check (kind in ('identity', 'seller_authority', 'title', 'encumbrance', 'agreement', 'registration', 'handover', 'other')),
  object_path text not null unique,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  review_note text,
  created_at timestamptz not null default now()
);
create index sale_documents_deal_idx on public.sale_documents(deal_id, created_at);
create table public.sale_disputes (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.sale_deals(id),
  opened_by text not null,
  reason text not null check (length(btrim(reason)) between 20 and 3000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  resolution text,
  created_at timestamptz not null default now()
);
create table public.sale_payment_references (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.sale_deals(id),
  provider text not null,
  provider_reference text not null,
  state text not null check (state in ('created', 'funded', 'held', 'released', 'refunded', 'failed')),
  amount_egp numeric(16,2) not null check (amount_egp > 0),
  created_at timestamptz not null default now(),
  unique (provider, provider_reference)
);
create table public.sale_payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_reference_id uuid not null references public.sale_payment_references(id),
  provider_event_id text not null unique,
  event_type text not null,
  amount_egp numeric(16,2),
  received_at timestamptz not null default now()
);
create table public.sale_money_approvals (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.sale_deals(id),
  action text not null check (action in ('release','refund')),
  staff_id text not null,
  created_at timestamptz not null default now(),
  unique (deal_id, action, staff_id)
);

-- Evidence and decisions are append-only, including for privileged API roles.
create function app_private.reject_sale_audit_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'Sale audit records are append-only';
end $$;
create trigger sale_offer_versions_append_only before update or delete on public.sale_offer_versions
for each row execute function app_private.reject_sale_audit_mutation();
create trigger sale_events_append_only before update or delete on public.sale_events
for each row execute function app_private.reject_sale_audit_mutation();
create trigger sale_payment_events_append_only before update or delete on public.sale_payment_events
for each row execute function app_private.reject_sale_audit_mutation();
create trigger listing_events_append_only before update or delete on public.listing_events
for each row execute function app_private.reject_sale_audit_mutation();

create function app_private.audit_listing_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare event_name text; event_details jsonb; listing_id uuid;
begin
  if tg_table_name = 'properties' then
    if new.property_type <> 'sale' then return new; end if;
    if tg_op = 'INSERT' then event_name := 'listing_created';
    elsif new.review_status is distinct from old.review_status then event_name := 'listing_review_changed';
    elsif new.archived_at is distinct from old.archived_at then event_name := 'listing_archived';
    elsif new.refreshed_at is distinct from old.refreshed_at then event_name := 'listing_refreshed';
    else return new; end if;
    listing_id := new.property_id;
    event_details := jsonb_build_object('review_status', new.review_status);
  elsif tg_table_name = 'listing_authority_documents' then
    if tg_op = 'INSERT' then event_name := 'authority_submitted';
    elsif new.status is distinct from old.status then event_name := 'authority_reviewed';
    else return new; end if;
    listing_id := new.property_id;
    event_details := jsonb_build_object('document_id',new.id,'status',new.status,'review_note',new.review_note);
  else
    if tg_op = 'INSERT' then event_name := 'report_opened';
    elsif new.status is distinct from old.status then event_name := 'report_reviewed';
    else return new; end if;
    listing_id := new.property_id;
    event_details := jsonb_build_object('report_id',new.id,'status',new.status,'resolution_note',new.resolution_note);
  end if;
  insert into public.listing_events(property_id,actor_id,event_type,details)
    values (listing_id,coalesce(auth.jwt()->>'sub','system'),event_name,event_details);
  return new;
end $$;
create trigger audit_listing_properties after insert or update on public.properties
for each row execute function app_private.audit_listing_change();
create trigger audit_listing_authority after insert or update on public.listing_authority_documents
for each row execute function app_private.audit_listing_change();
create trigger audit_listing_reports after insert or update on public.listing_reports
for each row execute function app_private.audit_listing_change();

do $$ declare relation_name text; begin
  foreach relation_name in array array['sale_deals','sale_offer_versions','sale_events','sale_documents','sale_disputes','sale_payment_references','sale_payment_events','sale_money_approvals'] loop
    execute format('alter table public.%I enable row level security', relation_name);
    execute format('revoke all on public.%I from anon, authenticated', relation_name);
    execute format('grant select on public.%I to authenticated', relation_name);
  end loop;
end $$;
grant insert on public.sale_documents, public.sale_disputes to authenticated;

create function app_private.sale_is_staff() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.sale_staff s where s.user_id = (select auth.jwt()->>'sub') and s.active)
$$;
create function app_private.sale_can_read(p_deal uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.sale_deals d where d.id = p_deal
    and ((select auth.jwt()->>'sub') in (d.buyer_id, d.seller_id) or app_private.sale_is_staff()))
$$;
revoke all on function app_private.sale_is_staff(), app_private.sale_can_read(uuid) from public, anon, authenticated;
grant usage on schema app_private to anon, authenticated;
grant execute on function app_private.sale_is_staff() to anon, authenticated;
grant execute on function app_private.sale_can_read(uuid) to authenticated;

create policy "Participants and staff read deals" on public.sale_deals for select to authenticated
using (buyer_id = (select auth.jwt()->>'sub') or seller_id = (select auth.jwt()->>'sub') or app_private.sale_is_staff());
create policy "Participants and staff read offers" on public.sale_offer_versions for select to authenticated
using (app_private.sale_can_read(deal_id));
create policy "Participants and staff read events" on public.sale_events for select to authenticated
using (app_private.sale_can_read(deal_id));
create policy "Participants and staff read documents" on public.sale_documents for select to authenticated
using (app_private.sale_can_read(deal_id));
create policy "Participants and staff add documents" on public.sale_documents for insert to authenticated
with check (uploaded_by = (select auth.jwt()->>'sub') and review_status = 'pending' and reviewed_by is null and review_note is null
  and app_private.sale_can_read(deal_id)
  and object_path like deal_id::text || '/' || uploaded_by || '/%'
  and exists (select 1 from storage.objects o where o.bucket_id = 'sale-documents' and o.name = object_path));
create policy "Participants and staff read disputes" on public.sale_disputes for select to authenticated
using (app_private.sale_can_read(deal_id));
create policy "Participants open disputes" on public.sale_disputes for insert to authenticated
with check (opened_by = (select auth.jwt()->>'sub') and status = 'open' and resolution is null
  and app_private.sale_can_read(deal_id));
create policy "Participants and staff read payment status" on public.sale_payment_references for select to authenticated
using (app_private.sale_can_read(deal_id));
create policy "Staff read payment events" on public.sale_payment_events for select to authenticated
using (app_private.sale_is_staff());
create policy "Staff read money approvals" on public.sale_money_approvals for select to authenticated
using (app_private.sale_is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sale-documents', 'sale-documents', false, 10485760,
  array['application/pdf','image/jpeg','image/png']) on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-authority', 'listing-authority', false, 10485760,
  array['application/pdf','image/jpeg','image/png']) on conflict (id) do nothing;
create policy "Deal members upload their own evidence" on storage.objects for insert to authenticated
with check (bucket_id = 'sale-documents' and app_private.sale_can_read((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2] = (select auth.jwt()->>'sub'));
create policy "Deal members read evidence" on storage.objects for select to authenticated
using (bucket_id = 'sale-documents' and app_private.sale_can_read((storage.foldername(name))[1]::uuid));
create policy "Owners upload authority evidence" on storage.objects for insert to authenticated
with check (bucket_id = 'listing-authority' and (storage.foldername(name))[2] = (select auth.jwt()->>'sub')
  and exists (select 1 from public.properties p where p.property_id = (storage.foldername(name))[1]::uuid
    and p.seller_id = (select auth.jwt()->>'sub')));
create policy "Owners and staff read authority evidence" on storage.objects for select to authenticated
using (bucket_id = 'listing-authority' and (exists
  (select 1 from public.properties p where p.property_id = (storage.foldername(name))[1]::uuid
    and p.seller_id = (select auth.jwt()->>'sub')) or app_private.sale_is_staff()));
create policy "Uploader removes unused deal evidence" on storage.objects for delete to authenticated
using (bucket_id = 'sale-documents' and (storage.foldername(name))[2] = (select auth.jwt()->>'sub')
  and app_private.sale_can_read((storage.foldername(name))[1]::uuid)
  and not exists (select 1 from public.sale_documents d where d.object_path = name));
create policy "Owner removes unused authority upload" on storage.objects for delete to authenticated
using (bucket_id = 'listing-authority' and (storage.foldername(name))[2] = (select auth.jwt()->>'sub')
  and not exists (select 1 from public.listing_authority_documents d where d.object_path = name));

create function public.propose_sale_deal(p_conversation uuid, p_price numeric, p_conditions text, p_expires_at timestamptz)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.property_conversations%rowtype; d public.sale_deals%rowtype; actor text := auth.jwt()->>'sub';
begin
  if actor is null then raise exception 'Sign in required'; end if;
  select * into c from public.property_conversations where id = p_conversation;
  if not found or actor not in (c.seeker_id, c.seller_id) then raise exception 'Conversation unavailable'; end if;
  if p_price <= 0 or p_price > 99999999999999 or length(btrim(p_conditions)) not between 10 and 5000
    or p_expires_at <= now() or p_expires_at > now() + interval '90 days' then raise exception 'Invalid offer'; end if;
  if not exists (select 1 from public.properties p where p.property_id = c.property_id
    and p.property_type = 'sale' and p.is_available and p.review_status = 'approved' and p.archived_at is null
    and p.refreshed_at > now() - interval '90 days') then
    raise exception 'Sale listing is not approved and available'; end if;
  update public.sale_deals set status = 'expired', updated_at = now()
    where property_id = c.property_id and status = 'proposed' and expires_at <= now();
  select * into d from public.sale_deals where conversation_id = p_conversation for update;
  if found then
    if d.status not in ('proposed', 'expired', 'cancelled', 'verification_failed') then raise exception 'Deal terms are locked'; end if;
    update public.sale_deals set offer_version = d.offer_version + 1, price_egp = p_price,
      conditions = btrim(p_conditions), expires_at = p_expires_at, status = 'proposed',
      buyer_accepted_version = null, seller_accepted_version = null, accepted_at = null, updated_at = now()
      where id = d.id returning * into d;
  else
    insert into public.sale_deals(conversation_id, property_id, buyer_id, seller_id, price_egp, conditions, expires_at)
    values (c.id, c.property_id, c.seeker_id, c.seller_id, p_price, btrim(p_conditions), p_expires_at)
    returning * into d;
  end if;
  insert into public.sale_offer_versions(deal_id, version, proposed_by, price_egp, conditions, expires_at, seller_fee_bps)
  values (d.id, d.offer_version, actor, d.price_egp, d.conditions, d.expires_at, d.seller_fee_bps);
  insert into public.sale_events(deal_id, actor_id, event_type, details)
  values (d.id, actor, 'offer_proposed', jsonb_build_object('version',d.offer_version));
  return d.id;
end $$;
create function public.accept_sale_deal(p_deal uuid, p_version integer)
returns void language plpgsql security definer set search_path = '' as $$
declare d public.sale_deals%rowtype; actor text := auth.jwt()->>'sub';
begin
  select * into d from public.sale_deals where id = p_deal for update;
  if not found or actor not in (d.buyer_id, d.seller_id) then raise exception 'Deal unavailable'; end if;
  if d.status <> 'proposed' or d.expires_at <= now() or d.offer_version <> p_version then raise exception 'Offer expired or changed'; end if;
  if actor = d.buyer_id then update public.sale_deals set buyer_accepted_version = p_version, updated_at = now() where id = p_deal;
  else update public.sale_deals set seller_accepted_version = p_version, updated_at = now() where id = p_deal; end if;
  insert into public.sale_events(deal_id, actor_id, event_type, details)
  values (p_deal, actor, 'offer_accepted', jsonb_build_object('version',p_version));
  update public.sale_deals set status = 'accepted', accepted_at = now(), updated_at = now()
  where id = p_deal and buyer_accepted_version = p_version and seller_accepted_version = p_version;
end $$;
create function public.review_sale_document(p_document uuid, p_approved boolean, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare doc public.sale_documents%rowtype; actor text := auth.jwt()->>'sub';
begin
  if not app_private.sale_is_staff() then raise exception 'Staff access required'; end if;
  select * into doc from public.sale_documents where id = p_document for update;
  if not found then raise exception 'Document unavailable'; end if;
  if not p_approved and length(btrim(coalesce(p_note,''))) < 10 then raise exception 'Explain why the document was rejected'; end if;
  update public.sale_documents set review_status = case when p_approved then 'approved' else 'rejected' end,
    reviewed_by = actor, review_note = left(coalesce(p_note,''),1000) where id = p_document;
  insert into public.sale_events(deal_id, actor_id, event_type, details)
  values (doc.deal_id, actor, 'document_reviewed', jsonb_build_object('document_id',doc.id,'approved',p_approved));
end $$;
create function public.cancel_sale_deal(p_deal uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare d public.sale_deals%rowtype; actor text := auth.jwt()->>'sub';
begin
  select * into d from public.sale_deals where id = p_deal for update;
  if not found or actor is null then raise exception 'Deal unavailable'; end if;
  if (d.status = 'proposed' and actor not in (d.buyer_id,d.seller_id)) or
    (d.status in ('accepted','reviewing') and not app_private.sale_is_staff()) or
    d.status not in ('proposed','accepted','reviewing') then raise exception 'Cancellation is unavailable'; end if;
  if length(btrim(p_reason)) < 10 then raise exception 'Cancellation reason is required'; end if;
  update public.sale_deals set status = 'cancelled', updated_at = now() where id = p_deal;
  insert into public.sale_events(deal_id, actor_id, event_type, details)
    values (p_deal, actor, 'deal_cancelled', jsonb_build_object('reason',left(btrim(p_reason),1000)));
end $$;
create function public.resolve_sale_dispute(p_dispute uuid, p_resolution text)
returns void language plpgsql security definer set search_path = '' as $$
declare dispute public.sale_disputes%rowtype; actor text := auth.jwt()->>'sub';
begin
  if not app_private.sale_is_staff() then raise exception 'Staff access required'; end if;
  if length(btrim(p_resolution)) < 20 then raise exception 'Resolution details are required'; end if;
  select * into dispute from public.sale_disputes where id = p_dispute for update;
  if not found then raise exception 'Dispute unavailable'; end if;
  update public.sale_disputes set status = 'resolved', resolution = left(btrim(p_resolution),3000) where id = p_dispute;
  insert into public.sale_events(deal_id, actor_id, event_type, details)
    values (dispute.deal_id, actor, 'dispute_resolved', jsonb_build_object('dispute_id',p_dispute));
end $$;
create function public.resolve_listing_report(p_report uuid, p_resolution text, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not app_private.sale_is_staff() or p_resolution not in ('resolved','dismissed') then raise exception 'Staff access required'; end if;
  if length(btrim(coalesce(p_note,''))) < 10 then raise exception 'Review reason is required'; end if;
  update public.listing_reports set status = p_resolution, reviewed_by = auth.jwt()->>'sub',
    resolution_note = left(btrim(p_note),1000) where id = p_report;
  if not found then raise exception 'Report unavailable'; end if;
end $$;
create function public.review_sale_listing(p_property uuid, p_approved boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not app_private.sale_is_staff() then raise exception 'Staff access required'; end if;
  if p_approved and not exists (select 1 from public.listing_authority_documents
    where property_id = p_property and status = 'approved') then raise exception 'Seller authority evidence must be approved'; end if;
  if p_approved and exists (select 1 from public.listing_reports
    where property_id = p_property and status = 'open') then raise exception 'Open report blocks approval'; end if;
  update public.properties set review_status = case when p_approved then 'approved' else 'rejected' end,
    reviewed_at = now() where property_id = p_property;
  if not found then raise exception 'Listing unavailable'; end if;
end $$;
create function public.review_listing_authority(p_document uuid, p_approved boolean, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not app_private.sale_is_staff() then raise exception 'Staff access required'; end if;
  if not p_approved and length(btrim(coalesce(p_note,''))) < 10 then raise exception 'Review reason is required'; end if;
  update public.listing_authority_documents
    set status = case when p_approved then 'approved' else 'rejected' end,
      reviewed_by = auth.jwt()->>'sub', review_note = left(btrim(coalesce(p_note,'')),1000) where id = p_document;
  if not found then raise exception 'Document unavailable'; end if;
end $$;
create function public.advance_sale_review(p_deal uuid, p_next text)
returns void language plpgsql security definer set search_path = '' as $$
declare d public.sale_deals%rowtype; actor text := auth.jwt()->>'sub';
begin
  if not app_private.sale_is_staff() then raise exception 'Staff access required'; end if;
  select * into d from public.sale_deals where id = p_deal for update;
  if not found then raise exception 'Deal unavailable'; end if;
  if not ((d.status = 'accepted' and p_next in ('reviewing','verification_failed'))
    or (d.status = 'reviewing' and p_next in ('ready_for_partner','verification_failed')))
    then raise exception 'Invalid review transition'; end if;
  if p_next = 'ready_for_partner' and not (exists (select 1 from public.sale_documents
      where deal_id = p_deal and kind = 'title' and review_status = 'approved')
    and exists (select 1 from public.sale_documents where deal_id = p_deal and kind = 'encumbrance' and review_status = 'approved')
    and exists (select 1 from public.sale_documents where deal_id = p_deal and kind = 'agreement' and review_status = 'approved')
    and exists (select 1 from public.sale_documents where deal_id = p_deal and kind = 'seller_authority'
      and uploaded_by = d.seller_id and review_status = 'approved')
    and exists (select 1 from public.sale_documents where deal_id = p_deal and kind = 'identity'
      and uploaded_by = d.seller_id and review_status = 'approved')
    and exists (select 1 from public.sale_documents where deal_id = p_deal and kind = 'identity'
      and uploaded_by = d.buyer_id and review_status = 'approved'))
    then raise exception 'Required evidence is incomplete'; end if;
  if p_next = 'ready_for_partner' and exists (select 1 from public.sale_disputes where deal_id = p_deal and status <> 'resolved')
    then raise exception 'Open dispute blocks review'; end if;
  update public.sale_deals set status = p_next, updated_at = now() where id = p_deal;
  insert into public.sale_events(deal_id, actor_id, event_type, details)
  values (p_deal, actor, 'review_status_changed', jsonb_build_object('status',p_next));
end $$;
create function public.approve_sale_money_action(p_deal uuid, p_action text)
returns integer language plpgsql security definer set search_path = '' as $$
declare d public.sale_deals%rowtype; actor text := auth.jwt()->>'sub'; approval_count integer;
begin
  if not exists (select 1 from public.sale_staff where user_id = actor and active and role = 'manager')
    then raise exception 'Manager approval required'; end if;
  select * into d from public.sale_deals where id = p_deal for update;
  if not found or not ((p_action = 'release' and d.status = 'release_pending')
    or (p_action = 'refund' and d.status = 'refund_pending')) then raise exception 'Money action unavailable'; end if;
  if exists (select 1 from public.sale_disputes where deal_id = p_deal and status <> 'resolved')
    then raise exception 'Open dispute blocks approval'; end if;
  if p_action = 'release' and not (exists (select 1 from public.sale_documents
      where deal_id = p_deal and kind = 'registration' and review_status = 'approved')
    and exists (select 1 from public.sale_documents
      where deal_id = p_deal and kind = 'handover' and review_status = 'approved'))
    then raise exception 'Closing evidence is incomplete'; end if;
  insert into public.sale_money_approvals(deal_id,action,staff_id)
    values (p_deal,p_action,actor) on conflict (deal_id,action,staff_id) do nothing;
  select count(*) into approval_count from public.sale_money_approvals
    where deal_id = p_deal and action = p_action;
  insert into public.sale_events(deal_id,actor_id,event_type,details)
    values (p_deal,actor,'money_action_approved',jsonb_build_object('action',p_action,'approval_count',approval_count));
  return approval_count;
end $$;
revoke all on function public.propose_sale_deal(uuid,numeric,text,timestamptz),
  public.accept_sale_deal(uuid,integer), public.review_sale_document(uuid,boolean,text),
  public.review_sale_listing(uuid,boolean), public.review_listing_authority(uuid,boolean,text),
  public.advance_sale_review(uuid,text), public.cancel_sale_deal(uuid,text),
  public.resolve_sale_dispute(uuid,text), public.resolve_listing_report(uuid,text,text),
  public.approve_sale_money_action(uuid,text) from public, anon;
grant execute on function public.propose_sale_deal(uuid,numeric,text,timestamptz),
  public.accept_sale_deal(uuid,integer), public.review_sale_document(uuid,boolean,text),
  public.review_sale_listing(uuid,boolean), public.review_listing_authority(uuid,boolean,text),
  public.advance_sale_review(uuid,text), public.cancel_sale_deal(uuid,text),
  public.resolve_sale_dispute(uuid,text), public.resolve_listing_report(uuid,text,text),
  public.approve_sale_money_action(uuid,text) to authenticated;

create function app_private.audit_sale_document() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.sale_events(deal_id, actor_id, event_type, details)
    values (new.deal_id, new.uploaded_by, 'document_uploaded', jsonb_build_object('kind',new.kind,'document_id',new.id));
  return new;
end $$;
create trigger audit_sale_document_after_insert after insert on public.sale_documents
for each row execute function app_private.audit_sale_document();
create function app_private.audit_sale_dispute() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.sale_events(deal_id, actor_id, event_type, details)
    values (new.deal_id, new.opened_by, 'dispute_opened', jsonb_build_object('dispute_id',new.id));
  return new;
end $$;
create trigger audit_sale_dispute_after_insert after insert on public.sale_disputes
for each row execute function app_private.audit_sale_dispute();

-- Keep sale listings in review until a staff member checks seller authority.
create function app_private.prepare_sale_listing() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' and new.property_type = 'sale' then new.review_status := 'pending'; end if;
  if tg_op = 'UPDATE' then
    if current_user in ('authenticated','anon') then
      new.review_status := old.review_status;
      new.refreshed_at := old.refreshed_at;
      new.archived_at := old.archived_at;
    end if;
    if exists (select 1 from public.sale_deals where property_id = old.property_id and status in
      ('accepted','reviewing','ready_for_partner','awaiting_funding','funded','registration_pending',
       'handover_pending','release_pending','refund_pending','disputed'))
      and (new.price is distinct from old.price or new.seller_id is distinct from old.seller_id
        or new.address is distinct from old.address or new.property_type is distinct from old.property_type)
      then raise exception 'Accepted sale listing is locked'; end if;
    if new.price is distinct from old.price or new.address is distinct from old.address
      or new.seller_id is distinct from old.seller_id or new.property_type is distinct from old.property_type
      then new.review_status := 'pending'; end if;
  end if;
  return new;
end $$;
create trigger prepare_sale_listing_before_write before insert or update on public.properties
for each row execute function app_private.prepare_sale_listing();
create function app_private.prevent_active_sale_delete() returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.sale_deals where property_id = old.property_id
    and status in ('proposed','accepted','reviewing','ready_for_partner','awaiting_funding',
      'funded','registration_pending','handover_pending','release_pending','refund_pending','disputed')) then
    raise exception 'Listing has an active sale deal'; end if;
  return old;
end $$;
create trigger prevent_active_sale_delete before delete on public.properties
for each row execute function app_private.prevent_active_sale_delete();

create function public.archive_sale_listing(p_property uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.sale_deals where property_id = p_property
    and status in ('proposed','accepted','reviewing','ready_for_partner','awaiting_funding',
      'funded','registration_pending','handover_pending','release_pending','refund_pending','disputed')) then
    raise exception 'Active sale deal must be resolved first'; end if;
  update public.properties set archived_at = now(), is_available = false where property_id = p_property
    and seller_id = auth.jwt()->>'sub' and property_type = 'sale';
  if not found then raise exception 'Sale listing unavailable'; end if;
end $$;
revoke all on function public.archive_sale_listing(uuid) from public, anon;
grant execute on function public.archive_sale_listing(uuid) to authenticated;

create function public.refresh_sale_listing(p_property uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.properties set refreshed_at = now() where property_id = p_property
    and seller_id = auth.jwt()->>'sub' and property_type = 'sale';
  if not found then raise exception 'Sale listing unavailable'; end if;
end $$;
revoke all on function public.refresh_sale_listing(uuid) from public, anon;
grant execute on function public.refresh_sale_listing(uuid) to authenticated;

-- This restrictive policy also applies when a broad property SELECT policy already exists.
create policy "Unreviewed sales stay private" on public.properties as restrictive for select to anon, authenticated
using (property_type is distinct from 'sale' or (archived_at is null and review_status = 'approved' and refreshed_at > now() - interval '90 days')
  or seller_id = (select auth.jwt()->>'sub') or app_private.sale_is_staff());

-- Existing public property SELECT access made seller_phone visible through the Data API.
-- Keep sale contact details in an owner-only table, including previously published sales.
create table public.seller_contacts (
  property_id uuid primary key references public.properties(property_id) on delete cascade deferrable initially deferred,
  seller_id text not null,
  phone text not null
);
alter table public.seller_contacts enable row level security;
revoke all on public.seller_contacts from anon, authenticated;
grant select on public.seller_contacts to authenticated;
create policy "Owners read their private contact" on public.seller_contacts for select to authenticated
using (seller_id = (select auth.jwt()->>'sub'));
insert into public.seller_contacts(property_id,seller_id,phone)
select property_id,seller_id,seller_phone from public.properties
where property_type = 'sale' and seller_phone is not null;
alter table public.properties alter column seller_phone drop not null;
update public.properties set seller_phone = null where property_type = 'sale';
create function app_private.private_sale_contact() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.property_type = 'sale' and new.seller_phone is not null then
    insert into public.seller_contacts(property_id,seller_id,phone)
      values (new.property_id,new.seller_id,new.seller_phone)
      on conflict (property_id) do update set seller_id = excluded.seller_id, phone = excluded.phone;
    new.seller_phone := null;
  end if;
  return new;
end $$;
create trigger private_sale_contact_before_write before insert or update on public.properties
for each row execute function app_private.private_sale_contact();
