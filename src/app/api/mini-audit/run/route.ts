import { NextResponse } from "next/server";
import { parseMiniAuditLead } from "@/lib/mini-audit-intake";
import { enqueueReportJob } from "@/lib/report-job-queue";
import {
  attributionFromRawIntake,
  buildFreeIntakeAlert,
  sendTelegramAlert,
} from "@/lib/telegram-alerts";
import {
  createSupabaseLead,
  createSupabaseLeadEvent,
  createSupabaseTelegramAlertLog,
  saveSupabaseCompetitors,
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
    }

    const supabaseLeadId = supabaseLead.data?.id ?? null;
    const baseUrl = new URL(request.url).origin;
    const job = await enqueueReportJob({
      type: "free_mini_report",
      leadId: supabaseLeadId,
      payload: {
        rawIntake,
        lead,
        auditInput: lead.auditInput,
        email: lead.email,
        competitorSource: lead.competitorSource,
        baseUrl,
        origin: baseUrl,
        supabaseLeadId,
      },
    });

    if (supabaseLeadId) {
      await createSupabaseLeadEvent({
        leadId: supabaseLeadId,
        eventType: "report_queued",
        payload: { jobId: job.id, jobType: job.type },
      });
      await updateSupabaseLeadStatus({ leadId: supabaseLeadId, status: "report_queued" });
    }

    return NextResponse.json({
      status: "queued",
      jobId: job.id,
      thankYouUrl: `/intake/thank-you?${new URLSearchParams({ email: lead.email, delivery: "queued" }).toString()}`,
      supabaseLeadId,
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to run mini audit" },
      { status: 400 },
    );
  }
}
