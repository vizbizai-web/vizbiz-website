import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Why Your Dealership Isn't Showing Up in AI Search Results | VizBiz",
  description:
    "If competitors appear in ChatGPT and AI search but your dealership doesn't, there are specific reasons. Learn the diagnostic signals and how to fix them.",
  alternates: {
    canonical: "https://vizbiz.ai/why-dealership-not-showing-up-in-ai-search",
  },
};

const commonReasons = [
  {
    title: "Inconsistent business data across the web",
    body: "Entity consistency means your dealership's name, address, phone number, hours, and services match exactly across every online platform. Your dealership name is \"Smith Auto Group\" on your website but \"Smith Automotive\" on Yelp. Your hours are wrong on Facebook. Your phone number is outdated on Bing Places. Individually, each inconsistency seems minor. Together, they tell AI systems: this entity is unclear. When an AI can't confidently identify your business, it won't recommend it. 84% of dealerships have at least one major inconsistency affecting AI visibility (VizBiz data).",
    fix: "Audit every platform where your dealership appears. Standardize name, address, phone, hours, and service descriptions so they match exactly. This single fix often produces the fastest visibility improvement.",
  },
  {
    title: "Thin or generic website content",
    body: "Content depth is the measure of how substantively your website answers the questions car buyers ask. If your service pages are three sentences, your FAQ section doesn't exist, and your inventory pages are the only thing with any depth, AI systems have very little substance to work with. They can't confidently describe what makes your dealership a good recommendation if you haven't told them. VizBiz scoring found the average dealership website scores just 11 out of 100 on content depth.",
    fix: "Build out pages that answer real buyer questions: financing guides, trade-in process explainers, certified pre-owned breakdowns, service department capabilities, model comparisons. Aim for depth and specificity, not marketing copy.",
  },
  {
    title: "Reviews that lack substance",
    body: "Review richness measures the specificity and detail in customer reviews — not just star ratings. Two hundred reviews averaging 4.5 stars sounds strong — but if most say \"Great experience!\" or \"Would recommend,\" there's not much for an AI to work with. Compare that to a competitor with 120 reviews where customers describe specific interactions, name their salesperson, mention the vehicle they bought, and detail the financing process. Detailed reviews are cited 2.3x more often by AI systems (Ekho, February 2026).",
    fix: "Shift your review strategy from volume to specificity. Ask customers to mention what they bought, who helped them, and what stood out. A few detailed reviews per month will outperform a flood of generic ones for AI visibility.",
  },
  {
    title: "No presence beyond your website and Google",
    body: "Authority mentions are references to your dealership on third-party websites — local news, industry directories, community sites, and forums. AI systems draw from a wide range of sources. If your dealership only exists on your website and Google Business Profile, you're a thin entity in the AI's view of the world. Competitors who appear in local news, sponsor community events that get covered online, participate in industry associations, or get mentioned in automotive forums have a richer signal profile.",
    fix: "Make sure your community involvement, awards, certifications, and sponsorships are documented online. Claim and fill out profiles on industry directories. Engage with platforms where local buyers discuss car shopping.",
  },
  {
    title: "Competitors are simply out-signaling you",
    body: "VizBiz's analysis of 84 buyer-intent prompts found that only 5 to 6 dealerships appear per AI query. Sometimes you're doing everything right — but a competitor is doing it better or has been doing it longer. They have more detailed reviews, deeper content, stronger community mentions, and perfectly consistent data. In a market where AI recommends a narrow set of dealerships, the ones with the clearest, most consistent, and most substantive signals win.",
    fix: "Benchmark against the specific competitors showing up in AI answers. What do their reviews look like? How detailed is their website content? How consistent is their data? Find the gaps and close them. VizBiz's competitive benchmarking surfaces exactly these differences.",
  },
];

const diagnosticSteps = [
  {
    title: "Query AI platforms directly",
    body: "Open ChatGPT, Google AI Overviews, and Perplexity. Ask them the questions your buyers would: \"Best [your make] dealership in [your city]\", \"Where to buy a used car near [your area]\", \"Which dealer has good financing?\" Note whether you appear, how you're described, and which competitors show up instead.",
  },
  {
    title: "Check your entity consistency",
    body: "Search for your dealership on Google, Yelp, Facebook, Apple Maps, Bing Places, and your top industry directories. Compare name, address, phone, hours, and services across all of them. Mark every inconsistency.",
  },
  {
    title: "Audit your review content",
    body: "Read your last 50 reviews. How many mention specific details — a person, a vehicle, a process? How many are generic? Compare that to the last 50 reviews of the competitor that keeps showing up in AI answers.",
  },
  {
    title: "Evaluate your content depth",
    body: "Does your site answer the questions buyers ask AI? Financing options, trade-in process, certified pre-owned programs, service department capabilities, warranty coverage. If the answer is \"our site doesn't really cover that,\" you've found a major gap.",
  },
];

const faqItems = [
  {
    question: "Why does my competitor show up in ChatGPT but I don't?",
    answer:
      "Usually it comes down to signal clarity. Your competitor may have more consistent business data across platforms, more detailed reviews, deeper website content, or stronger mentions in third-party sources. VizBiz's analysis found that only 5 to 6 dealerships appear per AI query, so even small signal advantages matter. The fix is identifying which specific signals are weak and improving them. A VizBiz audit surfaces these gaps.",
  },
  {
    question: "I have good Google reviews — why doesn't AI recommend my dealership?",
    answer:
      "Star ratings and review count matter for Google's local pack, but AI systems like ChatGPT evaluate the substance of what's written in reviews, not just the numbers. A dealership with fewer but more detailed reviews may outperform one with more generic reviews (Ekho, February 2026). AI also considers signals beyond Google — your website content, directory consistency, and third-party mentions all factor in.",
  },
  {
    question: "How quickly can I fix my AI visibility?",
    answer:
      "Entity data fixes can show results within weeks. Content improvements and review strategy changes typically take 60–90 days. The important thing is to start — every month you wait, competitors with stronger signals are being recommended to your potential customers.",
  },
  {
    question: "Is AI visibility something my SEO agency should handle?",
    answer:
      "Traditional SEO agencies focus on Google search rankings. AI visibility requires a different set of signals and measurement approaches. Some SEO fundamentals overlap (content quality, consistent data), but measuring AI visibility requires querying AI platforms directly — something most SEO tools don't do. VizBiz is specifically built for this.",
  },
  {
    question: "Does my website need to be rebuilt?",
    answer:
      "Almost never. Most dealerships have a reasonable website. The issue is usually content depth — adding detailed pages that answer buyer questions — and consistency of business data across the web. These are incremental improvements, not rebuilds.",
  },
];

export default function WhyDealershipNotShowingUpInAISearchPage() {
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Why Your Dealership Isn't Showing Up in AI Search Results",
    "description": "If competitors appear in ChatGPT and AI search but your dealership doesn't, there are specific reasons. Learn the diagnostic signals and how to fix them.",
    "datePublished": "2026-04-01",
    "dateModified": "2026-04-12",
    "author": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "publisher": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "mainEntityOfPage": "https://vizbiz.ai/why-dealership-not-showing-up-in-ai-search",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">AI visibility diagnostic</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            Why Your Dealership Isn't Showing Up in AI Search Results
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              You asked ChatGPT for a dealership recommendation in your own market — and your competitor's name came up instead of yours. It's a frustrating moment, and it's happening to dealerships across the country. <strong className="text-white">84% of dealerships score below 60 on AI visibility</strong>, with the average score sitting at just 11 out of 100 (VizBiz data).
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The good news: there are specific, diagnosable reasons why. And every one of them is fixable. Nearly <strong className="text-white">30% of car buyers now use AI during their purchase research</strong> (DealershipGuy, January 2026), and AI-sourced traffic converts at <strong className="text-white">4.4x the rate of organic traffic</strong> (Ekho, February 2026).
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This guide walks through the most common causes and what to do about each one. For the broader framework, see <Link href="/ai-visibility-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">AI visibility for car dealerships</Link>. To understand how AI selects dealerships in the first place, see <Link href="/chatgpt-car-dealership-recommendations/" className="text-[var(--neon-cyan)] hover:text-white">how ChatGPT recommends dealerships</Link>.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--neon-cyan)]">Key Takeaways</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Average AI visibility score: <strong className="text-white">11 out of 100</strong> (VizBiz data)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">84% of dealerships</strong> have at least one major entity inconsistency</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Detailed reviews are cited <strong className="text-white">2.3x more often</strong> by AI systems than generic ones (Ekho, 2026)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Only <strong className="text-white">5–6 dealerships</strong> appear per AI query — narrow winner-take-most dynamic</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>All 5 common causes are fixable; entity fixes produce fastest results</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Are the 5 Most Common Reasons Dealerships Are Invisible to AI?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              After analyzing 84 buyer-intent prompts and auditing dozens of dealerships, these are the patterns that show up again and again:
            </p>
            <div className="mt-6 space-y-5">
              {commonReasons.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                  <div className="mt-4 rounded-xl bg-[var(--neon-cyan)]/5 p-4 border border-[var(--neon-cyan)]/10">
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--neon-cyan)]">How to fix it: </span>
                      {item.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How Do You Diagnose Your Dealership's AI Visibility in 4 Steps?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Before changing anything, run this quick self-assessment:
            </p>
            <div className="mt-6 space-y-5">
              {diagnosticSteps.map((item, index) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If you want to skip the manual work, a <Link href="/intake/" className="text-[var(--neon-cyan)] hover:text-white">free VizBiz AI Visibility Snapshot</Link> runs this diagnosis automatically across dozens of queries and platforms.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Does VizBiz Do Differently for AI Visibility?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              VizBiz was built specifically to solve this problem. It doesn't guess — it measures:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Runs real buyer-intent queries across ChatGPT, Google AI Overviews, Perplexity, and other AI platforms</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Identifies exactly where your dealership appears and where it doesn't</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Benchmarks you against the competitors AI is recommending instead</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Scores your signals — entity consistency, review depth, content quality, authority mentions</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Delivers a ranked action plan so your team tackles the highest-impact fixes first</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Learn more about the <Link href="/ai-visibility-audit-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">full AI Visibility Audit</Link> or see a <Link href="/sample-ai-visibility-report-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">sample report</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Free diagnosis</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Find Out Why Competitors Show Up and You Don't
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Get a free AI Visibility Snapshot that shows exactly where your dealership is missing — and the specific steps to fix it.
            </p>
            <div className="mt-8">
              <Link href="/intake/" className="premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold">
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
