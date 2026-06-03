import type { ReportJobRecord, ReportJobStatus, ReportJobType } from "@/lib/report-job-queue";

export const REPORT_JOB_STATUSES: ReportJobStatus[] = [
  "queued",
  "processing",
  "completed",
  "needs_operator_review",
  "failed_retryable",
  "failed_permanent",
];

const STATUS_LABELS: Record<ReportJobStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  needs_operator_review: "Needs operator review",
  failed_retryable: "Failed — retryable",
  failed_permanent: "Failed — permanent",
};

const TYPE_LABELS: Record<ReportJobType, string> = {
  free_mini_report: "Free mini report",
  paid_full_report: "Paid full report",
  paid_monthly_baseline: "Paid monthly baseline",
  rerun_report: "Rerun report",
};

export interface ReportJobViewModel {
  id: string;
  shortId: string;
  status: ReportJobStatus;
  statusLabel: string;
  typeLabel: string;
  businessName: string;
  clientName: string;
  email: string;
  paidOrderId: string;
  attemptsLabel: string;
  lockedLabel: string;
  lastError: string;
  reportUrl: string;
  reasons: string[];
  payloadSummary: Array<{ label: string; value: string }>;
  createdLabel: string;
  updatedLabel: string;
}

export function buildReportQueueSummary(jobs: ReportJobRecord[]) {
  const viewModels = jobs.map(buildReportJobViewModel);
  return {
    total: jobs.length,
    statusCards: REPORT_JOB_STATUSES.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: jobs.filter((job) => job.status === status).length,
    })),
    jobs: viewModels,
  };
}

export function buildReportJobViewModel(job: ReportJobRecord): ReportJobViewModel {
  const payload = job.payload ?? {};
  const lead = asRecord(payload.lead);
  const auditInput = asRecord(lead.auditInput) ?? asRecord(payload.auditInput);
  const result = job.result ?? {};
  const reasons = arrayOfStrings(result.reasons);
  const competitors = extractCompetitors(auditInput?.competitors);

  return {
    id: job.id,
    shortId: shortenId(job.id),
    status: job.status,
    statusLabel: STATUS_LABELS[job.status],
    typeLabel: TYPE_LABELS[job.type],
    businessName: stringValue(auditInput?.name) || stringValue(payload.businessName) || stringValue(payload.clientName) || "Unknown business",
    clientName: stringValue(auditInput?.clientName) || stringValue(payload.clientName) || "—",
    email: stringValue(lead.email) || stringValue(payload.email) || "—",
    paidOrderId: job.paidOrderId ?? (stringValue(payload.orderId) || "—"),
    attemptsLabel: `${job.attempts} / ${job.maxAttempts}`,
    lockedLabel: job.lockedBy && job.lockedAt ? `${job.lockedBy} · ${formatDate(job.lockedAt)}` : "Not locked",
    lastError: job.lastError ?? "",
    reportUrl: stringValue(result.absoluteReportUrl) || stringValue(result.reportUrl) || "",
    reasons,
    payloadSummary: compactSummary([
      { label: "Website", value: stringValue(auditInput?.websiteUrl) || stringValue(payload.websiteUrl) },
      { label: "Location", value: stringValue(auditInput?.city) || stringValue(payload.primaryLocation) },
      { label: "Competitors", value: summarizeCompetitors(competitors) },
    ]),
    createdLabel: formatDate(job.createdAt),
    updatedLabel: formatDate(job.updatedAt),
  };
}

function shortenId(id: string) {
  if (id.length <= 18) return id;
  return `${id.slice(0, 11)}…${id.slice(-6)}`;
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const iso = date.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.map((item) => stringValue(item)).filter(Boolean) : [];
}

function extractCompetitors(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => stringValue(asRecord(item).name) || stringValue(item)).filter(Boolean);
}

function summarizeCompetitors(competitors: string[]) {
  if (!competitors.length) return "";
  if (competitors.length <= 2) return competitors.join(", ");
  return `${competitors.slice(0, 2).join(", ")} +${competitors.length - 2} more`;
}

function compactSummary(items: Array<{ label: string; value: string }>) {
  return items.filter((item) => item.value);
}
