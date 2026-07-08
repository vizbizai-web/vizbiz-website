BEGIN;

ALTER TABLE public.audit_snapshots
  DROP CONSTRAINT IF EXISTS audit_snapshots_run_type_check;

ALTER TABLE public.audit_snapshots
  ADD CONSTRAINT audit_snapshots_run_type_check
  CHECK (run_type IN ('baseline', 'monthly', 'rescan_after_fix', 'manual', 'pulse'));

COMMIT;
