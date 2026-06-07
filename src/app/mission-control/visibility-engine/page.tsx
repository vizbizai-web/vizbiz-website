import Link from 'next/link';

const pillars = [
  {
    label: 'Technical visibility foundation',
    status: 'Active',
    detail: 'Search Console, Bing Webmaster Tools, IndexNow, sitemap, llms.txt, canonicals, schema, speed, mobile, and route hygiene.',
  },
  {
    label: 'GEO / AEO authority pages',
    status: 'Queued',
    detail: 'Build AI Visibility Audit, GEO, AEO, ChatGPT visibility, and local business AI visibility pages.',
  },
  {
    label: 'Vertical demand pages',
    status: 'Queued',
    detail: 'Car dealerships, dentists, law firms, med spas, home services, real estate, restaurants, and clinics.',
  },
  {
    label: 'Proof assets',
    status: 'Queued',
    detail: 'Benchmark reports, sample reports, glossary, checklists, and methodology pages VizBiz can be cited for.',
  },
];

const dailyRhythm = [
  'Protect client intake and report pipeline first.',
  'Spend one focused block on VizBiz.ai SEO/GEO/AEO visibility work.',
  'Ship or improve one indexable/citable asset whenever possible.',
  'Track Search Console, Bing Webmaster Tools, IndexNow, sitemap, llms.txt, AI citability, and conversion path health.',
];

const foundationTasks = [
  {
    label: 'Bing Webmaster Tools verification',
    status: 'Todo',
    detail: 'Verify vizbiz.ai in Bing Webmaster Tools and keep the verification proof out of client-facing report copy.',
  },
  {
    label: 'Submit VizBiz sitemap to Bing',
    status: 'Todo',
    detail: 'Submit https://vizbiz.ai/sitemap.xml after verification and record the date/status in Mission Control.',
  },
  {
    label: 'IndexNow setup',
    status: 'Todo',
    detail: 'Add an IndexNow key file and submission route if practical, then use it for new/updated authority pages.',
  },
  {
    label: 'Broaden llms.txt positioning',
    status: 'Done',
    detail: 'Update llms.txt away from dealership-only positioning so AI systems understand VizBiz serves local businesses broadly.',
  },
  {
    label: 'Internal dogfood checklist',
    status: 'Todo',
    detail: 'Show these as VizBiz Visibility Engine tasks, not client-report warnings or technical noise.',
  },
];

const firstBuilds = [
  '/ai-visibility-audit-for-car-dealerships/',
  '/ai-visibility-for-local-businesses/',
  '/generative-engine-optimization/',
  '/answer-engine-optimization/',
  '/ai-visibility-for-car-dealerships/',
  '/ai-visibility-for-dentists/',
];

export default function VisibilityEnginePage() {
  return (
    <div className="space-y-5 overflow-x-hidden">
      <section className="rounded-2xl border border-cyan-300/20 bg-[#07111f]/80 p-4 shadow-[0_0_50px_rgba(34,211,238,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Priority Project</p>
            <h1 className="mt-2 break-words text-3xl font-bold text-white sm:text-4xl">VizBiz Visibility Engine</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Make VizBiz.ai the proof asset for the thing we sell: SEO, GEO, AEO, and AI recommendation readiness for local businesses. This sits beside client intake and client reports as a top operating priority.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-left lg:w-64 lg:text-right">
            <p className="text-xs uppercase tracking-widest text-cyan-100">Current phase</p>
            <p className="mt-1 text-2xl font-bold text-cyan-200">Foundation</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">Baseline audit → architecture → first authority pages.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <article key={pillar.label} className="min-w-0 rounded-2xl border border-slate-800/60 bg-[#0A0B14]/85 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="break-words text-base font-semibold text-white">{pillar.label}</h2>
              <span className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                {pillar.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800/60 bg-[#0A0B14]/85 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">First build queue</h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {firstBuilds.map((page, index) => (
              <div key={page} className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300">0{index + 1}</p>
                <p className="mt-1 break-all text-sm font-medium text-white">{page}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-[#0A0B14]/85 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Daily operating rule</h2>
          <ul className="mt-4 space-y-3">
            {dailyRhythm.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/mission-control/calendar" className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 sm:w-auto">
            View scheduled tasks
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800/60 bg-[#0A0B14]/85 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Dogfood foundation queue</p>
            <h2 className="mt-2 text-xl font-semibold text-white">VizBiz.ai must use the visibility stack we sell</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            These are internal Visibility Engine tasks. They should strengthen VizBiz.ai and Mission Control, not leak as client-facing report warnings.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {foundationTasks.map((task) => (
            <article key={task.label} className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="break-words text-sm font-semibold text-white">{task.label}</h3>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${task.status === 'Done' ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/30 bg-amber-300/10 text-amber-200'}`}>
                  {task.status}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{task.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Non-negotiable</p>
        <p className="mt-2 text-sm leading-6 text-amber-50/90">
          This project cannot steal oxygen from paying-client intake, reports, or delivery quality. It runs beside them: one steady visibility block per day, with shipped proof assets becoming part of VizBiz’s own sales argument.
        </p>
      </section>
    </div>
  );
}
