-- Disposable CI baseline for the existing tables required by the protected-sale migration.
-- Production's older schema predates repository migrations; this file is never deployed.
create schema if not exists app_private;

create table public.properties (
  property_id uuid primary key default gen_random_uuid(),
  seller_id text not null,
  title varchar not null,
  price numeric not null,
  country varchar not null,
  state varchar not null,
  property_type varchar not null,
  seller_phone text not null,
  images text[] not null default '{}',
  address text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.properties enable row level security;
revoke all on public.properties from anon, authenticated;
grant select on public.properties to anon;
grant select, insert, update, delete on public.properties to authenticated;
create policy "Public reads listings" on public.properties for select to anon, authenticated using (true);
create policy "Owner creates listings" on public.properties for insert to authenticated
with check (seller_id = (select auth.jwt()->>'sub'));
create policy "Owner updates listings" on public.properties for update to authenticated
using (seller_id = (select auth.jwt()->>'sub'))
with check (seller_id = (select auth.jwt()->>'sub'));
create policy "Owner deletes listings" on public.properties for delete to authenticated
using (seller_id = (select auth.jwt()->>'sub'));

create table public.property_conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(property_id) on delete cascade,
  seeker_id text not null,
  seller_id text not null,
  created_at timestamptz not null default now(),
  unique (property_id, seeker_id),
  check (seeker_id <> seller_id)
);
alter table public.property_conversations enable row level security;
revoke all on public.property_conversations from anon, authenticated;
grant select, insert on public.property_conversations to authenticated;
create policy "Participants read conversations" on public.property_conversations for select to authenticated
using ((select auth.jwt()->>'sub') in (seeker_id, seller_id));
create policy "Buyer starts conversation" on public.property_conversations for insert to authenticated
with check (seeker_id = (select auth.jwt()->>'sub') and exists
  (select 1 from public.properties p where p.property_id = property_conversations.property_id
    and p.seller_id = property_conversations.seller_id and p.is_available));
