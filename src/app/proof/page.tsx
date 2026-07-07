import { getClientZeroDashboardModel } from '@/lib/client-zero';
import { assertClientSafeCopy } from '@/lib/client-copy-qa';

export const revalidate = 0;

function pct(value: number | null | undefined) {
  return value == null ? '—' : `${Math.round(value)}%`;
}

export default async function ProofPage() {
  const model = await getClientZeroDashboardModel();
  const latestMonthly = model.monthlySnapshots.at(-1);
  const current = latestMonthly?.blendedScore == null ? null : Math.round(latestMonthly.blendedScore * 100);
  const bodyCopy = [
    'We run VizBiz through VizBiz. Here is our own score.',
    'The numbers below come from our approved monthly snapshots. We show the trend even when it is flat.',
    'We test ChatGPT, Gemini, and Perplexity using the same subscriber loop we use for clients.',
    'Want this chart for your business?',
  ].join('\n');
  assertClientSafeCopy(bodyCopy, 'Client Zero public proof page');

  if (!model.publicReady) {
    return (
      <main className="min-h-screen bg-[#020617] px-5 py-16 text-slate-100">
        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">VizBiz proof</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">We run VizBiz through VizBiz.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Our public trend page appears after the monthly Client Zero report is approved. No auto-published numbers, no staged wins.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] px-5 py-16 text-slate-100">
      <section className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/20">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">VizBiz proof</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">We run VizBiz through VizBiz. Here is our own score.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">The numbers below come from approved monthly snapshots. If the score is flat, we show that too.</p>
          <div className="mt-8 rounded-2xl bg-cyan-400/10 p-5"><p className="text-sm text-cyan-100">Current approved monthly score</p><p className="mt-2 text-6xl font-semibold text-white">{current ?? '—'}</p></div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <h2 className="text-2xl font-semibold">Monthly trend</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {model.monthlySnapshots.map((snapshot) => <div key={snapshot.sequence} className="rounded-2xl bg-slate-900/80 p-4"><p className="text-xs text-slate-500">Snapshot #{snapshot.sequence}</p><p className="mt-2 text-3xl font-semibold">{snapshot.blendedScore == null ? '—' : Math.round(snapshot.blendedScore * 100)}</p><p className="mt-1 text-xs text-slate-400">{snapshot.tier} · {snapshot.runType}</p></div>)}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {model.engineLines.map((line) => {
            const point = line.points.filter((p) => model.monthlySnapshots.some((s) => s.sequence === p.sequence)).at(-1);
            return <div key={line.provider} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6"><p className="text-sm text-slate-400">{line.provider === 'openai' ? 'ChatGPT' : line.provider === 'gemini' ? 'Gemini' : 'Perplexity'}</p><p className="mt-2 text-4xl font-semibold">{pct((point?.rate ?? 0) * 100)}</p></div>;
          })}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <h2 className="text-2xl font-semibold">Methodology</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">We test ChatGPT, Gemini, and Perplexity on a monthly cadence. The public page shows approved monthly points only. Weekly pulse checks help us see movement internally, but they are not mixed into the public month-over-month line.</p>
        </div>

        <div className="rounded-3xl bg-cyan-400 p-8 text-[#020617]"><h2 className="text-3xl font-semibold">Want this chart for your business?</h2><p className="mt-3 max-w-2xl">VizBiz shows how often AI systems name you, what changed, and what to fix next.</p><a href="/pricing" className="mt-6 inline-flex rounded-full bg-[#020617] px-5 py-3 font-semibold text-white">See pricing</a></div>
      </section>
    </main>
  );
}
