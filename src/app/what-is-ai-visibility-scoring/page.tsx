import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Is AI Visibility Scoring? — VizBiz",
  description:
    "AI Visibility Scoring measures how often your business appears in AI-powered search results like ChatGPT, Google AI Overviews, and Perplexity. Learn what it is, why it matters, and how to improve your score.",
  openGraph: {
    title: "What Is AI Visibility Scoring?",
    description:
      "AI Visibility Scoring measures how often your business appears in AI-powered search results. Learn what it is and how to improve yours.",
    url: "https://vizbiz.ai/what-is-ai-visibility-scoring",
    type: "article",
  },
  alternates: {
    canonical: "https://vizbiz.ai/what-is-ai-visibility-scoring",
  },
};

export default function AIVisibilityScoring() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-blue-600 mb-3 tracking-wide uppercase">
            AI Visibility Explained
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            What Is AI Visibility Scoring?
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A clear, practical guide to understanding how AI search platforms
            decide which businesses to recommend — and how to measure where you
            stand.
          </p>
        </div>
      </section>

      {/* Core Definition */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold">The Short Answer</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>AI Visibility Scoring</strong> measures how often and how
            prominently your business appears in AI-generated answers — across
            platforms like ChatGPT, Google AI Overviews, Gemini, and Perplexity.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Think of it like SEO ranking, but for AI. Instead of tracking your
            position on a search results page, you&apos;re tracking whether AI
            models recommend you when potential customers ask questions about
            your products, services, or location.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <p className="text-lg font-medium text-gray-800">
              If someone asks ChatGPT &ldquo;What&apos;s the best car
              dealership in Mississauga?&rdquo; — does your dealership show up?
              That&apos;s AI visibility.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold">Why AI Visibility Matters Now</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                AI search is replacing traditional search
              </h3>
              <p className="text-gray-700">
                More people are asking ChatGPT, Gemini, and Perplexity for
                recommendations instead of scrolling through Google results. If
                your business isn&apos;t showing up in AI answers, you&apos;re
                invisible to a growing segment of buyers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                The rules are different from SEO
              </h3>
              <p className="text-gray-700">
                AI models don&apos;t rank pages — they synthesize answers from
                multiple sources. Your Google position doesn&apos;t guarantee AI
                visibility. You need a separate strategy.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Early movers have an advantage
              </h3>
              <p className="text-gray-700">
                AI models build knowledge from the content they can access.
                Businesses that create clear, structured, authoritative content
                now will be recommended more often as AI adoption grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Scoring Works */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold">How AI Visibility Scoring Works</h2>
          <p className="text-gray-700">
            A comprehensive AI visibility score typically evaluates your
            business across several categories:
          </p>

          <div className="grid gap-4">
            {[
              {
                category: "Discovery",
                weight: "30%",
                description:
                  "How often does the AI recommend your business when buyers ask about your category, location, or services?",
              },
              {
                category: "Trust & Reviews",
                weight: "25%",
                description:
                  "Does the AI reference your reviews, ratings, and third-party trust signals when making recommendations?",
              },
              {
                category: "Service Visibility",
                weight: "20%",
                description:
                  "Can customers find your service department, hours, and specialties through AI search?",
              },
              {
                category: "Inventory & Pricing",
                weight: "15%",
                description:
                  "Does the AI surface your inventory selection, used car options, or competitive pricing information?",
              },
              {
                category: "Finance & Trade-In",
                weight: "10%",
                description:
                  "Are your financing options and trade-in programs visible in AI-generated answers?",
              },
            ].map((item) => (
              <div
                key={item.category}
                className="border border-gray-200 rounded-lg p-5 flex gap-4"
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-xl font-bold text-blue-600">
                    {item.weight}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.category}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-sm mt-4">
            This weighting structure — known as the AVI (AI Visibility Index) —
            was developed by VizBiz for automotive retailers. The exact weights
            may vary by industry, but the categories apply broadly.
          </p>
        </div>
      </section>

      {/* Score Ranges */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold">What&apos;s a Good Score?</h2>
          <div className="grid gap-4">
            {[
              {
                range: "70–100",
                label: "Strong",
                color: "text-green-600",
                description:
                  "Your business consistently appears in AI recommendations across most buyer-intent queries.",
              },
              {
                range: "40–69",
                label: "Moderate",
                color: "text-yellow-600",
                description:
                  "You show up sometimes, but competitors often get the recommendation instead.",
              },
              {
                range: "15–39",
                label: "Weak",
                color: "text-cyan-500",
                description:
                  "Rare appearances. Most buyers asking AI about your category won't hear about you.",
              },
              {
                range: "0–14",
                label: "Not Visible",
                color: "text-red-600",
                description:
                  "AI platforms don't reference your business at all. You're missing this channel entirely.",
              },
            ].map((tier) => (
              <div key={tier.range} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-mono font-bold text-lg">
                    {tier.range}
                  </span>
                </div>
                <div>
                  <span className={`font-semibold ${tier.color}`}>
                    {tier.label}
                  </span>
                  <p className="text-gray-600 text-sm mt-1">
                    {tier.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Improve */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold">How to Improve Your AI Visibility</h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Make your site readable by AI crawlers",
                description:
                  "Ensure your robots.txt allows AI bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended). Many businesses accidentally block them.",
              },
              {
                step: "2",
                title: "Use structured data (schema markup)",
                description:
                  "Add LocalBusiness, AutoDealer, and FAQ schema to your site. This helps AI models understand exactly what you offer and where you are.",
              },
              {
                step: "3",
                title: "Create authoritative, question-focused content",
                description:
                  "Write content that directly answers the questions your customers ask AI platforms. Service guides, comparisons, and how-to articles all feed AI knowledge.",
              },
              {
                step: "4",
                title: "Build third-party citations",
                description:
                  "Get listed in directories, industry publications, and review sites. AI models cross-reference multiple sources — the more they see you, the more they recommend you.",
              },
              {
                step: "5",
                title: "Measure and iterate",
                description:
                  "Run regular AI visibility audits. Track which prompts mention you, which don't, and what your competitors are doing differently.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          {[
            {
              q: "Is AI visibility the same as SEO?",
              a: "No. SEO focuses on your position in traditional search engine results pages. AI visibility focuses on whether AI models recommend your business in conversational answers. They're related but require different strategies.",
            },
            {
              q: "How often should I check my AI visibility?",
              a: "Monthly for established businesses. Weekly if you're actively making changes to improve it. AI models update their knowledge continuously, so scores can shift as new content gets indexed.",
            },
            {
              q: "Can I pay to improve my AI visibility score?",
              a: "Not directly. AI models don't accept payment for recommendations. But investing in structured content, schema markup, and authoritative citations consistently improves visibility over time.",
            },
            {
              q: "How long does it take to see improvement?",
              a: "Typically 4–8 weeks after making changes. AI crawlers need time to re-index your content and for those changes to be reflected in model outputs.",
            },
          ].map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">
            See Where You Stand
          </h2>
          <p className="text-gray-600 text-lg">
            Get a free AI visibility audit for your dealership. We&apos;ll run
            real buyer-intent queries across ChatGPT, Google AI Overviews, and
            more — and show you exactly where you appear and where you
            don&apos;t.
          </p>
          <Link
            href="/#audit/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Your Free AI Visibility Audit
          </Link>
          <p className="text-sm text-gray-500">
            Or{" "}
            <Link href="/sample-ai-visibility-report-for-car-dealerships/" className="underline">
              see a sample report
            </Link>{" "}
            to understand what you&apos;ll get.
          </p>
        </div>
      </section>
    </main>
  );
}
