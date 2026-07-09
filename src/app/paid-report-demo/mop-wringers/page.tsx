import type { ReactNode } from 'react';
import Image from 'next/image';
import {
  mopWringersPaidReportDemo,
  paidReportReadinessSummary,
  paidReportToneClasses,
  validatePaidReportForClient,
} from '@/lib/paid-report-system';

const report = mopWringersPaidReportDemo;
const readiness = paidReportReadinessSummary(report);
const blockers = validatePaidReportForClient(report);

function strongestMetric() { return report.metrics.find((m) => m.tone === 'strong') || report.metrics[0]; }
function weakestMetric() { return report.metrics.find((m) => m.tone === 'weak') || report.metrics.at(-1) || report.metrics[0]; }
function fastestPaidFix() { return report.findings.find((f) => f.impact === 'High') || report.findings[0]!; }


function Badge({ children, tone = 'cyan' }: { children: ReactNode; tone?: 'cyan' | 'amber' | 'emerald' | 'slate' }) {
  const classes = {
    cyan: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
    amber: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    emerald: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
    slate: 'border-white/10 bg-white/5 text-slate-200',
  }[tone];
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${classes}`}>{children}</span>;
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-sm font-black text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
        {number}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/70">Report section</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">{label}</h2>
      </div>
    </div>
  );
}


function QuickAnswer() {
  const strongest = strongestMetric();
  const weakest = weakestMetric();
  const firstFix = fastestPaidFix();
  const tested = report.promptClusters.reduce((sum, cluster) => sum + cluster.tested, 0);
  const appeared = report.promptClusters.reduce((sum, cluster) => sum + cluster.targetAppeared, 0);
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-8 md:px-8">
      <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-100/80">Quick answer</p>
        <p className="mt-4 text-base leading-8 text-slate-100">
          {report.businessName} appeared in {appeared} of {tested} paid buyer-question checks across the current prompt clusters. The strongest category is {strongest.label.toLowerCase()}, while the weakest category is {weakest.label.toLowerCase()}. The fastest fix is: {firstFix.fixFirstStep}
        </p>
      </div>
    </section>
  );
}

function Methodology() {
  const tested = report.promptClusters.reduce((sum, cluster) => sum + cluster.tested, 0);
  const cards = [
    ['Engines', 'AI/search recommendation checks where available'],
    ['Prompt count', `Up to ${tested} buyer-intent prompts`],
    ['Category framework', report.metrics.map((m) => m.label).join(', ')],
    ['Tested date', report.dateLabel],
    ['Author', 'Alex at VizBiz.ai'],
    ['Sources', 'Client intake, website/profile evidence, prompt clusters, and approved client-facing report data'],
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-8 md:px-8">
      <SectionLabel number="0" label="Methodology" />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className="mt-3 text-sm leading-6 text-slate-100">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompetitorTable() {
  const total = report.promptClusters.reduce((sum, cluster) => sum + cluster.tested, 0);
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
      <SectionLabel number="3b" label="Competitor benchmark table" />
      <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-slate-900/80">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr><th className="p-4">Competitor</th><th className="p-4">Appears for</th><th className="p-4">Strength</th><th className="p-4">Your gap</th></tr>
          </thead>
          <tbody>
            {report.competitors.map((competitor) => (
              <tr key={competitor.name} className="border-t border-white/10">
                <td className="p-4 font-semibold text-white">{competitor.name}</td>
                <td className="p-4 text-slate-300">{competitor.status === 'needed' ? 'Not scored yet' : `Compared across up to ${total} prompts`}</td>
                <td className="p-4 text-slate-300">{competitor.note}</td>
                <td className="p-4 text-slate-300">{competitor.status === 'needed' ? 'Provide this competitor before scoring the gap.' : 'Gap calculated in paid benchmark.'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DecisionRoadmap() {
  const first = fastestPaidFix();
  const second = report.findings.find((f) => f.title !== first.title && f.impact === 'High') || report.findings[1] || first;
  const hold = report.findings.find((f) => f.difficulty === 'Developer') || report.findings.at(-1) || first;
  const rows = [
    [`Fix ${first.title} first if…`, first.whyItMatters],
    [`Fix ${second.title} if…`, second.whyItMatters],
    [`Hold ${hold.title} until…`, 'the easier visible-content and trust-proof changes are live, then verify what still blocks AI/search understanding.'],
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
      <SectionLabel number="6b" label="Decision framework roadmap" />
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map(([label, body]) => (
          <div key={label} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6">
            <h3 className="text-lg font-bold text-white">{label}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SignalBar({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm font-bold text-cyan-200">{value}%</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-950/80 ring-1 ring-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{note}</p>
    </div>
  );
}

export default function MopWringersPaidReportDemoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute left-[-10%] top-[-10%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[34rem] w-[34rem] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_75%)]" />
      </div>

      <header className="relative border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="VizBiz" width={42} height={42} className="rounded-xl border border-white/10" />
            <div>
              <p className="text-lg font-bold tracking-tight">VizBiz<span className="text-cyan-300">.ai</span></p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">AI visibility intelligence</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="cyan">Paid AI Visibility Report</Badge>
            <Badge tone="slate">{report.dateLabel}</Badge>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-16">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge tone="emerald">{report.primaryMarket}</Badge>
            <Badge tone="cyan">{report.category}</Badge>
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white md:text-6xl">
            Paid AI Visibility Report for {report.businessName}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
            {report.executiveSummary}
          </p>
          <div className="mt-7 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">Owner translation</p>
            <p className="mt-3 text-base leading-7 text-slate-100">{report.ownerTranslation}</p>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Verified score target</p>
              <p className="mt-2 text-2xl font-bold text-white">{report.scoreLabel}</p>
            </div>
            <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full bg-conic-gradient ring-1 ring-cyan-200/20" style={{ background: `conic-gradient(#22D3EE ${report.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}>
              <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-950 text-3xl font-black text-cyan-100">{report.score}</div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-300">
            This score shows how clearly AI and search systems can understand and recommend Mop Wringers today. The recommendations below focus on service clarity, local relevance, visible proof, and machine-readable business information.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-slate-950/70 p-4 ring-1 ring-white/10">
              <p className="text-2xl font-black text-white">120</p>
              <p className="mt-1 text-xs text-slate-400">Buyer questions</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-4 ring-1 ring-white/10">
              <p className="text-2xl font-black text-white">5</p>
              <p className="mt-1 text-xs text-slate-400">Priority fixes</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-4 ring-1 ring-white/10">
              <p className="text-2xl font-black text-white">7</p>
              <p className="mt-1 text-xs text-slate-400">Areas</p>
            </div>
          </div>
        </aside>
      </section>

      <QuickAnswer />
      <Methodology />

      <section className="relative mx-auto max-w-7xl px-5 pb-10 md:px-8">
        <SectionLabel number="1" label="What the score means" />
        <div className="grid gap-4 md:grid-cols-4">
          {report.metrics.map((metric) => (
            <div key={metric.label} className={`rounded-3xl border p-5 ${paidReportToneClasses(metric.tone)}`}>
              <p className="text-sm font-semibold text-white/80">{metric.label}</p>
              <p className="mt-3 text-xl font-black text-white">{metric.value}</p>
              <p className="mt-3 text-sm leading-6 text-current/80">{metric.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionLabel number="2" label="The buyer-question map" />
        <div className="grid gap-4 md:grid-cols-2">
          {report.promptClusters.map((cluster) => (
            <SignalBar
              key={cluster.name}
              label={cluster.name}
              value={Math.round((cluster.targetAppeared / cluster.tested) * 100)}
              note={`Mop Wringers currently appears relevant for ${cluster.targetAppeared} of ${cluster.tested} common buyer questions in this group. ${cluster.takeaway}`}
            />
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionLabel number="3" label="Service-area strategy" />
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Primary market</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-white">Rockwall County</p>
            <p className="mt-4 text-slate-300 leading-7">
              The report keeps Rockwall County as the center of gravity, then uses nearby areas as supporting question groups. This keeps the visibility strategy local, specific, and accurate.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {report.serviceAreaMap.map((area, index) => (
                <div key={area} className={`rounded-3xl border p-5 ${index === 0 ? 'border-cyan-300/40 bg-cyan-300/10' : 'border-white/10 bg-slate-950/50'}`}>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{index === 0 ? 'Core' : 'Nearby'}</p>
                  <p className="mt-2 text-lg font-bold text-white">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CompetitorTable />

      <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionLabel number="4" label="Top fixes, shown visually" />
        <div className="grid gap-5 lg:grid-cols-5">
          {report.findings.map((finding) => (
            <article key={finding.title} className="group rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-sm font-black text-slate-950">{finding.visualPosition}</div>
                <Badge tone={finding.impact === 'High' ? 'emerald' : 'amber'}>{finding.impact}</Badge>
              </div>
              <h3 className="text-lg font-bold leading-tight text-white">{finding.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{finding.plainEnglish}</p>
              <div className="mt-4 rounded-2xl bg-slate-950/70 p-4 ring-1 ring-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">First move</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{finding.fixFirstStep}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionLabel number="5" label="Implementation pack" />
        <div className="grid gap-4 md:grid-cols-2">
          {report.assets.map((asset) => (
            <div key={asset.label} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">{asset.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{asset.purpose}</p>
              <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-4">
                <p className="text-sm leading-7 text-slate-100">“{asset.copyReady}”</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DecisionRoadmap />

      <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionLabel number="6" label="Action tracker" />
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80">
          {report.tracker.map((item, index) => (
            <div key={item.task} className="grid gap-4 border-b border-white/10 p-5 last:border-b-0 md:grid-cols-[0.45fr_1.2fr_0.45fr_0.55fr] md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-black text-cyan-100">{index + 1}</div>
                <Badge tone={item.priority === 'Fix First' ? 'emerald' : 'slate'}>{item.priority}</Badge>
              </div>
              <div>
                <p className="font-semibold text-white">{item.task}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Verify: {item.verification}</p>
              </div>
              <p className="text-sm text-slate-300">Handled by: <span className="font-semibold text-white">{item.owner}</span></p>
              <p className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">{item.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionLabel number="7" label="Verification and monthly growth" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6">
            <h3 className="text-xl font-bold text-white">After fixes go live</h3>
            <div className="mt-5 space-y-3">
              {report.verificationPlan.map((step) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300" />
                  <p className="text-sm leading-6 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <h3 className="text-xl font-bold text-white">Ongoing visibility monitoring</h3>
            <div className="mt-5 space-y-3">
              {report.monthlyPlan.map((step) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                  <p className="text-sm leading-6 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionLabel number="8" label="What happens next" />
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-amber-300/30 bg-amber-300/10 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-100/80">Report status</p>
            <h3 className="mt-3 text-3xl font-black text-white">Ready for owner review</h3>
            <p className="mt-4 text-sm leading-6 text-amber-50/85">
              This preview shows the report layout, priority fixes, implementation pack, tracker, and verification plan. To complete the competitor benchmark, Mop Wringers should provide the two local businesses customers most often compare against.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black">{readiness.highImpactFindings}</p>
                <p className="text-xs text-amber-100/70">High-impact findings</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black">{readiness.readyAssets}</p>
                <p className="text-xs text-amber-100/70">Ready-to-use assets</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black">{readiness.missingCompetitors}</p>
                <p className="text-xs text-amber-100/70">Competitors needed</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-bold text-white">What we need for the full comparison</h3>
            <div className="mt-5 space-y-3">
              {blockers.map((blocker) => (
                <div key={blocker} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                  {blocker}
                </div>
              ))}
            </div>
            <h3 className="mt-7 text-xl font-bold text-white">Quality checks before delivery</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {report.qaGate.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative mt-10 border-t border-white/10 bg-slate-950 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>Prepared by VizBiz.ai for Mop Wringers</p>
          <p>Clear visuals, plain English, evidence-backed fixes, and verification after changes go live.</p>
        </div>
      </footer>
    </main>
  );
}
