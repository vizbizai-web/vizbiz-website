import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';
import { excludeQaLeads } from '@/lib/qa-leads';

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
    const leads = excludeQaLeads(allLeads);
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

    return NextResponse.json({
      source: 'vizbiz-leads',
      stats,
      qa: { excluded: qaExcluded - leads.length, included: leads.length },
      pipeline,
      leads,
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
