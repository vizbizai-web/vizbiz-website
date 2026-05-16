import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Ontario Dealership AI Visibility Report — April 2026 | VizBiz",
  description:
    "Original research: How visible are Ontario car dealerships in AI search? Data from 84 buyer-intent prompts across ChatGPT, Gemini, and search platforms. Average score: 11/100.",
  openGraph: {
    title: "Ontario Dealership AI Visibility Report — April 2026",
    description:
      "84% of dealership websites are basically invisible to AI search. Our data confirms it.",
    url: "https://vizbiz.ai/ontario-dealership-ai-visibility-report-2026",
  },
  alternates: {
    canonical: "https://vizbiz.ai/ontario-dealership-ai-visibility-report-2026",
  },
};

export default function OntarioReportPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Ontario Dealership AI Visibility Report — April 2026",
    "description": "Original research: How visible are Ontario car dealerships in AI search? Data from 84 buyer-intent prompts across ChatGPT, Gemini, and search platforms. Average score: 11/100.",
    "datePublished": "2026-04-01",
    "dateModified": "2026-04-11",
    "author": {
      "@type": "Organization",
      "name": "VizBiz",
      "url": "https://vizbiz.ai"
    },
    "publisher": {
      "@type": "Organization",
      "name": "VizBiz",
      "logo": { "@type": "ImageObject", "url": "https://vizbiz.ai/logo.jpg" }
    },
    "mainEntityOfPage": "https://vizbiz.ai/ontario-dealership-ai-visibility-report-2026",
    "wordCount": 1200,
    "articleSection": "Original Research",
    "keywords": "AI visibility, car dealership, GEO, Ontario, AI search, ChatGPT recommendations",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is the average AI visibility score for Ontario car dealerships?", "acceptedAnswer": { "@type": "Answer", "text": "The average score across dealerships tested was 11 out of 100, based on VizBiz's 84-prompt battery run across Brave Search, Tavily, and GLM-5.1 in April 2026." } },
      { "@type": "Question", "name": "Which AI platforms were used in the Ontario AI visibility study?", "acceptedAnswer": { "@type": "Answer", "text": "Three platforms: Brave Search API, Tavily, and GLM-5.1. These represent the three main ways AI systems retrieve and synthesize dealership information." } },
      { "@type": "Question", "name": "Why do Ontario dealerships score so low on AI visibility?", "acceptedAnswer": { "@type": "Answer", "text": "Dealerships only appear in AI responses when a shopper already knows their name. When prompts don't name them specifically, they vanish." } },
      { "@type": "Question", "name": "What categories had the highest and lowest AI visibility?", "acceptedAnswer": { "@type": "Answer", "text": "Highest: Competitor comparison (same brand) at 36% and negative/objection queries at 33%. Lowest: Ontario-specific queries, review/reputation signals, and digital experience all scored 0%." } },
      { "@type": "Question", "name": "How can an Ontario dealership improve its AI visibility score?", "acceptedAnswer": { "@type": "Answer", "text": "Fix entity data consistency, build detailed content answering buyer questions, earn specific customer reviews, and build authority through third-party mentions." } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main className="min-h-screen bg-black text-white">
        {/* Hero */}
        <section className="section-shell">
          <div className="glass-card max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-purple-400 mb-4">
              Original Research — April 2026
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Ontario Dealership AI Visibility Report
            </h1>
            <p className="text-lg text-white/70 mb-2">
              We ran 84 buyer-intent prompts across AI search platforms to measure how visible
              Ontario car dealerships really are. The results confirm what many dealers suspect
              but can&apos;t quantify.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-purple-400/15 bg-purple-400/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-purple-400">Key Takeaways</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70 sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" /><span>Average AI visibility score: <strong className="text-white">11 out of 100</strong></span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" /><span>Dealerships only appear when shoppers already know their name — otherwise they vanish</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" /><span>Highest category: competitor comparison at <strong className="text-white">36%</strong>; several categories scored <strong className="text-white">0%</strong></span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" /><span>Data from 84 prompts across Brave Search, Tavily, and GLM-5.1 in April 2026</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Key Finding */}
        <section className="section-shell">
          <div className="glass-card max-w-4xl mx-auto text-center">
            <p className="text-sm uppercase tracking-widest text-purple-400 mb-4">
              Key Finding
            </p>
            <p className="text-5xl md:text-7xl font-bold text-white mb-4">11/100</p>
            <p className="text-xl text-white/70">
              Average AI Visibility Score for Ontario dealerships tested
            </p>
            <p className="text-sm text-white/50 mt-4">
              Based on 84 buyer-intent prompts × Brave Search + Tavily + GLM-5.1 = 252 data
              points per dealership audited
            </p>
          </div>
        </section>

        {/* Industry Context */}
        <section className="section-shell">
          <div className="glass-card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              What Is the Industry Problem with Dealership AI Visibility?
            </h2>
            <div className="space-y-4 text-white/80">
              <div className="metric-row">
                <span className="text-purple-400 font-bold text-2xl">84%</span>
                <span>
                  of dealership websites score below 60/100 on AI visibility (DealershipGuy,
                  Jan 2026)
                </span>
              </div>
              <div className="metric-row">
                <span className="text-purple-400 font-bold text-2xl">30%</span>
                <span>
                  of car buyers now use generative AI (ChatGPT, Gemini) to research vehicles
                  before visiting a dealership (Ekho, Feb 2026)
                </span>
              </div>
              <div className="metric-row">
                <span className="text-purple-400 font-bold text-2xl">5–6</span>
                <span>
                  brands dominate AI recommendations nationally — Tesla, Toyota, CarMax,
                  Edmunds, KBB — regardless of what local dealers are actually nearby
                  (Metricus, Apr 2026)
                </span>
              </div>
              <div className="metric-row">
                <span className="text-purple-400 font-bold text-2xl">62</span>
                <span>
                  brands tracked across AI platforms show the same pattern: AI dramatically
                  compresses the competitive field to a tiny handful of names (Arcalea AEO
                  Index, Mar 2026)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Our Methodology */}
        <section className="section-shell">
          <div className="glass-card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Did VizBiz Measure Dealership AI Visibility?</h2>
            <div className="space-y-3 text-white/80">
              <p>
                We designed 84 buyer-intent prompts across 11 categories — the same questions
                real car shoppers ask AI when looking for a dealership. Each prompt was run
                across three platforms:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Brave Search API — web search results</li>
                <li>Tavily — AI-optimized search with answer summaries</li>
                <li>GLM-5.1 — large language model responses</li>
              </ul>
              <p>11 prompt categories covering the full buyer journey:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {[
                  ["General Discovery", "10 prompts"],
                  ["Vehicle-Type Specific", "12 prompts"],
                  ["Service & After-Sales", "10 prompts"],
                  ["Ontario-Specific", "8 prompts"],
                  ["Competitor Comparison (Same Brand)", "6 prompts"],
                  ["Voice / Casual Search", "6 prompts"],
                  ["Review & Reputation Signals", "5 prompts"],
                  ["Negative / Objection", "5 prompts"],
                  ["Inventory & Marketplace", "6 prompts"],
                  ["Digital Experience", "4 prompts"],
                  ["Cross-OEM Competitor Visibility", "12 prompts"],
                ].map(([cat, count]) => (
                  <div key={cat} className="flex justify-between text-sm border-b border-white/10 pb-1">
                    <span>{cat}</span>
                    <span className="text-white/50">{count}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                Scoring: Cited (3 pts) = recommended by name. Mentioned (2 pts) = appears but
                not primary. Listed (1 pt) = in a list. Absent (0) = not visible. Maximum
                possible: 252 points per dealership.
              </p>
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="section-shell">
          <div className="glass-card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              Where Do Ontario Dealerships Show Up \u2014 and Where Don\u2019t They?
            </h2>
            <div className="space-y-3">
              {[
                { cat: "Competitor Comparison (Same Brand)", pct: 36, note: "Only visible when explicitly named by the shopper" },
                { cat: "Negative / Objection Queries", pct: 33, note: "Appears when people ask if the dealer is legitimate" },
                { cat: "Service & After-Sales", pct: 25, note: "Some visibility for brand-specific service queries" },
                { cat: "Inventory & Marketplace", pct: 17, note: "Weak — AI rarely connects dealers to specific vehicles" },
                { cat: "Vehicle-Type Specific", pct: 6, note: "Almost invisible when buyers search by vehicle type" },
                { cat: "Voice / Casual Search", pct: 6, note: "Zero presence in conversational queries" },
                { cat: "General Discovery", pct: 3, note: "Invisible to organic discovery searches" },
                { cat: "Cross-OEM Competitors", pct: 3, note: "Not winning cross-brand buyer queries" },
                { cat: "Ontario-Specific", pct: 0, note: "No visibility for province-specific buying questions" },
                { cat: "Review & Reputation", pct: 0, note: "Review signals not translating to AI visibility" },
                { cat: "Digital Experience", pct: 0, note: "No recognition of online retail capabilities" },
              ].map((row) => (
                <div key={row.cat} className="border-b border-white/10 pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{row.cat}</span>
                    <span className="text-purple-400 font-bold">{row.pct}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.max(row.pct, 1)}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/50">{row.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What This Means */}
        <section className="section-shell">
          <div className="glass-card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">What Does This Mean for Ontario Dealers?</h2>
            <div className="space-y-4 text-white/80">
              <p>
                The average Ontario dealership is <strong className="text-white">AI Invisible</strong>. They only appear in AI responses when a shopper already knows their name. They are completely missing from the highest-value moments: when a buyer asks AI for a recommendation and hasn&apos;t decided on a dealer yet.
              </p>
              <p>
                The three strongest categories — competitor comparison, negative/objection, and service — all share one trait: <strong className="text-white">the dealer&apos;s name is in the prompt</strong>. When the prompt doesn&apos;t name them, they vanish.
              </p>
              <p>
                This is the core opportunity. The fix isn&apos;t more ads or more reviews alone. It&apos;s building the structured, citable, machine-readable presence that AI engines need to recommend your dealership by name — even when the buyer doesn&apos;t ask for you specifically.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-shell">
          <div className="glass-card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-5">
                <h3 className="text-lg font-semibold">What is the average AI visibility score for Ontario car dealerships?</h3>
                <p className="mt-3 text-white/70">The average score across dealerships tested was 11 out of 100, based on VizBiz&apos;s 84-prompt battery run across Brave Search, Tavily, and GLM-5.1 in April 2026. This means the average Ontario dealership is effectively invisible in AI-generated answers when buyers don&apos;t already know their name.</p>
              </div>
              <div className="border-b border-white/10 pb-5">
                <h3 className="text-lg font-semibold">How many Ontario dealerships were tested in the report?</h3>
                <p className="mt-3 text-white/70">The April 2026 report tested dealerships across Ontario using 84 buyer-intent prompts across 11 categories, run on three platforms (Brave Search API, Tavily, GLM-5.1). Each dealership generated 252 data points. The full list of dealerships tested is available in the complete audit.</p>
              </div>
              <div className="border-b border-white/10 pb-5">
                <h3 className="text-lg font-semibold">Which AI platforms were used in the Ontario AI visibility study?</h3>
                <p className="mt-3 text-white/70">Three platforms: Brave Search API (web search results), Tavily (AI-optimized search with answer summaries), and GLM-5.1 (large language model responses). These represent the three main ways AI systems retrieve and synthesize dealership information.</p>
              </div>
              <div className="border-b border-white/10 pb-5">
                <h3 className="text-lg font-semibold">Why do Ontario dealerships score so low on AI visibility?</h3>
                <p className="mt-3 text-white/70">The data shows that dealerships only appear in AI responses when a shopper already knows their name. When prompts don&apos;t name them specifically — which is the highest-value scenario for new customer acquisition — they vanish. The core issue is lack of structured, citable, machine-readable presence that AI engines need to recommend a dealership by name.</p>
              </div>
              <div className="border-b border-white/10 pb-5">
                <h3 className="text-lg font-semibold">What categories had the highest and lowest AI visibility?</h3>
                <p className="mt-3 text-white/70">Highest: Competitor comparison (same brand) at 36% and negative/objection queries at 33%. Both involve the dealer&apos;s name in the prompt. Lowest: Ontario-specific queries, review/reputation signals, and digital experience all scored 0%. General discovery and cross-OEM competitor visibility scored just 3%.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">How can an Ontario dealership improve its AI visibility score?</h3>
                <p className="mt-3 text-white/70">The highest-impact actions are: (1) fix entity data consistency across all platforms, (2) build detailed content that answers real buyer questions, (3) earn specific, substantive customer reviews, and (4) build authority through third-party mentions. VizBiz&apos;s AI Visibility Audit provides a prioritized action plan based on actual prompt data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-shell">
          <div className="cta-shell max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              Find Out Your AI Visibility Score
            </h2>
            <p className="text-white/70 mb-6">
              Get a full 84-prompt audit for your dealership. See where you appear, where
              competitors appear instead, and what to fix first.
            </p>
            <a
              href="/intake/"
              className="inline-block bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-white/90 transition"
            >
              Get Your AI Visibility Audit
            </a>
          </div>
        </section>

        {/* Sources */}
        <section className="section-shell pb-20">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm uppercase tracking-widest text-white/40 mb-3">
              Sources & Citations
            </h3>
            <ul className="text-xs text-white/40 space-y-1">
              <li>Arcalea AEO Industry Index, March 2026 — arcalea.com</li>
              <li>Ekho 2026 AI Vehicle Research Study — ekho.com</li>
              <li>DealershipGuy: 84% of dealership websites invisible to AI search, Jan 2026</li>
              <li>Metricus: Automotive AI Visibility Data, April 2026</li>
              <li>VizBiz Primary Research: 84-prompt battery across Brave, Tavily, GLM-5.1, April 2026</li>
            </ul>
            <p className="mt-4 text-xs text-white/30"><time dateTime="2026-04-12">Last updated: April 12, 2026</time></p>
          </div>
        </section>
      </main>
    </>
  );
}
