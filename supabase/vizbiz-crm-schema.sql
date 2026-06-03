-- VizBiz Supabase CRM + AI visibility pipeline schema
-- Run in Supabase Dashboard → SQL Editor → New query.
-- Assumes automatic RLS is enabled. These tables are designed for server-side writes
-- using SUPABASE_SERVICE_ROLE_KEY. Do not expose service-role writes to client code.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  email text not null,
  website_url text not null,
  submitted_location text,
  submitted_niche text,
  competitor_1_name text,
  competitor_1_url text,
  competitor_2_name text,
  competitor_2_url text,
  competitor_source text not null default 'submitted' check (competitor_source in ('submitted','auto_discovered','mixed','missing')),
  status text not null default 'new' check (status in ('new','report_queued','site_intelligence_running','site_intelligence_complete','report_generating','needs_operator_review','report_sent','report_viewed','cta_clicked','paid_one_time','paid_monthly','not_fit')),
  source text not null default 'website_intake',
  raw_intake jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_crawls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  homepage_url text not null,
  pages_crawled jsonb not null default '[]'::jsonb,
  detected_business_name text,
  detected_phone text,
  detected_email text,
  detected_address text,
  detected_city text,
  detected_region text,
  detected_country text,
  schema_types jsonb not null default '[]'::jsonb,
  robots_status text,
  sitemap_found boolean not null default false,
  llms_txt_found boolean not null default false,
  social_links jsonb not null default '[]'::jsonb,
  review_links jsonb not null default '[]'::jsonb,
  trust_signals jsonb not null default '{}'::jsonb,
  llm_readiness_signals jsonb not null default '{}'::jsonb,
  raw_summary text,
  confidence_score numeric(4,3),
  created_at timestamptz not null default now()
);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  primary_category text,
  secondary_categories jsonb not null default '[]'::jsonb,
  primary_services jsonb not null default '[]'::jsonb,
  service_areas jsonb not null default '[]'::jsonb,
  target_city text,
  target_region text,
  target_country text,
  buyer_intent_prompts jsonb not null default '[]'::jsonb,
  inference_notes text,
  confidence_score numeric(4,3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitor_candidates (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  source text not null check (source in ('submitted','auto_discovered','manual')),
  name text not null,
  website_url text,
  city text,
  category_match text,
  reason_selected text,
  confidence_score numeric(4,3),
  rank_order integer,
  created_at timestamptz not null default now()
);

create table if not exists public.mini_reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  slug text not null unique,
  avi_score integer check (avi_score between 0 and 100),
  social_proof_score integer check (social_proof_score between 0 and 100),
  local_clarity_score integer check (local_clarity_score between 0 and 100),
  competitor_gap_summary text,
  top_visibility_gaps jsonb not null default '[]'::jsonb,
  report_json jsonb not null default '{}'::jsonb,
  report_url text,
  email_subject text,
  email_preview text,
  sent_at timestamptz,
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_sync_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  destination text not null default 'google_sheets',
  status text not null check (status in ('pending','success','failed')),
  external_row_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.report_jobs (
  id text primary key,
  type text not null check (type in ('free_mini_report','paid_full_report','paid_monthly_baseline','rerun_report')),
  status text not null default 'queued' check (status in ('queued','processing','completed','needs_operator_review','failed_retryable','failed_permanent')),
  lead_id uuid references public.leads(id) on delete set null,
  paid_order_id uuid,
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

create table if not exists public.telegram_alert_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  alert_type text not null,
  chat_id text,
  thread_id text,
  message_id text,
  status text not null check (status in ('pending','sent','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.paid_orders (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  mini_report_id uuid references public.mini_reports(id) on delete set null,
  product text not null check (product in ('fix_package','monthly_plan')),
  amount_cents integer not null,
  currency text not null default 'usd',
  stripe_checkout_session_id text,
  stripe_customer_id text,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  raw_payload jsonb not null default '{}'::jsonb,
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

create index if not exists leads_email_idx on public.leads(email);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists site_crawls_lead_id_idx on public.site_crawls(lead_id);
create index if not exists business_profiles_lead_id_idx on public.business_profiles(lead_id);
create index if not exists competitor_candidates_lead_id_idx on public.competitor_candidates(lead_id);
create index if not exists mini_reports_lead_id_idx on public.mini_reports(lead_id);
create index if not exists mini_reports_slug_idx on public.mini_reports(slug);
create index if not exists lead_events_lead_id_idx on public.lead_events(lead_id);
create index if not exists lead_events_type_idx on public.lead_events(event_type);
create index if not exists report_jobs_status_created_idx on public.report_jobs(status, created_at);
create index if not exists report_jobs_lead_id_idx on public.report_jobs(lead_id);
create index if not exists report_jobs_paid_order_id_idx on public.report_jobs(paid_order_id);
create index if not exists telegram_alert_logs_lead_id_idx on public.telegram_alert_logs(lead_id);
create index if not exists paid_orders_lead_id_idx on public.paid_orders(lead_id);
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

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists set_business_profiles_updated_at on public.business_profiles;
create trigger set_business_profiles_updated_at before update on public.business_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_mini_reports_updated_at on public.mini_reports;
create trigger set_mini_reports_updated_at before update on public.mini_reports
for each row execute function public.set_updated_at();

drop trigger if exists set_report_jobs_updated_at on public.report_jobs;
create trigger set_report_jobs_updated_at before update on public.report_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_paid_orders_updated_at on public.paid_orders;
create trigger set_paid_orders_updated_at before update on public.paid_orders
for each row execute function public.set_updated_at();

drop trigger if exists set_paid_fulfillment_tasks_updated_at on public.paid_fulfillment_tasks;
create trigger set_paid_fulfillment_tasks_updated_at before update on public.paid_fulfillment_tasks
for each row execute function public.set_updated_at();

-- Explicit RLS protection. Service role bypasses RLS for server routes.
alter table public.leads enable row level security;
alter table public.site_crawls enable row level security;
alter table public.business_profiles enable row level security;
alter table public.competitor_candidates enable row level security;
alter table public.mini_reports enable row level security;
alter table public.lead_events enable row level security;
alter table public.crm_sync_logs enable row level security;
alter table public.report_jobs enable row level security;
alter table public.telegram_alert_logs enable row level security;
alter table public.paid_orders enable row level security;
alter table public.paid_fulfillment_tasks enable row level security;

-- No public policies yet. Public/client access will be added narrowly later,
-- e.g. read-only access for report pages by slug if needed.
