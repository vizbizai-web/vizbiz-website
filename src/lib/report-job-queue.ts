import { listJson, readJson, saveJsonWithKey } from "@/lib/file-store";
import {
  createSupabaseReportJob,
  hasSupabaseServerConfig,
  listSupabaseReportJobs,
  readSupabaseReportJob,
  updateSupabaseReportJob,
  type SupabaseReportJobRow,
} from "@/lib/supabase-crm";

export type ReportJobType = "free_mini_report" | "paid_full_report" | "paid_monthly_baseline" | "rerun_report";
export type ReportJobStatus = "queued" | "processing" | "completed" | "needs_operator_review" | "failed_retryable" | "failed_permanent";

export interface ReportJobRecord {
  id: string;
  type: ReportJobType;
  status: ReportJobStatus;
  leadId?: string | null;
  paidOrderId?: string | null;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  lockedAt?: string | null;
  lockedBy?: string | null;
  lastError?: string | null;
  result?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnqueueReportJobInput {
  type: ReportJobType;
  leadId?: string | null;
  paidOrderId?: string | null;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
  now?: string;
}

const COLLECTION = "report-jobs";
const STUCK_LOCK_MS = 15 * 60 * 1000;

export async function enqueueReportJob(input: EnqueueReportJobInput): Promise<ReportJobRecord> {
  const now = input.now ?? new Date().toISOString();
  const job: ReportJobRecord = {
    id: `report_job_${crypto.randomUUID()}`,
    type: input.type,
    status: "queued",
    leadId: input.leadId ?? null,
    paidOrderId: input.paidOrderId ?? null,
    payload: input.payload ?? {},
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 3,
    lockedAt: null,
    lockedBy: null,
    lastError: null,
    result: null,
    createdAt: now,
    updatedAt: now,
  };
  return saveJob(job);
}

export async function listReportJobs(status?: ReportJobStatus): Promise<ReportJobRecord[]> {
  if (shouldUseSupabaseReportJobs()) {
    try {
      const rows = await listSupabaseReportJobs(status);
      return rows.map(fromSupabaseRow);
    } catch (error) {
      console.warn("Falling back to local report job store after Supabase list failed", error);
    }
  }

  const jobs = await listJson<ReportJobRecord>(COLLECTION);
  return jobs
    .filter((job) => !status || job.status === status)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function claimNextReportJob(workerId: string, now = new Date().toISOString()): Promise<ReportJobRecord | null> {
  const jobs = await listReportJobs();
  const nowMs = Date.parse(now);
  const claimable = jobs.find((job) => isClaimable(job, nowMs));
  if (!claimable) return null;

  const claimed: ReportJobRecord = {
    ...claimable,
    status: "processing",
    attempts: claimable.attempts + 1,
    lockedAt: now,
    lockedBy: workerId,
    updatedAt: now,
  };
  return saveJob(claimed);
}

export async function completeReportJob(id: string, result: Record<string, unknown> = {}, now = new Date().toISOString()): Promise<ReportJobRecord> {
  const job = await requireJob(id);
  return saveJob({
    ...job,
    status: "completed",
    result,
    lockedAt: null,
    lockedBy: null,
    lastError: null,
    updatedAt: now,
  });
}

export async function markReportJobNeedsReview(
  id: string,
  reasons: string[],
  result: Record<string, unknown> = {},
  now = new Date().toISOString(),
): Promise<ReportJobRecord> {
  const job = await requireJob(id);
  return saveJob({
    ...job,
    status: "needs_operator_review",
    result: { ...result, reasons },
    lockedAt: null,
    lockedBy: null,
    lastError: reasons.join("; ") || null,
    updatedAt: now,
  });
}

export async function failReportJob(
  id: string,
  error: unknown,
  retryable: boolean,
  now = new Date().toISOString(),
): Promise<ReportJobRecord> {
  const job = await requireJob(id);
  const lastError = error instanceof Error ? error.message : String(error);
  const canRetry = retryable && job.attempts < job.maxAttempts;
  return saveJob({
    ...job,
    status: canRetry ? "failed_retryable" : "failed_permanent",
    lockedAt: null,
    lockedBy: null,
    lastError,
    updatedAt: now,
  });
}

async function requireJob(id: string): Promise<ReportJobRecord> {
  if (shouldUseSupabaseReportJobs()) {
    try {
      const row = await readSupabaseReportJob(id);
      if (row) return fromSupabaseRow(row);
    } catch (error) {
      console.warn("Falling back to local report job store after Supabase read failed", error);
    }
  }

  const job = await readJson<ReportJobRecord>(COLLECTION, id);
  if (!job) throw new Error(`Report job not found: ${id}`);
  return job;
}

function isClaimable(job: ReportJobRecord, nowMs: number) {
  if (job.status === "queued") return true;
  if (job.status === "failed_retryable" && job.attempts < job.maxAttempts) return true;
  if (job.status !== "processing" || !job.lockedAt) return false;
  return nowMs - Date.parse(job.lockedAt) > STUCK_LOCK_MS && job.attempts < job.maxAttempts;
}

async function saveJob(job: ReportJobRecord): Promise<ReportJobRecord> {
  if (shouldUseSupabaseReportJobs()) {
    try {
      const existing = await readSupabaseReportJob(job.id);
      const row = existing
        ? await updateSupabaseReportJob(job.id, toSupabasePatch(job))
        : (await createSupabaseReportJob(job)).data;
      if (row) return fromSupabaseRow(row);
    } catch (error) {
      console.warn("Falling back to local report job store after Supabase save failed", error);
    }
  }

  return saveJsonWithKey(COLLECTION, job.id, job);
}

function shouldUseSupabaseReportJobs() {
  return hasSupabaseServerConfig() && process.env.VIZBIZ_REPORT_JOB_STORE !== "local";
}

function fromSupabaseRow(row: SupabaseReportJobRow): ReportJobRecord {
  return {
    id: row.id,
    type: row.type as ReportJobType,
    status: row.status as ReportJobStatus,
    leadId: row.lead_id,
    paidOrderId: row.paid_order_id,
    payload: row.payload ?? {},
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    lockedAt: row.locked_at,
    lockedBy: row.locked_by,
    lastError: row.last_error,
    result: row.result,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSupabasePatch(job: ReportJobRecord): Partial<Omit<SupabaseReportJobRow, "id" | "created_at">> {
  return {
    type: job.type,
    status: job.status,
    lead_id: job.leadId ?? null,
    paid_order_id: job.paidOrderId ?? null,
    payload: job.payload ?? {},
    attempts: job.attempts,
    max_attempts: job.maxAttempts,
    locked_at: job.lockedAt ?? null,
    locked_by: job.lockedBy ?? null,
    last_error: job.lastError ?? null,
    result: job.result ?? null,
    updated_at: job.updatedAt,
  };
}
