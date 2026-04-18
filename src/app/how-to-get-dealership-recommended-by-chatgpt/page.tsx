import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "How to Get Your Dealership Recommended by ChatGPT | VizBiz",
  description:
    "Car buyers are asking AI for dealership recommendations. Learn the signals ChatGPT uses to pick dealerships and the steps you can take to get recommended more often.",
  alternates: {
    canonical: "https://vizbiz.ai/how-to-get-dealership-recommended-by-chatgpt",
  },
};

const buyerQueries = [
  "\"What's the best Toyota dealership near me?\"",
  "\"Where should I buy a used car in Chicago?\"",
  "\"Which dealer has the best financing for first-time buyers?\"",
  "\"Recommend a trustworthy dealership for a family SUV.\"",
];

const whyItMatters = [
  {
    title: "30% of car buyers now use AI for purchase research",
    body: "According to DealershipGuy (January 2026), nearly one in three car shoppers now consult AI platforms like ChatGPT during their buying journey. When AI names a specific dealership, that endorsement carries weight — it feels researched, not advertised. AI-sourced traffic converts at 4.4x the rate of traditional organic traffic (Ekho, February 2026), making every AI recommendation a high-intent lead.",
  },
  {
    title: "5–6 brands dominate AI recommendations in every market",
    body: "VizBiz's analysis of 84 buyer-intent prompts across major US markets found that ChatGPT typically names only 5 to 6 dealerships per query — and the same stores appear repeatedly. If your competitors appear in AI answers and you don't, those buyers are being steered toward their lots. Every missed recommendation is a lost floor visit.",
  },
  {
    title: "84% of dealerships score below 60 on AI visibility",
    body: "AI-driven search is not a trend that will pass — it is the new front door. Metricus (April 2026) reports 527% year-over-year growth in AI-driven automotive search traffic. Every major search engine is integrating generative answers. Dealerships that build strong AI signals now will compound their advantage as adoption grows.",
  },
];

const fiveSteps = [
  {
    title: "Make your business data consistent everywhere",
    body: "Business data consistency means your dealership's name, address, phone number, hours, and service descriptions match exactly across every online platform — your website, Google Business Profile, Yelp, Apple Maps, Facebook, and dozens of directories. ChatGPT cross-references all of these sources. If your information differs even slightly between sources, the AI loses confidence in recommending you. Start by auditing every listing and standardizing every field — including abbreviations, suite numbers, and hours of operation.",
  },
  {
    title: "Earn reviews that tell a story",
    body: "Review richness is the depth and specificity of what customers write in their reviews, not just star ratings. Generic five-star reviews (\"Great experience!\") do less for AI visibility than detailed ones. When a customer mentions the specific vehicle they bought, how the trade-in negotiation went, or how the finance team explained their options, that review becomes a rich signal AI can cite. Train your team to ask for specifics and make it easy — a follow-up text with a direct review link and a prompt like \"Tell us about your experience with [salesperson]\" works better than a generic request.",
  },
  {
    title: "Publish content that answers real buyer questions",
    body: "Content depth refers to having substantive, specific pages on your website that directly answer the questions car buyers ask. ChatGPT looks for dealerships that demonstrate expertise. Pages that answer questions like \"What does certified pre-owned actually cover?\", \"How does leasing vs. financing work in 2026?\", or \"What should I inspect on a used car before buying?\" give the AI material to cite when explaining why it recommends your store. Build an FAQ section on your site, create model comparison pages, and write service guides that reflect real buyer concerns.",
  },
  {
    title: "Strengthen your local authority",
    body: "Authority mentions are references to your dealership on third-party websites — local news, industry directories, community sites, and forums. These build the web of credibility AI systems use to assess trustworthiness. Mentions in local news, sponsorship of community events, participation in chamber of commerce activities, and industry certifications all contribute. If your dealership supports a local youth sports team, make sure that sponsorship is documented online. If you've won dealer excellence awards, feature them prominently. These aren't just marketing — they're signals.",
  },
  {
    title: "Measure, track, and adjust",
    body: "AI visibility measurement means systematically checking whether your dealership appears in AI-generated answers to buyer-intent queries. ChatGPT's behavior changes over time as models update and new information is indexed. Run the same buyer-intent queries monthly — \"best [make] dealer in [city]\", \"where to buy a used car near [neighborhood]\" — and track whether your dealership appears, how it's described, and which competitors surface. This is exactly what VizBiz automates, but even a manual spreadsheet is better than flying blind.",
  },
];

const faqItems = [
  {
    question: "How does ChatGPT decide which dealership to recommend?",
    answer:
      "ChatGPT synthesizes information from across the web — your website, reviews, directories, articles, and forum discussions. It evaluates the clarity, consistency, and depth of information about each dealership, then recommends the ones with the strongest signals. A Princeton GEO study found that source credibility, entity consistency, and content depth are the three strongest predictors of AI citation. There's no single factor; it's the overall quality of your web presence.",
  },
  {
    question: "Can I pay to get recommended by ChatGPT?",
    answer:
      "No. ChatGPT recommendations are based on organic signals, not paid placement. This is actually good news for dealerships — it means the playing field is determined by the quality of your presence, not your ad budget.",
  },
  {
    question: "How long before I see results from GEO efforts?",
    answer:
      "Fixing inconsistent business data can show results within weeks. Building review depth and content authority typically takes 60–90 days of consistent effort. The key is starting now — every month you wait is a month competitors are building their advantage.",
  },
  {
    question: "Is GEO the same as SEO for dealerships?",
    answer:
      "Related, but not the same. Traditional SEO focuses on ranking in Google's link-based search results. ChatGPT visibility depends on how clearly and consistently your dealership is represented across the entire web — including review platforms, directories, and content quality. Many dealerships with good SEO still have weak AI visibility because the signals are different. VizBiz's analysis found 84% of dealerships scoring below 60 on AI visibility despite many having solid Google rankings.",
  },
  {
    question: "What about Google AI Overviews and Perplexity?",
    answer:
      "The same principles apply. Each AI platform has its own weighting, but consistent business data, detailed reviews, and strong content benefit you across all of them. VizBiz tracks your visibility across ChatGPT, Google AI Overviews, Perplexity, and other platforms so you can see where you're strong and where you need work.",
  },
  {
    question: "How do I check if ChatGPT is already recommending my dealership?",
    answer:
      "Open ChatGPT and ask it the same questions your customers would: \"What's the best [your make] dealership in [your city]?\" or \"Where should I buy a used car near [your neighborhood]?\" See if your store comes up. For a comprehensive analysis across dozens of queries and multiple AI platforms, get a free VizBiz AI Visibility Snapshot.",
  },
];

export default function HowToGetDealershipRecommendedByChatGPTPage() {
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
          <div className="section-kicker">AI recommendations guide</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            How to Get Your Dealership Recommended by ChatGPT
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              When car buyers ask AI for a dealership recommendation, someone gets named. The question is whether it's your store.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Buyers are already typing things like:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {buyerQueries.map((prompt) => (
                <li key={prompt} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              ChatGPT responds with specific dealership names, and buyers act on those recommendations. <strong className="text-white">VizBiz's analysis of 84 buyer-intent prompts</strong> across major US markets found that ChatGPT typically names only 5 to 6 dealerships per query. This guide covers the signals ChatGPT uses and the five steps you can take to earn that recommendation more often.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For the technical breakdown of how ChatGPT selects dealerships, see our guide to <Link href="/chatgpt-car-dealership-recommendations/" className="text-[var(--neon-cyan)] hover:text-white">ChatGPT car dealership recommendations</Link>. For the broader AI visibility landscape, see <Link href="/ai-visibility-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">AI visibility for automotive retailers</Link>.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--neon-cyan)]">Key Takeaways</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span><strong className="text-white">30% of car buyers</strong> now use AI for purchase research (DealershipGuy, Jan 2026)</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>ChatGPT names only <strong className="text-white">5–6 dealerships</strong> per query — narrow winner-take-most</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>Five actionable steps: fix entity data, earn story-rich reviews, publish buyer Q&A content, build local authority, and track monthly</span></li>
                <li className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" /><span>AI-sourced traffic converts at <strong className="text-white">4.4x the rate</strong> of traditional organic (Ekho, Feb 2026)</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why Should Dealerships Care About AI Recommendations Now?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI-driven search isn't a future problem. It's a today problem. Here's why dealerships need to pay attention now:
            </p>
            <div className="mt-6 space-y-5">
              {whyItMatters.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Are the 5 Steps to Get Recommended by ChatGPT?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              These are the highest-impact actions, ordered by effort-to-reward ratio:
            </p>
            <div className="mt-6 space-y-5">
              {fiveSteps.map((item, index) => (
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
              How Does VizBiz Help You Get Recommended?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Most dealerships don't have the bandwidth to run dozens of AI queries every month, track competitor movements, and manually audit every directory listing. VizBiz handles the measurement and guidance:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Runs buyer-intent queries across ChatGPT, Google AI Overviews, Perplexity, and other AI platforms</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Tracks your visibility over time and benchmarks against local competitors</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Scores your presence across reviews, content, entity consistency, and services</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />Delivers a prioritized action plan so your team knows exactly what to fix first</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Start with a free <Link href="/intake/" className="text-[var(--neon-cyan)] hover:text-white">AI Visibility Snapshot</Link> to see where your dealership stands today. For a deep-dive analysis, explore the <Link href="/ai-visibility-audit-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">full AI Visibility Audit</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Free snapshot</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Is ChatGPT Recommending Your Dealership?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Get a clear report showing which AI platforms mention your dealership, how you're described, and where competitors are being surfaced instead.
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
