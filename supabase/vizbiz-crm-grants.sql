-- VizBiz Supabase grants for API roles.
-- Run after creating tables in Supabase SQL Editor.
-- RLS remains enabled; these grants only allow roles to reach the tables.
-- Public anon access still requires explicit RLS policies, which we are not adding yet.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.leads to service_role;
grant select, insert, update, delete on public.site_crawls to service_role;
grant select, insert, update, delete on public.business_profiles to service_role;
grant select, insert, update, delete on public.competitor_candidates to service_role;
grant select, insert, update, delete on public.mini_reports to service_role;
grant select, insert, update, delete on public.lead_events to service_role;
grant select, insert, update, delete on public.crm_sync_logs to service_role;
grant select, insert, update, delete on public.report_jobs to service_role;
grant select, insert, update, delete on public.telegram_alert_logs to service_role;
grant select, insert, update, delete on public.paid_orders to service_role;
grant select, insert, update, delete on public.paid_fulfillment_tasks to service_role;

grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
