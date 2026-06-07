/**
 * Pipeline Phase 3: RESEARCH (async, 60-120s)
 *
 * Runs research via pipeline controller (idempotent, locked, mode-aware).
 * On success, fires review phase.
 */

import { after, NextResponse } from "next/server";
import { getLeadByLeadId } from "@/lib/google-sheets";
import { runResearchStage } from "@/lib/pipeline-controller";
import { sendPipelineAlert } from "@/lib/telegram-alerts";
import { buildPipelineBaseUrl } from "@/lib/pipeline-url";

// Research takes 60-120s (Sonar calls + competitor discovery + social signals)
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId, force, researchMode } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/research] Starting for ${leadId}`);

  // Run research via controller
  const result = await runResearchStage(leadId, { force: !!force, researchMode: researchMode || "free" });

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  if (result.skipped) {
    return NextResponse.json({ success: true, leadId, skipped: true });
  }

  // Send review alert
  try {
    const lead = await getLeadByLeadId(leadId);
    if (lead) {
      const mode = result.data?.mode || "free";
      const emoji = result.data?.band === "Strong" ? "🟢" : result.data?.band === "Moderate" ? "🟡" : "🔴";

      const alertMessage = [
        `${emoji} Research Complete (${mode} mode)`,
        `📊 ${lead.dealershipName} — ${result.data?.appeared}/${result.data?.total} appearances (${result.data?.band})`,
        `🔗 Report: https://vizbiz.ai/report/${leadId}/`,
        `📍 ${lead.city} | Mode: ${mode}`,
      ].join("\n");

      await sendPipelineAlert(alertMessage);
    }
  } catch (alertErr) {
    console.warn(`[pipeline/research] Alert failed (non-blocking):`, alertErr);
  }

  // Trigger operator-review classification after the research response. This
  // keeps client delivery blocked, but makes the next operator step happen.
  const baseUrl = buildPipelineBaseUrl(request.url);
  after(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/pipeline/review/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error(`[pipeline/research] review trigger failed for ${leadId}`, { status: response.status, body: text.slice(0, 500) });
      }
    } catch (err) {
      console.error(`[pipeline/research] review trigger failed for ${leadId}:`, err);
    }
  });

  return NextResponse.json({
    success: true,
    leadId,
    appeared: result.data?.appeared,
    total: result.data?.total,
    band: result.data?.band,
    mode: result.data?.mode,
  });
}
