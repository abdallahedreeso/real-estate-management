-- Demonstration ledger only. These tables never authorize or record real money movement.
create table public.sale_simulations (
  deal_id uuid primary key references public.sale_deals(id),
  state text not null default 'awaiting_demo_payment' check (state in
    ('awaiting_demo_payment','payment_failed','demo_held','release_pending','refund_pending','demo_released','demo_refunded')),
  amount_egp numeric(16,2) not null check (amount_egp > 0),
  seller_fee_egp numeric(16,2) not null check (seller_fee_egp >= 0),
  seller_net_egp numeric(16,2) generated always as (amount_egp - seller_fee_egp) stored,
  demo_reference text not null unique,
  started_by text not null,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (seller_fee_egp < amount_egp)
);
create table public.sale_simulation_events (
  id bigint generated always as identity primary key,
  deal_id uuid not null references public.sale_simulations(deal_id),
  event_key uuid not null unique,
  event_type text not null,
  actor_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index sale_simulation_events_deal_idx on public.sale_simulation_events(deal_id,id);
create table public.sale_simulation_approvals (
  deal_id uuid not null references public.sale_simulations(deal_id),
  action text not null check (action in ('release','refund')),
  staff_id text not null,
  created_at timestamptz not null default now(),
  primary key (deal_id,action,staff_id)
);
create trigger sale_simulation_events_append_only before update or delete on public.sale_simulation_events
for each row execute function app_private.reject_sale_audit_mutation();
create trigger sale_simulation_approvals_append_only before update or delete on public.sale_simulation_approvals
for each row execute function app_private.reject_sale_audit_mutation();

alter table public.sale_simulations enable row level security;
alter table public.sale_simulation_events enable row level security;
alter table public.sale_simulation_approvals enable row level security;
revoke all on public.sale_simulations, public.sale_simulation_events, public.sale_simulation_approvals from anon, authenticated;
grant select on public.sale_simulations, public.sale_simulation_events to authenticated;
grant select on public.sale_simulation_approvals to authenticated;
create policy "Deal members read demo ledger" on public.sale_simulations for select to authenticated
using (app_private.sale_can_read(deal_id));
create policy "Deal members read demo events" on public.sale_simulation_events for select to authenticated
using (app_private.sale_can_read(deal_id));
create policy "Staff read demo approvals" on public.sale_simulation_approvals for select to authenticated
using (app_private.sale_is_staff());

create function public.start_sale_simulation(p_deal uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare d public.sale_deals%rowtype; actor text := auth.jwt()->>'sub';
begin
  if not app_private.sale_is_staff() then raise exception 'Staff access required'; end if;
  select * into d from public.sale_deals where id = p_deal for update;
  if not found or d.status <> 'ready_for_partner' then raise exception 'Reviewed deal required'; end if;
  if exists (select 1 from public.sale_disputes where deal_id = p_deal and status <> 'resolved')
    then raise exception 'Open dispute blocks simulation'; end if;
  insert into public.sale_simulations(deal_id,amount_egp,seller_fee_egp,demo_reference,started_by)
  values (p_deal,d.price_egp,round(d.price_egp*d.seller_fee_bps/10000,2),
    'DEMO-' || upper(substr(replace(p_deal::text,'-',''),1,12)),actor);
  insert into public.sale_simulation_events(deal_id,event_key,event_type,actor_id)
    values (p_deal,gen_random_uuid(),'demo_started',actor);
end $$;

-- Buyer action emulates a provider callback; it has no connection to any payment provider.
create function public.simulate_sale_payment(p_deal uuid, p_event_key uuid, p_outcome text) returns text
language plpgsql security definer set search_path = '' as $$
declare d public.sale_deals%rowtype; s public.sale_simulations%rowtype; actor text := auth.jwt()->>'sub'; next_state text;
begin
  if p_event_key is null or p_outcome not in ('success','failure') then raise exception 'Invalid demo event'; end if;
  select * into d from public.sale_deals where id = p_deal;
  if not found or actor is distinct from d.buyer_id then raise exception 'Buyer access required'; end if;
  select * into s from public.sale_simulations where deal_id = p_deal for update;
  if not found then raise exception 'Simulation unavailable'; end if;
  if exists (select 1 from public.sale_simulation_events where event_key = p_event_key and deal_id = p_deal)
    then return s.state; end if;
  if s.state not in ('awaiting_demo_payment','payment_failed') then raise exception 'Demo payment unavailable'; end if;
  if exists (select 1 from public.sale_disputes where deal_id = p_deal and status <> 'resolved')
    then raise exception 'Open dispute blocks simulation'; end if;
  next_state := case when p_outcome = 'success' then 'demo_held' else 'payment_failed' end;
  update public.sale_simulations set state = next_state, updated_at = now() where deal_id = p_deal;
  insert into public.sale_simulation_events(deal_id,event_key,event_type,actor_id,details)
    values (p_deal,p_event_key,next_state,actor,jsonb_build_object('amount_egp',s.amount_egp));
  return next_state;
end $$;

create function public.request_sale_simulation_outcome(p_deal uuid, p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.sale_simulations%rowtype; actor text := auth.jwt()->>'sub';
begin
  if not app_private.sale_is_staff() or p_action not in ('release','refund') then raise exception 'Staff access required'; end if;
  select * into s from public.sale_simulations where deal_id = p_deal for update;
  if not found or s.state <> 'demo_held' then raise exception 'Held demo balance required'; end if;
  if exists (select 1 from public.sale_disputes where deal_id = p_deal and status <> 'resolved')
    then raise exception 'Open dispute blocks outcome'; end if;
  if p_action = 'release' and not (exists (select 1 from public.sale_documents
      where deal_id = p_deal and kind = 'registration' and review_status = 'approved')
    and exists (select 1 from public.sale_documents
      where deal_id = p_deal and kind = 'handover' and review_status = 'approved'))
    then raise exception 'Registration and handover review required'; end if;
  update public.sale_simulations set state = p_action || '_pending', updated_at = now() where deal_id = p_deal;
  insert into public.sale_simulation_events(deal_id,event_key,event_type,actor_id)
    values (p_deal,gen_random_uuid(),p_action || '_requested',actor);
end $$;

create function public.approve_sale_simulation_outcome(p_deal uuid, p_action text) returns integer
language plpgsql security definer set search_path = '' as $$
declare s public.sale_simulations%rowtype; actor text := auth.jwt()->>'sub'; approval_count integer;
begin
  if not exists (select 1 from public.sale_staff where user_id = actor and active and role = 'manager')
    then raise exception 'Manager approval required'; end if;
  select * into s from public.sale_simulations where deal_id = p_deal for update;
  if not found or p_action not in ('release','refund') or s.state <> p_action || '_pending'
    then raise exception 'Demo approval unavailable'; end if;
  if exists (select 1 from public.sale_disputes where deal_id = p_deal and status <> 'resolved')
    then raise exception 'Open dispute blocks approval'; end if;
  if p_action = 'release' and not (exists (select 1 from public.sale_documents
      where deal_id = p_deal and kind = 'registration' and review_status = 'approved')
    and exists (select 1 from public.sale_documents
      where deal_id = p_deal and kind = 'handover' and review_status = 'approved'))
    then raise exception 'Closing evidence is incomplete'; end if;
  insert into public.sale_simulation_approvals(deal_id,action,staff_id)
    values (p_deal,p_action,actor) on conflict do nothing;
  select count(*) into approval_count from public.sale_simulation_approvals
    where deal_id = p_deal and action = p_action;
  if approval_count = 2 then
    update public.sale_simulations set state = case when p_action = 'release' then 'demo_released' else 'demo_refunded' end,
      updated_at = now() where deal_id = p_deal;
  end if;
  insert into public.sale_simulation_events(deal_id,event_key,event_type,actor_id,details)
    values (p_deal,gen_random_uuid(),'demo_' || p_action || '_approved',actor,
      jsonb_build_object('approval_count',approval_count,'completed',approval_count = 2));
  return approval_count;
end $$;

create function public.reconcile_sale_simulation(p_deal uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.sale_simulations%rowtype; d public.sale_deals%rowtype;
begin
  if not app_private.sale_can_read(p_deal) then raise exception 'Deal access required'; end if;
  select * into s from public.sale_simulations where deal_id = p_deal;
  select * into d from public.sale_deals where id = p_deal;
  if not found or s.deal_id is null then raise exception 'Simulation unavailable'; end if;
  return jsonb_build_object('balanced',s.amount_egp = s.seller_fee_egp + s.seller_net_egp
    and s.amount_egp = d.price_egp and
    (select count(*) from public.sale_simulation_events where deal_id = p_deal and event_type = 'demo_held') <= 1,
    'state',s.state,'gross_egp',s.amount_egp,'fee_egp',s.seller_fee_egp,
    'seller_net_egp',s.seller_net_egp,'real_money_moved',false);
end $$;

revoke all on function public.start_sale_simulation(uuid),public.simulate_sale_payment(uuid,uuid,text),
  public.request_sale_simulation_outcome(uuid,text),public.approve_sale_simulation_outcome(uuid,text),
  public.reconcile_sale_simulation(uuid) from public, anon;
grant execute on function public.start_sale_simulation(uuid),public.simulate_sale_payment(uuid,uuid,text),
  public.request_sale_simulation_outcome(uuid,text),public.approve_sale_simulation_outcome(uuid,text),
  public.reconcile_sale_simulation(uuid) to authenticated;
