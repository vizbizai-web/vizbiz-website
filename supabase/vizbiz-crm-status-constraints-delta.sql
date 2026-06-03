-- VizBiz Supabase delta: refresh existing enum-like check constraints
-- Run in Supabase SQL Editor. Safe to re-run.
-- Needed when an older leads table exists before newer queue/paid statuses were added.

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in (
    'new',
    'report_queued',
    'site_intelligence_running',
    'site_intelligence_complete',
    'report_generating',
    'needs_operator_review',
    'report_sent',
    'report_viewed',
    'cta_clicked',
    'paid_one_time',
    'paid_monthly',
    'not_fit'
  ));

alter table public.leads drop constraint if exists leads_competitor_source_check;
alter table public.leads add constraint leads_competitor_source_check
  check (competitor_source in ('submitted','auto_discovered','mixed','missing'));
