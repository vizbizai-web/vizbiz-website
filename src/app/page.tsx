import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  LineChart,
  MapPinned,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const whatYouGet = [
  "A quick AI visibility snapshot for your dealership",
  "A read on how your store appears in AI-driven search",
  "A view into where nearby competitors may be beating you",
  "A 15-minute review call to walk through the findings and next move",
];

const whyItMatters = [
  {
    icon: SearchCheck,
    title: "Buyers are asking AI first",
    body: "More dealership discovery now starts inside AI tools, not just traditional search results.",
  },
  {
    icon: Trophy,
    title: "Competitors can win before the click",
    body: "If AI keeps naming a competitor first, they win consideration before a shopper ever reaches your website.",
  },
  {
    icon: Compass,
    title: "You need clarity before a full platform",
    body: "The first sale is not the future system. It’s a clear snapshot that shows whether there’s a visibility problem worth fixing now.",
  },
];

const proofPoints = [
  {
    label: "Snapshot focus",
    value: "Local market",
    note: "Built around your dealership, website, and market instead of generic SEO noise.",
  },
  {
    label: "Competitive angle",
    value: "Nearby rivals",
    note: "Designed to surface where another dealership may be showing up more often in AI-driven discovery.",
  },
  {
    label: "Next step",
    value: "15-minute review",
    note: "Every submission pushes straight into a short review call so the lead does not die on a thank-you page.",
  },
];

function PrimaryCTA({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/intake"
      className={`premium-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-[0.05em] ${className}`}
    >
      Get My AI Visibility Snapshot
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <header className="site-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-2xl">
              <span className="display-font text-sm font-black tracking-[0.22em]">VB</span>
            </div>
            <div className="leading-none">
              <div className="text-sm font-semibold tracking-[0.08em] text-white/96">VizBiz</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">AI visibility</div>
            </div>
          </Link>

          <PrimaryCTA className="hidden sm:inline-flex" />
        </div>
      </header>

      <section className="hero-premium section-shell relative overflow-hidden pb-18 pt-18 sm:pb-22 sm:pt-22 lg:pb-28 lg:pt-26">
        <div className="hero-grid-overlay" aria-hidden="true" />
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-ambient hero-ambient-left" aria-hidden="true" />
        <div className="hero-ambient hero-ambient-right" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:px-8">
          <div className="max-w-3xl">
            <div className="section-kicker">Launch snapshot for car dealerships</div>
            <h1 className="display-font mt-6 text-[3rem] font-black leading-[0.94] tracking-[-0.06em] text-white sm:text-[4.2rem] lg:text-[5rem]">
              Check Your AI Visibility
            </h1>
            <p className="mt-6 max-w-2xl text-[1.04rem] leading-8 text-[var(--text-secondary)] sm:text-[1.15rem] sm:leading-9">
              See how your dealership appears in AI-driven search and where nearby competitors may be beating you.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <PrimaryCTA />
              <Link
                href="/book-call"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.05em] text-white/82 transition-all hover:border-white/18 hover:bg-white/8 hover:text-white"
              >
                Book a 15-Minute Review Call
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/52">
              <span className="font-medium text-white/74">Built for dealerships</span>
              <span className="text-white/20">•</span>
              <span>Short intake</span>
              <span className="text-white/20">•</span>
              <span>Snapshot first</span>
              <span className="text-white/20">•</span>
              <span>Review call next</span>
            </div>
          </div>

          <div className="hero-panel rounded-[2rem] p-5 sm:p-6 lg:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="section-label">Sample snapshot</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
                  Fast signal, not a giant report.
                </h2>
              </div>
              <div className="score-ring h-24 w-24 flex-shrink-0">
                <div className="score-ring-inner flex-col">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/42">Score</span>
                  <span className="display-font text-2xl font-black text-white">42</span>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3">
              <div className="metric-cell rounded-[1.3rem] p-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-1 h-5 w-5 text-[var(--accent-green)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Your dealership is not showing up often enough</p>
                    <p className="mt-1 text-sm leading-6 text-white/62">
                      In buyer-intent AI discovery, your store is inconsistently surfaced.
                    </p>
                  </div>
                </div>
              </div>
              <div className="metric-cell rounded-[1.3rem] p-4">
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-1 h-5 w-5 text-[var(--accent-green)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">A local competitor appears stronger</p>
                    <p className="mt-1 text-sm leading-6 text-white/62">
                      Another dealership is likely getting more recommendation share in your market.
                    </p>
                  </div>
                </div>
              </div>
              <div className="premium-callout rounded-[1.3rem] p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-[var(--accent-green)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Next move: review call</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      Submit the snapshot request, then book a 15-minute call while intent is high.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-transition section-divider py-18 sm:py-22 lg:py-24" style={{ ["--transition-from" as string]: "#070909" }}>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="section-kicker">What you get</div>
            <h2 className="display-font mt-5 text-[2.25rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem]">
              A clear first offer.
            </h2>
            <p className="mt-5 max-w-2xl text-[1.02rem] leading-7 text-[var(--text-secondary)] sm:text-[1.08rem] sm:leading-8">
              This homepage is not trying to sell the full future platform. It sells one thing: a tight AI visibility snapshot for a dealership.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {whatYouGet.map((item) => (
              <div key={item} className="glass-card rounded-[1.5rem] p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--accent-green)]" />
                  <p className="text-sm leading-7 text-white/76 sm:text-[0.98rem]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-transition section-divider bg-[var(--bg-soft)] py-18 sm:py-22 lg:py-24" style={{ ["--transition-from" as string]: "#070909" }}>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="section-kicker">Why it matters</div>
            <h2 className="display-font mt-5 text-[2.25rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem]">
              This problem shows up before a lead ever clicks.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {whyItMatters.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="glass-card rounded-[1.7rem] p-6">
                  <div className="icon-chip">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/66 sm:text-[0.98rem]">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell section-transition section-divider py-18 sm:py-22 lg:py-24" style={{ ["--transition-from" as string]: "#0e1212" }}>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
            <div>
              <div className="section-kicker">Sample snapshot / proof</div>
              <h2 className="display-font mt-5 text-[2.25rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem]">
                Enough proof to start the conversation.
              </h2>
              <p className="mt-5 max-w-2xl text-[1.02rem] leading-7 text-[var(--text-secondary)] sm:text-[1.08rem] sm:leading-8">
                The goal is not to drown people in methodology. It’s to show what the snapshot reveals and why the next step is a short review call.
              </p>
            </div>

            <div className="cta-shell rounded-[2rem] p-5 sm:p-6 lg:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                {proofPoints.map((item) => (
                  <div key={item.label} className="panel-subtle rounded-[1.4rem] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{item.label}</p>
                    <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[rgba(198,255,77,0.16)] bg-[rgba(198,255,77,0.08)] p-5">
                <div className="flex items-start gap-3">
                  <LineChart className="mt-1 h-5 w-5 text-[var(--accent-green)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Launch logic</p>
                    <p className="mt-2 text-sm leading-7 text-white/72">
                      First sell clarity. Then sell the deeper work. The homepage should convert on the first offer, not explain the whole roadmap of the future product.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-transition section-divider pb-22 pt-18 sm:pb-24 sm:pt-22 lg:pb-28 lg:pt-24" style={{ ["--transition-from" as string]: "#070909" }}>
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="cta-shell rounded-[2.2rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/72">
              <ShieldCheck className="h-4 w-4 text-[var(--accent-green)]" />
              Built to convert, not overwhelm
            </div>
            <h2 className="display-font mx-auto mt-6 max-w-4xl text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.4rem]">
              Get your AI visibility snapshot.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-7 text-[var(--text-secondary)] sm:text-[1.08rem] sm:leading-8">
              Short intake. Clear signal. Then a 15-minute review call to decide what matters next.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryCTA className="w-full sm:w-auto" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/46">
              <Sparkles className="h-4 w-4" />
              One primary CTA. One clear offer.
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-white/42 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>VizBiz — AI visibility snapshots for dealerships.</p>
          <div className="flex items-center gap-5">
            <Link href="/book-call" className="transition-colors hover:text-white/76">
              Book a review call
            </Link>
            <Link href="/intake" className="transition-colors hover:text-white/76">
              Get snapshot
            </Link>
          </div>
        </div>
      </footer>

      <StickyMobileCTA />
    </main>
  );
}
