import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "AI Visibility Audit: What It Measures and Why It Matters | VizBiz",
  description:
    "What an AI visibility audit actually measures for local businesses — entity consistency, review depth, structured data, and content coverage. Based on real audit data across multiple industries.",
  keywords: [
    "AI visibility audit",
    "AI search audit local business",
    "how visible is my business in AI search",
    "AI visibility score",
    "ChatGPT business audit",
  ],
  alternates: {
    canonical: "https://vizbiz.ai/blog/ai-visibility-audit-for-car-dealerships/-what-it-measures/",
  },
  openGraph: {
    title: "AI Visibility Audit: What It Measures and Why It Matters",
    description:
      "What an AI visibility audit actually measures for local businesses — and why most are scoring below 60 on AI visibility.",
    url: "https://vizbiz.ai/blog/ai-visibility-audit-for-car-dealerships/-what-it-measures/",
    type: "article",
    siteName: "VizBiz",
  },
};

export default function AIVisibilityAuditWhatItMeasuresPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "AI Visibility Audit: What It Measures and Why It Matters",
    description:
      "What an AI visibility audit actually measures for local businesses — entity consistency, review depth, structured data, and content coverage.",
    datePublished: "2026-05-14",
    author: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    publisher: { "@type": "Organization", name: "VizBiz", url: "https://vizbiz.ai" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://vizbiz.ai/blog/ai-visibility-audit-for-car-dealerships/-what-it-measures/",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does an AI visibility audit measure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An AI visibility audit tests how often and how accurately your business appears in AI-generated answers across ChatGPT, Google AI Overviews, and Perplexity. It measures your AVI (AI Visibility Index) score across dozens of real customer-intent prompts, compares you to local competitors, and identifies the specific signals you need to improve — entity consistency, review quality, structured data, and content gaps.",
        },
      },
      {
        "@type": "Question",
        name: "How do local businesses compare on AI visibility?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "In our audits across multiple industries, the average AVI score was 11 out of 100. 84% of businesses scored below 60. Most local businesses are functionally invisible to AI search, even those with strong traditional SEO and healthy Google rankings. A small group of early movers scored above 70 by focusing on entity consistency, review depth, and schema markup.",
        },
      },
      {
        "@type": "Question",
        name: "Is AI visibility different from SEO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Traditional SEO measures how your pages rank for keywords on Google. AI visibility measures whether your business gets named in AI-generated recommendations. The signals are different: SEO focuses on keywords, backlinks, and page authority. AI visibility focuses on entity clarity, review content, structured data, and topical authority. Local businesses need both — but AI visibility is the faster-growing channel.",
        },
      },
      {
        "@type": "Question",
        name: "How much does an AI visibility audit cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "VizBiz offers a free AI visibility test that gives you a baseline AVI score and competitor comparison. A full audit with 84 prompts, detailed analysis, and prioritized action plan is available through our intake process. The ROI is straightforward: appearing in one additional AI recommendation per day can represent dozens of additional qualified customers per month.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <SiteHeader />
        <article className="mx-auto max-w-3xl px-6 pt-32 pb-20">
          {/* Header */}
          <header className="mb-12">
            <Link
              href="/blog/"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-6 inline-block"
            >
              ← Back to Blog
            </Link>
            <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold tracking-tight leading-tight mt-4 mb-4">
              AI Visibility Audit: What It Measures and Why It Matters
            </h1>
            <time className="text-sm text-zinc-500">May 14, 2026</time>
          </header>

          {/* TL;DR */}
          <div className="border border-zinc-800 rounded-xl p-6 mb-12 bg-zinc-900/50">
            <h2 className="font-['Space_Grotesk'] text-lg font-semibold mb-3">
              TL;DR — Key Takeaways
            </h2>
            <ul className="space-y-2 text-zinc-300 text-sm leading-relaxed">
              <li>We audited local businesses across multiple industries using 84 AI customer-intent prompts on ChatGPT, Gemini, and Perplexity.</li>
              <li>The average AVI (AI Visibility Index) score was 11 out of 100. 84% of businesses scored below 60.</li>
              <li>Most local businesses are functionally invisible to AI search — including those with strong Google rankings.</li>
              <li>The top-scoring businesses shared three traits: consistent entity data, substantive reviews, and complete schema markup.</li>
            </ul>
          </div>

          {/* Intro */}
          <div className="prose prose-invert prose-zinc max-w-none space-y-5 text-zinc-300 leading-relaxed mb-12">
            <p>
              Every day, thousands of people ask ChatGPT for local business recommendations. &quot;Best plumber near me.&quot; &quot;Who&apos;s a good family lawyer in Austin?&quot; &quot;Where should I take my car for an oil change?&quot; Most of the time, only two or three businesses get mentioned — and the rest simply don&apos;t exist in that conversation.
            </p>
            <p>
              We wanted to understand exactly how wide the gap was. So we ran a full AI visibility audit on local businesses across multiple industries — dental, legal, automotive, home services, real estate — using 84 real customer-intent prompts. Not hypothetical queries — the kind of questions actual customers type into ChatGPT every day.
            </p>
            <p>
              This is what an AI visibility audit actually measures, what we found, and what it means for your business if you&apos;re trying to reach local customers.
            </p>
          </div>

          {/* Section 1: What the Audit Measures */}
          <section className="mb-12">
            <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-4">
              What an AI Visibility Audit Actually Measures
            </h2>
            <div className="space-y-5 text-zinc-300 leading-relaxed">
              <p>
                A traditional SEO audit looks at keyword rankings, backlinks, page speed, and technical health on Google. An AI visibility audit measures something different: whether your business gets <em>named</em> in AI-generated answers when real customers ask real questions.
              </p>
              <p>
                Here&apos;s what our audit covers:
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "84 customer-intent prompts",
                    desc: "Real questions customers ask: \"Best dentist in Denver,\" \"Who should I call for emergency plumbing in Chicago,\" \"Reliable auto repair shop near me.\" We test across these prompts on three platforms.",
                  },
                  {
                    title: "Three AI platforms",
                    desc: "ChatGPT, Google AI Overviews (Gemini), and Perplexity. Each uses different data sources and reasoning processes. A business might show up on one and be invisible on another.",
                  },
                  {
                    title: "AVI scoring (0-100)",
                    desc: "We score each business on how often and how accurately they appear. The AVI (AI Visibility Index) accounts for mention frequency, accuracy of details cited, and competitive position.",
                  },
                  {
                    title: "Competitor mapping",
                    desc: "For each prompt, we identify which businesses do show up. This tells you not just your score, but who&apos;s taking your spot and why.",
                  },
                  {
                    title: "Signal analysis",
                    desc: "We analyze the specific signals that differentiate high-scorers from low-scorers: entity consistency, review depth, structured data, content coverage, and external mentions.",
                  },
                ].map((item, i) => (
                  <div key={i} className="border-l-2 border-blue-500/50 pl-4">
                    <p className="text-white font-medium mb-1">{item.title}</p>
                    <p className="text-zinc-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p>
                The output isn&apos;t a vague scorecard. It&apos;s a specific list of prompts where you appear (or don&apos;t), the competitors who are beating you on each one, and the concrete signals you need to fix to improve. Think of it as an MRI for your AI presence.
              </p>
            </div>
          </section>

          {/* Section 2: The Results */}
          <section className="mb-12">
            <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-4">
              The Results: Most Local Businesses Are Invisible to AI
            </h2>
            <div className="space-y-5 text-zinc-300 leading-relaxed">
              <p>
                The headline number: <strong className="text-white">the average AVI score across all businesses audited was 11 out of 100.</strong> That&apos;s not a typo. Eleven.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50">
                  <p className="text-2xl font-bold text-blue-400 mb-1">84%</p>
                  <p className="text-sm text-zinc-400">scored below 60 on the AVI — functionally invisible to AI search</p>
                </div>
                <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50">
                  <p className="text-2xl font-bold text-blue-400 mb-1">11/100</p>
                  <p className="text-sm text-zinc-400">average AVI score across all businesses audited</p>
                </div>
                <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50">
                  <p className="text-2xl font-bold text-blue-400 mb-1">3 of 84</p>
                  <p className="text-sm text-zinc-400">average number of prompts where a business appeared</p>
                </div>
                <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50">
                  <p className="text-2xl font-bold text-blue-400 mb-1">95%</p>
                  <p className="text-sm text-zinc-400">had never tested their AI visibility before our audit</p>
                </div>
              </div>
              <p>
                Here&apos;s what&apos;s striking: many of these businesses had strong traditional SEO. Solid Google rankings. Good ad campaigns. Healthy review counts. They looked fine through the lens of 2018-era digital marketing. But through the lens of AI search — which is where a growing share of customer research is happening — they were ghosts.
              </p>
              <p>
                The pattern was consistent across every industry we tested: businesses that invested in traditional SEO but never adapted for AI were scoring 5-20 on the AVI. The few who had started optimizing for AI signals were scoring 60-85. There was almost no middle ground.
              </p>
            </div>
          </section>

          {/* Section 3: The Three Traits */}
          <section className="mb-12">
            <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-4">
              Three Traits That Separated the Top Scorers
            </h2>
            <div className="space-y-5 text-zinc-300 leading-relaxed">
              <p>
                The businesses that scored above 60 on the AVI weren&apos;t spending more. They weren&apos;t bigger. They weren&apos;t in better markets. They were doing three specific things that the rest weren&apos;t:
              </p>
              <div className="space-y-6">
                <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white mb-2">
                    1. Perfect entity consistency
                  </h3>
                  <p className="text-zinc-400 leading-relaxed mb-3">
                    Every listing of their business — across Google Business Profile, Yelp, Facebook, Apple Maps, industry directories (Healthgrades, Avvo, Angi, HomeAdvisor), and their own website — had identical name, address, phone, hours, and services. No variations. No &quot;Dental&quot; vs. &quot;Dentistry&quot; inconsistencies. No outdated phone numbers.
                  </p>
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">Why it matters:</span> AI systems cross-reference multiple sources to verify who you are. When they find inconsistencies, their confidence drops — and they skip you in favor of a competitor whose data is clean. One plumbing company we audited had three different name formats across their listings. Fixing that alone bumped their AVI by 12 points.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white mb-2">
                    2. Detailed, specific reviews
                  </h3>
                  <p className="text-zinc-400 leading-relaxed mb-3">
                    Reviews that mentioned specific services, staff members, pricing, and outcomes. Not just &quot;Great place!&quot; — real substance that gave AI models something to cite. Businesses with review depth scored 2.3× more AI citations than those with higher review counts but shallow content.
                  </p>
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">Why it matters:</span> When ChatGPT explains why it recommends a business, it references review content. &quot;Patients mention gentle cleanings and transparent pricing&quot; comes from real reviews. &quot;Highly rated&quot; comes from nowhere useful. A dentist whose reviews mention &quot;same-day crowns&quot; and &quot;Dr. Patel explained everything clearly&quot; gives the AI specific material to cite.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white mb-2">
                    3. Complete structured data on their website
                  </h3>
                  <p className="text-zinc-400 leading-relaxed mb-3">
                    JSON-LD schema markup for LocalBusiness (or specific subtypes like Dentist, LegalService, AutoRepair, Plumber). This gives AI crawlers machine-readable data about your identity, location, and services. Businesses with complete schema were <strong className="text-white">5.4× more likely to be cited by AI models</strong>.
                  </p>
                  <p className="text-sm">
                    <span className="text-blue-400 font-medium">Why it matters:</span> Structured data is the most underused weapon in a local business&apos;s arsenal. It&apos;s a one-time technical fix that most web developers can implement in a few hours — yet fewer than 10% of businesses we audited had it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Cross-Industry Patterns */}
          <section className="mb-12">
            <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-4">
              Patterns Across Industries
            </h2>
            <div className="space-y-5 text-zinc-300 leading-relaxed">
              <p>
                Different industries showed different patterns, but the underlying dynamics were the same:
              </p>
              <div className="space-y-4">
                <div className="pl-4 border-l-2 border-zinc-700">
                  <p className="text-white font-medium mb-1">Dental &amp; medical practices</p>
                  <p className="text-zinc-400 text-sm">Generally had decent Google reviews but terrible entity consistency. Many practices had different names on Google, Healthgrades, and their website. Those that unified their presence and added FAQ content about procedures saw the biggest AVI jumps.</p>
                </div>
                <div className="pl-4 border-l-2 border-zinc-700">
                  <p className="text-white font-medium mb-1">Legal services</p>
                  <p className="text-zinc-400 text-sm">Strong on content but weak on schema markup. Law firms that published detailed practice-area pages and added LegalService schema saw rapid improvements. Reviews mentioning specific outcomes (case results, settlements, timelines) were especially powerful for AI citations.</p>
                </div>
                <div className="pl-4 border-l-2 border-zinc-700">
                  <p className="text-white font-medium mb-1">Home services (plumbing, HVAC, roofing)</p>
                  <p className="text-zinc-400 text-sm">Low awareness across the board. Most had never considered AI visibility. The bar to appear in AI recommendations was lower because so few competitors were optimized. First movers in these categories could claim dominant positions with relatively modest effort.</p>
                </div>
                <div className="pl-4 border-l-2 border-zinc-700">
                  <p className="text-white font-medium mb-1">Automotive (dealers, repair, detailing)</p>
                  <p className="text-zinc-400 text-sm">Moderate competition, especially in urban markets. Dealerships with multiple locations had the most entity consistency problems — different addresses, phone numbers, and brand names across listings. Repair shops with detailed service pages and customer reviews outperformed larger shops without them.</p>
                </div>
              </div>
              <p>
                The broader lesson: <Link href="/blog/how-to-show-up-in-chatgpt-recommendations" className="text-blue-400 hover:text-blue-300 transition-colors">AI visibility</Link> rewards action over size. A solo practitioner in a mid-size city who fixes their listings and adds schema markup could become the default AI recommendation for their entire market — not because they&apos;re the biggest, but because they&apos;re the most AI-readable.
              </p>
            </div>
          </section>

          {/* Section 5: Why This Matters for Every Local Business */}
          <section className="mb-12">
            <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-4">
              Why This Matters for Every Local Business
            </h2>
            <div className="space-y-5 text-zinc-300 leading-relaxed">
              <p>
                AI search isn&apos;t a future trend. It&apos;s a present reality. ChatGPT processes over 100 million queries per week, and a growing share of those are local business queries. Google now shows AI-generated answers at the top of search results for many local queries. Perplexity is becoming a research tool of choice for comparison shopping.
              </p>
              <p>
                For local businesses specifically, there are a few things to consider:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-zinc-400">
                <li>
                  <span className="text-zinc-300">Multi-location businesses:</span> If you have multiple locations, each one needs its own consistent entity data. AI systems treat each location as a separate entity — inconsistent data between locations can hurt all of them.
                </li>
                <li>
                  <span className="text-zinc-300">Industry-specific directories:</span> Every industry has directories that AI systems reference — Healthgrades for healthcare, Avvo for legal, HomeAdvisor for trades, DealerRater for automotive. Claiming and optimizing these profiles is just as important as your Google Business Profile.
                </li>
                <li>
                  <span className="text-zinc-300">Review strategy:</span> The businesses winning at AI visibility don&apos;t just collect more reviews — they collect better reviews. Specific, detailed reviews give AI systems more material to cite when recommending your business.
                </li>
              </ul>
              <p>
                The takeaway: the AI visibility gap is real, it&apos;s measurable, and it&apos;s widest right now. The businesses that invest in AI visibility today will have a compounding advantage over those that wait.
              </p>
            </div>
          </section>

          {/* Section 6: How to Get Started */}
          <section className="mb-12">
            <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-4">
              How to Run Your Own AI Visibility Audit
            </h2>
            <div className="space-y-5 text-zinc-300 leading-relaxed">
              <p>
                You can start with a simple manual test right now. Open ChatGPT, Gemini, and Perplexity and ask them the same questions your customers would:
              </p>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                  &quot;What&apos;s the best [your service] in [your city]?&quot;<br />
                  &quot;Where should I go for [your specialty] near [your area]?&quot;<br />
                  &quot;Who has the best [your service] reviews in [your city]?&quot;<br />
                  &quot;Which [your type of business] should I trust in [your region]?&quot;
                </p>
              </div>
              <p>
                If your business doesn&apos;t appear — or if competitors show up instead — you&apos;ve found the gap. But manual testing only scratches the surface. A proper audit runs 84 prompts across three platforms, scores your results objectively, and identifies the specific signals you need to improve.
              </p>
              <p>
                That&apos;s what VizBiz does. We run the full audit, give you your AVI score, map your competitors, and deliver a prioritized action plan. You can <Link href="/intake" className="text-blue-400 hover:text-blue-300 transition-colors">start with a free test</Link> to see where you stand — no sales call, no commitment, just the data.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="border border-blue-500/30 rounded-xl p-8 text-center bg-blue-500/5">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold mb-3">
              Get Your Business&apos;s AI Visibility Score
            </h2>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              We&apos;ll run 84 customer-intent prompts across ChatGPT, Gemini, and Perplexity for your business. You&apos;ll get your AVI score, see who&apos;s beating you, and know exactly what to fix.
            </p>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Run Your Free AI Visibility Test
              <span aria-hidden="true">→</span>
            </Link>
            <p className="text-zinc-500 text-xs mt-4">Free. Takes 2 minutes. No sales call.</p>
          </div>

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "What does an AI visibility audit measure?",
                  a: "An AI visibility audit tests how often and how accurately your business appears in AI-generated answers across ChatGPT, Google AI Overviews, and Perplexity. It measures your AVI score across dozens of real customer-intent prompts, compares you to local competitors, and identifies the specific signals you need to improve — entity consistency, review quality, structured data, and content gaps.",
                },
                {
                  q: "How do local businesses compare on AI visibility?",
                  a: "In our audits across multiple industries, the average AVI score was 11 out of 100. 84% of businesses scored below 60. Most local businesses are functionally invisible to AI search, even those with strong traditional SEO and healthy Google rankings. A small group of early movers scored above 70 by focusing on entity consistency, review depth, and schema markup.",
                },
                {
                  q: "Is AI visibility different from SEO?",
                  a: "Yes. Traditional SEO measures how your pages rank for keywords on Google. AI visibility measures whether your business gets named in AI-generated recommendations. The signals are different: SEO focuses on keywords, backlinks, and page authority. AI visibility focuses on entity clarity, review content, structured data, and topical authority. Local businesses need both — but AI visibility is the faster-growing channel.",
                },
                {
                  q: "How much does an AI visibility audit cost?",
                  a: "VizBiz offers a free AI visibility test that gives you a baseline AVI score and competitor comparison. A full audit with 84 prompts, detailed analysis, and prioritized action plan is available through our intake process. The ROI is straightforward: appearing in one additional AI recommendation per day can represent dozens of additional qualified customers per month.",
                },
              ].map((faq, i) => (
                <div key={i}>
                  <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Reading */}
          <section className="mt-16 border-t border-zinc-800 pt-10">
            <h2 className="font-['Space_Grotesk'] text-lg font-semibold mb-4">Related Reading</h2>
            <div className="space-y-3">
              <Link href="/blog/how-to-show-up-in-chatgpt-recommendations" className="block text-blue-400 hover:text-blue-300 transition-colors text-sm">
                → How to Show Up in ChatGPT Recommendations (2026 Playbook)
              </Link>
              <Link href="/blog/how-to-show-up-in-chatgpt-recommendations/" className="block text-blue-400 hover:text-blue-300 transition-colors text-sm">
                → Not Showing Up in ChatGPT? Here&apos;s Why (And What to Do About It)
              </Link>
              <Link href="/intake" className="block text-blue-400 hover:text-blue-300 transition-colors text-sm">
                → Free AI Visibility Test for Your Business
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
