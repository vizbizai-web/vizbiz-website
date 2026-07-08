'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Trend = { current: number; prior: number; direction: 'up' | 'down' | 'flat'; delta: number };
type Summary = {
  generatedAt: string;
  health24h: { sent: number; failed: number };
  topStrip: Record<'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced', Trend>;
  daily: Array<{ date: string; sent: number; failed: number; delivery: number; nurture: number; lifecycle: number; gated: number; alarm: boolean; scheduledDue: number }>;
  funnel: { e2: number; e3: number; e4: number; e5: number; suppressions: Array<{ between: string; count: number; purchase: number; other: number }> };
  pendingGatedCards: number;
  rescansCompleted24h: number;
  suppressions24h: Array<{ reason: string; count: number }>;
  sendsByTemplate24h: Array<{ templateId: string; count: number }>;
  failures24h: number;
  recentEvents: Array<{ id?: string; leadId: string; businessName: string; eventType: string; templateId: string; reason?: string; at: string; leadUrl: string }>;
};

const COLORS = { delivery: '#22D3EE', nurture: '#A78BFA', lifecycle: '#34D399', gated: '#F59E0B', failed: '#EF4444' };

export default function EmailOpsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch('/mission-control/api/email-ops')
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setSummary(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Email Ops unavailable'));
  }, []);

  const maxDaily = useMemo(() => Math.max(1, ...(summary?.daily || []).map((d) => d.sent + d.failed)), [summary]);

  if (error) return <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>;
  if (!summary) return <div className="text-sm text-slate-400">Loading Email Ops...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-semibold uppercase tracking-widest text-white">Email Ops</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Automation health, sends, gates, failures</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">Real lead_events history. Counts first; click any recent event to open the matching lead.</p>
        </div>
        <Link href="/mission-control" className="text-sm text-cyan-200 hover:text-cyan-100">← Needs-You</Link>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {(['sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced'] as const).map((key) => (
          <Metric key={key} label={key} trend={summary.topStrip[key]} danger={key === 'failed' || key === 'bounced'} />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#070A12]/90 p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Last 14 days</p>
            <h2 className="text-xl font-bold text-white">Stacked sends by class</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <Legend color={COLORS.delivery} label="Delivery" />
            <Legend color={COLORS.nurture} label="Nurture" />
            <Legend color={COLORS.lifecycle} label="Lifecycle" />
            <Legend color={COLORS.gated} label="Gated" />
            <Legend color={COLORS.failed} label="Failed" />
          </div>
        </div>
        <div className="flex h-64 items-end gap-2 overflow-x-auto pb-2">
          {summary.daily.map((day) => <DailyBar key={day.date} day={day} max={maxDaily} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-800 bg-[#070A12]/90 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Nurture funnel</p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <FunnelStep label="E2" count={summary.funnel.e2} />
            <FunnelStep label="E3" count={summary.funnel.e3} />
            <FunnelStep label="E4" count={summary.funnel.e4} />
            <FunnelStep label="E5" count={summary.funnel.e5} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {summary.funnel.suppressions.map((item) => (
              <div key={item.between} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">{item.between}</p>
                <p className="mt-1 text-lg font-bold text-white">{item.count} suppressed</p>
                <p className="text-xs text-emerald-300">{item.purchase} purchase suppressions</p>
                <p className="text-xs text-slate-500">{item.other} other</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#070A12]/90 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Last 24h digest inputs</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p><strong className="text-white">{summary.health24h.sent}</strong> sends · <strong className={summary.health24h.failed ? 'text-red-300' : 'text-white'}>{summary.health24h.failed}</strong> failures</p>
            <p><strong className="text-white">{summary.pendingGatedCards}</strong> gated cards pending</p>
            <p><strong className="text-white">{summary.rescansCompleted24h}</strong> rescans completed</p>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Suppressions</p>
            {summary.suppressions24h.length ? summary.suppressions24h.map((s) => <p key={s.reason} className="mt-1 text-sm text-slate-300">{s.count} · {s.reason}</p>) : <p className="mt-1 text-sm text-slate-500">none</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#070A12]/90 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Click-through ledger</p>
            <h2 className="text-xl font-bold text-white">Recent matching leads</h2>
          </div>
          <p className="text-xs text-slate-500">Synced {new Date(summary.generatedAt).toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          {summary.recentEvents.map((event) => (
            <Link key={event.id || `${event.leadId}-${event.at}-${event.eventType}`} href={event.leadUrl} className="block rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition hover:border-cyan-300/30">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-white">{event.businessName}</p>
                <p className="text-xs text-slate-500">{new Date(event.at).toLocaleString()}</p>
              </div>
              <p className="mt-1 text-sm text-slate-300">{event.eventType} · {event.templateId}{event.reason ? ` · ${event.reason}` : ''}</p>
            </Link>
          ))}
          {!summary.recentEvents.length && <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-slate-500">No email events yet.</div>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, trend, danger = false }: { label: string; trend: Trend; danger?: boolean }) {
  const arrow = trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→';
  const color = danger ? '#F87171' : '#22D3EE';
  return (
    <Link href={`/mission-control/email-ops?metric=${label}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 hover:border-cyan-300/30">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color }}>{trend.current}</p>
      <p className="text-xs text-slate-500">{arrow} {trend.delta >= 0 ? '+' : ''}{trend.delta} vs prior 7</p>
    </Link>
  );
}
function Legend({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span>; }
function FunnelStep({ label, count }: { label: string; count: number }) { return <Link href={`/mission-control/email-ops?template=${label}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold text-white">{count}</p></Link>; }
function Segment({ value, total, color }: { value: number; total: number; color: string }) { return value ? <div style={{ height: `${Math.max(4, (value / total) * 100)}%`, background: color }} title={`${value}`} /> : null; }
function DailyBar({ day, max }: { day: Summary['daily'][number]; max: number }) {
  const total = Math.max(1, day.sent + day.failed);
  return (
    <div className="flex min-w-[42px] flex-1 flex-col items-center gap-2">
      <div className="flex h-48 w-full items-end rounded-lg border border-slate-800 bg-slate-950/60 p-1">
        <div className="flex w-full flex-col justify-end overflow-hidden rounded-md" style={{ height: `${Math.max(3, (total / max) * 100)}%` }}>
          <Segment value={day.failed} total={total} color={COLORS.failed} />
          <Segment value={day.gated} total={total} color={COLORS.gated} />
          <Segment value={day.nurture} total={total} color={COLORS.nurture} />
          <Segment value={day.lifecycle} total={total} color={COLORS.lifecycle} />
          <Segment value={day.delivery} total={total} color={COLORS.delivery} />
        </div>
      </div>
      <p className="text-[10px] text-slate-500">{day.date.slice(5)}</p>
      {day.alarm && <span title={`${day.scheduledDue} scheduled sends due; none fired`} className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-200">alarm</span>}
    </div>
  );
}
