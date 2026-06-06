import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "AI Visibility Tools for Car Dealerships Compared (2026) | VizBiz",
  description:
    "Honest comparison of AI visibility platforms for car dealerships: VizBiz, Metricus, AEO Vantage, and AI Rank Checker. See which tool fits your dealership's needs.",
  alternates: {
    canonical: "https://vizbiz.ai/ai-visibility-tools-compared/",
  },
  openGraph: {
    title: "AI Visibility Tools for Car Dealerships Compared (2026) | VizBiz",
    description:
      "Honest comparison of AI visibility platforms for car dealerships. Features, pricing, and fit — so you can pick the right tool.",
    url: "https://vizbiz.ai/ai-visibility-tools-compared/",
    siteName: "VizBiz",
    type: "article",
  },
};

const tools = [
  {
    name: "VizBiz",
    slug: "vizbiz",
    tagline: "AI visibility intelligence built for car dealerships",
    pricingModel: "Free AVI Snapshot, paid audits & subscription monitoring",
    verticalFocus: "Car dealerships and automotive retail (purpose-built)",
    scoringMethod: "AVI Score — tests 84 buyer-intent prompts across ChatGPT, Google AI Overviews, Perplexity",
    fixGuidance: "Full fix pipeline — prioritized action plan with specific content, review, and entity recommendations",
    dealerSpecific: "Yes — scoring model, prompts, and recommendations designed around automotive retail signals",
    strengths: [
      "Only tool purpose-built for car dealerships with 84 buyer-intent prompts per market",
      "AVI Score gives a single benchmarkable number across 4+ AI platforms",
      "Fix pipeline goes beyond measurement — tells you exactly what to change",
      "Tracks make-specific, model-specific, and financing queries unique to auto retail",
    ],
    bestFor: "Car dealerships that want to appear in AI-generated answers and need a clear, prioritized plan to get there.",
  },
  {
    name: "Metricus",
    slug: "metricus",
    tagline: "AI search tracking and analytics platform",
    pricingModel: "Subscription tiers based on query volume and features",
    verticalFocus: "General — serves multiple industries",
    scoringMethod: "AI search rank tracking and citation monitoring across AI platforms",
    fixGuidance: "Analytics and reporting dashboards; limited prescriptive guidance",
    dealerSpecific: "No — general-purpose platform",
    strengths: [
      "Strong analytics dashboard for tracking AI search presence over time",
      "Good cross-platform coverage including emerging AI search engines",
      "Useful for agencies managing multiple brands or verticals",
    ],
    bestFor: "Marketing agencies and multi-vertical businesses that need broad AI search analytics and are comfortable building their own optimization strategy from data.",
  },
  {
    name: "AEO Vantage",
    slug: "aeo-vantage",
    tagline: "Answer Engine Optimization platform",
    pricingModel: "Consultative pricing based on scope",
    verticalFocus: "General — AEO consulting and tooling",
    scoringMethod: "Answer Engine Optimization audits and optimization scoring",
    fixGuidance: "Consulting-led recommendations and implementation support",
    dealerSpecific: "No — general AEO platform",
    strengths: [
      "Deep expertise in Answer Engine Optimization methodology",
      "Consulting-led approach means hands-on strategic guidance",
      "Covers traditional SEO and AEO in a unified framework",
    ],
    bestFor: "Businesses that want a consulting-driven approach to AI visibility and have the budget for hands-on strategic engagement.",
  },
  {
    name: "AI Rank Checker",
    slug: "ai-rank-checker",
    tagline: "Free AI ranking check tool",
    pricingModel: "Free tool with limited checks; premium tier for expanded monitoring",
    verticalFocus: "General — any business or website",
    scoringMethod: "Position-based ranking checks against AI-generated answers",
    fixGuidance: "Basic position data; no prescriptive fix pipeline",
    dealerSpecific: "No — general-purpose ranking checker",
    strengths: [
      "Quick and free entry point for checking basic AI visibility",
      "Simple interface — easy to understand without onboarding",
      "Good for a first look at whether your business appears in AI answers",
    ],
    bestFor: "Businesses looking for a quick, free check of their AI search presence without committing to a full platform.",
  },
];

const comparisonDimensions = [
  { label: "Pricing model", key: "pricingModel" as const },
  { label: "Vertical focus", key: "verticalFocus" as const },
  { label: "Scoring method", key: "scoringMethod" as const },
  { label: "Fix guidance", key: "fixGuidance" as const },
  { label: "Dealer-specific", key: "dealerSpecific" as const },
];

const faqItems = [
  {
    question: "Which AI visibility tool is best for car dealerships?",
    answer:
      "VizBiz is the only platform purpose-built for car dealerships. It uses 84 buyer-intent prompts tailored to automotive retail, scores your visibility across multiple AI platforms, and provides a prioritized fix pipeline. Other tools on this list are strong general-purpose options but aren't designed around dealership-specific signals.",
  },
  {
    question: "Do I need an AI visibility tool if I already do SEO?",
    answer:
      "Yes. Traditional SEO focuses on Google search rankings. AI visibility measures whether your dealership appears in AI-generated answers from ChatGPT, Google AI Overviews, and Perplexity — a growing channel where 30% of car buyers now start research (DealershipGuy, January 2026). The signals overlap but the measurement and optimization approaches are different.",
  },
  {
    question: "What's the difference between AI visibility and local SEO?",
    answer:
      "Local SEO targets Google's local pack and map results. AI visibility measures your presence in AI-generated answers and recommendations. A dealership can rank well in Google's local pack but be invisible when a buyer asks ChatGPT for a recommendation — or vice versa. Both channels matter.",
  },
  {
    question: "Can I use more than one of these tools together?",
    answer:
      "Absolutely. Many dealerships benefit from a layered approach. For example, VizBiz for dealership-specific AI visibility measurement and fix guidance, combined with a broader analytics tool like Metricus for tracking trends across your full brand portfolio.",
  },
  {
    question: "How much does VizBiz cost?",
    answer:
      "VizBiz offers a free AVI Snapshot that shows your current AI visibility score across major platforms. Paid audits and ongoing monitoring subscriptions are available for dealerships that want deeper analysis and continuous tracking.",
  },
];

export default function AIVisibilityToolsComparedPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "AI Visibility Tools for Car Dealerships Compared (2026)",
    description:
      "Honest comparison of AI visibility platforms for car dealerships: VizBiz, Metricus, AEO Vantage, and AI Rank Checker.",
    datePublished: "2026-04-23",
    dateModified: "2026-04-23",
    author: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    publisher: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    mainEntityOfPage: "https://vizbiz.ai/ai-visibility-tools-compared/",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SiteHeader ctaLabel="Get My Snapshot" />

        {/* Hero */}
        <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-4xl">
            <div className="section-kicker">Honest comparison</div>
            <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
              AI Visibility Tools for Car Dealerships Compared
            </h1>

            <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
              {/* TL;DR */}
              <div className="rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-[var(--neon-cyan)]">TL;DR</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  <strong className="text-white">VizBiz is the only platform purpose-built for car dealerships.</strong>{" "}
                  It tests 84 buyer-intent prompts across ChatGPT, Google AI Overviews, and Perplexity, scores your AI visibility with a single number (AVI Score), and gives you a prioritized fix pipeline.{" "}
                  Metricus offers strong analytics for agencies. AEO Vantage brings consulting depth. AI Rank Checker is a solid free starting point.{" "}
                  For dealerships serious about AI visibility, <strong className="text-white">VizBiz is the clear fit</strong>.
                </p>
              </div>

              {/* Intro */}
              <p className="mt-8 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                When a buyer asks ChatGPT "what's the best Toyota dealership near me?" — does your store show up?{" "}
                <strong className="text-white">30% of car buyers now start research with AI</strong> (DealershipGuy, January 2026), and that number is climbing fast.
              </p>
              <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                AI visibility tools measure and improve your presence in these AI-generated answers. They're different from traditional SEO tools — they query AI platforms directly, test real buyer questions, and track whether your business gets recommended.
              </p>
              <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                Here's an honest comparison of the four platforms most likely to come up when you search for AI visibility solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Feature-by-Feature Comparison
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              How do these platforms stack up on the dimensions that matter most to dealerships?
            </p>

            <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 pr-4 font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                        Dimension
                      </th>
                      {tools.map((t) => (
                        <th
                          key={t.slug}
                          className={`py-3 px-4 font-semibold whitespace-nowrap ${
                            t.slug === "vizbiz"
                              ? "text-[var(--neon-cyan)]"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {t.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonDimensions.map((dim, i) => (
                      <tr
                        key={dim.label}
                        className={i < comparisonDimensions.length - 1 ? "border-b border-white/6" : ""}
                      >
                        <td className="py-4 pr-4 font-medium text-[var(--text-secondary)] whitespace-nowrap">
                          {dim.label}
                        </td>
                        {tools.map((t) => (
                          <td
                            key={t.slug}
                            className={`py-4 px-4 leading-6 ${
                              t.slug === "vizbiz" ? "text-white" : "text-[var(--text-secondary)]"
                            }`}
                          >
                            {t[dim.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dives */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Deep Dive: Each Tool at a Glance
            </h2>

            {tools.map((t) => (
              <div key={t.slug} className="glass-card rounded-[2rem] p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-white sm:text-2xl">{t.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{t.tagline}</p>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                  {t.bestFor}
                </p>
                {t.strengths.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Key Strengths
                    </p>
                    <ul className="mt-3 space-y-2">
                      {t.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* VizBiz Differentiator */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Makes VizBiz Different
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Most AI visibility tools measure the problem. VizBiz measures it <strong className="text-white">and tells you exactly how to fix it</strong> — with signals built specifically for automotive retail.
            </p>

            <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white">84 Buyer-Intent Prompts</h3>
                <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
                  VizBiz doesn't just check if your name appears. It tests 84 real buyer-intent questions per market — make-specific ("best Toyota dealership near me"), model-specific ("where to lease a 2026 RAV4"), financing ("bad credit car dealerships"), service ("best Honda mechanic in Toronto"), and more. These are the questions real buyers ask AI platforms every day.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">AVI Score — One Number, Four+ Platforms</h3>
                <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
                  The AI Visibility Index (AVI) distills your performance across ChatGPT, Google AI Overviews, Perplexity, and other AI platforms into a single benchmarkable score. Track it over time. Compare against competitors. Know where you stand.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">Built for Auto, Not Adapted From General</h3>
                <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
                  Every scoring signal, every prompt, every recommendation is designed around automotive retail — inventory visibility, service department mentions, trade-in content, OEM-specific queries. General tools can't match that specificity without heavy customization.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">Fix Pipeline, Not Just Measurement</h3>
                <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
                  Knowing your score is table stakes. VizBiz gives you a prioritized action plan: which content to create, which reviews to encourage, which entity signals to fix, and which queries to target first. Measurement without a fix plan is just a report card. VizBiz gives you the study guide too.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 space-y-6">
              {faqItems.map((f, i) => (
                <div key={i} className="glass-card rounded-[1.5rem] p-6">
                  <h3 className="text-base font-semibold text-white sm:text-lg">{f.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              See Where You Stand
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Get your free AVI Snapshot and find out if your dealership appears when buyers ask AI for recommendations.
            </p>
            <Link
              href="/intake/?utm_source=site&utm_medium=cta-button&utm_campaign=tools-compared"
              className="mt-8 inline-flex items-center rounded-full bg-[var(--neon-cyan)] px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-105 sm:text-lg"
            >
              Get Your Free AVI Snapshot →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
