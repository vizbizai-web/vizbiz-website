import { createMiniReportFromAudit, type MiniAuditReport } from "@/engines/research/mini-audit";
import { runAudit } from "@/engines/research/runner";
import { sendMiniReportEmail, type EmailSendResult } from "@/lib/email";
import { saveJson, saveJsonWithKey } from "@/lib/file-store";
import { buildMiniLeadRecord } from "@/lib/lead-pipeline";
import type { MiniAuditLead } from "@/lib/mini-audit-intake";
import {
  createSupabaseLeadEvent,
  hasSupabaseServerConfig,
  saveSupabaseBusinessProfile,
  saveSupabaseMiniReport,
  saveSupabaseSiteIntelligencePlaceholder,
  updateSupabaseLeadStatus,
} from "@/lib/supabase-crm";

export type ReportGenerationMode = "free" | "paid_baseline" | "paid_full";

export type GenerateMiniReportStatus = "report_sent" | "needs_operator_review" | "report_prepared";

export interface GenerateMiniReportForLeadInput {
  lead: MiniAuditLead;
  rawIntake?: Record<string, unknown>;
  baseUrl: string;
  supabaseLeadId?: string | null;
  mode: ReportGenerationMode;
}

export interface GenerateMiniReportForLeadResult {
  status: GenerateMiniReportStatus;
  slug?: string;
  reportUrl?: string;
  absoluteReportUrl?: string;
  reasons?: string[];
  emailDelivery?: EmailSendResult;
  report?: MiniAuditReportWithLeadContext;
}

type MiniAuditReportWithLeadContext = MiniAuditReport & {
  leadEmail: string;
  competitorSource: MiniAuditLead["competitorSource"];
  competitorNote: string;
};

export async function generateMiniReportForLead(input: GenerateMiniReportForLeadInput): Promise<GenerateMiniReportForLeadResult> {
  const audit = await runAudit(input.lead.auditInput);
  const miniReport: MiniAuditReportWithLeadContext = {
    ...createMiniReportFromAudit(audit),
    leadEmail: input.lead.email,
    competitorSource: input.lead.competitorSource,
    competitorNote: input.lead.competitorSource === "user_supplied"
      ? "Competitor benchmark uses the two competitors you supplied, which improves accuracy."
      : "Add two competitors to make the competitor gap and local visibility opportunity estimate more accurate.",
  };

  await saveJson("audits", audit);
  await saveJsonWithKey("mini-reports", miniReport.slug, miniReport);

  const reportUrl = `/mini-report/${miniReport.slug}`;
  const absoluteReportUrl = new URL(reportUrl, input.baseUrl).toString();
  const supabaseLeadId = input.supabaseLeadId ?? undefined;
  let durableReportSaved = false;

  if (supabaseLeadId && hasSupabaseServerConfig()) {
    await saveSupabaseSiteIntelligencePlaceholder({ leadId: supabaseLeadId, audit });
    await saveSupabaseBusinessProfile({ leadId: supabaseLeadId, report: miniReport });
    const supabaseReport = await saveSupabaseMiniReport({
      leadId: supabaseLeadId,
      report: miniReport,
      absoluteReportUrl,
      emailDeliveryStatus: "dry_run",
    });
    if (supabaseReport.error) {
      throw new Error(`Mini report was generated but could not be saved for email delivery: ${supabaseReport.error.message}`);
    }
    durableReportSaved = true;
    await createSupabaseLeadEvent({
      leadId: supabaseLeadId,
      eventType: "report_generated",
      payload: { slug: miniReport.slug, aviScore: miniReport.aviScore, reportUrl: absoluteReportUrl, mode: input.mode },
    });
  }

  const reportQuality = validateMiniReportQuality(miniReport);
  if (!reportQuality.ok) {
    if (supabaseLeadId) {
      await updateSupabaseLeadStatus({ leadId: supabaseLeadId, status: "needs_operator_review" });
      await createSupabaseLeadEvent({
        leadId: supabaseLeadId,
        eventType: "report_blocked_quality_gate",
        payload: { reasons: reportQuality.reasons, profile: miniReport.businessProfile, mode: input.mode },
      });
    }
    return {
      status: "needs_operator_review",
      slug: miniReport.slug,
      reportUrl,
      absoluteReportUrl,
      reasons: reportQuality.reasons,
      report: miniReport,
    };
  }

  if (process.env.VERCEL && !durableReportSaved && !hasSupabaseServerConfig()) {
    throw new Error("Report storage is not configured for Vercel. Refusing to send an email link that would 404.");
  }

  const emailDelivery = await sendMiniReportEmail({
    to: input.lead.email,
    email: miniReport.emailMiniReport,
    reportUrl: absoluteReportUrl,
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    replyTo: process.env.RESEND_REPLY_TO_EMAIL,
  });

  await saveJsonWithKey("mini-report-emails", miniReport.id, {
    id: miniReport.id,
    to: input.lead.email,
    reportUrl,
    absoluteReportUrl,
    subject: miniReport.emailMiniReport.subject,
    previewText: miniReport.emailMiniReport.previewText,
    openingLine: miniReport.emailMiniReport.openingLine,
    bullets: miniReport.emailMiniReport.bullets,
    ctaLabel: miniReport.emailMiniReport.ctaLabel,
    delivery: emailDelivery,
    createdAt: miniReport.createdAt,
  });
  await saveJsonWithKey("mini-leads", miniReport.id, buildMiniLeadRecord({
    id: miniReport.id,
    email: input.lead.email,
    auditId: audit.id,
    reportSlug: miniReport.slug,
    competitorSource: input.lead.competitorSource,
    competitors: input.lead.auditInput.competitors ?? [],
    client: miniReport.client,
    emailDeliveryStatus: emailDelivery.status,
    createdAt: miniReport.createdAt,
  }));

  if (supabaseLeadId) {
    await updateSupabaseLeadStatus({ leadId: supabaseLeadId, status: emailDelivery.status === "sent" ? "report_sent" : "report_generating" });
  }

  return {
    status: emailDelivery.status === "sent" ? "report_sent" : "report_prepared",
    slug: miniReport.slug,
    reportUrl,
    absoluteReportUrl,
    emailDelivery,
    report: miniReport,
  };
}

export function validateMiniReportQuality(report: {
  businessProfile?: { profileMode?: string; displayNiche?: string; niche?: string; primaryServices?: string[] };
  businessIntelligenceProfile?: { needsOperatorReview?: boolean; confidence?: number; contradictions?: string[]; displayNiche?: string; primaryServices?: string[] };
  buyerQuestionTest?: { prompts?: Array<{ question?: string }> };
}) {
  const reasons: string[] = [];
  const profile = report.businessProfile;
  const intelligence = report.businessIntelligenceProfile;
  const questions = report.buyerQuestionTest?.prompts?.map((prompt) => prompt.question ?? "") ?? [];
  const joinedQuestions = questions.join(" \n ").toLowerCase();
  const serviceTerms = (profile?.primaryServices ?? []).join(" ").toLowerCase();
  const hasSpecificService = serviceTerms.length >= 4 && !/^(local service|consultation|appointment|quote|service provider|services?)$/.test(serviceTerms.trim());

  if (intelligence?.needsOperatorReview) {
    reasons.push(`business intelligence confidence gate requires operator review (${intelligence.confidence ?? 0}/100)`);
  }
  for (const contradiction of intelligence?.contradictions ?? []) {
    reasons.push(contradiction);
  }
  if (profile?.profileMode === "needs_review") {
    reasons.push("business niche was too generic after site/intake analysis");
  }
  if (/generic[_ ]local[_ ]service/.test(`${profile?.niche ?? ""} ${profile?.displayNiche ?? ""}`.toLowerCase()) && !hasSpecificService) {
    reasons.push("detected niche is generic and no specific service was extracted");
  }
  if (/\b(local business|which local business|looking for a local business)\b/.test(joinedQuestions) && hasSpecificService) {
    reasons.push("client-facing AI questions still use generic local-business wording");
  }

  return { ok: reasons.length === 0, reasons };
}
