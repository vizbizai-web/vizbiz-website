import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About VizBiz | AI Visibility Intelligence for Car Dealerships",
  description:
    "VizBiz helps car dealerships measure and improve how they appear in AI-powered search results like ChatGPT, Google AI Overviews, and Gemini. Learn who we are and why AI visibility matters.",
  keywords:
    "about VizBiz, AI visibility company, dealership AI search, car dealership AI optimization",
  openGraph: {
    title: "About VizBiz | AI Visibility Intelligence",
    description:
      "VizBiz helps car dealerships measure and improve how they appear in AI-powered search results.",
    type: "website",
    url: "https://vizbiz.ai/about",
  },
  alternates: {
    canonical: "https://vizbiz.ai/about",
  },
};

export default function AboutPage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VizBiz",
    url: "https://vizbiz.ai",
    logo: "https://vizbiz.ai/logo.png",
    description:
      "VizBiz helps car dealerships measure and improve how they appear in AI-powered search results like ChatGPT, Google AI Overviews, and Gemini.",
    email: "hello@vizbiz.ai",
    sameAs: ["https://x.com/VizBizAI"],
    foundingDate: "2025",
    industry: "AI Visibility Intelligence",
    areaServed: {
      "@type": "Country",
      name: "Canada",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SiteHeader ctaLabel="Get My Snapshot" />

        {/* Hero */}
        <section className="section-shell px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-18 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="mx-auto max-w-4xl">
            <div className="section-kicker">About</div>
            <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
              Built to Make Dealerships Visible in AI
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              VizBiz is an AI visibility intelligence platform that helps car dealerships understand and improve how they appear in AI-driven search results — ChatGPT, Google AI Overviews, Gemini, and Perplexity.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              The Problem We're Solving
            </h2>
            <div className="mt-8 glass-card rounded-[2rem] p-6 sm:p-8">
              <p className="text-base leading-8 text-slate-200 sm:text-lg">
                Car buyers aren't just Googling anymore. They're asking ChatGPT for dealership recommendations, using Google AI Overviews for research, and querying Perplexity for comparisons. These AI systems decide which dealerships to mention — and most dealerships are invisible to them.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-[#3b82f6]/20 bg-white/[0.03] p-5 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-[#3b82f6]">11/100</div>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">Average AI visibility score for Ontario dealerships</div>
                </div>
                <div className="rounded-[1.5rem] border border-[#3b82f6]/20 bg-white/[0.03] p-5 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-[#3b82f6]">30%</div>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">Of car buyers start research with an AI chatbot</div>
                </div>
                <div className="rounded-[1.5rem] border border-[#3b82f6]/20 bg-white/[0.03] p-5 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-[#3b82f6]">47%</div>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">Of auto search queries show Google AI Overviews</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What We Do
            </h2>
            <div className="mt-8 space-y-4">
              {[
                {
                  title: "Measure",
                  body: "We run 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity — generating 252 data points per dealership — to create your AI Visibility Index (AVI) score.",
                },
                {
                  title: "Compare",
                  body: "We benchmark your visibility against local competitors so you can see exactly where you're winning, where you're losing, and what the gap looks like.",
                },
                {
                  title: "Improve",
                  body: "We deliver prioritized, implementation-ready recommendations — content blocks, schema fixes, trust signals, citation cleanup — that your webmaster can act on immediately.",
                },
                {
                  title: "Track",
                  body: "Monthly monitoring shows how your AI visibility changes over time, which competitors are moving, and whether your improvements are working.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-[#3b82f6]/20 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8"
                >
                  <h3 className="text-lg font-semibold text-[#6d9fff]">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why AI Visibility Matters Now
            </h2>
            <div className="mt-8 glass-card rounded-[2rem] p-6 sm:p-8">
              <div className="space-y-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                <p>
                  AI-driven search is not a future trend — it's happening now. Nearly half of automotive search queries trigger Google AI Overviews. ChatGPT has over 200 million weekly users. Perplexity is becoming a go-to research tool for purchase decisions.
                </p>
                <p>
                  Traditional SEO and Google Ads don't put you in AI answers. These systems use different signals — entity clarity, structured data, trust markers, review patterns, citation consistency — to decide which businesses to recommend.
                </p>
                <p>
                  The dealerships that figure this out early will have a compounding advantage. The ones that don't will wonder why their leads are drying up while competitors show up in every AI recommendation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
              <div className="section-kicker">Get started</div>
              <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
                See Your AI Visibility Score
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                Get a free AI Visibility Snapshot for your dealership. No commitment — just real data on where you stand.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake/"
                  className="premium-button inline-block rounded-2xl px-6 py-3.5 text-sm font-semibold"
                >
                  Get My AI Visibility Snapshot
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
