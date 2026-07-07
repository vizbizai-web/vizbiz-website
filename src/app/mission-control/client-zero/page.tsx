import { getClientZeroDashboardModel } from '@/lib/client-zero';

function pct(value: number | null | undefined) {
  return value == null ? '—' : `${Math.round(value * 100)}%`;
}

function bar(value: number) {
  return <div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-400" style={{ width: `${Math.max(3, Math.round(value * 100))}%` }} /></div>;
}

export default async function ClientZeroPage() {
  const model = await getClientZeroDashboardModel();
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Client Zero</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">VizBiz runs through VizBiz.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">This dashboard uses the same audit snapshots, prompt battery, monthly loop, and Fix Drop system we use for subscribers. Self-data is excluded from inbound and revenue metrics, but it stays visible here.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-xs text-slate-500">Lead</p><p className="mt-1 font-medium">{model.lead?.leadId || 'Not registered'}</p></div>
            <div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-xs text-slate-500">Monthly snapshots</p><p className="mt-1 text-2xl font-semibold">{model.monthlySnapshots.length}</p></div>
            <div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-xs text-slate-500">Pulse snapshots</p><p className="mt-1 text-2xl font-semibold">{model.pulseSnapshots.length}</p></div>
            <div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-xs text-slate-500">Public page</p><p className="mt-1 font-medium">{model.publicReady ? 'Approved' : 'Waiting approval'}</p></div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Blended score trend</h2>
          <p className="mt-1 text-sm text-slate-400">Monthly points and lighter pulse points share one axis. Tier labels are visible so mixed-depth runs are not confused.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {model.scorePoints.map((point) => (
              <div key={`${point.sequence}-${point.runType}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-2"><span className="text-sm text-slate-300">#{point.sequence} {point.label}</span><span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-wide text-cyan-200">{point.runType} · {point.tier}</span></div>
                <p className="mt-3 text-3xl font-semibold text-white">{point.score ?? '—'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="text-xl font-semibold">Engine trend</h2>
            <div className="mt-4 space-y-4">
              {model.engineLines.map((line) => <div key={line.provider}><p className="mb-2 text-sm font-medium capitalize text-slate-200">{line.provider === 'openai' ? 'ChatGPT' : line.provider}</p><div className="flex gap-2">{line.points.map((p) => <span key={`${line.provider}-${p.sequence}`} className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-slate-300">#{p.sequence} {pct(p.rate)}</span>)}</div></div>)}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="text-xl font-semibold">Category scorecard</h2>
            <div className="mt-4 space-y-3">{model.categoryScorecard.slice(0, 8).map((c) => <div key={c.categoryId}><div className="mb-1 flex justify-between text-sm"><span>{c.categoryId} · {c.categoryName}</span><span>{pct(c.currentRate)}</span></div>{bar(c.currentRate)}</div>)}</div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6"><h2 className="text-lg font-semibold">Competitor overlay</h2><div className="mt-4 space-y-2">{model.competitorOverlay.length ? model.competitorOverlay.map((c) => <p key={c.name} className="text-sm text-slate-300">{c.name}: {pct(c.currentRate)}</p>) : <p className="text-sm text-slate-500">No competitor scores yet.</p>}</div></div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6"><h2 className="text-lg font-semibold">Source ledger</h2><div className="mt-4 space-y-2">{model.sourceLedger.map((s) => <p key={s.domain} className="text-sm text-slate-300">{s.present ? '✓' : '—'} {s.domain} <span className="text-slate-500">({s.count})</span></p>)}</div></div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6"><h2 className="text-lg font-semibold">Fix implementation</h2><p className="mt-2 text-sm text-slate-400">{model.fixStatus.ready ? `${model.fixStatus.titles.length} Fix Drop artifact ready.` : 'No Client Zero Fix Drop is ready yet.'}</p>{model.fixStatus.titles.map((t) => <p key={t} className="mt-3 rounded-xl bg-cyan-400/10 p-3 text-sm text-cyan-100">{t}</p>)}</div>
        </section>
      </div>
    </main>
  );
}
