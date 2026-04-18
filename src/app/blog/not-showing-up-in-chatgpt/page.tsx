import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Not Showing Up in ChatGPT? Here's Why (And What to Do About It) | VizBiz",
  description:
    "Your car dealership doesn't appear in ChatGPT recommendations. Learn the 5 most common reasons dealerships are invisible to AI search — and practical steps to fix each one.",
  alternates: {
    canonical: "https://vizbiz.ai/blog/not-showing-up-in-chatgpt",
  },
  openGraph: {
    title: "Not Showing Up in ChatGPT? Here's Why (And What to Do About It)",
    description:
      "Your car dealership doesn't appear in ChatGPT recommendations. Learn the 5 most common reasons — and practical steps to fix each one.",
    url: "https://vizbiz.ai/blog/not-showing-up-in-chatgpt",
    type: "article",
    siteName: "VizBiz",
  },
};

const reasons = [
  {
    title: "Your web presence is fragmented",
    body: "AI models like ChatGPT don't just read your website. They pull from your Google Business Profile, review sites, directories, social pages, and forum discussions. If your dealership name, address, phone number, or makes carried are inconsistent across these sources, AI systems can't confidently identify you as a coherent entity. Inconsistencies as small as \"Auto\" versus \"Automotive\" erode trust.",
    fix: "Audit every public listing. Make sure your name, address, phone, hours, and make affiliations match exactly on your site, Google Business Profile, Yelp, Facebook, Apple Maps, and every major directory. Consistency builds entity clarity — the foundation AI systems need to recommend you.",
  },
  {
    title: "Your reviews don't say anything useful",
    body: "Star ratings matter, but AI systems weight review content more heavily than raw counts. A wall of generic five-star reviews with no detail gives ChatGPT almost nothing to work with. Detailed reviews that mention specific vehicles, financing experiences, and service quality are cited 2.3x more often by AI systems than generic ones (Ekho, February 2026).",
    fix: "Ask customers to mention specifics in their reviews — which vehicle they bought, how the trade-in went, what the financing process was like. These details give AI real substance to reference when explaining why it recommends your dealership over another.",
  },
  {
    title: "You're not answering the questions buyers actually ask",
    body: "When someone asks ChatGPT \"Where's the best place to buy a used SUV near me?\", the model looks for content that demonstrates expertise on exactly that topic. If your site only has inventory pages and a generic About section, there's nothing for the AI to draw from. Dealerships with dedicated content around buyer-intent questions — financing guides, trade-in explainers, certified pre-owned breakdowns — show up more often because they give AI systems more material to cite.",
    fix: "Build pages and FAQ sections around real buyer questions: \"What should I look for in a used car?\", \"How does CPO work?\", \"What's a good interest rate right now?\" These help your customers and give AI clearer signals about your expertise.",
  },
  {
    title: "Your competitors are doing more of the right things",
    body: "AI visibility is relative. Even if your web presence is decent, if a competing dealership in your area has stronger reviews, more consistent listings, and better content, ChatGPT will recommend them instead. Our research shows that in most local markets, only 2-3 dealerships consistently appear in AI recommendations for buyer-intent queries. If you're not one of them, you're losing a growing share of traffic.",
    fix: "Run a competitive visibility audit. Find out which dealerships AI systems are recommending in your area, compare their web presence to yours, and identify specific gaps you can close. VizBiz's AI Visibility Audit does this automatically across 84 buyer-intent prompts.",
  },
  {
    title: "You haven't checked — so you don't know what's wrong",
    body: "Most dealerships have never systematically tested their AI visibility. They might check Google and see themselves ranking fine, but AI search works differently. ChatGPT, Google AI Overviews, Perplexity, and Gemini each use different models, data sources, and reasoning processes. You might show up in one and be completely invisible in another — and you'd never know without checking.",
    fix: "Ask each AI platform the same questions your buyers would: \"What's the best [make] dealership in [your city]?\", \"Where should I buy a used car near [your area]?\" Track whether you appear, how you're described, and which competitors show up. Better yet, get a VizBiz AVI audit — it runs 84 prompts across three platforms and gives you a score from 0-100.",
  },
];

export default function BlogPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Not Showing Up in ChatGPT? Here's Why (And What to Do About It)",
    description:
      "Your car dealership doesn't appear in ChatGPT recommendations. Learn the 5 most common reasons dealerships are invisible to AI search — and practical steps to fix each one.",
    datePublished: "2026-04-16",
    author: {
      "@type": "Organization",
      name: "VizBiz",
      url: "https://vizbiz.ai",
    },
    publisher: {
      "@type": "Organization",
      name: "VizBiz",
      url: "https://vizbiz.ai",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://vizbiz.ai/blog/not-showing-up-in-chatgpt",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <SiteHeader />
        <article className="mx-auto max-w-3xl px-6 pt-32 pb-20">
          {/* Post header */}
          <header className="mb-12">
            <Link
              href="/blog/"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-6 inline-block"
            >
              ← Back to Blog
            </Link>
            <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold tracking-tight leading-tight mt-4 mb-4">
              Not Showing Up in ChatGPT? Here&apos;s Why (And What to Do About It)
            </h1>
            <time className="text-sm text-zinc-500">April 16, 2026</time>
          </header>

          {/* TL;DR */}
          <div className="border border-zinc-800 rounded-xl p-6 mb-12 bg-zinc-900/50">
            <h2 className="font-['Space_Grotesk'] text-lg font-semibold mb-3">
              TL;DR — Key Takeaways
            </h2>
            <ul className="space-y-2 text-zinc-300 text-sm leading-relaxed">
              <li>AI search is different from traditional Google rankings — it synthesizes information from across the web, not just your site.</li>
              <li>The most common visibility killers: inconsistent listings, shallow reviews, no buyer-intent content, stronger competitors, and never having measured the problem.</li>
              <li>Fixing it starts with understanding where you stand right now — a VizBiz AVI audit gives you that baseline for free.</li>
            </ul>
          </div>

          {/* Intro */}
          <div className="prose prose-invert prose-zinc max-w-none space-y-5 text-zinc-300 leading-relaxed mb-12">
            <p>
              You searched for your own dealership in ChatGPT and… nothing. A competitor showed up. Or worse, a dealership you&apos;ve never heard of. Meanwhile, you&apos;re spending on SEO, running ads, and showing up fine on Google. So what&apos;s going on?
            </p>
            <p>
              AI-powered search is fundamentally different from traditional search. When someone types a query into Google, the engine returns a list of links ranked by relevance and authority. When someone asks ChatGPT a question, the model <em>synthesizes an answer</em> by drawing from across the web — your site, review platforms, directories, forums, and structured data — then recommends specific businesses it has enough confidence in.
            </p>
            <p>
              That confidence is built on a different set of signals than traditional SEO. And most dealerships haven&apos;t optimized for those signals yet — which means the ones who do are capturing a growing share of AI-driven buyer traffic.
            </p>
            <p>Here are the five most common reasons your dealership isn&apos;t showing up — and what you can do about each one.</p>
          </div>

          {/* Reasons */}
          <div className="space-y-10 mb-14">
            {reasons.map((reason, i) => (
              <section key={i}>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold mb-3">
                  <span className="text-blue-400">{i + 1}.</span> {reason.title}
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-4">{reason.body}</p>
                <div className="border-l-2 border-blue-500/50 pl-4">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    <span className="text-blue-400 font-medium">Fix:</span> {reason.fix}
                  </p>
                </div>
              </section>
            ))}
          </div>

          {/* Closing */}
          <div className="prose prose-invert prose-zinc max-w-none space-y-5 text-zinc-300 leading-relaxed mb-12">
            <p>
              AI search isn&apos;t replacing Google overnight — but it&apos;s growing fast. ChatGPT alone processes over 100 million queries per week (OpenAI, 2026), and a meaningful share of those are from people actively looking for products and services, including cars and dealerships.
            </p>
            <p>
              The dealerships that show up in those conversations today are building an advantage that compounds over time. Every review, every listing correction, every helpful page you publish adds to the web of signals AI systems use to decide who to recommend.
            </p>
            <p>
              The first step is knowing where you stand. And that&apos;s free.
            </p>
          </div>

          {/* CTA */}
          <div className="border border-blue-500/30 rounded-xl p-8 text-center bg-blue-500/5">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold mb-3">
              Find out your AI Visibility Score — free
            </h2>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              VizBiz runs 84 buyer-intent prompts across ChatGPT, Google AI, and Perplexity to measure how visible your dealership actually is. Get your AVI score, competitor comparison, and priority fixes.
            </p>
            <Link
              href="/intake/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Get Your Free AVI Audit
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
