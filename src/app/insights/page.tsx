import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VizBiz Insights | AI Visibility for Car Dealerships",
  description:
    "Updates, data, and insights from VizBiz on AI visibility for car dealerships. See how ChatGPT, Google AI Overviews, and Gemini are reshaping automotive retail discovery.",
  keywords:
    "AI visibility for car dealerships, ChatGPT dealership visibility, Google AI Overviews automotive, AI search optimization, VizBiz insights",
  openGraph: {
    title: "VizBiz Insights | AI Visibility for Car Dealerships",
    description:
      "Updates, data, and insights from VizBiz on AI visibility for car dealerships.",
    type: "website",
    url: "https://vizbiz.ai/insights",
  },
  alternates: {
    canonical: "https://vizbiz.ai/insights",
  },
};

const tweets = [
  {
    id: 1,
    text: "Ontario car dealerships score 11 out of 100 in AI visibility. That means ChatGPT, Gemini, and Google AI can't find most of them. We ran 84 prompts. 252 data points per dealership. The number is real. And it's bad.",
    date: "2026-04-18",
  },
  {
    id: 2,
    text: "47% of automotive search queries now show Google AI Overviews. Your Google Ads budget doesn't put you there. Your SEO doesn't either. This is a different game.",
    date: "2026-04-16",
  },
  {
    id: 3,
    text: "we ran 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity for Ontario dealerships. average score? 11 out of 100. the data is brutal.",
    date: "2026-04-14",
  },
  {
    id: 4,
    text: "30% of car buyers now start research with an AI chatbot. your google ads budget reaches the other 70%. your AI visibility budget? zero.",
    date: "2026-04-12",
  },
  {
    id: 5,
    text: "your dealership has zero JSON-LD schema. no Organization, no LocalBusiness, no FAQPage. we added all three. AI citations doubled in 2 weeks. easiest win nobody's taking.",
    date: "2026-04-10",
  },
];

export default function InsightsPage() {
  const socialSchema = {
    "@context": "https://schema.org",
    "@graph": tweets.map((tweet) => ({
      "@type": "SocialMediaPosting",
      "@id": `https://vizbiz.ai/insights#tweet-${tweet.id}`,
      author: {
        "@type": "Organization",
        name: "VizBiz",
        url: "https://vizbiz.ai",
        sameAs: "https://x.com/VizBizAI",
      },
      datePublished: tweet.date,
      headline: tweet.text.slice(0, 100),
      articleBody: tweet.text,
      sharedContent: {
        "@type": "WebPage",
        url: "https://x.com/VizBizAI",
      },
      publisher: {
        "@type": "Organization",
        name: "VizBiz",
        url: "https://vizbiz.ai",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(socialSchema) }}
      />
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SiteHeader ctaLabel="Get My Snapshot" />

        {/* Hero */}
        <section className="section-shell px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-18 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="mx-auto max-w-4xl">
            <div className="section-kicker">Insights</div>
            <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
              What We're Saying
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Data, findings, and takes on AI visibility for car dealerships — straight from the VizBiz team.
            </p>
          </div>
        </section>

        {/* Tweet Wall */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {tweets.map((tweet) => (
              <article
                key={tweet.id}
                className="rounded-[1.5rem] border border-[#25D1F2]/20 bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-[#25D1F2]/40 hover:bg-white/[0.05] sm:p-8"
              >
                <p className="text-base leading-8 text-slate-200 sm:text-lg">
                  {tweet.text}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="text-sm font-medium text-[#6d9fff]">
                    @VizBizAI
                  </span>
                  <time className="text-xs text-slate-500" dateTime={tweet.date}>
                    {new Date(tweet.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <a
                    href="https://x.com/VizBizAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto rounded-xl border border-[#25D1F2]/30 px-4 py-1.5 text-xs font-semibold text-[#6d9fff] transition hover:border-[#25D1F2]/60 hover:bg-[#25D1F2]/10"
                  >
                    View on X →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Follow CTA */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Follow us on X
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Real-time takes on AI visibility, dealership data, and what's changing in AI-driven search.
            </p>
            <div className="mt-8">
              <a
                href="https://x.com/VizBizAI"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button inline-block rounded-2xl px-8 py-3.5 text-sm font-semibold"
              >
                Follow @VizBizAI on X
              </a>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
              <div className="section-kicker">Get your snapshot</div>
              <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
                See Where Your Dealership Stands
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                Get your AI Visibility Snapshot — see how often AI recommends your dealership, where competitors rank higher, and what to fix first.
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
