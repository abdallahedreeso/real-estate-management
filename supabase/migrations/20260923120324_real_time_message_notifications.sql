-- Notifications are created by the database only after a message is saved.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references public.property_messages(id) on delete cascade,
  conversation_id uuid not null references public.property_conversations(id) on delete cascade,
  property_id uuid not null references public.properties(property_id) on delete cascade,
  recipient_id text not null,
  sender_id text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint notification_different_people check (recipient_id <> sender_id)
);

create index notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);
create index notifications_unread_idx on public.notifications(recipient_id, created_at desc) where read_at is null;
create index notifications_conversation_idx on public.notifications(conversation_id, recipient_id) where read_at is null;

alter table public.notifications enable row level security;
revoke all on public.notifications from anon, authenticated;
grant select, update (read_at) on public.notifications to authenticated;

create policy "Recipients read their notifications" on public.notifications
for select to authenticated using ((select auth.jwt()->>'sub') = recipient_id);

create policy "Recipients mark notifications read" on public.notifications
for update to authenticated
using ((select auth.jwt()->>'sub') = recipient_id)
with check ((select auth.jwt()->>'sub') = recipient_id);

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create function app_private.notify_property_message() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  conversation public.property_conversations%rowtype;
begin
  select * into conversation from public.property_conversations where id = new.conversation_id;
  if not found then return new; end if;

  insert into public.notifications (message_id, conversation_id, property_id, recipient_id, sender_id)
  values (
    new.id, new.conversation_id, conversation.property_id,
    case when new.sender_id = conversation.seller_id then conversation.seeker_id else conversation.seller_id end,
    new.sender_id
  );
  return new;
end;
$$;
revoke all on function app_private.notify_property_message() from public, anon, authenticated;

create trigger notify_property_message_after_insert
after insert on public.property_messages
for each row execute function app_private.notify_property_message();

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;
