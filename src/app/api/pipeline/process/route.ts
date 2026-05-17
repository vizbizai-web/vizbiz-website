/**
 * Pipeline Orchestrator — Process a lead through all pending stages.
 *
 * Can be called by:
 * - Intake (background fetch)
 * - Cron (stalled lead recovery)
 * - Manual trigger (admin/Mission Control)
 * - process-lead (backward compat)
 *
 * POST /api/pipeline/process
 * Body: { "leadId": "VZB-XXX", "force": false, "researchMode": "free" }
 */

import { NextResponse } from "next/server";
import { getLeadByLeadId, getLeadsByStatus, type LeadRow } from "@/lib/google-sheets";
import { runAllStages, type ResearchMode } from "@/lib/pipeline-controller";

export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { leadId, force, researchMode } = body;

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  console.info(`[pipeline/process] Starting for ${leadId} (force=${!!force}, mode=${researchMode || "free"})`);

  const results = await runAllStages(leadId, {
    force: !!force,
    researchMode: (researchMode || "free") as ResearchMode,
  });

  const allSuccess = results.every((r) => r.success || r.skipped);
  const failed = results.find((r) => !r.success && !r.skipped);

  return NextResponse.json({
    success: allSuccess,
    leadId,
    stages: results.map((r) => ({
      stage: r.stage,
      success: r.success,
      skipped: r.skipped,
      error: r.error,
      data: r.data,
    })),
    error: failed?.error,
  });
}

/**
 * GET: Process the oldest stalled lead (for cron recovery).
 * Picks up leads that are stuck in: new, preflight_failed, research_failed, preflight_queued, research_queued
 */
export async function GET() {
  const stalledStatuses = ["new", "preflight_failed", "research_failed", "preflight_queued", "research_queued"];

  for (const status of stalledStatuses) {
    try {
      const leads = await getLeadsByStatus(status as any);
      if (leads.length === 0) continue;

      // Process the oldest lead
      const lead = leads[0];
      console.info(`[pipeline/process] Cron: processing stalled lead ${lead.leadId} (status: ${status})`);

      const results = await runAllStages(lead.leadId, { researchMode: "free" });

      return NextResponse.json({
        success: true,
        leadId: lead.leadId,
        processedStatus: status,
        stages: results.map((r) => ({
          stage: r.stage,
          success: r.success,
          skipped: r.skipped,
          error: r.error,
        })),
      });
    } catch (err) {
      console.error(`[pipeline/process] Cron error for status ${status}:`, err);
    }
  }

  return NextResponse.json({ success: true, message: "No stalled leads found" });
}
