import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "AI Search Optimization for Car Dealerships | GEO & AEO Guide | VizBiz",
  description:
    "Learn what AI search optimization (GEO and AEO) means for car dealerships, how it differs from traditional SEO, practical strategies to improve AI visibility, and how to measure results.",
  alternates: {
    canonical: "https://vizbiz.ai/ai-search-optimization-for-car-dealerships",
  },
};

const buyerQueries = [
  "\"Which dealership in my area has the best certified pre-owned program?\"",
  "\"Where can I get a reliable used SUV under $25,000?\"",
  "\"What's the best dealer for Honda service near me?\"",
  "\"Which dealership should I trust for my first car purchase?\"",
];

const seoVsGeo = [
  {
    dimension: "Goal",
    seo: "Rank on page 1 of Google",
    geo: "Be included in AI-generated answers and recommendations",
  },
  {
    dimension: "Mechanism",
    seo: "Keyword relevance, backlinks, technical signals",
    geo: "Content clarity, entity consistency, review depth, answer coverage",
  },
  {
    dimension: "Output",
    seo: "Blue link in search results",
    geo: "Named recommendation within a synthesized answer",
  },
  {
    dimension: "Trust signals",
    seo: "Domain authority, link profile",
    geo: "Review substance, NAP consistency, content specificity",
  },
  {
    dimension: "Content focus",
    seo: "Target keywords and search intent",
    geo: "Answer real buyer questions comprehensively",
  },
  {
    dimension: "Measurement",
    seo: "Rank tracking, organic traffic",
    geo: "AI mention frequency, recommendation accuracy, competitor overlap",
  },
];

const geoStrategies = [
  {
    title: "Strengthen entity consistency across platforms",
    body: "Your dealership name, address, phone number, hours, makes carried, and key services should be identical everywhere — your website, Google Business Profile, Apple Maps, Yelp, Facebook, Bing Places, and industry directories. AI systems cross-reference these sources. Inconsistencies erode confidence.",
    action: "Audit your listings on the top 10 platforms your buyers use. Fix every discrepancy.",
  },
  {
    title: "Build review depth, not just volume",
    body: "AI systems read review content, not just star counts. A review that says \"Great experience buying my Civic here — the financing team got me 4.9% with no hassle\" gives ChatGPT specific, credible material to reference. Generic five-star reviews contribute far less.",
    action: "Ask recent customers to mention what they bought, how the process went, and what stood out. Respond to reviews thoughtfully — the responses themselves become content AI can reference.",
  },
  {
    title: "Create comprehensive FAQ and buyer-guide content",
    body: "AI systems look for sites that answer questions thoroughly. Build content around the questions buyers actually ask: financing terms, trade-in value, certified pre-owned benefits, warranty coverage, service intervals, and model comparisons. Each page should be genuinely useful, not keyword-stuffed.",
    action: "List the 20 most common questions your sales and service teams hear. Build dedicated content for the top 10.",
  },
  {
    title: "Make inventory data clean and interpretable",
    body: "AI crawlers need to understand your inventory — makes, models, years, price ranges, conditions (new/used/CPO), and availability. Poorly structured inventory pages or heavy JavaScript rendering can make this information invisible to AI systems.",
    action: "Ensure your vehicle listing pages use clear, readable structure — descriptive titles, visible pricing, trim-level organization, and straightforward navigation.",
  },
  {
    title: "Publish detailed service and specialty content",
    body: "Many dealerships have a single paragraph about their service department. AI systems reward dealerships that explain what they offer in detail — maintenance packages, certified technicians, specialty services, hours, and what makes their service experience different.",
    action: "Expand your service page into a real resource. Add sub-pages for maintenance, repairs, parts, and any specialties your store offers.",
  },
];

const measurementFramework = [
  {
    title: "AI mention frequency",
    body: "How often does your dealership appear when buyers ask AI platforms about dealers in your market? Track this across ChatGPT, Google AI Overviews, Perplexity, and Gemini.",
  },
  {
    title: "Competitor overlap",
    body: "Which competitors appear alongside or instead of you? Understanding who you're competing against in AI answers is different from traditional rank tracking.",
  },
  {
    title: "Category coverage",
    body: "Are you appearing for the full range of buyer-intent queries — new sales, used sales, service, certified pre-owned, financing — or only certain categories?",
  },
  {
    title: "Recommendation quality",
    body: "When your dealership is mentioned, how is it described? Accurate and positive? Outdated? Missing key details? The quality of the mention matters as much as the frequency.",
  },
  {
    title: "Trend over time",
    body: "AI visibility fluctuates as models update and as your competitors improve their own signals. Monthly or quarterly tracking reveals whether your efforts are producing results.",
  },
];

const faqItems = [
  {
    question: "What is AI search optimization for car dealerships?",
    answer:
      "AI search optimization (sometimes called GEO — Generative Engine Optimization, or AEO — Answer Engine Optimization) is the practice of improving how often and how accurately your dealership appears in AI-generated answers from tools like ChatGPT, Google AI Overviews, and Perplexity.",
  },
  {
    question: "Is AI search optimization replacing traditional SEO?",
    answer:
      "Not replacing — expanding. Traditional SEO still drives Google traffic. But AI search is a growing discovery channel that requires its own strategy. Dealerships that invest in both will have the strongest overall presence.",
  },
  {
    question: "How long does it take to see results from GEO?",
    answer:
      "Quick wins like fixing inconsistent business data can show results within weeks. Content and review strategies typically take 60–90 days to produce measurable changes in AI visibility.",
  },
  {
    question: "Can I do AI search optimization myself?",
    answer:
      "Some elements — like fixing directory listings and encouraging better reviews — can be handled in-house. The measurement layer is harder to do manually because it requires running dozens of queries across multiple AI platforms on a regular cadence. That's where VizBiz helps.",
  },
  {
    question: "How do I measure AI search visibility?",
    answer:
      "Track how often your dealership appears in AI-generated answers, which competitors show up instead, what categories you're strong or weak in, and how all of this changes over time. VizBiz automates this tracking across all major AI platforms.",
  },
];

export default function AiSearchOptimizationForCarDealershipsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">AI search optimization</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            AI Search Optimization for Car Dealerships
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Buyers are no longer just Googling \"dealership near me.\" They're asking AI platforms for personalized recommendations — and getting specific, named answers.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Queries like:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {buyerQueries.map((query) => (
                <li key={query} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{query}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI search optimization — sometimes called GEO (Generative Engine Optimization) or AEO (Answer Engine Optimization) — is about making sure your dealership is one of those answers.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For the full category overview, see <Link href="/ai-visibility-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">AI visibility for automotive retailers</Link>. For ChatGPT-specific strategies, see <Link href="/how-to-show-up-in-chatgpt-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">how to show up in ChatGPT recommendations</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Traditional SEO vs. AI Search Optimization
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If you've been investing in SEO, good — that foundation still matters. But AI search optimization addresses a different layer of buyer discovery. Here's how they compare:
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 pr-4 font-semibold text-[var(--text-secondary)]">Dimension</th>
                    <th className="pb-4 pr-4 font-semibold text-[var(--text-secondary)]">Traditional SEO</th>
                    <th className="pb-4 font-semibold text-[var(--text-secondary)]">AI Search (GEO/AEO)</th>
                  </tr>
                </thead>
                <tbody>
                  {seoVsGeo.map((row) => (
                    <tr key={row.dimension} className="border-b border-white/6">
                      <td className="py-4 pr-4 font-semibold">{row.dimension}</td>
                      <td className="py-4 pr-4 text-[var(--text-secondary)]">{row.seo}</td>
                      <td className="py-4 text-[var(--text-secondary)]">{row.geo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The key difference: SEO earns you a blue link. AI search optimization earns you a named recommendation inside a conversational answer. Both drive real buyers — but the AI layer is growing fast, and most dealerships haven't optimized for it yet.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Practical Strategies for Dealership AI Search Optimization
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              These are the highest-impact actions most dealerships can take, roughly in order of effort and return:
            </p>
            <div className="mt-6 space-y-5">
              {geoStrategies.map((item, index) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                  <p className="mt-3 text-sm leading-7 font-medium text-[var(--neon-cyan)]">Action: {item.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How to Measure AI Search Visibility
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              You can't improve what you don't measure. A proper AI visibility measurement framework tracks these dimensions:
            </p>
            <div className="mt-6 space-y-5">
              {measurementFramework.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              VizBiz automates all of this. Each audit covers dozens of buyer-intent queries across multiple AI platforms, giving you a clear scorecard and prioritized action plan. See a <Link href="/sample-ai-visibility-report-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">sample report</Link> to understand the output.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why Most Dealerships Haven't Started Yet
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI search is still new enough that most dealerships — and most agencies serving dealerships — haven't built a strategy for it. That's actually good news if you move now.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The dealerships that invest in AI visibility today are building an advantage that compounds over time. Every review you earn, every piece of content you publish, every consistency fix you make strengthens the signals AI systems rely on. Early movers are showing up in AI recommendations while competitors are still invisible.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For more on the broader opportunity, read <Link href="/how-dealerships-show-up-in-ai-search" className="text-[var(--neon-cyan)] hover:text-white">how dealerships show up in AI search</Link>. For answers to common questions, visit the <Link href="/faq-ai-visibility-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">FAQ hub</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Get your snapshot</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Measure Your Dealership's AI Search Visibility
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              See how your dealership performs across AI platforms, where competitors are being recommended instead, and what to optimize first.
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
  );
}
