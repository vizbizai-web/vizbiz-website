import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, LineChart, Radar, Search, TrendingUp } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export const metadata: Metadata = {
  title: "VizBiz | AI Visibility Intelligence for Automotive Retailers",
  description:
    "VizBiz helps dealerships see how they show up in AI-driven search, compare local visibility, and identify the next moves to improve discovery.",
};

const resourceLinks = [
  {
    title: "AI Visibility for Automotive Retailers",
    href: "/ai-visibility-for-car-dealerships",
  },
  {
    title: "How Dealerships Show Up in AI Search",
    href: "/how-dealerships-show-up-in-ai-search",
  },
  {
    title: "AI Visibility Audit for Automotive Retailers",
    href: "/ai-visibility-audit-for-car-dealerships",
  },
  {
    title: "Sample AI Visibility Report for Automotive Retailers",
    href: "/sample-ai-visibility-report-for-car-dealerships",
  },
  {
    title: "FAQ: AI Visibility for Automotive Retailers",
    href: "/faq-ai-visibility-for-car-dealerships",
  },
];

const howItWorks = [
  {
    title: "Tell us about your dealership",
    body: "Share your dealership name, website, market, and contact details in one short intake.",
  },
  {
    title: "We build your visibility snapshot",
    body: "We review how your dealership shows up in AI-driven search, where visibility is strongest, and where competitors may still have an edge.",
  },
  {
    title: "Review the next moves with us",
    body: "Book a 15-minute call to walk through the snapshot and leave with clear, practical next steps.",
  },
];
const whyItMatters = [
  {
    icon: Search,
    title: "AI is becoming a new discovery layer for automotive retailers",
    body: "More buyers are asking AI tools where to shop, compare, and service before they ever visit a dealership website.",
  },
  {
    icon: TrendingUp,
    title: "Early visibility can influence who gets considered first",
    body: "When nearby dealerships are surfaced more often, they can earn trust and attention earlier in the buying journey.",
  },
  {
    icon: Radar,
    title: "Clear visibility data leads to better decisions",
    body: "A focused snapshot helps your team see what is working, where the biggest opportunities are, and what to improve next.",
  },
];
function PrimaryCTA({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/intake"
      className={`premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold ${className}`}
    >
      Get My Dealership Snapshot
    </Link>
  );
}

function CarWireframe() {
  return (
    <div className="hero-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="scan-beam" aria-hidden="true" />
      <div className="relative aspect-[1.08/0.9] rounded-[1.5rem] border border-[var(--border-subtle)] bg-[rgba(5,7,10,0.55)]">
        <svg viewBox="0 0 640 440" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wireframe car illustration">
          <g stroke="rgba(230,237,243,0.85)" strokeWidth="2">
            <path d="M119 283L161 228L252 192H394L483 225L523 283" />
            <path d="M142 283H500" />
            <path d="M187 227L241 176H386L456 227" />
            <path d="M257 192L278 228H410L394 192" />
            <path d="M221 283C221 315 195 341 163 341C131 341 105 315 105 283C105 251 131 225 163 225C195 225 221 251 221 283Z" />
            <path d="M537 283C537 315 511 341 479 341C447 341 421 315 421 283C421 251 447 225 479 225C511 225 537 251 537 283Z" />
            <path d="M269 176L245 227" />
            <path d="M378 176L453 227" />
            <path d="M126 283L103 304" />
            <path d="M515 283L538 304" />
          </g>
          <g stroke="rgba(0,240,255,0.75)" strokeWidth="2">
            <path d="M163 246C183 246 200 263 200 283" />
            <path d="M479 246C499 246 516 263 516 283" />
            <path d="M198 282H445" />
            <path d="M252 192H392" />
          </g>
        </svg>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        <div className="metric-row rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">Visibility</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Growth opportunity</p>
        </div>
        <div className="metric-row rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">Local competitors</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Showing stronger today</p>
        </div>
        <div className="metric-row rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">Next step</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Review call</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:items-center">
          <div className="max-w-2xl">
            <div className="section-kicker">AI visibility intelligence for automotive retailers</div>
            <h1 className="display-font mt-6 text-[3rem] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[4.2rem] lg:text-[5rem]">
              See How Your Dealership Shows Up in AI Search
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              VizBiz helps dealerships understand, improve, and track how often they appear in AI-driven discovery so more shoppers can find them earlier and trust them faster.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryCTA className="min-h-13 px-6" />
              <Link href="/book-call" className="secondary-button min-h-13 rounded-2xl px-6 text-sm font-medium">
                Book My 15-Minute Review
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--neon-cyan)]" />Short intake</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--neon-cyan)]" />Clear snapshot</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--neon-cyan)]" />Practical next steps</span>
            </div>
          </div>

          <CarWireframe />
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-18 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <div className="section-kicker">How it works</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              Clear visibility insight, without a complicated process.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <div key={item.title} className="glass-card rounded-[1.6rem] p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] text-sm font-semibold text-[var(--neon-cyan)]">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-18 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="max-w-xl">
            <div className="section-kicker">Snapshot preview</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              See the visibility signal behind better decisions.
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
              Your snapshot is designed to make the opportunity clear: where your dealership is already earning attention, where competitors may be ahead, and what to improve first.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-7">
            <div className="flex flex-col gap-6 border-b border-white/8 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Sample result</p>
                <h3 className="mt-2 text-2xl font-semibold">Oakville market snapshot</h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--text-secondary)]">
                  Your dealership is showing up in some buyer-intent prompts, with clear room to improve consistency and close the gap with stronger nearby competitors.
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-[var(--border-subtle)] px-5 py-4 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">Score</p>
                <p className="mt-2 text-4xl font-semibold text-[var(--neon-cyan)]">42</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="metric-row rounded-2xl p-4">
                <Search className="h-5 w-5 text-[var(--neon-cyan)]" />
                <p className="mt-3 text-sm font-semibold">AI answer presence</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Visibility can improve across key dealership-style prompts.</p>
              </div>
              <div className="metric-row rounded-2xl p-4">
                <LineChart className="h-5 w-5 text-[var(--neon-cyan)]" />
                <p className="mt-3 text-sm font-semibold">Competitive share</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Another store is performing stronger in your local market today.</p>
              </div>
              <div className="metric-row rounded-2xl p-4">
                <Calendar className="h-5 w-5 text-[var(--neon-cyan)]" />
                <p className="mt-3 text-sm font-semibold">Recommended move</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Review the snapshot and focus on the highest-impact next moves.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-18 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <div className="section-kicker">Why it matters</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              AI visibility can shape who gets considered first.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {whyItMatters.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="glass-card rounded-[1.6rem] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(0,240,255,0.06)] text-[var(--neon-cyan)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 pb-24 pt-18 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-12">
            <div className="section-kicker">Next step</div>
            <h2 className="display-font mt-5 text-[2.35rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Start with a clear snapshot of where your dealership stands.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              Submit the intake, review the findings with us, and leave with a clearer picture of what will improve visibility first.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryCTA className="min-h-13 px-6" />
              <Link href="/book-call" className="secondary-button min-h-13 rounded-2xl px-6 text-sm font-medium">
                Book My 15-Minute Review
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyMobileCTA />
    </main>
  );
}
