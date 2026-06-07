/**
 * Pipeline: Check Abandoned Checkouts
 *
 * Runs periodically (via cron or manual trigger).
 * Checks for Stripe checkout sessions that were created but not completed within 30 minutes.
 * Sends Telegram alert for follow-up.
 *
 * NOTE: This is a simplified version. For full Stripe integration,
 * you'd query the Stripe API for recent sessions. This version
 * checks Sheets for leads that have checkout activity but no payment.
 */

import { NextResponse } from "next/server";
import { getLeadsByStatus, updateLead } from "@/lib/google-sheets";
import { sendRevenueAlert } from "@/lib/telegram-alerts";

export async function GET() {
  console.info("[pipeline/check-abandoned] Running abandoned checkout check");

  try {
    // Check for leads that are in "pending_review" or "approved" status
    // but haven't been paid — these might have abandoned checkouts
    const pendingLeads = await getLeadsByStatus("pending_review");
    const approvedLeads = await getLeadsByStatus("approved");

    const allLeads = [...pendingLeads, ...approvedLeads];
    let abandonedCount = 0;

    for (const lead of allLeads) {
      // Check if the lead was created more than 30 minutes ago
      const createdAt = new Date(lead.timestamp);
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

      if (createdAt < thirtyMinAgo) {
        // Check if we already alerted about this lead
        const alreadyAlerted = lead.notes?.includes("[abandoned_alert_sent]");

        if (!alreadyAlerted) {
          // Send Telegram alert
          await sendRevenueAlert(
            `⚠️ Possible abandoned checkout: ${lead.dealershipName} (${lead.leadId}) — ${lead.email}\n` +
            `Status: ${lead.status}, Created: ${lead.timestamp}\n` +
            `Report: https://vizbiz.ai/report/${lead.leadId}/\n` +
            `Follow up?`
          ).catch(() => {});

          // Mark as alerted in notes
          try {
            await updateLead(lead.leadId, {
              notes: `${lead.notes || ""}\n[abandoned_alert_sent at ${new Date().toISOString()}]`,
            });
          } catch { /* non-blocking */ }

          abandonedCount++;
          console.info(`[pipeline/check-abandoned] Alert sent for ${lead.leadId}`);
        }
      }
    }

    console.info(`[pipeline/check-abandoned] Check complete. Abandoned: ${abandonedCount}`);

    return NextResponse.json({
      checked: true,
      totalLeads: allLeads.length,
      abandoned: abandonedCount,
    });
  } catch (error) {
    console.error("[pipeline/check-abandoned] Failed:", error);
    return NextResponse.json({ checked: false, error: "Check failed" }, { status: 500 });
  }
}
