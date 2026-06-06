import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/google-sheets';

export const revalidate = 0;

type AlertSeverity = 'critical' | 'warning' | 'info';

interface AttentionAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  href?: string;
}

function daysBetween(date: string) {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return null;
  return Math.floor((Date.now() - time) / 86_400_000);
}

export async function GET() {
  try {
    const leads = await getAllLeads();
    const alerts: AttentionAlert[] = [];

    const pendingReview = leads.filter((lead) => lead.status === 'pending_review');
    if (pendingReview.length > 0) {
      alerts.push({
        id: 'pending-review',
        severity: 'warning',
        title: `${pendingReview.length} report${pendingReview.length === 1 ? '' : 's'} pending review`,
        detail: pendingReview.map((lead) => lead.dealershipName || lead.leadId).join(', '),
        href: '/mission-control/leads?status=pending_review',
      });
    }

    const approved = leads.filter((lead) => lead.status === 'approved' || lead.status === 'email_drafted');
    if (approved.length > 0) {
      alerts.push({
        id: 'approved-not-sent',
        severity: 'info',
        title: `${approved.length} approved/drafted report${approved.length === 1 ? '' : 's'} not marked sent`,
        detail: 'Review and send from the Email Hub when the report copy is approved.',
        href: '/mission-control/emails',
      });
    }

    const researching = leads.filter((lead) => lead.status === 'researching');
    if (researching.length > 0) {
      alerts.push({
        id: 'researching',
        severity: 'info',
        title: `${researching.length} lead${researching.length === 1 ? '' : 's'} in research`,
        detail: 'Check pipeline status before approving or rerunning.',
        href: '/mission-control/leads?status=researching',
      });
    }

    const contactedDates = leads.map((lead) => lead.emailSentAt).filter(Boolean).sort().reverse();
    const daysSinceLastOutreach = contactedDates[0] ? daysBetween(contactedDates[0]) : null;
    if (daysSinceLastOutreach !== null && daysSinceLastOutreach > 7) {
      alerts.push({
        id: 'outreach-stale',
        severity: 'critical',
        title: `${daysSinceLastOutreach} days since last marked outreach`,
        detail: 'Pipeline follow-up is stale. Review approved reports and email drafts.',
        href: '/mission-control/emails',
      });
    }

    const summary = alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] += 1;
        acc.total += 1;
        return acc;
      },
      { critical: 0, warning: 0, info: 0, total: 0, daysSinceLastOutreach } as Record<AlertSeverity | 'total', number> & { daysSinceLastOutreach: number | null },
    );

    return NextResponse.json({ source: 'vizbiz-leads', alerts, summary, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[mission-control/attention-feed] Error:', error);
    return NextResponse.json(
      {
        source: 'vizbiz-leads',
        error: 'Failed to fetch VizBiz attention feed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
