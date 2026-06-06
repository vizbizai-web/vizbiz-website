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
import { sendVizBizEmail } from "@/lib/resend-mailer";

async function sendSnapshotEmail(
  to: string,
  data: SnapshotEmailData
): Promise<void> {
  const html = buildSnapshotEmailHtml(data);

  await sendVizBizEmail({
    to,
    subject: `Your AI Visibility Snapshot — ${data.dealershipName}`,
    html,
  });
}

function getStringValue(record: Record<string, unknown>, key: string, fallback: string): string {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getNumberValue(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
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

    if (lead.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Free report delivery requires operator-approved status", currentStatus: lead.status },
        { status: 409 }
      );
    }

    // Parse research data for email content
    let researchData: Record<string, unknown> = {};
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
          researchData = typeof parsed.research === "object" && parsed.research ? parsed.research : {};
        }
      }
    } catch { /* use defaults */ }

    if (lead.researchStatus !== "complete" || Object.keys(researchData).length === 0) {
      return NextResponse.json(
        { success: false, error: "Free report delivery requires completed research data" },
        { status: 409 }
      );
    }

    // Send email if lead has an email address
    let emailSent = false;
    if (lead.email) {
      const emailData: SnapshotEmailData = {
        dealershipName: lead.dealershipName,
        contactName: lead.contactName,
        city: lead.city,
        snapshotDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        appearedIn: lead.snapshotAppeared || `${getNumberValue(researchData, "appearedCount") || 0} of ${getNumberValue(researchData, "totalPrompts") || 0} prompts`,
        overallVisibility: String(researchData.statusBand === "Strong" ? 70 : researchData.statusBand === "Moderate" ? 45 : 15),
        serviceDeptVisibility: lead.serviceVisibility || "Not surfaced",
        competitorName: getStringValue(researchData, "competitorMention", "nearby competitors"),
        competitorCategories: getStringValue(researchData, "niche", "local business"),
        bookingUrl: "https://vizbiz.ai/book-call/",
        profitAtRiskLow: getNumberValue(researchData, "revenueLoss"),
        profitAtRiskHigh: getNumberValue(researchData, "leadsLost"),
      };

      await sendSnapshotEmail(lead.email, emailData);
      emailSent = true;
      console.info(`[pipeline/deliver] Snapshot email sent to ${lead.email}`);
    } else {
      return NextResponse.json({ success: false, error: "Lead has no email address" }, { status: 409 });
    }

    // Update CRM
    await updateLead(leadId, {
      status: "contacted",
      emailSentAt: new Date().toISOString(),
      notes: `${lead.notes}\n[Delivered at ${new Date().toISOString()}]`,
    });

    // Telegram alert
    await sendPipelineAlert(
      `✅ Report delivered to ${lead.dealershipName} — ${lead.email}\nLead ID: ${leadId}\nReport: https://vizbiz.ai/report/${leadId}/`
    );

    console.info(`[pipeline/deliver] Complete for ${leadId}`);

    return NextResponse.json({ success: true, leadId, emailSent });
  } catch (error) {
    console.error(`[pipeline/deliver] Failed for ${leadId}:`, error);
    return NextResponse.json({ success: false, error: "Delivery failed", leadId }, { status: 500 });
  }
}
