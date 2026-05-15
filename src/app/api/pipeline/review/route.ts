/**
 * Pipeline Phase 4: REVIEW (async)
 *
 * Sanity checks results, auto-classifies, sends Telegram alert.
 * Auto-approved leads trigger delivery. Manual review leads wait.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, updateLead, updateLeadResearchResults } from "@/lib/google-sheets";
import { sendPipelineAlert } from "@/lib/telegram-alerts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/review] Starting for ${leadId}`);

  try {
    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    // Parse research data from notes
    let researchData: {
      appearedCount?: number;
      totalPrompts?: number;
      statusBand?: string;
      competitorMention?: string;
      niche?: string;
    } = {};

    try {
      const notesStr = lead.notes || "";
      // Find the research JSON in notes
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
    } catch (parseErr) {
      console.warn(`[pipeline/review] Could not parse research data:`, parseErr);
    }

    const appearedCount = researchData.appearedCount ?? 0;
    const totalPrompts = researchData.totalPrompts ?? 0;
    const statusBand = researchData.statusBand || "Unknown";
    const niche = researchData.niche || "unknown";

    // Sanity checks
    const warnings: string[] = [];

    if (appearedCount === 0 && totalPrompts > 0) {
      warnings.push("Zero appearances — prompts may not match business type");
    }

    if (niche === "local_business" || niche === "unknown") {
      warnings.push(`Weak niche detection: ${niche}`);
    }

    // Auto-classify
    const isConfident = appearedCount > 0 && niche !== "unknown";
    const newStatus = isConfident ? "approved" : "pending_review";

    // Update Sheets
    await updateLeadResearchResults(leadId, {
      status: newStatus as any,
      notes: lead.notes + `\n[Review: ${newStatus} at ${new Date().toISOString()}${warnings.length > 0 ? `. Warnings: ${warnings.join("; ")}` : ""}]`,
    });

    // Send Telegram alert to Vlad
    const emoji = statusBand === "Strong" ? "🟢" : statusBand === "Moderate" ? "🟡" : "🔴";
    const classificationLabel = isConfident ? "Auto-approved ✅" : "Needs review ⚠️";

    const alertMessage = [
      `📋 New lead reviewed: ${lead.dealershipName}`,
      "",
      `📍 ${lead.city} | 🌐 ${lead.website}`,
      `${emoji} Score: ${appearedCount}/${totalPrompts} (${statusBand})`,
      `🏷️ Niche: ${niche}`,
      `📊 Classification: ${classificationLabel}`,
      ...(warnings.length > 0 ? [`⚠️ Warnings: ${warnings.join("; ")}`] : []),
      "",
      `Lead ID: ${leadId}`,
      `Report: https://vizbiz.ai/report/${leadId}`,
      `MC: https://vizbiz.ai/mission-control/leads/${leadId}`,
    ].join("\n");

    await sendPipelineAlert(alertMessage);

    // If auto-approved, fire delivery
    if (isConfident) {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      fetch(`${baseUrl}/api/pipeline/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      }).catch((err) => {
        console.error(`[pipeline/review] deliver trigger failed for ${leadId}:`, err);
      });
    }

    console.info(`[pipeline/review] ${leadId}: ${newStatus}${warnings.length > 0 ? ` [warnings: ${warnings.join(", ")}]` : ""}`);

    return NextResponse.json({
      success: true,
      leadId,
      status: newStatus,
      warnings,
    });
  } catch (error) {
    console.error(`[pipeline/review] Failed for ${leadId}:`, error);
    return NextResponse.json({ success: false, error: "Review failed", leadId }, { status: 500 });
  }
}
