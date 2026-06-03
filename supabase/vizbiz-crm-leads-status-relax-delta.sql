-- VizBiz emergency constraint relaxation for existing Supabase leads table.
-- Use this only server-side; app-level statuses remain typed in code.

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (status is not null and length(status) > 0);
