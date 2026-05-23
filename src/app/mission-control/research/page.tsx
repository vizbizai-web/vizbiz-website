export const dynamic = 'force-dynamic';

const items = ['AI SEO', 'AI visibility', 'ChatGPT recommendations', 'Google AI Overviews', 'Generative engine optimization', 'Local SEO'];

export default function Page() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Find monetizable conversations</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">X Research</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Track AI SEO, AI visibility, Google AI Overviews, local SEO, dentist marketing, med spa marketing, and law firm SEO conversations for VizBiz content.</p>
      </div>

      <div className="rounded-3xl border border-slate-800/60 bg-[#111118] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-2xl">𝕏</span>
          <div>
            <h2 className="text-xl font-semibold text-white">Phase 1 workspace</h2>
            <p className="text-sm text-slate-400">This tab is now part of the cleaned Mission Control navigation. The full workflow can be wired next.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="font-semibold text-white">{item}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Ready to connect to real VizBiz operations data.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
