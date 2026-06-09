import Link from 'next/link';

const statusCards = [
  {
    label: 'Current score',
    value: '6.5 → 7.2',
    tone: 'cyan',
    detail: 'Foundation is live; first non-auto vertical lifts the public footprint after production deploy.',
  },
  {
    label: 'Phase',
    value: 'Expansion',
    tone: 'emerald',
    detail: 'Move from dealership-heavy authority to broader local-business AI visibility coverage.',
  },
  {
    label: 'Public blocker',
    value: 'Indexing next',
    tone: 'amber',
    detail: 'Production URLs are live; next step is Search Console/Bing submission and ranking movement tracking.',
  },
  {
    label: 'Measurement loop',
    value: 'Weekly AVI',
    tone: 'violet',
    detail: 'Run fixed AI/search prompts so VizBiz becomes its own proof asset.',
  },
];

const pillars = [
  {
    label: 'Technical visibility foundation',
    status: 'Active',
    detail: 'Search Console, Bing Webmaster Tools, IndexNow, sitemap, llms.txt, canonicals, schema, speed, mobile, and route hygiene.',
  },
  {
    label: 'GEO / AEO authority pages',
    status: 'Active',
    detail: 'Core pages exist for AI visibility scoring, GEO, tools, comparisons, reports, and local-business AI visibility education.',
  },
  {
    label: 'Vertical demand pages',
    status: 'Shipping',
    detail: 'Car dealerships are established; med spas are the first non-automotive vertical; dentists and law firms are next.',
  },
  {
    label: 'Proof assets',
    status: 'Queued',
    detail: 'Benchmark reports, sample non-auto reports, methodology pages, screenshots, and before/after AI answer evidence.',
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
    label: 'Broaden llms.txt positioning',
    status: 'Done',
    detail: 'llms.txt positions VizBiz for local businesses broadly, not dealership-only visibility.',
  },
  {
    label: 'First non-auto vertical page',
    status: 'Done',
    detail: '/ai-visibility-for-med-spas/ is live with med-spa-specific AI visibility, trust proof, service clarity, FAQ, and schema signals.',
  },
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
    label: 'Internal dogfood checklist',
    status: 'Active',
    detail: 'Show these as VizBiz Visibility Engine tasks, not client-report warnings or technical noise.',
  },
];

const shippedAssets = [
  {
    label: 'Homepage local-business positioning',
    href: '/',
    detail: 'Hero, industry ticker, intake CTA, pricing, and footer position VizBiz beyond dealerships.',
  },
  {
    label: 'llms.txt',
    href: '/llms.txt',
    detail: 'Machine-readable overview for AI crawlers and answer engines.',
  },
  {
    label: 'sitemap.xml',
    href: '/sitemap.xml',
    detail: 'Indexable route inventory for Google/Bing crawlers.',
  },
  {
    label: 'AI visibility tools hub',
    href: '/best-ai-visibility-tools-for-local-businesses/',
    detail: 'Broader local-business tooling and measurement context.',
  },
  {
    label: 'Med spa vertical page',
    href: '/ai-visibility-for-med-spas/',
    detail: 'First non-automotive vertical authority page, live on the custom domain.',
  },
];

const firstBuilds = [
  { page: '/ai-visibility-for-med-spas/', status: 'Live' },
  { page: '/ai-visibility-for-dentists/', status: 'Next' },
  { page: '/ai-visibility-for-law-firms/', status: 'Next' },
  { page: '/how-vizbiz-measures-ai-visibility/', status: 'Queued' },
  { page: '/ai-visibility-for-roofers/', status: 'Queued' },
  { page: '/ai-visibility-for-hvac-companies/', status: 'Queued' },
];

const measurementPlan = [
  {
    label: 'Crawl readiness',
    cadence: 'Every deploy',
    detail: '200 status, canonical, sitemap, llms.txt, robots, JSON-LD, no mobile overflow, and no internal wording leakage.',
  },
  {
    label: 'Search Console / Bing',
    cadence: 'Weekly',
    detail: 'Track indexed pages, impressions, clicks, average position, and target query movement for AI visibility/local-business terms.',
  },
  {
    label: 'AI assistant prompts',
    cadence: 'Weekly',
    detail: 'Run fixed prompts across ChatGPT, Gemini/Google AI, Claude, and Perplexity; score mention, rank, correctness, and citations.',
  },
  {
    label: 'Conversion signal',
    cadence: 'Weekly',
    detail: 'Track vertical-page visits, CTA clicks, free report starts, completed intakes, paid CTA clicks, and Stripe conversions.',
  },
];

const testPrompts = [
  'What companies help local businesses improve AI visibility?',
  'Who offers AI visibility audits for local businesses?',
  'What tools measure whether a business appears in ChatGPT recommendations?',
  'How can a med spa improve visibility in AI search?',
  'What is VizBiz.ai?',
  'Is VizBiz.ai an SEO company or AI visibility company?',
];

const statusClass = (status: string) => {
  if (status === 'Done') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200';
  if (status === 'Active' || status === 'Shipping' || status === 'Shipping now' || status === 'Live') return 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200';
  if (status === 'Next') return 'border-violet-300/30 bg-violet-300/10 text-violet-200';
  return 'border-amber-300/30 bg-amber-300/10 text-amber-200';
};

export default function VisibilityEnginePage() {
  return (
    <div className="space-y-5 overflow-x-hidden">
      <section className="rounded-2xl border border-cyan-300/20 bg-[#07111f]/80 p-4 shadow-[0_0_50px_rgba(34,211,238,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Priority Project</p>
            <h1 className="mt-2 break-words text-3xl font-bold text-white sm:text-4xl">VizBiz Visibility Engine</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Make VizBiz.ai the proof asset for the thing we sell: SEO, GEO, AEO, and AI recommendation readiness for local businesses. This board tracks what is live, what is shipping, what is queued, and how we test whether our own AI visibility is improving.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-left lg:w-72 lg:text-right">
            <p className="text-xs uppercase tracking-widest text-cyan-100">Current checkpoint</p>
            <p className="mt-1 text-2xl font-bold text-cyan-200">First non-auto vertical live</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">Med spas are live; dentists and law firms are next.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <article key={card.label} className="min-w-0 rounded-2xl border border-slate-800/60 bg-[#0A0B14]/85 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="mt-2 break-words text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <article key={pillar.label} className="min-w-0 rounded-2xl border border-slate-800/60 bg-[#0A0B14]/85 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="break-words text-base font-semibold text-white">{pillar.label}</h2>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass(pillar.status)}`}>
                {pillar.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800/60 bg-[#0A0B14]/85 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Build queue</h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {firstBuilds.map((item, index) => (
              <div key={item.page} className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300">0{index + 1}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClass(item.status)}`}>{item.status}</span>
                </div>
                <p className="mt-2 break-all text-sm font-medium text-white">{item.page}</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Shipped / visible assets</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Public surfaces that help AI understand VizBiz</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            These are the routes and machine-readable files we verify after deploy. No fake rankings here — just visible surfaces and their job.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {shippedAssets.map((asset) => (
            <Link key={asset.href} href={asset.href} className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 transition hover:border-cyan-300/30 hover:bg-cyan-300/5">
              <h3 className="break-words text-sm font-semibold text-white">{asset.label}</h3>
              <p className="mt-2 break-all text-xs text-cyan-200">{asset.href}</p>
              <p className="mt-3 text-xs leading-5 text-slate-400">{asset.detail}</p>
            </Link>
          ))}
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
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {foundationTasks.map((task) => (
            <article key={task.label} className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="break-words text-sm font-semibold text-white">{task.label}</h3>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClass(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{task.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">Testing our own rankings</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Weekly VizBiz Own Visibility Scorecard</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-300">
            Scoring model: 35% AI assistant presence, 25% search/index visibility, 20% machine readability, 10% topical footprint, 10% conversion signal.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {measurementPlan.map((item) => (
            <article key={item.label} className="min-w-0 rounded-xl border border-violet-300/20 bg-slate-950/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="break-words text-sm font-semibold text-white">{item.label}</h3>
                <span className="shrink-0 rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">{item.cadence}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-300">{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-violet-300/20 bg-slate-950/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Fixed AI prompt set</p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {testPrompts.map((prompt) => (
              <p key={prompt} className="break-words rounded-lg border border-slate-800/70 bg-black/20 p-3 text-xs leading-5 text-slate-300">“{prompt}”</p>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Non-negotiable</p>
        <p className="mt-2 text-sm leading-6 text-amber-50/90">
          This project cannot steal oxygen from paying-client intake, reports, or delivery quality. It runs beside them: one steady visibility block per day, with shipped proof assets becoming part of VizBiz’s own sales argument. Last board update: June 9, 2026 10:24 AM EDT.
        </p>
      </section>
    </div>
  );
}
