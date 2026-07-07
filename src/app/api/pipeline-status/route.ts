import { NextResponse } from "next/server";
import { requireMissionControlApiAuth } from "@/lib/mission-control-api-auth";
import { getAllLeads } from "@/lib/google-sheets";
import { excludeQaLeads } from '@/lib/qa-leads';
import { classifyLeadTriage } from '@/lib/lead-triage';
import { buildMcHealthStrip, buildNeedsYouQueue, enrichProviderStatusFromLatestSnapshot } from '@/lib/mission-control-needs-you';


export const revalidate = 0;

export async function GET(request: Request) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const allLeads = await getAllLeads();
    const metricLeads = excludeQaLeads(allLeads).map((lead) => ({
      ...lead,
      triage: classifyLeadTriage(lead),
    }));
    const clientZeroLeads = allLeads
      .filter((lead) => (lead.source || '').toLowerCase() === 'client_zero')
      .map((lead) => ({ ...lead, triage: classifyLeadTriage(lead) }));
    const leads = metricLeads;
    const operationalLeads = [...metricLeads, ...clientZeroLeads];

    // Group by status for pipeline view
    const byStatus = leads.reduce(
      (acc, lead) => {
        const status = lead.status || "new";
        if (!acc[status]) acc[status] = [];
        acc[status].push(lead);
        return acc;
      },
      {} as Record<string, typeof leads>
    );

    // Summary stats
    const stats = {
      total: leads.length,
      new: byStatus["new"]?.length || 0,
      researching: byStatus["researching"]?.length || 0,
      pending_review: byStatus["pending_review"]?.length || 0,
      approved: byStatus["approved"]?.length || 0,
      contacted: byStatus["contacted"]?.length || 0,
      closed_won: byStatus["closed_won"]?.length || 0,
      closed_lost: byStatus["closed_lost"]?.length || 0,
    };

    const needsYou = buildNeedsYouQueue(operationalLeads);
    const health = await enrichProviderStatusFromLatestSnapshot(buildMcHealthStrip(operationalLeads));

    return NextResponse.json({
      stats,
      qa: { excluded: allLeads.length - leads.length, included: leads.length },
      pipeline: byStatus,
      leads,
      needsYou,
      health,
      triage: {
        junkCandidates: leads.filter((lead) => lead.triage.label === 'junk_candidate').length,
        uncertain: leads.filter((lead) => lead.triage.label === 'uncertain').length,
      },
    });
  } catch (error: any) {
    console.error("[pipeline-status] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch pipeline data", details: error.message },
      { status: 500 }
    );
  }
}
