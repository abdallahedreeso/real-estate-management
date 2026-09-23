-- Display only: authorization continues to use the Clerk subject IDs.
alter table public.property_conversations
add column seeker_display_name text
check (seeker_display_name is null or length(btrim(seeker_display_name)) between 1 and 120);

-- Only the seeker may refresh their own display name; column privileges keep
-- conversation participants and property ownership immutable.
grant update (seeker_display_name) on public.property_conversations to authenticated;

create policy "Seekers update their display name"
on public.property_conversations for update to authenticated
using ((select auth.jwt()->>'sub') = seeker_id)
with check ((select auth.jwt()->>'sub') = seeker_id);
