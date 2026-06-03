export const metadata = {
  title: "Contact | VizBiz.ai",
  description: "Contact VizBiz.ai for support, report delivery questions, and paid package onboarding.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Contact VizBiz</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">We respond fast and clearly.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">For report delivery questions, paid package onboarding, or account support, reach us directly below.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Email</h2>
            <p className="mt-2 text-sm text-slate-300">Primary support channel</p>
            <a className="mt-4 inline-block text-cyan-300 hover:text-cyan-200" href="mailto:hello@vizbiz.ai">hello@vizbiz.ai</a>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Phone</h2>
            <p className="mt-2 text-sm text-slate-300">For urgent coordination</p>
            <a className="mt-4 inline-block text-cyan-300 hover:text-cyan-200" href="tel:+14168902469">+1 (416) 890-2469</a>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-5 text-sm text-slate-200">
          Prefer to start with the product flow? Run the free mini report from the homepage and we’ll follow up with your report and next steps.
        </div>
      </section>
    </main>
  );
}
