import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "AI Visibility Audit for Car Dealerships | Free Score & Report | VizBiz",
  description:
    "Get your dealership's AI visibility score. See how often ChatGPT, Gemini, and Perplexity recommend your dealership — and what to fix. Free snapshot, paid deep-dive audit.",
  alternates: {
    canonical: "https://vizbiz.ai/ai-visibility-audit-for-car-dealerships",
  },
  openGraph: {
    title: "AI Visibility Audit for Car Dealerships | Free Score & Report",
    description:
      "See how often AI recommends your dealership. Free AI visibility snapshot with competitor comparison and fix plan.",
    type: "website",
    url: "https://vizbiz.ai/ai-visibility-audit-for-car-dealerships",
  },
};

const auditIncludes = [
  {
    title: "AI Visibility Score (0–100)",
    body: "How often your dealership appears in ChatGPT, Gemini, and Perplexity answers across real buyer-intent queries",
  },
  {
    title: "Competitor Comparison",
    body: "Which dealerships AI recommends instead of you — and why",
  },
  {
    title: "Category Breakdown",
    body: "Inventory, reviews, services, FAQ coverage, and entity signals scored individually",
  },
  {
    title: "Actionable Fix Plan",
    body: "Prioritized list of changes that will increase your AI visibility",
  },
];

const freeVsPaid = [
  {
    feature: "AI Visibility Score",
    free: true,
    paid: true,
  },
  {
    feature: "Top 3 competitor comparison",
    free: false,
    paid: true,
  },
  {
    feature: "Category breakdown (5 areas)",
    free: true,
    paid: true,
  },
  {
    feature: "Full SEO audit",
    free: false,
    paid: true,
  },
  {
    feature: "Prioritized fix plan",
    free: false,
    paid: true,
  },
  {
    feature: "Grounding query analysis",
    free: false,
    paid: true,
  },
  {
    feature: "15-min review call",
    free: false,
    paid: true,
  },
];

export default function AiVisibilityAuditPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Score" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">AI visibility audit</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            How Often Does AI Recommend Your Dealership?
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              When a car buyer asks ChatGPT, Gemini, or Perplexity for dealership recommendations — does your name come up?
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Most dealerships score below 15 out of 100 on AI visibility. That means AI systems are recommending competitors instead of you, even when you're the better option.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              A VizBiz AI Visibility Audit shows you exactly where you stand and what to fix.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
            What the Audit Covers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {auditIncludes.map((item) => (
              <div key={item.title} className="metric-row rounded-2xl p-5">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
            Free Snapshot vs Full Audit
          </h2>
          <div className="glass-card mt-8 overflow-hidden rounded-[2rem]">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Free Snapshot</th>
                  <th className="px-6 py-4 text-center font-semibold">Full Audit</th>
                </tr>
              </thead>
              <tbody>
                {freeVsPaid.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="px-6 py-4">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.free ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.paid ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
            See a Sample Report
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            Want to see what the full audit looks like before committing?
          </p>
          <div className="mt-6">
            <Link
              href="/sample-ai-visibility-report-for-car-dealerships/"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--neon-cyan)]/30 px-6 py-3 text-sm font-semibold text-[var(--neon-cyan)] transition hover:border-[var(--neon-cyan)]/60 hover:bg-[var(--neon-cyan)]/10"
            >
              View Sample Report →
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Get started</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Get Your AI Visibility Score
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Free snapshot takes 60 seconds. See your score, see where you stand, decide if the full audit is worth it.
            </p>
            <div className="mt-8">
              <Link
                href="/intake/?utm_source=site&utm_medium=cta-button&utm_campaign=audit-page"
                className="premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold"
              >
                Get My AI Visibility Score
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
            Related Resources
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/ai-visibility-for-car-dealerships/" className="metric-row rounded-2xl p-5 transition hover:bg-white/[0.04]">
              <h3 className="text-lg font-semibold">AI Visibility Guide</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">What AI visibility means and which signals matter most</p>
            </Link>
            <Link href="/sample-ai-visibility-report-for-car-dealerships/" className="metric-row rounded-2xl p-5 transition hover:bg-white/[0.04]">
              <h3 className="text-lg font-semibold">Sample Report</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">See a full audit with scores, competitor data, and recommendations</p>
            </Link>
            <Link href="/faq-ai-visibility-for-car-dealerships/" className="metric-row rounded-2xl p-5 transition hover:bg-white/[0.04]">
              <h3 className="text-lg font-semibold">FAQ</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">Common questions about AI visibility for dealerships</p>
            </Link>
            <Link href="/how-dealerships-show-up-in-ai-search/" className="metric-row rounded-2xl p-5 transition hover:bg-white/[0.04]">
              <h3 className="text-lg font-semibold">How AI Search Works</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">The mechanics behind how AI selects which dealerships to mention</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
