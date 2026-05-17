/**
 * Pipeline Phase 2: PREFLIGHT (async, 30-60s)
 *
 * Runs preflight via pipeline controller (idempotent, locked).
 * On success, triggers research stage.
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId } from "@/lib/google-sheets";
import { runPreflightStage, runResearchStage } from "@/lib/pipeline-controller";

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

  // Trigger research in background
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  fetch(`${baseUrl}/api/pipeline/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId, researchMode: researchMode || "free" }),
  }).catch((err) => {
    console.error(`[pipeline/preflight] research trigger failed for ${leadId}:`, err);
  });

  return NextResponse.json({
    success: true,
    leadId,
    niche: result.data?.niche,
    score: result.data?.score,
  });
}
