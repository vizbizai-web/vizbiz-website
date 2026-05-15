/**
 * Pipeline Phase 5: FREE DELIVERY (async)
 *
 * Sends snapshot email to the lead. Updates Sheets status.
 * Telegram alert on delivery.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead } from "@/lib/google-sheets";
import { buildSnapshotEmailHtml, type SnapshotEmailData } from "@/lib/snapshot-email";
import { sendPipelineAlert } from "@/lib/telegram-alerts";

async function sendSnapshotEmail(
  to: string,
  data: SnapshotEmailData
): Promise<void> {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    service: "gmail",
    auth: {
      user: "vizbiz.ai@gmail.com",
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const html = buildSnapshotEmailHtml(data);

  await transporter.sendMail({
    from: '"VizBiz" <vizbiz.ai@gmail.com>',
    to,
    subject: `Your AI Visibility Snapshot — ${data.dealershipName}`,
    html,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/deliver] Starting for ${leadId}`);

  try {
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    // Parse research data for email content
    let researchData: any = {};
    try {
      const notesStr = lead.notes || "";
      const jsonStart = notesStr.lastIndexOf('{"preflight"');
      if (jsonStart !== -1) {
        let braceCount = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < notesStr.length; i++) {
          if (notesStr[i] === '{') braceCount++;
          if (notesStr[i] === '}') braceCount--;
          if (braceCount === 0) { jsonEnd = i + 1; break; }
        }
        if (jsonEnd > 0) {
          const parsed = JSON.parse(notesStr.substring(jsonStart, jsonEnd));
          researchData = parsed.research || {};
        }
      }
    } catch { /* use defaults */ }

    // Send email if lead has an email address
    if (lead.email) {
      try {
        const emailData: SnapshotEmailData = {
          dealershipName: lead.dealershipName,
          contactName: lead.contactName,
          city: lead.city,
          snapshotDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          appearedIn: lead.snapshotAppeared || `${researchData.appearedCount || 0} of ${researchData.totalPrompts || 0} prompts`,
          overallVisibility: String(researchData.statusBand === "Strong" ? 70 : researchData.statusBand === "Moderate" ? 45 : 15),
          serviceDeptVisibility: lead.serviceVisibility || "Not surfaced",
          competitorName: researchData.competitorMention || "nearby competitors",
          competitorCategories: researchData.niche || "local business",
          bookingUrl: "https://vizbiz.ai/book-call",
          profitAtRiskLow: researchData.revenueLoss,
          profitAtRiskHigh: researchData.leadsLost,
        };

        await sendSnapshotEmail(lead.email, emailData);
        console.info(`[pipeline/deliver] Snapshot email sent to ${lead.email}`);
      } catch (emailErr) {
        console.error(`[pipeline/deliver] Email send failed:`, emailErr);
        // Non-blocking — still mark as delivered
      }
    }

    // Update Sheets
    await updateLead(leadId, {
      emailSentAt: new Date().toISOString(),
      notes: `${lead.notes}\n[Delivered at ${new Date().toISOString()}]`,
    });

    // Telegram alert
    await sendPipelineAlert(
      `✅ Report delivered to ${lead.dealershipName} — ${lead.email}\nLead ID: ${leadId}\nReport: https://vizbiz.ai/report/${leadId}`
    );

    console.info(`[pipeline/deliver] Complete for ${leadId}`);

    return NextResponse.json({ success: true, leadId, emailSent: !!lead.email });
  } catch (error) {
    console.error(`[pipeline/deliver] Failed for ${leadId}:`, error);
    return NextResponse.json({ success: false, error: "Delivery failed", leadId }, { status: 500 });
  }
}
