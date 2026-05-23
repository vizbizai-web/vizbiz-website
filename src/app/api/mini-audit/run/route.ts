import { NextResponse } from "next/server";
import { createMiniReportFromAudit } from "@/engines/research/mini-audit";
import { runAudit } from "@/engines/research/runner";
import { saveJson, saveJsonWithKey } from "@/lib/file-store";
import { sendMiniReportEmail } from "@/lib/email";
import { buildMiniLeadRecord } from "@/lib/lead-pipeline";
import { parseMiniAuditLead } from "@/lib/mini-audit-intake";
import {
  attributionFromRawIntake,
  buildFreeIntakeAlert,
  sendTelegramAlert,
} from "@/lib/telegram-alerts";
import {
  createSupabaseLead,
  createSupabaseLeadEvent,
  createSupabaseTelegramAlertLog,
  saveSupabaseBusinessProfile,
  saveSupabaseCompetitors,
  saveSupabaseMiniReport,
  saveSupabaseSiteIntelligencePlaceholder,
  updateSupabaseLeadStatus,
} from "@/lib/supabase-crm";

export async function POST(request: Request) {
  try {
    const rawIntake = (await request.json()) as Record<string, unknown>;
    const lead = parseMiniAuditLead(rawIntake);
    const supabaseLead = await createSupabaseLead({ lead, rawIntake });
    if (supabaseLead.data) {
      await createSupabaseLeadEvent({
        leadId: supabaseLead.data.id,
        eventType: "submitted",
        payload: { source: "website_intake", competitorSource: lead.competitorSource },
      });
      await saveSupabaseCompetitors({
        leadId: supabaseLead.data.id,
        competitors: lead.auditInput.competitors ?? [],
        source: lead.competitorSource,
      });
      const alert = await sendTelegramAlert({
        type: "free_intake",
        text: buildFreeIntakeAlert({
          client: {
            businessName: lead.auditInput.name,
            email: lead.email,
            websiteUrl: lead.auditInput.websiteUrl,
            location: lead.auditInput.city,
            niche: lead.auditInput.businessType ?? lead.auditInput.primaryService,
          },
          competitorSource: lead.competitorSource,
          competitors: lead.auditInput.competitors ?? [],
          attribution: attributionFromRawIntake(rawIntake),
          supabaseLeadId: supabaseLead.data.id,
        }),
      });
      if (alert.status !== "skipped") {
        await createSupabaseTelegramAlertLog({
          leadId: supabaseLead.data.id,
          alertType: "free_intake",
          chatId: alert.chatId,
          threadId: alert.threadId,
          messageId: alert.messageId,
          status: alert.status === "sent" ? "sent" : "failed",
          errorMessage: alert.error,
        });
      }
      await updateSupabaseLeadStatus({ leadId: supabaseLead.data.id, status: "site_intelligence_running" });
    }

    const audit = await runAudit(lead.auditInput);
    const miniReport = {
      ...createMiniReportFromAudit(audit),
      leadEmail: lead.email,
      competitorSource: lead.competitorSource,
      competitorNote: lead.competitorSource === "user_supplied"
        ? "Competitor benchmark uses the two competitors you supplied, which improves accuracy."
        : "Add two competitors to make the competitor gap and local visibility opportunity estimate more accurate.",
    };

    const reportUrl = `/mini-report/${miniReport.slug}`;
    const absoluteReportUrl = new URL(reportUrl, request.url).toString();
    const emailDelivery = await sendMiniReportEmail({
      to: lead.email,
      email: miniReport.emailMiniReport,
      reportUrl: absoluteReportUrl,
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
    });

    await saveJson("audits", audit);
    await saveJsonWithKey("mini-reports", miniReport.slug, miniReport);
    await saveJsonWithKey("mini-report-emails", miniReport.id, {
      id: miniReport.id,
      to: lead.email,
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
      email: lead.email,
      auditId: audit.id,
      reportSlug: miniReport.slug,
      competitorSource: lead.competitorSource,
      competitors: lead.auditInput.competitors ?? [],
      client: miniReport.client,
      emailDeliveryStatus: emailDelivery.status,
      createdAt: miniReport.createdAt,
    }));

    if (supabaseLead.data) {
      await saveSupabaseSiteIntelligencePlaceholder({ leadId: supabaseLead.data.id, audit });
      await saveSupabaseBusinessProfile({ leadId: supabaseLead.data.id, report: miniReport });
      await saveSupabaseMiniReport({
        leadId: supabaseLead.data.id,
        report: miniReport,
        absoluteReportUrl,
        emailDeliveryStatus: emailDelivery.status,
      });
      await createSupabaseLeadEvent({
        leadId: supabaseLead.data.id,
        eventType: "report_generated",
        payload: { slug: miniReport.slug, aviScore: miniReport.aviScore, reportUrl: absoluteReportUrl },
      });
      await updateSupabaseLeadStatus({ leadId: supabaseLead.data.id, status: emailDelivery.status === "sent" ? "report_sent" : "report_generating" });
    }

    return NextResponse.json({ slug: miniReport.slug, reportUrl, report: miniReport, emailDelivery, supabaseLeadId: supabaseLead.data?.id ?? null }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to run mini audit" },
      { status: 400 },
    );
  }
}
