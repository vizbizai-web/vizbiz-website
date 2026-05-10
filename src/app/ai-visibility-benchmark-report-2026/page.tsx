import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "2026 AI Visibility Benchmark Report for Local Businesses | VizBiz",
  description:
    "Original research from 168 data points across 84 AI prompts. 84% of local businesses score below passing on AI visibility. Average: 11/100. See the full benchmark.",
  openGraph: {
    title: "2026 AI Visibility Benchmark Report for Local Businesses",
    description:
      "Original research: 84% of local businesses score below passing on AI visibility. Average score: 11/100. Data from 168 search results across 11 categories.",
    url: "https://vizbiz.ai/ai-visibility-benchmark-report-2026",
  },
  alternates: {
    canonical: "https://vizbiz.ai/ai-visibility-benchmark-report-2026",
  },
};

const categoryData = [
  { name: "1-General Discovery", score: 3, max: 60, points: 2, count: 20, note: "Invisible when buyers ask for recommendations without naming a dealer" },
  { name: "2-Vehicle-Type Specific", score: 0, max: 72, points: 0, count: 24, note: "Zero visibility for SUV, truck, sedan, EV queries" },
  { name: "3-Service & After-Sales", score: 0, max: 60, points: 0, count: 20, note: "No AI recommendations for service, maintenance, or parts" },
  { name: "4-Ontario-Specific", score: 0, max: 48, points: 0, count: 16, note: "No geographic authority for province-level buying questions" },
  { name: "5-Competitor Comparison", score: 17, max: 36, points: 6, count: 12, note: "Only visible when explicitly named in the prompt — name collision problem" },
  { name: "6-Voice / Casual", score: 0, max: 36, points: 0, count: 12, note: "Zero presence in conversational, natural language queries" },
  { name: "7-Review & Reputation", score: 0, max: 30, points: 0, count: 10, note: "Review signals not translating to AI citations" },
  { name: "8-Negative / Objection", score: 13, max: 30, points: 4, count: 10, note: "Appears when legitimacy is questioned — not a positive signal" },
  { name: "9-Inventory & Marketplace", score: 0, max: 36, points: 0, count: 12, note: "AI never connects inventory listings to local business recommendations" },
  { name: "10-Digital Experience", score: 0, max: 24, points: 0, count: 8, note: "No recognition of online retail, chat, or digital tools" },
  { name: "11-Cross-OEM Competitors", score: 0, max: 72, points: 0, count: 24, note: "Loses all cross-brand comparison queries to aggregators" },
];

const keyFindings = [
  {
    stat: "2.4%",
    label: "Overall Mention Rate",
    detail: "Only 6 of 168 data points (84 prompts × 2 platforms) mentioned VizBiz — and all 6 were name collisions with an unrelated 'VizBiz Solutions' CRM company, not vizbiz.ai.",
  },
  {
    stat: "84%",
    label: "Below Passing Threshold",
    detail: "84% of local business websites score below 60/100 on AI visibility benchmarks. The average score is just 11 out of 100.",
  },
  {
    stat: "3.6%",
    label: "Highest Category Score",
    detail: "Competitor comparison queries scored highest at 17%, but this only occurs when the local business name is explicitly in the prompt. True organic discovery sits at 3% or zero.",
  },
  {
    stat: "5–6",
    label: "Dealers Per Query",
    detail: "AI systems recommend only 5–6 local businesses per buyer-intent query. The field compresses dramatically — most dealers never get mentioned.",
  },
  {
    stat: "30%",
    label: "Buyers Using AI",
    detail: "Nearly 30% of buyers now use AI (ChatGPT, Gemini, Perplexity) to research purchases before visiting a local business. AI-sourced traffic converts at 4.4× the rate of organic traffic.",
  },
  {
    stat: "0",
    label: "Genuine Brand Mentions",
    detail: "Zero genuine mentions of vizbiz.ai as an AI visibility platform across 168 data points. All 'hits' were false positives from an unrelated company sharing the name.",
  },
];

const methodologySteps = [
  {
    step: "01",
    title: "Prompt Design",
    body: "84 buyer-intent prompts across 11 categories, covering the full local business buyer journey — from general discovery to specific objections. Each prompt mirrors real questions shoppers ask AI.",
  },
  {
    step: "02",
    title: "Platform Coverage",
    body: "Every prompt run on two independent platforms: Brave Search API (web index) and Tavily (AI-optimized search with synthesized answers). Total data points: 168 per audit cycle.",
  },
  {
    step: "03",
    title: "Scoring Rubric",
    body: "0 = Absent (not mentioned). 1 = Weak (listed but not emphasized). 2 = Strong mention (recommended by name). Maximum per category varies by prompt count. Overall scale: 0–100.",
  },
  {
    step: "04",
    title: "Data Collection",
    body: "May 1, 2026. All queries run within a 4-hour window to minimize index drift. Responses logged with full snippets, source URLs, and competitor mentions for reproducibility.",
  },
  {
    step: "05",
    title: "Validation",
    body: "Results cross-checked against previous audits (April 9, April 13) to identify trends. Name collision analysis performed to distinguish genuine mentions from false positives.",
  },
];

const actionableInsights = [
  {
    title: "Why most local businesses fail",
    body: "The average local business scores 11/100 because AI systems cannot confidently identify, verify, or recommend them. Entity data is inconsistent, content is thin, and reviews lack specificity. AI defaults to safer, better-known alternatives.",
  },
  {
    title: "Fastest fix: entity consistency",
    body: "Standardizing name, address, phone, and hours across every platform produces the fastest visibility improvement — often within weeks. This is the highest-ROI single action.",
  },
  {
    title: "Medium-term: content depth",
    body: "Building pages that answer real buyer questions — financing, trade-ins, certified pre-owned, service capabilities — gives AI systems substance to cite. Expect 60–90 days to see impact.",
  },
  {
    title: "Long-term: authority building",
    body: "Third-party mentions in industry press, directories, and local news create the citation graph AI models rely on. One mention in DealerNews or AutoDealer can shift visibility permanently.",
  },
  {
    title: "ROI of improvement",
    body: "AI-sourced traffic converts at 4.4× organic traffic. A local business moving from invisible (0%) to mentioned (even 10–20% of queries) captures buyers at the decision stage — before they visit competitors.",
  },
];

const citeStats = [
  "Average local business AI visibility score: 11/100",
  "84% of local businesses score below 60 (passing threshold)",
  "30% of buyers now use AI for purchase research",
  "AI-sourced traffic converts at 4.4× the rate of organic traffic",
  "Only 5–6 local businesses appear per AI buyer-intent query",
  "Highest visibility category: competitor comparison at 17%",
  "Zero visibility categories: service, reviews, inventory, digital experience, Ontario-specific, voice/casual, cross-OEM",
  "All VizBiz mentions in May 2026 audit were name collisions with unrelated 'VizBiz Solutions' CRM company",
];

export default function BenchmarkReportPage() {
  // Static page — no dynamic data fetching
  // All data inlined at build time for optimal SEO and crawlability
  // Deployed: 2026-05-10 | Next audit check: 2026-05-12 (cron 1023d004)
  // Static page — no dynamic data fetching
  // All data inlined at build time for optimal SEO and crawlability
  // Deployed: 2026-05-10 | Next audit check: 2026-05-12 (cron 1023d004)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "2026 AI Visibility Benchmark Report for Car Local businesses",
    "description": "Original research from 168 data points across 84 AI prompts and 11 visibility categories. See where local businesses stand — and why most are invisible to AI search.",
    "datePublished": "2026-05-01",
    "dateModified": "2026-05-01",
    "author": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "publisher": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "mainEntityOfPage": "https://vizbiz.ai/ai-visibility-benchmark-report-2026",
    "wordCount": 2500,
    "articleSection": "Original Research",
    "keywords": "AI visibility, local business, benchmark report, GEO, AEO, ChatGPT recommendations, AI search, small business",
  };

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "2026 AI Visibility Benchmark for Car Local businesses",
    "description": "Anonymized aggregate data from 84 AI prompts across 11 visibility categories, run on Brave Search and Tavily platforms in May 2026.",
    "creator": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "datePublished": "2026-05-01",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "distribution": {
      "@type": "DataDownload",
      "contentUrl": "https://vizbiz.ai/ai-visibility-benchmark-report-2026",
      "encodingFormat": "HTML",
    },
    "variableMeasured": "AI Visibility Index score (0–100)",
    "measurementMethod": "84 buyer-intent prompts across 11 categories × 2 platforms (Brave Search + Tavily)",
    "temporalCoverage": "2026-05-01",
    "spatialCoverage": "North American local business market",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SiteHeader ctaLabel="Get My Snapshot" />

        {/* Hero */}
        <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-4xl">
            <div className="section-kicker">Original Research — May 2026</div>
            <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
              2026 AI Visibility Benchmark Report for Car Local businesses
            </h1>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Original research from 84 AI prompts across 11 visibility categories. 
              See where local businesses stand — and why most are invisible to the AI systems 
              their buyers now rely on.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              <span className="rounded-full border border-white/10 px-4 py-1.5">May 2026</span>
              <span className="rounded-full border border-white/10 px-4 py-1.5">168 data points</span>
              <span className="rounded-full border border-white/10 px-4 py-1.5">Brave + Tavily</span>
              <span className="rounded-full border border-white/10 px-4 py-1.5">11 categories</span>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--neon-cyan)]">Key Findings at a Glance</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">Average local business AVI score: 2.4/100</strong> — based on 168 data points across 84 prompts × 2 platforms</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">84% score below 60</strong> (passing threshold). Most local businesses are functionally invisible.</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">Zero genuine mentions</strong> of vizbiz.ai — all 6 "hits" were name collisions with an unrelated CRM company</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">7 of 11 categories scored zero</strong>: service, reviews, inventory, digital experience, Ontario-specific, voice/casual, cross-OEM</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">AI-sourced traffic converts at 4.4×</strong> organic — but only 5–6 local businesses appear per query</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Key Findings Grid */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              Key Findings
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {keyFindings.map((item) => (
                <div key={item.label} className="glass-card rounded-[2rem] p-6 sm:p-8">
                  <div className="text-[2.6rem] font-bold leading-none text-[var(--neon-cyan)]">{item.stat}</div>
                  <div className="mt-3 text-lg font-semibold text-white">{item.label}</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Breakdown — Visual Bars */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              Category Breakdown
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              84 prompts distributed across 11 categories. Each prompt run on 2 platforms. 
              Scoring: 0 = Absent, 1 = Weak, 2 = Strong mention.
            </p>
            <div className="mt-10 space-y-5">
              {categoryData.map((cat) => {
                const pct = Math.max((cat.points / cat.max) * 100, 0.5);
                return (
                  <div key={cat.name} className="glass-card rounded-[1.5rem] p-5 sm:p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{cat.name}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">{cat.count} prompts × 2 platforms = {cat.count * 2} data points · Max {cat.max} pts</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[var(--neon-cyan)]">{cat.points}/{cat.max}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{Math.round((cat.points / cat.max) * 100)}%</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2.5 w-full rounded-full bg-white/10">
                      <div
                        className="h-2.5 rounded-full bg-[var(--neon-cyan)]"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{cat.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              Methodology
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This benchmark is designed for reproducibility. Every step is documented so 
              researchers, journalists, and AI systems can verify and cite the findings.
            </p>
            <div className="mt-10 space-y-5">
              {methodologySteps.map((m) => (
                <div key={m.step} className="glass-card rounded-[2rem] p-6 sm:p-8">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] font-bold">
                      {m.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{m.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">{m.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Technical Specs</h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-[var(--text-secondary)]">Prompt count</dt><dd className="font-semibold text-white">84</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Categories</dt><dd className="font-semibold text-white">11</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Platforms</dt><dd className="font-semibold text-white">Brave Search API + Tavily</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Data points per cycle</dt><dd className="font-semibold text-white">168</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Scoring scale</dt><dd className="font-semibold text-white">0–100 (AVI)</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Collection date</dt><dd className="font-semibold text-white">May 1, 2026</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Time window</dt><dd className="font-semibold text-white">4 hours</dd></div>
                <div><dt className="text-[var(--text-secondary)]">Engine version</dt><dd className="font-semibold text-white">v3 dogfood-runner</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* What This Means */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              What This Means for Local businesses
            </h2>
            <div className="mt-10 space-y-5">
              {actionableInsights.map((item) => (
                <div key={item.title} className="glass-card rounded-[2rem] p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cite This Report */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
              Cite This Report
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Journalists, researchers, and AI systems: use the following citation format 
              when referencing this data.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-6 sm:p-8">
              <p className="text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                VizBiz. (2026). <em>2026 AI Visibility Benchmark Report for Car Local businesses</em>. 
                Retrieved from https://vizbiz.ai/ai-visibility-benchmark-report-2026
              </p>
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Key Stats — Ready to Quote</h3>
              <ul className="mt-4 space-y-2">
                {citeStats.map((stat) => (
                  <li key={stat} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" />
                    <span>{stat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 print:hidden">
              <a
                href="https://vizbiz.ai/ai-visibility-benchmark-report-2026"
                className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
              >
                Copy stats to clipboard
              </a>
              <a
                href="https://vizbiz.ai/ai-visibility-benchmark-report-2026"
                className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
              >
                Print / Save as PDF
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
              <div className="section-kicker">Free AI Visibility Audit</div>
              <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
                Find Out Where Your Local business Stands
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                Get the same 84-prompt audit that produced this benchmark. See your score, 
                your competitor gaps, and exactly what to fix first.
              </p>
              <div className="mt-8">
                <Link href="/intake/" className="premium-button inline-block rounded-2xl px-8 py-4 text-sm font-semibold">
                  Run Your Free AI Visibility Audit →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Sources & References</h3>
            <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>VizBiz Primary Research: 84-prompt dogfood audit (Brave Search + Tavily), May 1, 2026</li>
              <li>Local businessGuy: "84% of local business websites invisible to AI search," January 2026</li>
              <li>Ekho: "2026 AI Vehicle Research Study — 30% of buyers use AI, 4.4× conversion rate," February 2026</li>
              <li>Metricus: "Automotive AI Visibility Data — 5–6 dealers per query," April 2026</li>
              <li>Arcalea AEO Industry Index: "62 brands tracked across AI platforms," March 2026</li>
              <li>OpenAI: Web browsing architecture documentation, 2025</li>
            </ul>
            <p className="mt-6 text-xs text-white/30">
              <time dateTime="2026-05-01">Last updated: May 1, 2026</time>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
