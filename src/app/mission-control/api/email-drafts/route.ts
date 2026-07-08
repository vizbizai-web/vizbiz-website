import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';
import { excludeQaLeads } from '@/lib/qa-leads';
import { renderClientEmail } from '@/lib/client-emails';
import { buildFreeReportDeliveryContext, selectFreeReportDeliveryTemplate } from '@/lib/email-suite-automation';

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

function parseSnapshotCounts(snapshotAppeared?: string, notes?: string): { appeared: number; total: number } | null {
  const match = (snapshotAppeared || '').match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
  if (match) return { appeared: Number(match[1]), total: Number(match[2]) };
  try {
    const parsed = JSON.parse(notes || '{}');
    const research = parsed?.research || parsed;
    if (Number.isFinite(research?.appearedCount) && Number.isFinite(research?.totalPrompts)) {
      return { appeared: Number(research.appearedCount), total: Number(research.totalPrompts) };
    }
  } catch {}
  return null;
}

export async function GET() {
  try {
    const leads = excludeQaLeads(await getAllLeads());
    const draftable = leads.filter((lead) =>
      ['approved', 'email_drafted', 'contacted', 'paid_report_delivered'].includes(lead.status),
    );

    const drafts = draftable.map((lead) => {
      const counts = parseSnapshotCounts(lead.snapshotAppeared, lead.notes);
      const templateId = counts ? selectFreeReportDeliveryTemplate(lead) : null;
      const context = counts ? buildFreeReportDeliveryContext(lead) : null;
      const rendered = templateId && context ? renderClientEmail(templateId, context) : null;
      return {
        lead,
        research: parseResearch(lead.notes || ''),
        status: draftStatus(lead.status),
        reportUrl: context?.reportUrl || lead.reportUrl || null,
        emailSentAt: lead.emailSentAt || null,
        templateName: rendered?.id || null,
        subject: rendered?.subject || null,
        body: rendered?.text || null,
      };
    });

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
