import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export const metadata: Metadata = {
  title: "VizBiz — AI Visibility Intelligence for Car Dealerships",
  description:
    "VizBiz helps car dealerships measure and improve how often they appear in AI-powered search results like ChatGPT, Google AI Overviews, and Gemini. Get your free AI visibility audit.",
};

const platformNames = ["ChatGPT", "Gemini", "Google AI", "Perplexity"];

const heroCards = [
  {
    title: "Visibility snapshot",
    subtitle: "See where your dealership is mentioned first — and where it disappears.",
    points: ["AVI score", "Platform visibility", "Buyer-intent prompts"],
    tone: "lime",
  },
  {
    title: "Competitor gap",
    subtitle: "Benchmark your local market and see who AI tools are trusting more right now.",
    points: ["Top rival gap", "Trust signals", "Priority fixes"],
    tone: "sand",
  },
];

const howItWorks = [
  {
    number: "01",
    title: "Tell us about your dealership",
    body: "VizBiz starts by collecting your dealership\u2019s website, location, inventory, and service details. This feeds our 84-prompt analysis engine that evaluates visibility across ChatGPT, Gemini, Google AI, and Perplexity.",
  },
  {
    number: "02",
    title: "We run your AVI audit",
    body: "VizBiz runs 84 buyer-intent prompts across three AI platforms \u2014 generating 252 data points per dealership \u2014 and compares your AI visibility against local competitors. Our research shows 84% of dealerships score below 60/100.",
  },
  {
    number: "03",
    title: "Get your score and next actions",
    body: "You receive your AVI score (0\u2013100), a competitor gap analysis, platform-specific visibility breakdown, and a prioritized action plan. According to Arcalea\u2019s 2026 AEO Index, only 5\u20136 brands dominate AI recommendations nationally.",
  },
];

const signals = [
  "AVI score and band",
  "Competitor comparison",
  "Platform visibility review",
  "Buyer-intent findings",
  "Priority fixes",
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
    option: "SEO tools",
    get: "Raw data and generic reports",
    missing: "No dealership context, no strategic interpretation",
  },
  {
    option: "VizBiz",
    get: "AVI score, competitor comparison, buyer-intent visibility analysis, action plan",
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
    <Link href="/intake" className={`premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold ${className}`}>
      Get My AVI Snapshot
    </Link>
  );
}

function HeroScene() {
  return (
    <div className="hero-scene-frame reveal-up rounded-[2.2rem] p-4 sm:p-6">
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-glow scene-glow-yellow" aria-hidden="true" />
      <div className="scene-glow scene-glow-green" aria-hidden="true" />

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        {heroCards.map((card, index) => (
          <article
            key={card.title}
            className={`hero-story-card hero-story-card-${card.tone} ${index === 1 ? "xl:translate-y-10" : ""}`}
          >
            <div className="hero-story-surface">
              <p className="scene-eyebrow">{card.title}</p>
              <h3 className="mt-3 text-[1.7rem] font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-[2.25rem]">
                {card.subtitle}
              </h3>

              <div className="mt-8 space-y-3">
                {card.points.map((item) => (
                  <div key={item} className="hero-point-row">
                    <span className="hero-point-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="hero-mini-dashboard mt-8">
                <div className="hero-mini-dashboard-top">
                  <span>Oakville</span>
                  <span>{index === 0 ? "AVI 42" : "Gap 16"}</span>
                </div>
                <div className="space-y-3">
                  {[68, 52, 37].map((value, rowIndex) => (
                    <div key={`${card.title}-${value}`} className="space-y-2">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/46">
                        <span>
                          {rowIndex === 0 ? "Top competitor" : rowIndex === 1 ? "Your dealership" : "Local average"}
                        </span>
                        <span>{value}</span>
                      </div>
                      <div className="scene-bar-shell">
                        <div
                          className={`scene-bar ${rowIndex === 0 ? "scene-bar-yellow" : rowIndex === 1 ? "scene-bar-green" : "scene-bar-muted"}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Recommendation share", "Who AI mentions early"],
          ["Trust scene", "Signals buyers see before clicking"],
          ["Action path", "What to fix next to gain ground"],
        ].map(([label, value]) => (
          <div key={label} className="metric-row rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</p>
            <p className="mt-2 text-base font-semibold text-[var(--text-primary)] sm:text-lg">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportScene() {
  return (
    <div className="report-stage reveal-up rounded-[2rem] p-5 sm:p-7">
      <div className="report-stage-grid" aria-hidden="true" />
      <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="report-stack">
          <div className="report-note-card">
            <p className="scene-eyebrow scene-eyebrow-dark">Sample report</p>
            <h3 className="mt-3 text-[2rem] font-semibold leading-[0.95] tracking-[-0.05em] text-[#274d14]">
              What your AVI audit actually shows.
            </h3>
            <p className="mt-4 text-sm leading-7 text-[rgba(39,77,20,0.72)]">
              The output is built to show where AI surfaces your dealership, where competitors outrank you in recommendation patterns, and which changes likely move the score fastest.
            </p>
            <Link href="/sample-ai-visibility-report-for-car-dealerships" className="inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#274d14]">
              See Sample Report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Current tier", "Moderate visibility"],
              ["Top competitor gap", "16 points"],
              ["Suggested focus", "Trust + used intent"],
            ].map(([label, value]) => (
              <div key={label} className="report-card rounded-[1.35rem] p-4">
                <p className="scene-label scene-label-dark">{label}</p>
                <p className="mt-3 text-base font-semibold text-[#274d14]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="report-display-panel">
          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="scene-eyebrow">Oakville visibility snapshot</p>
              <h4 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Buyer-intent recommendation map</h4>
            </div>
            <div className="scene-score-pill">
              <span>AVI</span>
              <strong>42</strong>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="scene-card scene-card-dark p-5">
              <div className="flex items-center justify-between">
                <p className="scene-label">Category mix</p>
                <span className="scene-chip">Live snapshot</span>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  ["Discovery", 61],
                  ["Trust", 47],
                  ["Service", 34],
                  ["Used", 52],
                ].map(([label, value]) => (
                  <div key={label as string} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-white/76">
                      <span>{label}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="scene-bar-shell">
                      <div className="scene-bar scene-bar-green" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="scene-card scene-card-light p-4">
                <p className="scene-label scene-label-dark">Platform coverage</p>
                <div className="mt-4 space-y-3">
                  {platformNames.map((name, index) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl bg-black/4 px-4 py-3 text-sm text-[#274d14]">
                      <span>{name}</span>
                      <span className={index === 0 ? "text-[#274d14]" : index === 1 ? "text-[#53a06c]" : "text-[#758173]"}>
                        {index === 0 ? "Visible" : index === 1 ? "Improving" : "Mixed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="scene-card scene-card-light p-4">
                <p className="scene-label scene-label-dark">Highest-leverage move</p>
                <p className="mt-3 text-lg font-semibold text-[#274d14]">Strengthen trust + comparison assets</p>
                <p className="mt-2 text-sm leading-7 text-[rgba(39,77,20,0.68)]">
                  Stronger trust proof and clearer used-vehicle answer targets could close the gap fastest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer,
      },
    })),
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VizBiz",
    "url": "https://vizbiz.ai",
    "description": "AI visibility intelligence platform for car dealerships. Measures and improves how dealerships appear in ChatGPT, Gemini, Google AI Overviews, and Perplexity.",
    "email": "hello@vizbiz.ai",
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VizBiz AI Visibility Audit",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Measures and improves how car dealerships appear in AI-generated answers across ChatGPT, Gemini, Google AI Overviews, and Perplexity. Runs 84 buyer-intent prompts generating 252 data points per dealership.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CAD", "description": "Free AI Visibility Snapshot" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My AVI Snapshot" />

      <section className="chapter chapter-hero-home px-4 pb-18 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal-up max-w-5xl">
            <div className="section-kicker">AI visibility intelligence for automotive retailers</div>
            <h1 className="super-display mt-6 text-[3.45rem] leading-[0.84] tracking-[-0.08em] text-white sm:text-[5.5rem] lg:text-[7.9rem]">
              Is AI recommending your dealership — or someone else first?
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              See how your dealership appears in ChatGPT, Gemini, Google AI, and Perplexity. Get your AVI score, competitor comparison, and clear actions to improve visibility. <strong className="text-white">84% of dealerships score below 60/100.</strong> Find out where you stand.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryCTA className="min-h-12 w-full justify-center px-5 sm:min-h-13 sm:w-auto sm:px-6" />
              <Link href="/sample-ai-visibility-report-for-car-dealerships" className="secondary-button flex min-h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-medium sm:min-h-13 sm:w-auto sm:px-6">
                See Sample Report
              </Link>
            </div>
            <div className="mt-7 flex flex-col gap-2 text-sm text-[var(--text-secondary)] sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--neon-cyan)]" />Built for dealerships</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--neon-cyan)]" />Competitor comparison</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--neon-cyan)]" />Practical next steps</span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">84%</p>
                <p className="text-xs text-white/50">dealers score below 60</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">30%</p>
                <p className="text-xs text-white/50">buyers use AI to research</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">84</p>
                <p className="text-xs text-white/50">buyer-intent prompts tested</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/4 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">Key Takeaways</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">84% of dealerships</strong> score below 60/100 on AI visibility (VizBiz data, 2026)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">30% of car buyers</strong> now use AI to research vehicles before visiting a dealership (Ekho, 2026)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Only <strong className="text-white">5–6 brands dominate</strong> AI recommendations nationally regardless of local presence (Arcalea AEO Index, 2026)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>VizBiz runs <strong className="text-white">84 buyer-intent prompts</strong> across ChatGPT, Gemini, Google AI, and Perplexity — generating 252 data points per dealership</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>An AVI audit shows where you appear, where competitors appear instead, and what to fix first</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 sm:mt-16">
            <HeroScene />
          </div>
        </div>
      </section>

      <section className="chapter chapter-break-dark px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-6xl reveal-up">
          <p className="chapter-label">What AI sees</p>
          <h2 className="super-display max-w-5xl text-[3rem] leading-[0.86] tracking-[-0.07em] text-white sm:text-[5.2rem] lg:text-[6.8rem]">
            How Does AI Decide Which Dealership to Recommend?
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            AI platforms like ChatGPT, Gemini, Google AI Overviews, and Perplexity evaluate visibility, trust, comparison, and recommendation signals for each dealership. Our research across 84 buyer-intent prompts found that only 5\u20136 brands dominate AI recommendations nationally, regardless of what local dealers are actually nearby (Metricus, 2026). The dealerships that get surfaced earlier often win trust earlier.
          </p>
        </div>
      </section>

      <section className="chapter chapter-light-home px-4 py-18 text-[#274d14] sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="light-intro-grid">
            <div className="reveal-up max-w-xl">
              <div className="section-kicker section-kicker-light">How it works</div>
              <h2 className="display-font mt-5 text-[2.45rem] font-semibold leading-[0.94] tracking-[-0.05em] sm:text-[3.35rem]">
                A clearer, scene-by-scene look at how your dealership appears in AI.
              </h2>
            </div>
            <div className="reveal-up light-platform-cloud">
              {platformNames.map((name) => (
                <span key={name} className="light-platform-pill">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {howItWorks.map((item, index) => (
              <div key={item.title} className="light-story-card reveal-up" style={{ animationDelay: `${index * 120}ms` }}>
                <div className="text-sm font-semibold tracking-[0.18em] text-[rgba(39,77,20,0.48)]">{item.number}</div>
                <h3 className="mt-8 text-[1.55rem] font-semibold leading-[1] tracking-[-0.04em] text-[#274d14]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[rgba(39,77,20,0.74)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="chapter chapter-report px-4 py-18 text-[#274d14] sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="reveal-up max-w-2xl">
            <div className="section-kicker section-kicker-light">What you get</div>
            <h2 className="display-font mt-5 text-[2.55rem] font-semibold leading-[0.94] tracking-[-0.05em] sm:text-[3.35rem]">
              Your AVI audit should feel like a real operating view, not a bland report.
            </h2>
          </div>

          <div className="mt-10">
            <ReportScene />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {signals.map((item, index) => (
              <div key={item} className="light-chip reveal-up flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-[rgba(39,77,20,0.76)]" style={{ animationDelay: `${index * 80}ms` }}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6af295]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="chapter chapter-break-dark-2 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-6xl reveal-up">
          <p className="chapter-label">Why AI visibility matters</p>
          <h2 className="super-display max-w-5xl text-[3rem] leading-[0.86] tracking-[-0.07em] text-white sm:text-[5rem] lg:text-[6.35rem]">
            Why Does AI Visibility Matter for Car Dealerships?
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            AI visibility determines which dealership gets considered first when a buyer asks ChatGPT for a recommendation. According to the Princeton GEO study (2024), GEO-optimized content achieves 30\u2013115% higher visibility in AI responses. AI-driven traffic shows a 4.4x higher conversion rate than traditional search traffic, with 527% year-over-year growth in AI referral traffic (Arcalea AEO Index, 2026). When AI tools consistently surface another dealership, that advantage compounds before a buyer ever clicks a website.
          </p>
        </div>
      </section>

      <section className="chapter chapter-light-home px-4 py-18 text-[#274d14] sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl reveal-up">
          <div className="max-w-2xl">
            <div className="section-kicker section-kicker-light">How VizBiz compares</div>
            <h2 className="display-font mt-5 text-[2.45rem] font-semibold tracking-[-0.04em] sm:text-[3rem]">
              Most options either give you vague advice or raw data without dealership context.
            </h2>
          </div>

          <div className="comparison-stage mt-8 hidden overflow-hidden rounded-[1.8rem] md:block">
            <div className="grid md:grid-cols-[1.05fr_1.2fr_1.15fr]">
              <div className="comparison-head">Option</div>
              <div className="comparison-head">What you get</div>
              <div className="comparison-head">What’s missing</div>
              {comparisonRows.map((row) => (
                <>
                  <div key={`${row.option}-option`} className={`comparison-cell font-semibold ${row.highlight ? "comparison-cell-highlight" : "text-[#274d14]"}`}>{row.option}</div>
                  <div key={`${row.option}-get`} className="comparison-cell text-[rgba(39,77,20,0.74)]">{row.get}</div>
                  <div key={`${row.option}-missing`} className="comparison-cell text-[rgba(39,77,20,0.74)]">{row.missing}</div>
                </>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:hidden">
            {comparisonRows.map((row) => (
              <div key={row.option} className={`rounded-[1.6rem] p-5 shadow-[0_10px_32px_rgba(39,77,20,0.08)] ${row.highlight ? "bg-[#274d14] text-white" : "bg-white text-[#274d14]"}`}>
                <div className="text-base font-semibold">{row.option}</div>
                <div className="mt-4">
                  <p className={`text-[11px] uppercase tracking-[0.18em] ${row.highlight ? "text-white/60" : "text-[rgba(39,77,20,0.5)]"}`}>What you get</p>
                  <p className={`mt-2 text-sm leading-7 ${row.highlight ? "text-white/82" : "text-[rgba(39,77,20,0.74)]"}`}>{row.get}</p>
                </div>
                <div className="mt-4">
                  <p className={`text-[11px] uppercase tracking-[0.18em] ${row.highlight ? "text-white/60" : "text-[rgba(39,77,20,0.5)]"}`}>What’s missing</p>
                  <p className={`mt-2 text-sm leading-7 ${row.highlight ? "text-white/82" : "text-[rgba(39,77,20,0.74)]"}`}>{row.missing}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="chapter chapter-white-home px-4 py-16 text-[#274d14] sm:px-6 sm:py-22 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="light-card reveal-up rounded-[1.8rem] p-6">
            <div className="section-kicker section-kicker-light">What VizBiz is</div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[rgba(39,77,20,0.74)]">
              <li>• A dealership-specific AI visibility audit</li>
              <li>• A competitor-aware visibility benchmark</li>
              <li>• A strategic scorecard and action plan</li>
              <li>• A way to see how AI currently represents your dealership</li>
            </ul>
          </div>
          <div className="light-card reveal-up rounded-[1.8rem] p-6" style={{ animationDelay: "120ms" }}>
            <div className="section-kicker section-kicker-light">What VizBiz isn’t</div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[rgba(39,77,20,0.74)]">
              <li>• A generic SEO retainer</li>
              <li>• A vanity score with no explanation</li>
              <li>• A website rebuild</li>
              <li>• A promise of instant rankings</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="chapter chapter-light-home px-4 py-16 text-[#274d14] sm:px-6 sm:py-22 lg:px-8">
        <div className="mx-auto max-w-6xl reveal-up">
          <div className="max-w-2xl">
            <div className="section-kicker section-kicker-light">Common questions</div>
            <h2 className="display-font mt-5 text-[2.45rem] font-semibold tracking-[-0.04em] sm:text-[3rem]">
              Answers that make the next step easier.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((item, index) => (
              <div key={item.question} className="light-story-card reveal-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-lg font-semibold text-[#274d14]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[rgba(39,77,20,0.74)]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="chapter chapter-final-home px-4 pb-20 pt-18 sm:px-6 sm:pb-28 sm:pt-22 lg:px-8">
        <div className="mx-auto max-w-4xl text-center reveal-up">
          <div className="section-kicker">Next step</div>
          <h2 className="super-display mt-5 text-[2.8rem] leading-[0.88] tracking-[-0.06em] text-white sm:text-[4rem] lg:text-[5rem]">
            See whether AI recommends your dealership.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
            Get your AVI score, competitor comparison, and a clear view of where your dealership stands across ChatGPT, Gemini, Google AI, and Perplexity.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCTA className="min-h-13 px-6" />
            <Link href="/sample-ai-visibility-report-for-car-dealerships" className="secondary-button min-h-13 rounded-2xl px-6 text-sm font-medium">
              See Sample Report
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCTA />
    </main>
    </>
  );
}
