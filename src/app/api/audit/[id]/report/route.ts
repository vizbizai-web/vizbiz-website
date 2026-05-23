import { NextResponse } from "next/server";
import type { AuditReport } from "@/engines/research/types";
import { readJson } from "@/lib/file-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await readJson<AuditReport>("audits", id);
  if (!audit) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

  return NextResponse.json({
    id: audit.id,
    client: audit.client,
    score: { avi: audit.aviScore, band: audit.band },
    categories: audit.categoryBreakdown,
    competitorGapScore: audit.competitorGapScore,
    primaryCompetitor: audit.primaryCompetitor,
    prompts: audit.promptResults,
    machineReadiness: audit.machineReadiness,
    seoSiteIntelligence: audit.seoSiteIntelligence,
    clientDeliverables: audit.clientDeliverables,
    actionItems: [
      ...audit.machineReadiness.checks.filter((check) => !check.passed).map((check) => check.label),
      ...(audit.seoSiteIntelligence?.technicalChecks.filter((check) => !check.passed).map((check) => check.label) ?? []),
    ],
  });
}
