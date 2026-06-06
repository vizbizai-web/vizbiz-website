import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';

export const revalidate = 0;

type DraftStatus = 'generated' | 'approved' | 'sent';

function parseResearch(notes: string): unknown | null {
  if (!notes) return null;
  try {
    const match = notes.match(/RESEARCH_DATA:\s*(\{[\s\S]*\})/);
    if (match) return JSON.parse(match[1]);
  } catch {
    return null;
  }
  return null;
}

function draftStatus(status: string): DraftStatus {
  if (status === 'contacted' || status === 'paid_report_delivered') return 'sent';
  if (status === 'email_drafted') return 'approved';
  return 'generated';
}

export async function GET() {
  try {
    const leads = await getAllLeads();
    const draftable = leads.filter((lead) =>
      ['approved', 'email_drafted', 'contacted', 'paid_report_delivered'].includes(lead.status),
    );

    const drafts = draftable.map((lead) => ({
      lead,
      research: parseResearch(lead.notes || ''),
      status: draftStatus(lead.status),
      reportUrl: lead.reportUrl || `/report/${lead.leadId}`,
      emailSentAt: lead.emailSentAt || null,
    }));

    return NextResponse.json({
      source: 'vizbiz-leads',
      total: drafts.length,
      drafts,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[mission-control/email-drafts] Error:', error);
    return NextResponse.json(
      {
        source: 'vizbiz-leads',
        error: 'Failed to fetch VizBiz email drafts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
