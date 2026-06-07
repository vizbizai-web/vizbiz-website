/**
 * Archived legacy route.
 *
 * The old /api/process-lead implementation duplicated pipeline logic, generated
 * stale dealership-first report data, and could preserve internal competitor
 * wording. It has been archived under docs/archive/legacy-routes/.
 *
 * Use /api/pipeline/process for controlled processing instead.
 */

import { NextResponse } from "next/server";
import { runAllStages, type ResearchMode } from "@/lib/pipeline-controller";

export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const leadId = typeof body.leadId === "string" ? body.leadId.trim() : "";

  if (!leadId) {
    return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
  }

  const researchMode = (body.researchMode || "free") as ResearchMode;
  const results = await runAllStages(leadId, { force: body.force === true, researchMode });
  const failed = results.find((result) => !result.success && !result.skipped);

  return NextResponse.json({
    success: !failed,
    archivedLegacyRoute: true,
    replacement: "/api/pipeline/process",
    leadId,
    stages: results,
    error: failed?.error,
  }, { status: failed ? 500 : 200 });
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      archivedLegacyRoute: true,
      error: "Legacy process-lead polling is disabled. Use /api/pipeline/process with an explicit leadId.",
      replacement: "/api/pipeline/process",
    },
    { status: 410 }
  );
}
