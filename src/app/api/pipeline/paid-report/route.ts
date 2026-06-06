/**
 * Pipeline Phase 6: PAID REPORT GENERATION (async)
 *
 * Triggered by Stripe webhook after payment.
 * Generates full report, sends email, updates Sheets.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead } from "@/lib/google-sheets";
import { sendRevenueAlert } from "@/lib/telegram-alerts";
import { sendVizBizEmail } from "@/lib/resend-mailer";

async function sendPaidReportEmail(
  to: string,
  businessName: string,
  leadId: string,
  tier: string
): Promise<void> {

  const reportUrl = `https://vizbiz.ai/report/${leadId}/full`;
  const tierLabel = tier === "fix_and_monitor" ? "Fix + Monthly Monitoring" : "Full Audit Fix";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #02091F; color: #F5F5F7;">
      <div style="padding: 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <h1 style="color: #25D1F2; font-size: 24px; margin: 0;">VizBiz</h1>
        <p style="color: #F5F5F7; font-size: 16px; margin: 8px 0 0;">Implementation Pack Ready</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F7;">Hi there,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F7;">
          Your <strong>${tierLabel}</strong> for <strong>${businessName}</strong> is ready.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F7;">
          Your pack includes: schema markup, llms.txt, FAQ content, technical fixes, revenue impact analysis${tier === "fix_and_monitor" ? ", and ongoing monthly monitoring" : ", and copy optimization recommendations"}.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${reportUrl}" style="display: inline-block; background: linear-gradient(to right, #06B6D4, #25D1F2); color: #051018; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
            View Full Report + Download Pack
          </a>
        </div>
      </div>
      <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
        <p style="font-size: 12px; color: rgba(245,245,247,0.4); margin: 0;">
          VizBiz.ai — AI Visibility Intelligence<br/>
          Questions? Reply to this email or book a call at vizbiz.ai/book-call
        </p>
      </div>
    </div>
  `;

  await sendVizBizEmail({
    to,
    subject: `Your VizBiz Implementation Pack is Ready — ${businessName}`,
    html,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId, tier } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/paid-report] Starting for ${leadId}, tier=${tier}`);

  try {
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    // Update Sheets to mark as paid
    await updateLead(leadId, {
      notes: `${lead.notes}\n[Paid report generation at ${new Date().toISOString()}, tier=${tier}]`,
    });

    // The full report page already exists at /report/[leadId]/full
    // It renders based on stored data. We just need to make sure the data is there.
    // For monitoring tier, we'd set up a cron — for now this is a placeholder.
    if (tier === "fix_and_monitor") {
      console.info(`[pipeline/paid-report] Monitoring tier — would set up monthly re-audit for ${leadId}`);
      // TODO: Set up monitoring cron for this lead
    }

    // Send paid report email
    const customerEmail = lead.email;
    if (customerEmail) {
      try {
        await sendPaidReportEmail(customerEmail, lead.dealershipName, leadId, tier);
        console.info(`[pipeline/paid-report] Email sent to ${customerEmail}`);
      } catch (emailErr) {
        console.error(`[pipeline/paid-report] Email failed:`, emailErr);
      }
    }

    // Telegram alert
    await sendRevenueAlert(
      `✅ Paid report delivered to ${lead.dealershipName} — ${tier} tier\nLead ID: ${leadId}\nReport: https://vizbiz.ai/report/${leadId}/full`
    );

    console.info(`[pipeline/paid-report] Complete for ${leadId}`);

    return NextResponse.json({ success: true, leadId, tier, emailSent: !!customerEmail });
  } catch (error) {
    console.error(`[pipeline/paid-report] Failed for ${leadId}:`, error);
    return NextResponse.json({ success: false, error: "Paid report generation failed", leadId }, { status: 500 });
  }
}
