import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "What Is GEO (Generative Engine Optimization) for Car Dealerships | VizBiz",
  description:
    "GEO is the practice of optimizing your dealership's presence so AI platforms like ChatGPT, Google AI Overviews, and Perplexity recommend you. Learn what GEO is, how it differs from SEO, and how to get started.",
  alternates: {
    canonical: "https://vizbiz.ai/what-is-geo-generative-engine-optimization-dealerships",
  },
};

const geoExplained = [
  {
    title: "Entity clarity",
    body: "AI systems need to understand exactly what your business is, where it operates, and what it offers. Consistent name, address, phone, hours, and services across every platform — your website, Google Business Profile, directories, social media — creates a clear entity that AI can reference with confidence.",
  },
  {
    title: "Content depth",
    body: "Thin pages with generic copy don't give AI systems enough substance. Detailed service descriptions, model comparisons, financing guides, trade-in explainers, and genuine FAQ sections give AI platforms material to cite when they recommend your dealership.",
  },
  {
    title: "Review richness",
    body: "Not just star ratings — the actual content of reviews matters. When customers describe specific experiences, vehicles, and interactions, those details become signals that AI weighs when deciding which dealership to recommend for a given buyer need.",
  },
  {
    title: "Authority and mentions",
    body: "References to your dealership across local publications, industry sites, automotive forums, and community platforms build a web of credibility. The more your dealership appears in trusted, independent sources, the more confidently AI can recommend you.",
  },
];

const whyDealersNeed = [
  {
    title: "AI answers are replacing the traditional search click",
    body: "When a buyer asks ChatGPT for a dealership recommendation, they get an answer immediately — no scrolling through results, no clicking through ads. If your dealership isn't in that answer, you're invisible to that buyer. The old model of \"rank on page one\" is giving way to \"be in the AI answer.\" VizBiz data shows 84% of dealerships score below 60 on AI visibility, meaning most stores are effectively invisible to this channel.",
  },
  {
    title: "Competitors with stronger signals are being recommended instead",
    body: "Right now, in your market, other dealerships are appearing in AI answers when buyers ask where to buy a car. They may not be better than you — they may just have clearer, more consistent signals. VizBiz's analysis found that only 5 to 6 dealerships appear per AI query, creating a narrow winner-take-most dynamic. GEO closes that gap.",
  },
  {
    title: "Early movers build compounding advantages",
    body: "AI systems learn and update continuously. Every piece of content you publish, every detailed review you earn, and every consistency fix you make contributes to a growing body of signals. Dealerships that start now are building an asset that gets stronger over time.",
  },
  {
    title: "Traditional SEO alone isn't enough anymore",
    body: "SEO gets you into Google's link-based results. GEO gets you into the AI-generated answers that an increasing share of buyers see first. You need both. According to Metricus (April 2026), AI-driven automotive search traffic grew 527% year-over-year — ignoring GEO means ignoring the fastest-growing segment of car-buying search.",
  },
];

const geoVsSeo = [
  { dimension: "Goal", geo: "Appear in AI-generated answers and recommendations", seo: "Rank in traditional search engine results pages", data: "AI traffic up 527% YoY (Metricus, Apr 2026)" },
  { dimension: "Key signals", geo: "Entity clarity, review depth, content substance, authority mentions", seo: "Backlinks, keyword optimization, page speed, technical SEO", data: "Princeton GEO study: source credibility is #1 citation predictor" },
  { dimension: "How success looks", geo: "Your dealership is named in ChatGPT, Perplexity, or AI Overviews responses", seo: "Your pages rank on page one of Google for target keywords", data: "Only 5–6 dealers per query get named (VizBiz analysis)" },
  { dimension: "Content approach", geo: "Answer real buyer questions with depth and specificity", seo: "Optimize pages for target keywords and search intent", data: "84% of dealers lack sufficient content depth" },
  { dimension: "Reviews", geo: "Detailed, specific reviews with story and substance", seo: "Star ratings and review count for local pack positioning", data: "Detailed reviews cited 2.3x more often by AI (Ekho, Feb 2026)" },
  { dimension: "Technical focus", geo: "Consistent structured data, clear entity information, schema markup", seo: "Site speed, Core Web Vitals, crawlability, indexation", data: "Entity inconsistency reduces AI confidence by ~40%" },
  { dimension: "Measurement", geo: "Query AI platforms directly, track mentions over time", seo: "Rank tracking tools, Google Search Console, analytics", data: "VizBiz automates cross-platform AI visibility scoring" },
];

const gettingStarted = [
  {
    title: "Audit your current AI visibility",
    body: "Before investing effort, find out where you stand. Run the queries your buyers would use — \"best [make] dealer in [city]\", \"where to buy a used car near [area]\" — across ChatGPT, Google AI Overviews, and Perplexity. Document whether you appear, how you're described, and which competitors show up. A VizBiz AI Visibility Snapshot automates this across dozens of queries and platforms.",
  },
  {
    title: "Fix your entity data",
    body: "This is the highest-ROI GEO action. Audit every place your dealership appears online — your site, Google Business Profile, Yelp, Apple Maps, Facebook, Bing Places, industry directories — and make sure every field matches exactly. Same name format, same address, same phone, same hours. Inconsistencies erode AI confidence.",
  },
  {
    title: "Build content that answers buyer questions",
    body: "Identify the top 20 questions your customers ask during the buying process. Create dedicated pages or FAQ entries for each one. Not marketing copy — genuine, helpful answers. \"How does certified pre-owned work?\", \"What credit score do I need for a car loan?\", \"What's the difference between leasing and financing?\" This content serves buyers directly and gives AI systems substance to reference.",
  },
  {
    title: "Upgrade your review strategy",
    body: "Shift from \"get more reviews\" to \"get better reviews.\" A review that says \"Mike at Smith Honda walked me through every option on the Civic Sport without any pressure — I got 3.9% financing and they beat my trade-in offer by $1,200\" is worth more for GEO than ten generic five-star ratings. Make it easy for customers to leave specific feedback.",
  },
  {
    title: "Track and iterate monthly",
    body: "GEO isn't one-and-done. AI models update, competitors improve, and new platforms emerge. Set up a monthly cadence to re-check your AI visibility, review your scores, and adjust your efforts. VizBiz handles this tracking automatically and surfaces the changes that matter.",
  },
];

const faqItems = [
  {
    question: "What does GEO stand for?",
    answer:
      "GEO stands for Generative Engine Optimization. It's the practice of optimizing your business's online presence so that AI-powered platforms — ChatGPT, Google AI Overviews, Perplexity, and others — surface and recommend your dealership in their generated answers. The GEO market is projected to grow from $850M to $7.3B by 2031.",
  },
  {
    question: "Is GEO replacing SEO for car dealerships?",
    answer:
      "No — it's additive. Traditional SEO still matters for ranking in Google's link-based results. GEO addresses a different and growing channel: AI-generated answers. Most dealerships need both. The good news is that many GEO actions (better content, consistent data, detailed reviews) also improve your traditional SEO.",
  },
  {
    question: "How is GEO different from local SEO?",
    answer:
      "Local SEO focuses on ranking in Google's local pack and map results. GEO focuses on appearing in AI-generated answers across multiple platforms. There's overlap — consistent business data helps both — but the measurement, signals, and strategies differ. Local SEO is Google-centric; GEO spans ChatGPT, Perplexity, Google AI Overviews, and any platform where AI generates recommendations.",
  },
  {
    question: "How do I measure GEO performance?",
    answer:
      "The most direct method is querying AI platforms with buyer-intent questions and tracking whether your dealership appears. VizBiz automates this process across multiple platforms, scores your visibility, tracks changes over time, and benchmarks you against local competitors.",
  },
  {
    question: "How long does GEO take to show results?",
    answer:
      "Entity data fixes can reflect in AI answers within a few weeks. Content building and review strategy changes typically take 60–90 days to produce measurable shifts in AI visibility. The key is consistent effort and regular tracking.",
  },
  {
    question: "Do I need a GEO tool, or can I do this manually?",
    answer:
      "You can start manually by querying AI platforms and auditing your listings. But as you scale — tracking across multiple platforms, monitoring competitors, measuring changes over time — the manual approach becomes unsustainable. VizBiz was built specifically to automate GEO measurement and guidance for car dealerships.",
  },
];

export default function WhatIsGEODealershipsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">GEO explained</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            What Is GEO (Generative Engine Optimization) for Car Dealerships?
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              GEO — Generative Engine Optimization — is the practice of shaping your dealership's online presence so that AI platforms like ChatGPT, Google AI Overviews, and Perplexity surface your store in their answers and recommendations. The GEO market is currently valued at $850M and projected to reach $7.3B by 2031, reflecting the massive shift toward AI-driven search.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If SEO is about ranking in Google's blue links, GEO is about being named when AI generates an answer. Car buyers are shifting from typing keywords into Google to asking conversational questions in AI chatbots — and <strong className="text-white">AI-driven automotive search traffic grew 527% year-over-year</strong> (Metricus, April 2026). GEO is how you make sure your dealership is part of those conversations.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For a practical guide to improving your ChatGPT presence specifically, see <Link href="/how-to-show-up-in-chatgpt-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">how to show up in ChatGPT for car dealerships</Link>. For the broader picture, visit our <Link href="/ai-visibility-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">AI visibility overview</Link>.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--neon-cyan)]">Key Takeaways</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>GEO = optimizing your dealership so AI platforms like ChatGPT and Perplexity <strong className="text-white">recommend you by name</strong></span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Four pillars: <strong className="text-white">entity clarity, content depth, review richness, authority mentions</strong></span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>AI-driven auto search traffic grew <strong className="text-white">527% year-over-year</strong> (Metricus, April 2026)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>GEO is complementary to SEO — you need both to capture the full buyer journey</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Start with entity data fixes (highest ROI), then build content and review depth</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Does GEO Actually Involve for Dealerships?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              GEO isn't a single tactic — it's a set of practices that work together to make your dealership clearly visible and credible to AI systems. The four core pillars:
            </p>
            <div className="mt-6 space-y-5">
              {geoExplained.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why Do Car Dealerships Need GEO Right Now?
            </h2>
            <div className="mt-6 space-y-5">
              {whyDealersNeed.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What's the Difference Between GEO and SEO?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Both are about being found. But the signals, platforms, and strategies diverge in important ways:
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 font-semibold text-[var(--text-secondary)]">Dimension</th>
                    <th className="py-3 pr-4 font-semibold text-[var(--neon-cyan)]">GEO</th>
                    <th className="py-3 pr-4 font-semibold text-[var(--text-secondary)]">SEO</th>
                    <th className="py-3 font-semibold text-[var(--text-secondary)]">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {geoVsSeo.map((row) => (
                    <tr key={row.dimension} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-medium">{row.dimension}</td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">{row.geo}</td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">{row.seo}</td>
                      <td className="py-3 text-[var(--text-secondary)] italic">{row.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The overlap is real — strong content, consistent data, and good reviews help both. But if you're only doing SEO, you're invisible in the fastest-growing search channel.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How Do You Get Started with GEO for Your Dealership?
            </h2>
            <div className="mt-6 space-y-5">
              {gettingStarted.map((item, index) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How Does VizBiz Power Your GEO Strategy?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              VizBiz is purpose-built for dealership GEO. Here's what it delivers:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Automated AI visibility measurement across ChatGPT, Google AI Overviews, Perplexity, and more</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Competitive benchmarking — see how you compare to local competitors on every signal</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Scoring across entity clarity, review depth, content quality, and authority signals</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Prioritized action plans — your team gets a clear to-do list ranked by impact</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Ongoing tracking so you can measure progress and prove ROI</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Start with a free <Link href="/intake" className="text-[var(--neon-cyan)] hover:text-white">AI Visibility Snapshot</Link> or dive deeper with the <Link href="/ai-visibility-audit-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">full audit</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Free snapshot</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              See Your Dealership's GEO Score
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Get a free AI Visibility Snapshot showing how your dealership performs across ChatGPT, Google AI Overviews, and Perplexity — with a clear action plan for improvement.
            </p>
            <div className="mt-8">
              <Link href="/intake" className="premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold">
                Get My AI Visibility Snapshot
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="display-font text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.8rem]">
            FAQ
          </h2>
          <div className="mt-8 space-y-4">
            {faqItems.map((item) => (
              <div key={item.question} className="glass-card rounded-[1.75rem] p-6 sm:p-7">
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <p className="mt-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
