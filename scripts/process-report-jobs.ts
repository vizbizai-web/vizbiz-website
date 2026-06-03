import { loadEnvConfig } from "@next/env";
import type { MiniAuditLead } from "@/lib/mini-audit-intake";
import { generateMiniReportForLead } from "@/lib/report-generation-service";
import {
  claimNextReportJob,
  completeReportJob,
  failReportJob,
  markReportJobNeedsReview,
  type ReportJobRecord,
} from "@/lib/report-job-queue";

export interface ProcessReportJobsOptions {
  limit?: number;
  workerId?: string;
}

export interface ProcessReportJobsResult {
  processed: number;
  completed: number;
  needsReview: number;
  failed: number;
}

interface FreeMiniReportPayload {
  lead: MiniAuditLead;
  rawIntake?: Record<string, unknown>;
  baseUrl?: string;
  origin?: string;
  supabaseLeadId?: string | null;
}

const DEFAULT_LIMIT = 3;

loadEnvConfig(process.cwd());

export async function processReportJobs(options: ProcessReportJobsOptions = {}): Promise<ProcessReportJobsResult> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const workerId = options.workerId ?? `report-worker-${process.pid}-${Date.now()}`;
  const result: ProcessReportJobsResult = { processed: 0, completed: 0, needsReview: 0, failed: 0 };

  for (let index = 0; index < limit; index += 1) {
    const job = await claimNextReportJob(workerId);
    if (!job) break;

    result.processed += 1;
    const status = await processReportJob(job);
    if (status === "completed") result.completed += 1;
    if (status === "needs_operator_review") result.needsReview += 1;
    if (status === "failed") result.failed += 1;
  }

  return result;
}

export async function processReportJob(job: ReportJobRecord): Promise<"completed" | "needs_operator_review" | "failed"> {
  try {
    if (job.type !== "free_mini_report") {
      await markReportJobNeedsReview(job.id, [`Report job type ${job.type} is not implemented by this worker yet`]);
      return "needs_operator_review";
    }

    const payload = parseFreeMiniReportPayload(job.payload);
    const generation = await generateMiniReportForLead({
      lead: payload.lead,
      rawIntake: payload.rawIntake,
      baseUrl: payload.baseUrl ?? payload.origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      supabaseLeadId: payload.supabaseLeadId ?? job.leadId ?? null,
      mode: "free",
    });

    const jobResult = {
      status: generation.status,
      slug: generation.slug,
      reportUrl: generation.reportUrl,
      absoluteReportUrl: generation.absoluteReportUrl,
      emailDelivery: generation.emailDelivery,
    };

    if (generation.status === "needs_operator_review") {
      await markReportJobNeedsReview(job.id, generation.reasons ?? ["Report generation requires operator review"], jobResult);
      return "needs_operator_review";
    }

    await completeReportJob(job.id, jobResult);
    return "completed";
  } catch (error) {
    await failReportJob(job.id, error, true);
    return "failed";
  }
}

function parseFreeMiniReportPayload(payload: Record<string, unknown>): FreeMiniReportPayload {
  const lead = payload.lead;
  if (!isMiniAuditLead(lead)) {
    throw new Error("free_mini_report job payload is missing a valid lead");
  }

  return {
    lead,
    rawIntake: isRecord(payload.rawIntake) ? payload.rawIntake : undefined,
    baseUrl: typeof payload.baseUrl === "string" ? payload.baseUrl : undefined,
    origin: typeof payload.origin === "string" ? payload.origin : undefined,
    supabaseLeadId: typeof payload.supabaseLeadId === "string" ? payload.supabaseLeadId : null,
  };
}

function isMiniAuditLead(value: unknown): value is MiniAuditLead {
  if (!isRecord(value)) return false;
  const auditInput = value.auditInput;
  return typeof value.email === "string"
    && typeof value.competitorSource === "string"
    && isRecord(auditInput)
    && typeof auditInput.name === "string"
    && typeof auditInput.city === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function limitFromArgv(argv: string[]) {
  const limitArg = argv.find((arg) => arg.startsWith("--limit="));
  if (!limitArg) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(limitArg.split("=", 2)[1] ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error("--limit must be a positive integer");
  }
  return parsed;
}

async function main() {
  const limit = limitFromArgv(process.argv.slice(2));
  const result = await processReportJobs({ limit });
  console.log(`Report worker processed ${result.processed} job(s): ${result.completed} completed, ${result.needsReview} needs review, ${result.failed} failed.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Report worker failed");
    process.exitCode = 1;
  });
}
