-- A private conversation belongs to one seeker and one listing owner.
-- Clerk IDs are text JWT subjects, not Supabase auth.users UUIDs.
create table if not exists public.property_conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(property_id) on delete cascade,
  seeker_id text not null,
  seller_id text not null,
  created_at timestamptz not null default now(),
  unique (property_id, seeker_id),
  constraint different_participants check (seeker_id <> seller_id)
);

create table if not exists public.property_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.property_conversations(id) on delete cascade,
  sender_id text not null,
  body text not null check (length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists property_conversations_seller_idx on public.property_conversations(seller_id, created_at desc);
create index if not exists property_conversations_seeker_idx on public.property_conversations(seeker_id, created_at desc);
create index if not exists property_messages_conversation_idx on public.property_messages(conversation_id, created_at);

alter table public.property_conversations enable row level security;
alter table public.property_messages enable row level security;
revoke all on public.property_conversations, public.property_messages from anon, authenticated;
grant select, insert on public.property_conversations, public.property_messages to authenticated;

create policy "Participants read their conversations" on public.property_conversations
for select to authenticated
using (
  (select auth.jwt()->>'sub') = seeker_id
  or (select auth.jwt()->>'sub') = seller_id
);

create policy "Seekers start conversations with listing owners" on public.property_conversations
for insert to authenticated
with check (
  (select auth.jwt()->>'sub') = seeker_id
  and seeker_id <> seller_id
  and exists (
    select 1 from public.properties p
    where p.property_id = property_id
      and p.seller_id = seller_id
      and p.is_available = true
  )
);

create policy "Participants read their messages" on public.property_messages
for select to authenticated
using (exists (
  select 1 from public.property_conversations c
  where c.id = conversation_id
    and ((select auth.jwt()->>'sub') = c.seeker_id or (select auth.jwt()->>'sub') = c.seller_id)
));

create policy "Participants send their own messages" on public.property_messages
for insert to authenticated
with check (
  (select auth.jwt()->>'sub') = sender_id
  and exists (
    select 1 from public.property_conversations c
    where c.id = conversation_id
      and (sender_id = c.seeker_id or sender_id = c.seller_id)
  )
);

-- Postgres Changes is an enhancement; the UI also refreshes on focus.
do $$ begin
  alter publication supabase_realtime add table public.property_messages;
exception when duplicate_object then null;
end $$;
