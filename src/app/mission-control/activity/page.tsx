import Link from 'next/link';
import { getAllLeads, type LeadRow } from '@/lib/google-sheets';

type ActivityEvent = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  href?: string;
  tone: 'cyan' | 'amber' | 'emerald' | 'rose' | 'slate';
};

function eventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function latestTimestamp(lead: LeadRow) {
  return (
    lead.emailSentAt ||
    lead.reportGeneratedAt ||
    lead.researchCompletedAt ||
    lead.researchStartedAt ||
    lead.preflightCompletedAt ||
    lead.preflightStartedAt ||
    lead.timestamp ||
    ''
  );
}

function toneForStatus(status: string): ActivityEvent['tone'] {
  if (['approved', 'sent', 'email_sent'].includes(status)) return 'emerald';
  if (['pending_review', 'needs_operator_review', 'email_drafted'].includes(status)) return 'amber';
  if (['failed', 'error', 'blocked'].includes(status)) return 'rose';
  if (['researching', 'report_queued', 'preflight_queued'].includes(status)) return 'cyan';
  return 'slate';
}

function buildEvents(leads: LeadRow[]): ActivityEvent[] {
  return leads
    .map((lead) => {
      const timestamp = latestTimestamp(lead);
      const name = lead.dealershipName || 'Unnamed business';
      const status = lead.status || 'unknown';
      const stage = lead.lastStage || lead.researchStatus || 'pipeline';
      const detailParts = [
        `Status: ${status}`,
        stage ? `Stage: ${stage}` : '',
        lead.source ? `Source: ${lead.source}` : '',
        lead.reportUrl ? 'Report URL available' : 'Report URL not ready',
        lead.lastError ? `Error: ${lead.lastError}` : '',
      ].filter(Boolean);

      return {
        id: lead.leadId || `${name}-${timestamp}`,
        title: name,
        detail: detailParts.join(' · '),
        timestamp,
        href: lead.leadId ? `/mission-control/leads/${lead.leadId}` : '/mission-control/leads',
        tone: toneForStatus(status),
      } satisfies ActivityEvent;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);
}

const toneClasses: Record<ActivityEvent['tone'], string> = {
  cyan: 'border-cyan-300/20 bg-cyan-300/5 text-cyan-100',
  amber: 'border-amber-300/20 bg-amber-300/5 text-amber-100',
  emerald: 'border-emerald-300/20 bg-emerald-300/5 text-emerald-100',
  rose: 'border-rose-300/20 bg-rose-300/5 text-rose-100',
  slate: 'border-white/10 bg-white/[0.03] text-slate-100',
};

export default async function ActivityPage() {
  let events: ActivityEvent[] = [];
  let error = '';

  try {
    const leads = await getAllLeads();
    events = buildEvents(leads);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown Mission Control activity error';
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Real VizBiz operations</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Activity</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Recent lead, report, email, and pipeline movement from the approved VizBiz lead source. No legacy agent logs, no demo feeds, no pretend cockpit noise.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/5 p-5 text-rose-100">
          <p className="text-sm font-semibold">Activity unavailable</p>
          <p className="mt-2 text-sm leading-6 text-rose-100/75">{error}</p>
          <p className="mt-3 text-xs text-rose-100/60">Missing or failing source: approved VizBiz CRM / Supabase lead adapter.</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-amber-100">
          <p className="text-sm font-semibold">No activity to show yet</p>
          <p className="mt-2 text-sm leading-6 text-amber-100/75">
            Mission Control reached the VizBiz lead source, but no lead/report/email events are available. Submit a controlled intake smoke test to verify the launch path.
          </p>
          <Link href="/mission-control/leads" className="mt-4 inline-flex rounded-xl border border-amber-200/20 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-200/10">
            Open Leads
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={event.href || '/mission-control/leads'}
              className={`block rounded-2xl border p-4 transition hover:border-cyan-200/35 hover:bg-white/[0.055] ${toneClasses[event.tone]}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-sm leading-6 text-current/75">{event.detail}</p>
                </div>
                <time className="shrink-0 text-xs text-current/55">{eventTime(event.timestamp)}</time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
