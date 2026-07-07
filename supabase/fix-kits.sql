create table if not exists public.fix_kits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  version integer not null default 1,
  status text not null check (status in ('draft','ready_for_approval','approved','delivered')),
  artifacts jsonb not null default '[]'::jsonb,
  evidence_hash text not null,
  approved_at timestamptz,
  delivered_at timestamptz,
  rescan_scheduled_at timestamptz,
  rescan_completed_at timestamptz,
  before_after jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fix_kits_lead_id_idx on public.fix_kits(lead_id);
create index if not exists fix_kits_rescan_due_idx on public.fix_kits(status, rescan_scheduled_at) where rescan_completed_at is null;
alter table public.fix_kits enable row level security;
do $$ begin
  create policy "service_role_all_fix_kits" on public.fix_kits for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;
