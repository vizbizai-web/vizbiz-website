import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, TrendingUp, Eye, BarChart3, Zap, Shield, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export const metadata: Metadata = {
  title: "VizBiz — AI Visibility Intelligence for Car Dealerships",
  description:
    "VizBiz helps car dealerships measure and improve how often they appear in AI-powered search results like ChatGPT, Google AI Overviews, and Gemini. Get your free AI visibility audit.",
};

const stats = [
  { value: "84%", label: "of dealerships score below 60/100 on AI visibility" },
  { value: "30%", label: "of car buyers now use AI to research vehicles" },
  { value: "252", label: "data points analyzed per dealership" },
];

const aviCategories = [
  { name: "Dealer Discovery", weight: "30%", score: 42, description: "How often AI recommends your dealership for buyer-intent searches" },
  { name: "Trust & Reviews", weight: "25%", score: 37, description: "Review signals, ratings, and trust markers AI relies on" },
  { name: "Service Visibility", weight: "20%", score: 34, description: "Service department mentions in AI-generated answers" },
  { name: "Used Inventory", weight: "15%", score: 52, description: "Pre-owned inventory appearance in AI shopping queries" },
  { name: "Finance & Trade-In", weight: "10%", score: 28, description: "Financing and trade-in signal presence" },
];

const recentMentions = [
  { question: "Best Honda dealerships near Oakville?", position: "#4", time: "2 hrs ago", context: "AI recommended 3 competitors before this dealership appeared.", competitors: ["Oakville Honda", "Milton Honda", "Erin Mills Honda"] },
  { question: "Who has the best used car deals in the GTA?", position: "Not mentioned", time: "5 hrs ago", context: "This dealership was invisible. AI recommended 5 other dealers.", competitors: ["AutoTrader listings", "Clutch", "Canada Drives"] },
  { question: "Reliable Toyota service department in Mississauga?", position: "#2", time: "8 hrs ago", context: "Strong service visibility. Appeared early in AI recommendations.", competitors: ["Mississauga Toyota", "Toyota on Front"] },
];

const howItWorks = [
  {
    number: "01",
    title: "Tell us about your dealership",
    body: "VizBiz collects your dealership\u2019s website, location, inventory, and service details. This feeds our 84-prompt analysis engine that evaluates visibility across ChatGPT, Gemini, Google AI, and Perplexity.",
    icon: Search,
  },
  {
    number: "02",
    title: "We run your AVI audit",
    body: "VizBiz runs 84 buyer-intent prompts across three AI platforms \u2014 generating 252 data points per dealership \u2014 and compares your AI visibility against local competitors. According to Arcalea\u2019s 2026 AEO Index, only 5\u20136 brands dominate AI recommendations nationally.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Get your score and action plan",
    body: "You receive your AVI score (0\u2013100), a competitor gap analysis, platform-specific visibility breakdown, and a prioritized action plan telling you exactly what to fix first.",
    icon: Zap,
  },
];

const signals = [
  "AVI score and band",
  "Competitor comparison",
  "Platform visibility review",
  "Buyer-intent findings",
  "Priority fixes ranked",
  "Next-step roadmap",
];

const comparisonRows = [
  {
    option: "DIY guessing",
    get: "Manual searches and scattered impressions",
    missing: "No benchmark, no scoring, no competitor view",
  },
  {
    option: "Generic SEO agency",
    get: "Broad SEO advice and retainers",
    missing: "Usually not built for AI recommendation behavior",
  },
  {
    option: "Visibility monitoring tools",
    get: "Brand mention tracking and dashboards",
    missing: "Tells you the score, not what to fix",
  },
  {
    option: "VizBiz",
    get: "AVI score, competitor gaps, buyer-intent analysis, prioritized action plan",
    missing: "Built specifically for dealerships",
    highlight: true,
  },
];

const faqs = [
  {
    question: "Does VizBiz replace SEO?",
    answer:
      "No. VizBiz measures and improves how your dealership appears in AI-generated answers and recommendations across ChatGPT, Gemini, Google AI Overviews, and Perplexity. VizBiz complements traditional SEO \u2014 our research shows 30% of car buyers now use AI to research vehicles (Ekho, 2026), a channel SEO tools don\u2019t measure.",
  },
  {
    question: "Does VizBiz work with Dealer.com, CDK, WordPress, or custom sites?",
    answer:
      "Yes. VizBiz evaluates AI visibility independently of your CMS or site platform. VizBiz analyzes how AI platforms interpret your dealership across the web \u2014 your website, reviews, directories, and third-party sources \u2014 regardless of how your site is built.",
  },
  {
    question: "What do I actually receive from VizBiz?",
    answer:
      "You receive an AVI score (0\u2013100), a competitor comparison showing which local dealerships AI recommends instead of you, platform-specific visibility findings across ChatGPT, Gemini, Google AI, and Perplexity, and a prioritized action plan. VizBiz analyzes 84 buyer-intent prompts producing 252 data points per dealership.",
  },
  {
    question: "How does VizBiz measure improvement over time?",
    answer:
      "VizBiz uses the AVI (AI Visibility Index) score alongside competitive visibility analysis to track changes over time. VizBiz re-runs the same 84-prompt battery across all AI platforms to measure whether your dealership is appearing more often, being recommended higher, and closing gaps with competitors.",
  },
];

function PrimaryCTA({ className = "" }: { className?: string }) {
  return (
    <Link href="/intake/" className={`premium-button rounded-xl px-7 py-4 text-sm font-semibold ${className}`}>
      Get My AVI Snapshot
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
    <SiteHeader />
    <main>

      {/* ─── HERO ─── */}
      <section className="chapter-hero relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="hero-video-bg" aria-hidden="true">
          <div className="hero-image-overlay" />
        </div>
        <div className="hero-grid-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="section-kicker reveal-up">AI Visibility Intelligence</div>
          <h1 className="super-display mt-6 text-[2.6rem] leading-[0.92] tracking-[-0.05em] text-white sm:text-[3.8rem] lg:text-[4.8rem] reveal-up" style={{ animationDelay: "100ms" }}>
            Is AI recommending<br />your dealership?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl reveal-up" style={{ animationDelay: "200ms" }}>
            VizBiz measures how often your dealership appears in ChatGPT, Gemini, Google AI, and Perplexity — and tells you exactly what to fix. Get your AVI score, competitor gaps, and a prioritized action plan.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row reveal-up" style={{ animationDelay: "300ms" }}>
            <PrimaryCTA className="min-h-14 px-8 text-base" />
            <Link href="/sample-ai-visibility-report-for-car-dealerships/" className="secondary-button min-h-14 rounded-xl px-7 text-sm font-medium">
              See Sample Report
            </Link>
          </div>
        </div>

        <div className="hero-bottom-fade" aria-hidden="true" />
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="chapter-dark border-t border-white/6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center reveal-up" style={{ animationDelay: `${i * 100}ms` }}>
              <p className="text-[2.8rem] font-bold tracking-[-0.04em] text-[var(--accent-blue)] sm:text-[3.2rem]">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT AI SEES (AVI Score Breakdown) ─── */}
      <section className="chapter-dark px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl reveal-up">
            <div className="section-kicker">Your AVI Score</div>
            <h2 className="display-font mt-5 text-[2.4rem] font-semibold tracking-[-0.04em] text-white sm:text-[3rem]">
              Five categories. One score. Clear priorities.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">
              The AI Visibility Index (AVI) measures your dealership across five dealer-specific categories — weighted by what actually drives buyer decisions.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4 reveal-up" style={{ animationDelay: "100ms" }}>
              {aviCategories.map((cat, i) => (
                <div key={cat.name} className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{cat.name} <span className="text-[var(--accent-blue)]">({cat.weight})</span></p>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{cat.description}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <p className={`text-2xl font-bold ${cat.score < 35 ? "text-red-400" : cat.score < 50 ? "text-yellow-400" : "text-[var(--accent-blue)]"}`}>{cat.score}</p>
                    </div>
                  </div>
                  <div className="mt-3 scene-bar-shell">
                    <div
                      className={`scene-bar ${cat.score < 35 ? "scene-bar-red" : cat.score < 50 ? "scene-bar-yellow" : "scene-bar-blue"}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5 reveal-up" style={{ animationDelay: "200ms" }}>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div>
                    <p className="scene-eyebrow">Sample dealership</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Recent AI Mentions</h3>
                  </div>
                  <div className="scene-score-pill">
                    <span>AVI</span>
                    <strong>42</strong>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {recentMentions.map((m) => (
                    <div key={m.question} className="rounded-xl bg-white/4 p-4 border border-white/6">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-white/90">{m.question}</p>
                        <span className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${m.position === "Not mentioned" ? "bg-red-500/16 text-red-400" : "bg-[var(--accent-blue)]/16 text-[var(--accent-blue)]"}`}>
                          {m.position}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/50">{m.context}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <p className="scene-eyebrow">What you get</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {signals.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl reveal-up">
            <div className="section-kicker">How it works</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
              From invisible to unmissable in three steps.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {howItWorks.map((step, i) => (
              <div key={step.number} className="glass-card rounded-2xl p-6 reveal-up" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-blue)]/12">
                    <step.icon className="h-5 w-5 text-[var(--accent-blue)]" />
                  </div>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent-blue)]">{step.number}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-[0.94rem] leading-[1.85] text-[var(--text-secondary)]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl reveal-up">
            <div className="section-kicker">Why VizBiz</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
              Not another dashboard. A diagnosis and a plan.
            </h2>
          </div>
          <div className="comparison-stage-v2 mt-10 reveal-up" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-0">
              <div className="comparison-head-v2">Approach</div>
              <div className="comparison-head-v2">What you get</div>
              <div className="comparison-head-v2">What\u2019s missing</div>
            </div>
            {comparisonRows.map((row) => (
              <div key={row.option} className={`comparison-row-v2 ${row.highlight ? "comparison-highlight-v2" : ""}`}>
                <div className="comparison-cell-v2 font-semibold">{row.option}</div>
                <div className="comparison-cell-v2">{row.get}</div>
                <div className="comparison-cell-v2">{row.missing}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IS / ISN'T ─── */}
      <section className="chapter-dark border-t border-white/6 px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <div className="glass-card reveal-up rounded-2xl p-6">
            <div className="section-kicker">What VizBiz is</div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A dealership-specific AI visibility audit</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A competitor-aware visibility benchmark</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A strategic scorecard and prioritized action plan</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A way to see how AI represents your dealership</li>
            </ul>
          </div>
          <div className="glass-card reveal-up rounded-2xl p-6" style={{ animationDelay: "100ms" }}>
            <div className="section-kicker">What VizBiz isn\u2019t</div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
              <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A generic SEO retainer</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A vanity score with no explanation</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A website rebuild</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A promise of instant rankings</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl reveal-up">
            <div className="section-kicker">Common questions</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
              Answers that make the next step easier.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((item, i) => (
              <div key={item.question} className="glass-card reveal-up rounded-2xl p-6" style={{ animationDelay: `${i * 100}ms` }}>
                <h3 className="text-base font-semibold text-white">{item.question}</h3>
                <p className="mt-3 text-[0.94rem] leading-[1.85] text-[var(--text-secondary)]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="chapter-final px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center reveal-up">
          <div className="section-kicker">Next step</div>
          <h2 className="super-display mt-6 text-[2.6rem] leading-[0.9] tracking-[-0.05em] text-white sm:text-[4rem] lg:text-[5rem]">
            See whether AI<br />recommends you.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
            Get your AVI score, competitor comparison, and a clear view of where your dealership stands across ChatGPT, Gemini, Google AI, and Perplexity.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCTA className="min-h-14 px-8 text-base" />
            <Link href="/sample-ai-visibility-report-for-car-dealerships/" className="secondary-button min-h-14 rounded-xl px-7 text-sm font-medium">
              See Sample Report
            </Link>
          </div>
        </div>
      </section>


      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/6 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="logo-wordmark text-xl">
              <span>VizBiz</span>
              <span className="logo-ai">.ai</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
              AI Visibility Intelligence for car dealerships. See whether AI recommends you.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
            <Link href="/ai-visibility-for-car-dealerships" className="transition-colors hover:text-white">AI Visibility</Link>
            <Link href="/how-dealerships-show-up-in-ai-search" className="transition-colors hover:text-white">How It Works</Link>
            <Link href="/sample-ai-visibility-report-for-car-dealerships" className="transition-colors hover:text-white">Sample Report</Link>
            <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
            <Link href="/insights" className="transition-colors hover:text-white">Insights</Link>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <Link href="/faq-ai-visibility-for-car-dealerships" className="transition-colors hover:text-white">FAQ</Link>
            <Link href="/intake/" className="font-semibold text-[var(--accent-blue)] transition-colors hover:text-white">Get My Snapshot</Link>
          </nav>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/6 pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} VizBiz.ai — All rights reserved.
        </div>
      </footer>

      <StickyMobileCTA />
    </main>
    </>
  );
}
