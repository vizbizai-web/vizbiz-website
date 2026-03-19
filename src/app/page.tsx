import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Eye,
  LineChart,
  MapPinned,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import AnimateIn from "@/components/AnimateIn";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Snapshot", href: "#audit" },
  { label: "Why now", href: "#why-now" },
  { label: "Flow", href: "#process" },
  { label: "Proof", href: "#proof" },
];

const heroMetrics = [
  { value: "Fast", label: "Lead magnet style snapshot flow" },
  { value: "Local", label: "Competitor context by market" },
  { value: "15 min", label: "Review call pushed after submit" },
];

const problemCards = [
  {
    title: "AI answers now shape the shortlist early",
    body: "One recommendation layer can narrow a buyer's options before dealer sites, inventory pages, or marketplaces are even opened.",
    icon: BrainCircuit,
  },
  {
    title: "Most dealership reporting never shows this layer",
    body: "Analytics and CRM systems do not tell you whether ChatGPT, Gemini, Claude, or Perplexity are mentioning your store at the moment a shopper asks who to trust.",
    icon: Eye,
  },
  {
    title: "Competitors can quietly take share first",
    body: "If nearby stores are surfaced more often, they gain consideration upstream and turn invisible brand weakness into real pipeline loss.",
    icon: TrendingUp,
  },
];

const auditItems = [
  {
    title: "Platform visibility snapshot",
    body: "See where your dealership is present, inconsistent, or absent across the major assistants buyers are actually using.",
    icon: Bot,
  },
  {
    title: "Competitor benchmarking",
    body: "Compare your visibility against the dealers AI is surfacing in the same local buying conversations.",
    icon: Crosshair,
  },
  {
    title: "Buyer-intent prompt testing",
    body: "We review trust, financing, service reputation, local recommendation, and comparison moments tied to real dealership demand.",
    icon: ScanSearch,
  },
  {
    title: "Executive action priorities",
    body: "The output is built for decisions: likely signal gaps, strongest risks, and what your team should address first.",
    icon: ShieldCheck,
  },
];

const whyNowCards = [
  {
    eyebrow: "Recommendation layer",
    title: "AI is becoming a front door to local demand",
    body: "Discovery is moving from ranked links toward direct answers. That changes how stores earn attention and how quickly weaker signals disappear.",
  },
  {
    eyebrow: "Compressed attention",
    title: "The stores surfaced first gain leverage fast",
    body: "When AI presents a shortlist, every dealership not named is effectively filtered out before the shopper starts comparing sites or offers.",
  },
  {
    eyebrow: "Measurement gap",
    title: "Most teams are still operating without visibility",
    body: "That creates an opening. Dealers that measure now can improve their signals while the rest of the market is still guessing.",
  },
];

const riskPrompts = [
  "Best dealership near me for a new SUV",
  "Most trusted Toyota dealer in [city]",
  "Which Honda dealership has the best service reputation?",
  "Where should I go for financing if my credit is challenged?",
];

const processSteps = [
  {
    step: "01",
    title: "Enter your website, dealership, and market",
    body: "The first step captures the inputs needed to frame your local AI visibility snapshot correctly.",
  },
  {
    step: "02",
    title: "Add your contact info",
    body: "The second step captures the contact details needed to hand off the lead and keep the funnel moving.",
  },
  {
    step: "03",
    title: "Land on snapshot in progress",
    body: "After submit, the user is pushed to an in-progress page instead of a dead-end thank-you screen.",
  },
  {
    step: "04",
    title: "Book a 15-minute review call",
    body: "The funnel immediately pushes the lead into the review call so follow-through does not depend on memory.",
  },
];

const proofBullets = [
  "Built around actual AI outputs, not theory",
  "Structured for dealership operators and leadership",
  "Human-reviewed findings with market context",
  "Action priorities instead of vanity reporting",
];

const platformRows = [
  { name: "ChatGPT", yourStore: "Low", competitor: "High" },
  { name: "Gemini", yourStore: "Low", competitor: "Moderate" },
  { name: "Perplexity", yourStore: "Absent", competitor: "High" },
  { name: "Claude", yourStore: "Absent", competitor: "Moderate" },
  { name: "Copilot", yourStore: "Moderate", competitor: "High" },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3 text-[var(--text-primary)]">
      <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-[1.1rem] sm:h-12 sm:w-12">
        <span className="display-font text-sm font-black tracking-[0.24em] sm:text-base">VB</span>
      </div>
      <div className="leading-none">
        <div className="display-font text-[1.12rem] font-black tracking-[-0.05em] text-white sm:text-[1.28rem]">
          VizBiz.ai
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)] sm:text-[11px]">
          AI Visibility Intelligence
        </div>
      </div>
    </div>
  );
}

function PrimaryCTA({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/intake"
      className={`premium-button inline-flex items-center justify-center rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-[0.05em] ${className}`}
    >
      Get My AI Visibility Snapshot
    </Link>
  );
}

function SecondaryCTA({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/book-call"
      className={`secondary-button inline-flex items-center justify-center rounded-2xl px-6 py-4 text-sm font-semibold uppercase tracking-[0.05em] ${className}`}
    >
      Book a 15-Minute Review Call
    </Link>
  );
}

function InsightStatus({ label, tone }: { label: string; tone: "good" | "warn" | "risk" }) {
  const toneClass =
    tone === "good"
      ? "bg-[var(--accent-green-soft)] text-[var(--accent-green)] border-[rgba(198,255,77,0.18)]"
      : tone === "warn"
        ? "bg-white/[0.04] text-white/80 border-white/10"
        : "bg-white/[0.03] text-white/64 border-white/10";

  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${toneClass}`}>{label}</span>;
}

function HeroVisual() {
  return (
    <div className="hero-visual-shell relative mx-auto w-full max-w-[640px]">
      <div className="hero-anchor rounded-[2rem] p-3 sm:p-4">
        <div className="hero-panel rounded-[1.7rem] p-4 sm:p-5 lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(230px,0.95fr)]">
            <div className="space-y-4">
              <div className="panel-subtle rounded-[1.45rem] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
                  <div>
                    <p className="section-label">Sample snapshot preview</p>
                    <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.8rem]">
                      Executive visibility summary
                    </h2>
                  </div>
                  <InsightStatus label="Preview" tone="warn" />
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="display-font text-6xl font-black tracking-[-0.08em] text-white sm:text-7xl">42</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">visibility score</p>
                  </div>
                  <div className="score-ring">
                    <div className="score-ring-inner">
                      <Radar className="h-7 w-7 text-[var(--accent-green)]" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Trust prompts", "Low"],
                    ["Financing prompts", "Weak"],
                    ["Local comparisons", "Mixed"],
                  ].map(([label, value]) => (
                    <div key={label} className="metric-cell rounded-[1.15rem] px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</div>
                      <div className="mt-2 text-base font-semibold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-subtle rounded-[1.45rem] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="section-label">Priority findings</p>
                  <Sparkles className="h-4 w-4 text-white/42" />
                </div>
                <div className="mt-4 space-y-2.5 text-sm leading-6 text-white/74">
                  {[
                    "Your dealership is rarely surfaced in trust and financing prompts.",
                    "Two nearby competitors are named more consistently across assistants.",
                    "Review authority and location-page specificity look like the first gaps to address.",
                  ].map((item) => (
                    <div key={item} className="metric-cell rounded-[1.15rem] px-4 py-3">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="panel-subtle rounded-[1.45rem] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="section-label">Platform presence</p>
                  <Eye className="h-4 w-4 text-white/44" />
                </div>
                <div className="mt-4 space-y-2.5">
                  {platformRows.map((row) => (
                    <div key={row.name} className="platform-row grid grid-cols-[0.95fr_0.75fr_0.75fr] items-center gap-2 rounded-[1.15rem] px-3 py-3 text-xs sm:text-sm">
                      <span className="font-medium text-white/82">{row.name}</span>
                      <span className="text-center text-[var(--text-secondary)]">{row.yourStore}</span>
                      <span className="text-center text-white/76">{row.competitor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-contrast rounded-[1.45rem] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-label">Competitive pressure</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">Who AI is likely to surface first</h3>
                  </div>
                  <MapPinned className="h-5 w-5 text-[var(--accent-green)]" />
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    { name: "Your store", width: "42%", tone: "bg-white/30" },
                    { name: "Competitor A", width: "71%", tone: "bg-[var(--accent-green)]" },
                    { name: "Competitor B", width: "63%", tone: "bg-white/58" },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between text-sm text-white/72">
                        <span>{item.name}</span>
                        <span>{item.width}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                        <div className={`h-full rounded-full ${item.tone}`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insight-note rounded-[1.35rem] px-4 py-4 text-sm leading-6 text-white/66">
                Sample framing only. The real snapshot is customized to your market, rooftop, and local competitor set.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <header className="site-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 lg:h-20 lg:px-8">
          <Link href="/" className="shrink-0">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold uppercase tracking-[0.08em] text-white/58 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <SecondaryCTA className="px-4 py-3 text-xs" />
            <PrimaryCTA className="px-5 py-3 text-xs" />
          </div>

          <div className="lg:hidden">
            <Link
              href="/intake"
              className="secondary-button inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em]"
            >
              Get snapshot
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-premium section-shell relative overflow-hidden border-b border-white/8 pt-28 sm:pt-32 lg:pt-36">
        <div className="hero-grid-overlay" aria-hidden="true" />
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-ambient hero-ambient-left" aria-hidden="true" />
        <div className="hero-ambient hero-ambient-right" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-3 pb-18 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-16">
            <AnimateIn stagger className="max-w-3xl">
              <div className="section-kicker">AI visibility snapshot for car dealerships</div>

              <div className="hero-copy-shell mt-7">
                <div className="hero-copy-rule" aria-hidden="true" />
                <h1 className="display-font max-w-4xl text-[2.95rem] font-black leading-[0.96] tracking-[-0.055em] text-white sm:text-[4rem] lg:text-[4.85rem]">
                  Check Your AI Visibility
                </h1>
              </div>

              <p className="mt-6 max-w-2xl text-[1.02rem] leading-7 text-[var(--text-secondary)] sm:text-[1.12rem] sm:leading-8">
                See how your dealership appears in AI-driven search and where nearby competitors may be beating you.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <PrimaryCTA className="min-h-14 sm:min-w-[280px]" />
                <SecondaryCTA className="min-h-14 sm:min-w-[250px]" />
              </div>

              <div className="hero-subline mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/54">
                <span className="font-medium text-white/76">Built for dealerships</span>
                <span className="text-white/20">•</span>
                <span>Snapshot funnel with market intake</span>
                <span className="text-white/20">•</span>
                <span>Review call pushed immediately after submit</span>
              </div>

              <div className="hero-trust-strip mt-10 grid gap-3 rounded-[1.6rem] p-3.5 sm:grid-cols-3 sm:p-4.5">
                {heroMetrics.map((item) => (
                  <div key={item.label} className="hero-stat-card rounded-[1.15rem] px-4 py-4">
                    <p className="display-font text-[1.55rem] font-black tracking-[-0.05em] text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-white/62">{item.label}</p>
                  </div>
                ))}
              </div>
            </AnimateIn>

            <AnimateIn delay={0.12}>
              <HeroVisual />
            </AnimateIn>
          </div>
        </div>
      </section>

      <section id="problem" className="section-shell section-transition bg-[var(--bg-soft)] py-18 sm:py-24 lg:py-28" style={{ ["--transition-from" as string]: "#070909" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <AnimateIn>
              <div className="max-w-xl">
                <div className="section-kicker">Problem</div>
                <h2 className="display-font mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.35rem]">
                  Dealerships are losing AI visibility without seeing the loss.
                </h2>
                <p className="mt-5 text-[1.03rem] leading-7 text-[var(--text-secondary)] sm:text-[1.1rem] sm:leading-8">
                  This is not just about rankings. It is recommendation share. If AI answers steer shoppers toward other stores in your market, buyers may never reach the channels your team is tracking today.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn stagger className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {problemCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="glass-card rounded-[1.55rem] p-5 sm:p-6">
                    <div className="icon-chip">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-[1.16rem] font-semibold tracking-[-0.02em] text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/64 sm:text-base sm:leading-7">{card.body}</p>
                  </div>
                );
              })}
            </AnimateIn>
          </div>
        </div>
      </section>

      <section id="audit" className="section-shell section-transition section-divider bg-[var(--bg)] py-18 sm:py-24 lg:py-28" style={{ ["--transition-from" as string]: "#0E1212" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-start lg:gap-16">
            <AnimateIn className="max-w-3xl">
              <div className="section-kicker">What the snapshot shows</div>
              <h2 className="display-font mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.3rem]">
                Clear visibility intelligence, framed like a lead magnet preview.
              </h2>
              <p className="mt-5 max-w-2xl text-[1.03rem] leading-7 text-[var(--text-secondary)] sm:text-[1.1rem] sm:leading-8">
                VizBiz turns a fuzzy question into a sharp snapshot: where your dealership appears, where competitors are ahead, and why the review call matters.
              </p>
            </AnimateIn>

            <AnimateIn stagger className="grid gap-4 md:grid-cols-2">
              {auditItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="glass-card rounded-[1.55rem] p-5 sm:p-6">
                    <div className="icon-chip icon-chip-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-[1.14rem] font-semibold tracking-[-0.02em] text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/64 sm:text-base sm:leading-7">{item.body}</p>
                  </div>
                );
              })}
            </AnimateIn>
          </div>
        </div>
      </section>

      <section id="why-now" className="section-shell section-transition bg-[linear-gradient(180deg,#070909_0%,#0E1212_100%)] py-18 sm:py-24 lg:py-28" style={{ ["--transition-from" as string]: "#070909" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-16">
            <AnimateIn className="max-w-xl">
              <div className="section-kicker">Why now</div>
              <h2 className="display-font mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.3rem]">
                AI visibility matters before buyer habits harden around your competitors.
              </h2>
              <p className="mt-5 text-[1.03rem] leading-7 text-[var(--text-secondary)] sm:text-[1.1rem] sm:leading-8">
                The winners in AI-driven discovery may not be the stores spending the most. They may be the ones whose signals are already clearer, more trusted, and easier for models to surface.
              </p>
            </AnimateIn>

            <AnimateIn stagger className="space-y-4">
              {whyNowCards.map((card) => (
                <div key={card.title} className="glass-card rounded-[1.55rem] p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/44">{card.eyebrow}</p>
                  <h3 className="mt-3 text-[1.24rem] font-semibold tracking-[-0.02em] text-white sm:text-[1.35rem]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/64 sm:text-base sm:leading-7">{card.body}</p>
                </div>
              ))}
            </AnimateIn>
          </div>
        </div>
      </section>

      <section id="risk" className="section-shell section-transition section-divider bg-[#090c0c] py-18 sm:py-24 lg:py-28" style={{ ["--transition-from" as string]: "#0E1212" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,1.08fr)] lg:items-center lg:gap-16">
            <AnimateIn className="max-w-2xl">
              <div className="section-kicker">Competitor risk</div>
              <h2 className="display-font mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.25rem]">
                Buyers can be sent elsewhere before they ever visit your site.
              </h2>
              <p className="mt-5 text-[1.03rem] leading-7 text-[var(--text-secondary)] sm:text-[1.1rem] sm:leading-8">
                AI-generated answers can quietly redirect shopper attention at the exact moment a buyer asks who to trust, where to finance, or which local dealership stands out. That makes recommendation loss more dangerous than simple ranking loss.
              </p>
              <div className="premium-callout mt-8 rounded-[1.45rem] p-5 sm:p-6">
                <p className="text-lg font-semibold tracking-[-0.02em] text-white">
                  The snapshot is built to expose that competitive leakage before it compounds.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn className="glass-card rounded-[1.7rem] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                <div>
                  <p className="section-label">High-risk prompt moments</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Representative prompts where AI can shape buyer consideration</p>
                </div>
                <MapPinned className="h-5 w-5 text-white/54" />
              </div>
              <div className="mt-4 space-y-3">
                {riskPrompts.map((prompt) => (
                  <div key={prompt} className="metric-cell rounded-[1.15rem] px-4 py-4 text-sm leading-6 text-white/74 sm:text-base">
                    {prompt}
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section id="process" className="section-shell section-transition bg-[var(--bg)] py-18 sm:py-24 lg:py-28" style={{ ["--transition-from" as string]: "#090c0c" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <AnimateIn className="max-w-3xl">
            <div className="section-kicker">Lead flow</div>
            <h2 className="display-font mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.25rem]">
              A homepage funnel built to capture and convert.
            </h2>
            <p className="mt-5 max-w-2xl text-[1.03rem] leading-7 text-[var(--text-secondary)] sm:text-[1.1rem] sm:leading-8">
              The homepage now acts like a lead magnet: capture the right inputs, move the lead forward, then push the call booking while intent is still high.
            </p>
          </AnimateIn>

          <AnimateIn stagger className="mt-10 grid gap-4 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div key={step.step} className="glass-card rounded-[1.55rem] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="display-font text-[1.9rem] font-black tracking-[-0.06em] text-white/20">{step.step}</div>
                  <ChevronRight className="h-4 w-4 text-white/24" />
                </div>
                <h3 className="mt-5 text-[1.14rem] font-semibold tracking-[-0.02em] text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/64 sm:text-base sm:leading-7">{step.body}</p>
              </div>
            ))}
          </AnimateIn>
        </div>
      </section>

      <section id="proof" className="section-shell section-transition section-divider bg-[#0b0e0e] py-18 sm:py-24 lg:py-28" style={{ ["--transition-from" as string]: "#070909" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:items-center lg:gap-16">
            <AnimateIn className="max-w-2xl">
              <div className="section-kicker">Credibility</div>
              <h2 className="display-font mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.25rem]">
                Built to answer a practical question, not impress with noise.
              </h2>
              <p className="mt-5 text-[1.03rem] leading-7 text-[var(--text-secondary)] sm:text-[1.1rem] sm:leading-8">
                VizBiz is structured around actual AI outputs, dealership-specific context, and findings a leadership team can use. No fake dashboards. No inflated certainty. Just a clearer picture of whether your store is being surfaced when buyers ask AI for guidance.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {proofBullets.map((item) => (
                  <div key={item} className="glass-card rounded-[1.2rem] p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-green)]" />
                      <p className="text-sm leading-6 text-white/74">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateIn>

            <AnimateIn className="space-y-4">
              <div className="glass-card rounded-[1.7rem] p-5 sm:p-6">
                <p className="section-label">What the report is designed to answer</p>
                <div className="mt-4 space-y-3 text-white/76">
                  {[
                    "Where does your dealership appear across major AI assistants?",
                    "Which nearby competitors are being recommended more often?",
                    "Which buyer-intent moments are you losing first?",
                    "What should your team improve before spending more elsewhere?",
                  ].map((item) => (
                    <div key={item} className="metric-cell rounded-[1.15rem] px-4 py-3 text-sm leading-6 sm:text-base">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="proof-card rounded-[1.55rem] p-5">
                  <p className="section-label">Methodology</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">Structured prompt testing</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Prompt sets are organized around local dealership discovery, trust, financing, service reputation, and comparison moments.
                  </p>
                </div>
                <div className="proof-card rounded-[1.55rem] p-5">
                  <p className="section-label">Review layer</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">Human-reviewed findings</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    The final report is shaped for executive review, with clear priorities instead of raw data dump behavior.
                  </p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section id="cta" className="section-shell section-transition bg-[linear-gradient(180deg,#0b0e0e_0%,#070909_100%)] px-3 py-18 sm:px-6 sm:py-24 lg:px-8 lg:py-28" style={{ ["--transition-from" as string]: "#0b0e0e" }}>
        <AnimateIn className="cta-shell mx-auto max-w-6xl rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
            <div className="max-w-3xl">
              <div className="section-kicker">Ready to check your AI visibility?</div>
              <h2 className="display-font mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[3.3rem]">
                Start the snapshot, then book the review call.
              </h2>
              <p className="mt-5 text-[1.02rem] leading-7 text-[var(--text-secondary)] sm:text-[1.08rem] sm:leading-8">
                The primary path is the snapshot funnel. The secondary path is booking a 15-minute review call directly.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[290px]">
              <PrimaryCTA className="min-h-14 w-full" />
              <SecondaryCTA className="min-h-14 w-full" />
              <Link href="/book-call" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white/58 transition-colors hover:text-white">
                Skip straight to the review call
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </AnimateIn>
      </section>

      <footer className="section-shell border-t border-white/8 bg-[var(--bg)] px-3 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-start lg:gap-12">
          <div className="max-w-md">
            <BrandMark />
            <p className="mt-4 text-sm leading-6 text-white/52 sm:text-base sm:leading-7">
              AI visibility intelligence for dealerships that want a fast snapshot of how they appear in AI-driven search and where competitors may be winning.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/36">Navigate</p>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-white/66">
              <Link href="#problem" className="transition-colors hover:text-white">Problem</Link>
              <Link href="#audit" className="transition-colors hover:text-white">Snapshot</Link>
              <Link href="#why-now" className="transition-colors hover:text-white">Why now</Link>
              <Link href="#process" className="transition-colors hover:text-white">Process</Link>
              <Link href="#proof" className="transition-colors hover:text-white">Credibility</Link>
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/36">Next step</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/intake" className="text-white/78 transition-colors hover:text-white">Get My AI Visibility Snapshot</Link>
              <Link href="/book-call" className="text-white/78 transition-colors hover:text-white">Book a 15-Minute Review Call</Link>
              <p className="pt-3 text-white/38">© {new Date().getFullYear()} VizBiz.ai</p>
            </div>
          </div>
        </div>
      </footer>

      <StickyMobileCTA />
    </main>
  );
}
