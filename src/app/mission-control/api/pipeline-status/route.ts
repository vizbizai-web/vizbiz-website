import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';
import { excludeQaLeads } from '@/lib/qa-leads';
import { classifyLeadTriage } from '@/lib/lead-triage';
import { buildMcHealthStrip, buildNeedsYouQueue, enrichProviderStatusFromLatestSnapshot } from '@/lib/mission-control-needs-you';
import { buildEmailOpsSummary, fetchEmailOpsEvents } from '@/lib/email-ops';

export const revalidate = 0;

const STATUSES = [
  'new',
  'researching',
  'pending_review',
  'approved',
  'email_drafted',
  'contacted',
  'closed_won',
  'closed_lost',
] as const;

export async function GET() {
  try {
    const allLeads = await getAllLeads();
    const qaExcluded = allLeads.length;
    const leads = excludeQaLeads(allLeads).map((lead) => ({
      ...lead,
      triage: classifyLeadTriage(lead),
    }));
    const pipeline = leads.reduce<Record<string, typeof leads>>((acc, lead) => {
      const status = lead.status || 'new';
      if (!acc[status]) acc[status] = [];
      acc[status].push(lead);
      return acc;
    }, {});

    const stats = STATUSES.reduce<Record<(typeof STATUSES)[number] | 'total', number>>(
      (acc, status) => {
        acc[status] = pipeline[status]?.length || 0;
        return acc;
      },
      { total: leads.length } as Record<(typeof STATUSES)[number] | 'total', number>,
    );

    const needsYou = buildNeedsYouQueue(leads);
    const emailOps = buildEmailOpsSummary(await fetchEmailOpsEvents(), leads).health24h;
    const health = { ...(await enrichProviderStatusFromLatestSnapshot(buildMcHealthStrip(leads))), emailOps };

    return NextResponse.json({
      source: 'vizbiz-leads',
      stats,
      qa: { excluded: qaExcluded - leads.length, included: leads.length },
      pipeline,
      leads,
      needsYou,
      health,
      triage: {
        junkCandidates: leads.filter((lead) => lead.triage.label === 'junk_candidate').length,
        uncertain: leads.filter((lead) => lead.triage.label === 'uncertain').length,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[mission-control/pipeline-status] Error:', error);
    return NextResponse.json(
      {
        source: 'vizbiz-leads',
        error: 'Failed to fetch VizBiz pipeline data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
