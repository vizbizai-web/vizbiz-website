import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "VizBiz vs BrightLocal — AI Visibility vs Local SEO Comparison | VizBiz",
  description:
    "Honest comparison of VizBiz and BrightLocal for car dealerships. See where each platform excels — AI visibility intelligence vs traditional local SEO management.",
  alternates: {
    canonical: "https://vizbiz.ai/compare/vizbiz-vs-brightlocal",
  },
};

const comparisonRows = [
  { dimension: "Primary focus", vizbiz: "AI visibility — appearing in ChatGPT, Google AI Overviews, Perplexity, and AI-generated answers", brightlocal: "Local SEO — ranking in Google local pack, managing citations and reviews" },
  { dimension: "Platforms measured", vizbiz: "ChatGPT, Google AI Overviews, Perplexity, and expanding AI platforms", brightlocal: "Google (search, maps, local pack), major citation sources" },
  { dimension: "Core measurement", vizbiz: "Whether your dealership appears in AI-generated recommendations and how it's described", brightlocal: "Local search rankings, citation accuracy, review sentiment" },
  { dimension: "Citation management", vizbiz: "Audit and scoring of entity consistency as an AI signal", brightlocal: "Full citation building, cleanup, and ongoing management across 80+ directories" },
  { dimension: "Review management", vizbiz: "Scoring review depth and substance for AI recommendation impact", brightlocal: "Review monitoring, response templates, generation tools, and sentiment analysis" },
  { dimension: "Competitive analysis", vizbiz: "AI visibility benchmarking — see which competitors AI recommends and why", brightlocal: "Local search rank tracking and competitor comparison on Google" },
  { dimension: "Reporting", vizbiz: "AI visibility scores, platform-specific breakdowns, prioritized action plans", brightlocal: "Local SEO audit reports, citation accuracy scores, review analytics" },
  { dimension: "Ideal for", vizbiz: "Dealerships that want to appear in AI-generated answers and recommendations", brightlocal: "Businesses that need to rank in Google's local pack and manage local SEO at scale" },
  { dimension: "Industry specificity", vizbiz: "Purpose-built for car dealerships and automotive retailers", brightlocal: "General platform serving all local business types" },
  { dimension: "Pricing model", vizbiz: "Free snapshot, paid audits, subscription monitoring", brightlocal: "Tiered subscription plans based on location count and feature access" },
];

const whereVizBizWins = [
  {
    title: "AI-native measurement",
    body: "VizBiz queries AI platforms directly with real buyer-intent questions and measures whether your dealership appears in the generated answers. BrightLocal measures Google local search rankings — a different and complementary channel. If your priority is being recommended by ChatGPT and other AI systems, VizBiz is purpose-built for that. VizBiz covers 4+ AI platforms and 84 buyer-intent query patterns per market.",
  },
  {
    title: "Dealership-specific signals",
    body: "VizBiz's scoring model was designed around automotive retail signals: inventory visibility, service department mentions, financing content, make-specific queries, and buyer-intent patterns unique to car shopping. BrightLocal serves all local businesses with a general-purpose model.",
  },
  {
    title: "Cross-platform AI visibility",
    body: "VizBiz tracks your presence across ChatGPT, Google AI Overviews, Perplexity, and emerging AI platforms in a single view. As new AI platforms gain adoption, VizBiz adds them to tracking. BrightLocal focuses on Google's ecosystem.",
  },
];

const whereBrightLocalWins = [
  {
    title: "Citation building at scale",
    body: "BrightLocal can build, fix, and manage citations across 80+ directories automatically. If your dealership needs a full citation cleanup or ongoing citation management, BrightLocal has the tooling and infrastructure for that work at a scale VizBiz doesn't replicate.",
  },
  {
    title: "Mature local SEO toolset",
    body: "Rank tracking, Google Business Profile auditing, review response management, local search grid reports — BrightLocal has been building local SEO tools for over a decade. For traditional Google local pack optimization, their toolset is comprehensive and battle-tested.",
  },
  {
    title: "Multi-location management",
    body: "BrightLocal is well-suited for agencies and dealer groups managing many locations. Its reporting infrastructure, white-label capabilities, and location-level dashboards are designed for that use case.",
  },
];

const useBoth = [
  "Use BrightLocal for citation management, local rank tracking, and Google Business Profile optimization — the traditional local SEO foundation.",
  "Use VizBiz to measure and improve your AI visibility — making sure you appear when buyers ask ChatGPT, Google AI Overviews, and Perplexity for dealership recommendations.",
  "The two platforms address different parts of the modern search landscape. Most dealerships serious about being found everywhere their buyers search will benefit from both.",
];

const faqItems = [
  {
    question: "Is VizBiz a BrightLocal alternative?",
    answer:
      "They solve different problems. BrightLocal is a local SEO platform focused on Google rankings and citation management across 80+ directories. VizBiz is an AI visibility platform focused on appearing in AI-generated answers across ChatGPT, Google AI Overviews, Perplexity, and other AI platforms. They're complementary, not competing.",
  },
  {
    question: "Can VizBiz replace BrightLocal?",
    answer:
      "If your only goal is AI visibility measurement and improvement, VizBiz covers that fully. But if you need citation building across 80+ directories, local rank tracking, Google Business Profile management, or review response tools, BrightLocal provides those capabilities. Many dealerships benefit from using both.",
  },
  {
    question: "Which platform should my dealership start with?",
    answer:
      "If your Google local pack rankings are solid but you're not appearing in AI answers, start with VizBiz. VizBiz data shows 84% of dealerships score below 60 on AI visibility — even many with strong Google rankings. If your Google presence needs work — inconsistent citations, poor local rankings — BrightLocal may be the higher priority. Ideally, address both channels.",
  },
  {
    question: "Does VizBiz help with Google rankings too?",
    answer:
      "Indirectly, yes. Many of the signals that improve AI visibility — consistent business data, better content, detailed reviews — also improve traditional SEO. But VizBiz's measurement and recommendations are focused specifically on AI platform visibility, not Google search ranking.",
  },
];

export default function VizBizVsBrightLocalPage() {
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
    "headline": "VizBiz vs BrightLocal — AI Visibility vs Local SEO Comparison",
    "description": "Honest comparison of VizBiz and BrightLocal for car dealerships. See where each platform excels — AI visibility intelligence vs traditional local SEO management.",
    "datePublished": "2026-04-01",
    "dateModified": "2026-04-12",
    "author": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "publisher": { "@type": "Organization", "name": "VizBiz", "url": "https://vizbiz.ai" },
    "mainEntityOfPage": "https://vizbiz.ai/compare/vizbiz-vs-brightlocal",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">Honest comparison</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            VizBiz vs BrightLocal
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Both platforms help businesses get found — but in different places, for different reasons, using different signals. Here's an honest breakdown.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <strong>VizBiz</strong> measures and improves your dealership's visibility in AI-generated answers — ChatGPT, Google AI Overviews, Perplexity, and other AI platforms where <strong className="text-white">30% of car buyers now start their research</strong> (DealershipGuy, January 2026).
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <strong>BrightLocal</strong> is a local SEO platform focused on Google search rankings, citation management across 80+ directories, and review monitoring. It's been a standard tool in local SEO for over a decade.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              They're not competitors — they address different parts of the modern search landscape. Here's how they compare.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--neon-cyan)]">Key Takeaways</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>VizBiz measures AI visibility (ChatGPT, Google AI Overviews, Perplexity); BrightLocal manages local SEO (Google rankings, citations)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>They're <strong className="text-white">complementary</strong>, not competing — most dealerships benefit from both</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>VizBiz is <strong className="text-white">purpose-built for car dealerships</strong>; BrightLocal serves all local business types</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>If AI visibility is your priority, start with VizBiz. If Google local pack needs work, start with BrightLocal</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How Do VizBiz and BrightLocal Compare Feature by Feature?
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 font-semibold text-[var(--text-secondary)]">Dimension</th>
                    <th className="py-3 pr-4 font-semibold text-[var(--neon-cyan)]">VizBiz</th>
                    <th className="py-3 font-semibold text-[var(--text-secondary)]">BrightLocal</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.dimension} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-medium align-top">{row.dimension}</td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)] align-top">{row.vizbiz}</td>
                      <td className="py-3 text-[var(--text-secondary)] align-top">{row.brightlocal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Where Does VizBiz Outperform BrightLocal?
            </h2>
            <div className="mt-6 space-y-5">
              {whereVizBizWins.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Where Does BrightLocal Outperform VizBiz?
            </h2>
            <div className="mt-6 space-y-5">
              {whereBrightLocalWins.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Should Your Dealership Use Both VizBiz and BrightLocal?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Car buyers don't use one search channel. They use Google, ChatGPT, Perplexity, and whatever AI assistant is built into their phone. Showing up everywhere requires addressing both traditional local SEO and AI visibility:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {useBoth.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Start with your AI visibility</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              See How Your Dealership Performs in AI Answers
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Get a free AI Visibility Snapshot showing where your dealership appears in ChatGPT, Google AI Overviews, and Perplexity — and where competitors are being recommended instead.
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
