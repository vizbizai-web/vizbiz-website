-- VizBiz Phase 3 Monthly Loop schema
-- Apply in Supabase SQL Editor before production activation.

create table if not exists public.audit_snapshots (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null,
  sequence integer not null,
  run_type text not null check (run_type in ('baseline', 'monthly', 'rescan_after_fix', 'manual')),
  tier text not null check (tier in ('free', 'paid', 'full')),
  created_at timestamptz not null default now(),
  profile_hash text,
  prompt_plan jsonb not null default '{}'::jsonb,
  platform_scores jsonb not null default '[]'::jsonb,
  blended_score numeric,
  band text,
  prompt_results jsonb not null default '[]'::jsonb,
  competitor_scores jsonb not null default '[]'::jsonb,
  readiness jsonb not null default '{}'::jsonb,
  cost_estimate numeric,
  status text not null default 'complete' check (status in ('complete', 'failed', 'partial')),
  error_message text,
  source text not null default 'pipeline'
);

create unique index if not exists audit_snapshots_lead_sequence_idx
  on public.audit_snapshots (lead_id, sequence);

create index if not exists audit_snapshots_lead_created_idx
  on public.audit_snapshots (lead_id, created_at desc);

create index if not exists audit_snapshots_status_idx
  on public.audit_snapshots (status);

alter table public.audit_snapshots enable row level security;

drop policy if exists "service role can manage audit snapshots" on public.audit_snapshots;
create policy "service role can manage audit snapshots"
  on public.audit_snapshots
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.subscriptions_local (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz,
  next_run_at timestamptz,
  last_run_snapshot_id uuid,
  paused_reason text,
  retry_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_local_lead_id_idx
  on public.subscriptions_local (lead_id);

create index if not exists subscriptions_local_due_idx
  on public.subscriptions_local (next_run_at)
  where status = 'active' and paused_reason is null;

create index if not exists subscriptions_local_stripe_subscription_id_idx
  on public.subscriptions_local (stripe_subscription_id);

alter table public.subscriptions_local enable row level security;

drop policy if exists "service role can manage subscriptions local" on public.subscriptions_local;
create policy "service role can manage subscriptions local"
  on public.subscriptions_local
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
