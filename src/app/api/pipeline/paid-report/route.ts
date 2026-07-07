/**
 * Pipeline Phase 6: PAID REPORT PREP (async)
 *
 * Prepares/stores paid report readiness state only. Client delivery is blocked
 * until the operator approves and sends from Mission Control.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead } from "@/lib/google-sheets";
import { sendRevenueAlert } from "@/lib/telegram-alerts";
import { assertPaidReportResearchComplete } from "@/lib/paid-report-readiness";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId, tier } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/paid-report] Preparing paid report for ${leadId}, tier=${tier}`);

  try {
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    if (!['paid_intake_submitted', 'paid_report_drafting', 'paid_report_ready_for_review'].includes(lead.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Paid report prep requires submitted paid intake before drafting.",
          currentStatus: lead.status,
        },
        { status: 409 }
      );
    }

    const readiness = assertPaidReportResearchComplete(lead);
    if (!readiness.ok) {
      return NextResponse.json(
        {
          success: false,
          error: readiness.error,
          currentResearchStatus: lead.researchStatus,
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const reportUrl = `https://vizbiz.ai/report/${leadId}/full/`;
    const monitoringState = tier === "fix_and_monitor" ? "monitoring_setup_required" : "monitoring_available_later";

    await updateLead(leadId, {
      status: "paid_report_ready_for_review",
      reportGeneratedAt: now,
      reportUrl,
      lastStage: "paid_report_review",
      notes: `${lead.notes || ""}\n[Paid report ready for operator review at ${now}; tier=${tier || "fix"}; ${monitoringState}; reportUrl=${reportUrl}]`,
    });

    await sendRevenueAlert(
      `🧾 Paid report ready for operator review — ${lead.dealershipName}\nLead ID: ${leadId}\nTier: ${tier || "fix"}\nReport: ${reportUrl}\nClient email: blocked until approval`
    ).catch(() => {});

    console.info(`[pipeline/paid-report] Ready for operator review: ${leadId}`);

    return NextResponse.json({
      success: true,
      leadId,
      tier,
      status: "paid_report_ready_for_review",
      reportUrl,
      emailSent: false,
      deliveryBlockedUntilApproval: true,
      monitoringState,
    });
  } catch (error) {
    console.error(`[pipeline/paid-report] Failed for ${leadId}:`, error);
    return NextResponse.json({ success: false, error: "Paid report prep failed", leadId }, { status: 500 });
  }
}
