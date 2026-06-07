/**
 * Pipeline Phase 2: PREFLIGHT (async, 30-60s)
 *
 * Runs preflight via pipeline controller (idempotent, locked).
 * On success, triggers research stage.
 */

import { after, NextResponse } from "next/server";
import { runPreflightStage } from "@/lib/pipeline-controller";
import { buildPipelineBaseUrl } from "@/lib/pipeline-url";

// Preflight takes 30-60s (Firecrawl scrape + LLM classification + SEO audit)
export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId, force, researchMode } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/preflight] Starting for ${leadId}`);

  // Run preflight via controller
  const result = await runPreflightStage(leadId, { force: !!force, researchMode: researchMode || "free" });

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  if (result.skipped) {
    return NextResponse.json({ success: true, leadId, skipped: true });
  }

  // Trigger research after the response using Next/Vercel's lifecycle hook.
  // Plain un-awaited fetches were freezing before execution in production.
  const baseUrl = buildPipelineBaseUrl(request.url);

  after(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/pipeline/research/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, researchMode: researchMode || "free" }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error(`[pipeline/preflight] research trigger failed for ${leadId}`, { status: response.status, body: text.slice(0, 500) });
      }
    } catch (err) {
      console.error(`[pipeline/preflight] research trigger failed for ${leadId}:`, err);
    }
  });

  return NextResponse.json({
    success: true,
    leadId,
    niche: result.data?.niche,
    score: result.data?.score,
  });
}
