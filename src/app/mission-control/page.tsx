'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { LiquidGlass } from './components/LiquidGlass';

type ProviderKey = 'openai' | 'gemini' | 'perplexity';

type HealthStrip = {
  today: { leadsIn: number; completed: number; failed: number };
  pass1FailureRate7d: { rate: number | null; failed: number; total: number; label: string };
  providerStatus: Array<{ provider: ProviderKey; ok: boolean | null; label: string; detail: string }>;
  spendEstimateTodayUsd: number;
  deployedSha: string;
  pipelineFlow: Array<{ status: string; count: number }>;
};

type NeedsYouItem = {
  leadId: string;
  businessName: string;
  status: string;
  tier: 'paid' | 'subscriber' | 'free' | 'failure';
  primaryActionLabel: string;
  primaryAction: 'resolve_niche' | 'review_paid' | 'review_free' | 'approve_monthly' | 'approve_gated_email' | 'inspect_failure' | 'open_detail' | 'complete_paid_intake' | 'fulfill_paid_from_profile';
  ageHours: number | null;
  reportPreviewUrl: string;
  detailUrl: string;
  nextLeadId?: string;
  ordinalTotal?: number;
  badges: Array<{ label: string; tone: 'red' | 'amber' | 'blue' | 'cyan' | 'slate'; detail?: string }>;
  city: string;
  email: string;
};

type PipelineData = {
  stats: Record<string, number>;
  leads: Array<{ leadId: string; status: string }>;
  needsYou: NeedsYouItem[];
  health: HealthStrip;
  syncedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  researching: 'Researching',
  pending_review: 'Review',
  approved: 'Approved',
  email_drafted: 'Drafted',
  contacted: 'Contacted',
  closed_won: 'Won',
};

const TIER_STYLES: Record<NeedsYouItem['tier'], { label: string; color: string; bg: string }> = {
  paid: { label: 'Paid', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  subscriber: { label: 'Monthly', color: '#A855F7', bg: 'rgba(168,85,247,0.10)' },
  free: { label: 'Free review', color: '#22D3EE', bg: 'rgba(34,211,238,0.10)' },
  failure: { label: 'Failure', color: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
};

function usePipelineData() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/mission-control/api/pipeline-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load Mission Control queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

function useLeadAction(refetch: () => Promise<void>) {
  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [clearedCount, setClearedCount] = useState(0);

  const runAction = async (item: NeedsYouItem, action: 'approve' | 'needs_revision') => {
    setBusyLeadId(item.leadId);
    setMessage(null);
    try {
      const approveAction = item.primaryAction === 'approve_gated_email'
        ? 'approve_gated_email'
        : item.primaryAction === 'fulfill_paid_from_profile'
          ? 'fulfill_paid_from_profile'
          : 'approve';
      const payload = action === 'approve'
        ? { leadId: item.leadId, action: approveAction, data: item.primaryAction === 'approve_gated_email' ? { templateId: 'E11_30_DAY_RESCAN' } : undefined }
        : { leadId: item.leadId, action: 'needs_revision', data: { reportType: item.tier === 'paid' ? 'paid' : 'free', reason: 'Needs work from Step 2 queue review', autoRerun: false } };
      const res = await fetch('/mission-control/api/lead-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.error || `HTTP ${res.status}`);
      const nextCleared = clearedCount + 1;
      setClearedCount(nextCleared);
      setMessage(action === 'approve'
        ? `Approved ${item.businessName}. ${nextCleared} of ${item.ordinalTotal || '?'} cleared this session.`
        : `Marked needs-work: ${item.businessName}. ${nextCleared} of ${item.ordinalTotal || '?'} cleared this session.`);
      await refetch();
      if (item.nextLeadId) {
        window.history.replaceState(null, '', `/mission-control?next=${item.nextLeadId}`);
        const nextRow = document.querySelector(`[data-lead-id="${item.nextLeadId}"]`);
        if (nextRow instanceof HTMLElement) nextRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyLeadId(null);
    }
  };

  return { runAction, busyLeadId, message };
}

export default function MissionControlDashboard() {
  const { data, loading, error, refetch } = usePipelineData();
  const { runAction, busyLeadId, message } = useLeadAction(refetch);
  const [tierFilter, setTierFilter] = useState<'all' | NeedsYouItem['tier']>('all');

  const queue = data?.needsYou || [];
  const filteredQueue = tierFilter === 'all' ? queue : queue.filter((item) => item.tier === tierFilter);
  const freeBacklog = queue.filter((item) => item.tier === 'free');
  const health = data?.health;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base text-white uppercase tracking-widest font-semibold">Mission Control</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Needs-You Queue</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">One queue for review backlog, paid approvals, monthly approvals, failures, and next actions. Paid first, subscribers second, free reviews oldest-first inside the tier.</p>
        </div>
        {loading && <span className="text-sm text-slate-500">Syncing...</span>}
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      {message && <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-sm text-cyan-100">{message}</div>}

      {health && <HealthStripView health={health} />}

      {health && (
        <section className="rounded-2xl border border-slate-800/60 bg-[#070A12]/90 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Pipeline Flow</p>
              <p className="text-sm text-slate-400">Compact status strip — the old dashboard forecast card is intentionally gone.</p>
            </div>
            <Link href="/mission-control/leads" className="text-sm text-cyan-200 hover:text-cyan-100">Full pipeline →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {health.pipelineFlow.map((stage) => (
              <div key={stage.status} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xl font-bold text-white">{stage.count}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{STATUS_LABELS[stage.status] || stage.status}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-cyan-300/20 bg-[#07111f]/80 p-4 shadow-[0_0_45px_rgba(34,211,238,0.07)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">Backlog clearing mode</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{queue.length ? `${queue.length} item${queue.length === 1 ? '' : 's'} need Alex` : 'Nothing needs you.'}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Free review backlog: <strong className="text-white">{freeBacklog.length}</strong>. Rows with Places or language badges need careful reading; clean rows are built for fast preview → approve/needs-work → next.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'paid', 'subscriber', 'free', 'failure'] as const).map((filter) => (
              <button key={filter} onClick={() => setTierFilter(filter)} className={`rounded-lg border px-3 py-2 text-sm ${tierFilter === filter ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100' : 'border-slate-700 bg-slate-950/40 text-slate-300'}`}>
                {filter === 'all' ? `All (${queue.length})` : `${TIER_STYLES[filter].label} (${queue.filter((item) => item.tier === filter).length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
            {filteredQueue.map((item, index) => (
            <QueueRow key={item.leadId} item={{ ...item, ordinalTotal: filteredQueue.length }} ordinal={index + 1} busy={busyLeadId === item.leadId} onAction={runAction} />
          ))}
          {!loading && filteredQueue.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-8 text-center text-slate-500">Nothing needs you in this filter. This is the product goal.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function HealthStripView({ health }: { health: HealthStrip }) {
  const shortSha = health.deployedSha && health.deployedSha !== 'unknown' ? health.deployedSha.slice(0, 7) : 'unknown';
  return (
    <LiquidGlass borderRadius={16} preset="card" tint="rgba(37, 209, 242, 0.03)" className="p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <HealthCell label="Today" value={`${health.today.leadsIn} in / ${health.today.completed} done / ${health.today.failed} failed`} />
        <HealthCell label="Pass 1 failure rate" value={`${health.pass1FailureRate7d.label} (${health.pass1FailureRate7d.failed}/${health.pass1FailureRate7d.total})`} accent={health.pass1FailureRate7d.rate && health.pass1FailureRate7d.rate > 0.1 ? '#F97316' : '#22C55E'} />
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Providers</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {health.providerStatus.map((provider) => (
              <span key={provider.provider} title={provider.detail} className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 px-2 py-1 text-xs text-slate-300">
                <span className={`h-2 w-2 rounded-full ${provider.ok === true ? 'bg-emerald-400' : provider.ok === false ? 'bg-red-400' : 'bg-slate-600'}`} />
                {provider.label}
              </span>
            ))}
          </div>
        </div>
        <HealthCell label="Spend estimate today" value={`$${health.spendEstimateTodayUsd.toFixed(2)}`} accent="#25D1F2" />
        <HealthCell label="Deployed SHA" value={shortSha} accent="#A78BFA" />
      </div>
    </LiquidGlass>
  );
}

function HealthCell({ label, value, accent = '#E2E8F0' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white" style={{ color: accent }}>{value}</p>
    </div>
  );
}

function QueueRow({ item, ordinal, busy, onAction }: { item: NeedsYouItem; ordinal: number; busy: boolean; onAction: (item: NeedsYouItem, action: 'approve' | 'needs_revision') => void }) {
  const tier = TIER_STYLES[item.tier];
  const age = item.ageHours == null ? 'age unknown' : item.ageHours < 24 ? `${Math.round(item.ageHours)}h old` : `${Math.floor(item.ageHours / 24)}d old`;
  return (
    <div data-lead-id={item.leadId} className="rounded-2xl border border-slate-800/80 bg-[#080B14] p-4 transition hover:border-cyan-300/25">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: tier.color, background: tier.bg, borderColor: `${tier.color}44` }}>#{ordinal} · {tier.label}</span>
            <span className="text-xs text-slate-500">{age}</span>
            <span className="text-xs text-slate-500">{item.status}</span>
          </div>
          <h3 className="mt-2 break-words text-lg font-bold text-white">{item.businessName}</h3>
          <p className="mt-1 break-words text-sm text-slate-400">{item.city || 'No location'} {item.email ? `· ${item.email}` : ''}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.badges.length === 0 && <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">Quick-read candidate</span>}
            {item.badges.map((badge) => (
              <span key={`${badge.label}-${badge.detail || ''}`} title={badge.detail} className={`rounded-full border px-2 py-1 text-xs ${badge.tone === 'red' ? 'border-red-400/30 bg-red-400/10 text-red-200' : badge.tone === 'amber' ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : badge.tone === 'blue' ? 'border-blue-400/30 bg-blue-400/10 text-blue-200' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>{badge.label}</span>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          {item.primaryAction === 'complete_paid_intake' ? (
            <Link href={`/paid-intake/${item.leadId}`} target="_blank" className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-3 text-center text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15 sm:py-2">Open intake</Link>
          ) : (
            <Link href={item.reportPreviewUrl} target="_blank" className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-3 text-center text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15 sm:py-2">Open preview</Link>
          )}
          {item.primaryAction === 'complete_paid_intake' ? (
            <Link href={item.detailUrl} className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-3 text-center text-sm font-semibold text-amber-200 hover:border-amber-300/50 sm:py-2">Review stalled intake</Link>
          ) : (
            <button disabled={busy} onClick={() => onAction(item, 'approve')} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-40 sm:py-2">{busy ? '...' : item.primaryAction === 'fulfill_paid_from_profile' ? 'Fulfill from profile → next' : 'Approve → next'}</button>
          )}
          <button disabled={busy || item.primaryAction === 'complete_paid_intake'} onClick={() => onAction(item, 'needs_revision')} className="rounded-lg border border-orange-400/30 bg-orange-400/10 px-3 py-3 text-sm font-semibold text-orange-200 disabled:opacity-40 sm:py-2">Needs-work → next</button>
          <Link href={item.detailUrl} className="rounded-lg border border-slate-700 px-3 py-3 text-center text-sm font-semibold text-slate-300 hover:border-slate-500 sm:py-2">Detail</Link>
        </div>
      </div>
    </div>
  );
}
