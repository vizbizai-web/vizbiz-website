-- VizBiz Supabase delta: async report jobs + paid fulfillment tasks
-- Run in Supabase Dashboard → SQL Editor → New query.
-- Safe to re-run. Designed for server-side service-role access only.

create extension if not exists pgcrypto;

create table if not exists public.report_jobs (
  id text primary key,
  type text not null check (type in ('free_mini_report','paid_full_report','paid_monthly_baseline','rerun_report')),
  status text not null default 'queued' check (status in ('queued','processing','completed','needs_operator_review','failed_retryable','failed_permanent')),
  lead_id uuid references public.leads(id) on delete set null,
  paid_order_id uuid references public.paid_orders(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts >= 1),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.paid_fulfillment_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  paid_order_id uuid references public.paid_orders(id) on delete set null,
  product text not null check (product in ('fix_package','monthly_plan')),
  title text not null,
  description text not null,
  status text not null default 'intake_pending' check (status in ('intake_pending','queued','in_progress','delivered','cancelled')),
  priority text not null default 'urgent' check (priority in ('normal','high','urgent')),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists report_jobs_status_created_idx on public.report_jobs(status, created_at);
create index if not exists report_jobs_lead_id_idx on public.report_jobs(lead_id);
create index if not exists report_jobs_paid_order_id_idx on public.report_jobs(paid_order_id);
create index if not exists paid_fulfillment_tasks_lead_id_idx on public.paid_fulfillment_tasks(lead_id);
create index if not exists paid_fulfillment_tasks_status_idx on public.paid_fulfillment_tasks(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_report_jobs_updated_at on public.report_jobs;
create trigger set_report_jobs_updated_at before update on public.report_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_paid_fulfillment_tasks_updated_at on public.paid_fulfillment_tasks;
create trigger set_paid_fulfillment_tasks_updated_at before update on public.paid_fulfillment_tasks
for each row execute function public.set_updated_at();

alter table public.report_jobs enable row level security;
alter table public.paid_fulfillment_tasks enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.report_jobs to service_role;
grant select, insert, update, delete on public.paid_fulfillment_tasks to service_role;
grant usage, select on all sequences in schema public to service_role;
