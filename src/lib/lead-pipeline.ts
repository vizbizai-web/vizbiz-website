import type { CompetitorSource } from "@/lib/mini-audit-intake";

export type MiniLeadStatus =
  | "submitted"
  | "scan_complete"
  | "email_prepared"
  | "email_sent"
  | "report_viewed"
  | "cta_clicked"
  | "paid_conversion";

export type EmailDeliveryStatus = "dry_run" | "sent" | "failed";
export type PaidProduct = "fix_package" | "monthly_plan";

export interface MiniLeadStatusEvent {
  status: MiniLeadStatus;
  at: string;
  note?: string;
}

export interface MiniLeadCtaClick {
  product: PaidProduct;
  destinationUrl: string;
  clickedAt: string;
}

export interface MiniLeadRecord {
  id: string;
  email: string;
  auditId: string;
  reportSlug: string;
  competitorSource: CompetitorSource;
  competitors: unknown[];
  client: unknown;
  status: MiniLeadStatus;
  statusHistory: MiniLeadStatusEvent[];
  emailDeliveryStatus: EmailDeliveryStatus;
  reportViewedAt: string | null;
  ctaClicks: MiniLeadCtaClick[];
  createdAt: string;
  updatedAt: string;
}

interface BuildMiniLeadRecordInput {
  id: string;
  email: string;
  auditId: string;
  reportSlug: string;
  competitorSource: CompetitorSource;
  competitors: unknown[];
  client: unknown;
  emailDeliveryStatus: EmailDeliveryStatus;
  createdAt: string;
}

const statusRank: Record<MiniLeadStatus, number> = {
  submitted: 0,
  scan_complete: 1,
  email_prepared: 2,
  email_sent: 3,
  report_viewed: 4,
  cta_clicked: 5,
  paid_conversion: 6,
};

export function nextLeadStatus(current: MiniLeadStatus, next: MiniLeadStatus): MiniLeadStatus {
  return statusRank[next] > statusRank[current] ? next : current;
}

export function buildMiniLeadRecord(input: BuildMiniLeadRecordInput): MiniLeadRecord {
  const finalEmailStatus = input.emailDeliveryStatus === "sent" ? "email_sent" : "email_prepared";
  const statuses: MiniLeadStatus[] = ["submitted", "scan_complete", finalEmailStatus];
  return {
    id: input.id,
    email: input.email,
    auditId: input.auditId,
    reportSlug: input.reportSlug,
    competitorSource: input.competitorSource,
    competitors: input.competitors,
    client: input.client,
    status: finalEmailStatus,
    statusHistory: statuses.map((status) => ({ status, at: input.createdAt })),
    emailDeliveryStatus: input.emailDeliveryStatus,
    reportViewedAt: null,
    ctaClicks: [],
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };
}

export interface PaymentLinks {
  fixPackage: {
    product: "fix_package";
    trackingUrl: string;
    destinationUrl: string;
  };
  monthlyPlan: {
    product: "monthly_plan";
    trackingUrl: string;
    destinationUrl: string;
  };
}

export function buildPaymentLinks(input: {
  slug: string;
  baseUrl?: string;
  fixPackageUrl?: string;
  monthlyPlanUrl?: string;
}): PaymentLinks {
  const baseUrl = (input.baseUrl ?? "").replace(/\/$/, "");
  const trackingBase = `${baseUrl}/api/mini-audit/cta?slug=${encodeURIComponent(input.slug)}`;

  return {
    fixPackage: {
      product: "fix_package",
      trackingUrl: `${trackingBase}&product=fix_package`,
      destinationUrl: input.fixPackageUrl || "/#pricing",
    },
    monthlyPlan: {
      product: "monthly_plan",
      trackingUrl: `${trackingBase}&product=monthly_plan`,
      destinationUrl: input.monthlyPlanUrl || "/#pricing",
    },
  };
}

export function appendStatus(record: MiniLeadRecord, status: MiniLeadStatus, note?: string, at = new Date().toISOString()): MiniLeadRecord {
  const nextStatus = nextLeadStatus(record.status, status);
  const alreadyHasStatus = record.statusHistory.some((event) => event.status === status);
  return {
    ...record,
    status: nextStatus,
    statusHistory: alreadyHasStatus ? record.statusHistory : [...record.statusHistory, { status, at, note }],
    reportViewedAt: status === "report_viewed" && !record.reportViewedAt ? at : record.reportViewedAt,
    updatedAt: at,
  };
}

export function appendCtaClick(record: MiniLeadRecord, click: MiniLeadCtaClick): MiniLeadRecord {
  return appendStatus(
    {
      ...record,
      ctaClicks: [...record.ctaClicks, click],
    },
    "cta_clicked",
    `${click.product} CTA clicked`,
    click.clickedAt,
  );
}
