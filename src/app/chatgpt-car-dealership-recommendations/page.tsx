import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "ChatGPT Car Dealership Recommendations — How They Work | VizBiz",
  description:
    "Understand how ChatGPT decides which car dealerships to recommend, what buyers see when they ask AI for car advice, and how your dealership can earn more AI-driven recommendations.",
  alternates: {
    canonical: "https://vizbiz.ai/chatgpt-car-dealership-recommendations",
  },
};

const buyerExamples = [
  {
    query: "\"What's a good dealership for buying a used Toyota Camry?\"",
    context: "Buyer comparing options, looking for a trusted recommendation",
  },
  {
    query: "\"Which dealer near me has the best financing for first-time buyers?\"",
    context: "Buyer with specific financial needs, ready to act",
  },
  {
    query: "\"Recommend a reliable dealership for certified pre-owned vehicles.\"",
    context: "Buyer who values quality assurance and is willing to pay for it",
  },
  {
    query: "\"Where should I take my car for service — dealer or independent shop?\"",
    context: "Owner deciding where to invest in maintenance",
  },
];

const howItWorks = [
  {
    title: "Information gathering",
    body: "ChatGPT draws from a broad set of sources: your website, Google Business Profile, review platforms (Google, Yelp, DealerRater), automotive directories, local publications, forum discussions, and social media mentions. It's not limited to one source — it synthesizes across many.",
  },
  {
    title: "Signal evaluation",
    body: "The model evaluates clarity, consistency, and depth of information. A dealership with detailed reviews, comprehensive service descriptions, clear inventory structure, and consistent business data across platforms presents a stronger, more confident signal than one with scattered or thin information.",
  },
  {
    title: "Contextual matching",
    body: "ChatGPT matches the buyer's question to the most relevant dealerships based on the signals it finds. A buyer asking about certified pre-owned will get different recommendations than one asking about used cars under $20K. The more specifically your content addresses different buyer scenarios, the more entry points you create.",
  },
  {
    title: "Confidence-weighted output",
    body: "ChatGPT recommends dealerships it can describe with confidence. If your dealership has clear, consistent information across multiple sources, the model can reference specifics — your makes, your services, your strengths. If information is sparse or contradictory, the model may skip you even if you're a good fit.",
  },
];

const whatBuyersSee = [
  "Named dealership recommendations, often 2–5 options per answer",
  "Brief descriptions of each dealership — makes carried, specialties, review highlights",
  "Comparisons between options when the buyer asks for \"the best\" or \"which should I choose\"",
  "Pricing guidance and financing context drawn from published information",
  "Service and maintenance advice that may or may not include your dealership",
];

const influenceSteps = [
  {
    title: "Make your core information unambiguous",
    body: "Your dealership's name, location, makes carried, and primary services should be immediately clear on your homepage and consistent across every platform. AI systems need to confidently identify who you are and what you offer before they can recommend you.",
  },
  {
    title: "Earn detailed reviews that tell a story",
    body: "Encourage customers to share specifics: what they bought, how the process felt, what surprised them. A review that says \"Bought a 2023 RAV4 here last month — sales team was upfront about pricing, financing was straightforward, and they threw in first service free\" is exponentially more useful to AI than \"Great dealer, highly recommend.\"",
  },
  {
    title: "Cover the full buyer journey in your content",
    body: "ChatGPT gets asked about every stage — research, comparison, financing, purchase, and service. Dealerships with content addressing each stage give the model more opportunities to recommend them across different types of buyer queries.",
  },
  {
    title: "Differentiate your dealership clearly",
    body: "What makes your store different? Family-owned for 30 years? Largest certified pre-owned selection in the region? Specialize in commercial fleet? Whatever your differentiator, make it prominent and specific. Generic \"we pride ourselves on customer service\" language doesn't give AI systems anything specific to recommend.",
  },
  {
    title: "Monitor and track your AI recommendations",
    body: "You can't optimize what you don't measure. Regularly check what ChatGPT and other AI platforms say about your dealership. Track which competitors appear alongside you, which queries you're missing from, and how your recommendations change over time. VizBiz automates this entire tracking process.",
  },
];

const opportunityPoints = [
  "Most dealerships have not yet optimized for AI search — the competitive landscape is still forming",
  "ChatGPT usage among car buyers is growing, especially for research and comparison phases",
  "AI recommendations influence buyers before they ever visit your website or walk onto your lot",
  "The dealerships that invest now are building lasting visibility advantages that compound over time",
  "Unlike traditional SEO, AI visibility improvements can often be achieved without major technical overhauls — it's more about clarity, consistency, and content depth",
];

const faqItems = [
  {
    question: "How does ChatGPT decide which dealerships to recommend?",
    answer:
      "ChatGPT synthesizes information from across the web — your website, reviews, directories, and other public sources — and recommends dealerships with the clearest, most consistent, and most detailed signals. It evaluates what you sell, where you are, what customers say about you, and how well your content answers buyer questions.",
  },
  {
    question: "Does ChatGPT recommend specific dealerships by name?",
    answer:
      "Yes. When buyers ask about where to buy a car, which dealer to trust, or where to find a specific type of vehicle, ChatGPT frequently names specific dealerships along with brief descriptions of their strengths.",
  },
  {
    question: "Can I influence what ChatGPT says about my dealership?",
    answer:
      "Yes, by strengthening the signals ChatGPT draws from: consistent business information, detailed reviews, comprehensive content, and clear differentiation. The more specific and consistent your web presence, the more confidently AI can recommend and describe your dealership.",
  },
  {
    question: "Is this the same as advertising on ChatGPT?",
    answer:
      "No. These are organic recommendations based on publicly available information, not paid placements. You earn visibility through the strength and clarity of your signals, not by buying ads.",
  },
  {
    question: "How do I track my ChatGPT visibility?",
    answer:
      "VizBiz runs automated queries across ChatGPT and other AI platforms to measure how often your dealership appears, how it's described, which competitors show up instead, and how all of this changes over time. Start with a free AI Visibility Snapshot.",
  },
];

export default function ChatgptCarDealershipRecommendationsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">ChatGPT recommendations</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            How ChatGPT Recommends Car Dealerships
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              When a car buyer asks ChatGPT for a dealership recommendation, the answer isn't random — it's built from signals your dealership puts out across the web. Understanding how this works gives you a clear path to earning more of those recommendations.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This is a growth opportunity, not a threat. The dealerships that understand and act on AI visibility now are the ones that will be recommended consistently as buyer behavior continues to shift toward AI-driven research.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For step-by-step actions, see <Link href="/how-to-show-up-in-chatgpt-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">how to show up in ChatGPT recommendations</Link>. For the broader AI optimization framework, see <Link href="/ai-search-optimization-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">AI search optimization for car dealerships</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Buyers Ask ChatGPT About Dealerships
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Car buyers are using ChatGPT across every stage of the purchase journey:
            </p>
            <div className="mt-6 space-y-5">
              {buyerExamples.map((item) => (
                <div key={item.query} className="metric-row rounded-2xl p-5">
                  <p className="text-base font-semibold">{item.query}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.context}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Each of these queries produces different recommendations. The more your dealership's content addresses specific buyer scenarios, the more types of queries you'll appear in.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How ChatGPT Builds Its Recommendations
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              ChatGPT doesn't maintain a list of preferred dealerships. Instead, it builds recommendations in real time by synthesizing publicly available information. Here's a simplified version of how the process works:
            </p>
            <div className="mt-6 space-y-5">
              {howItWorks.map((item, index) => (
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
              What Buyers Actually See
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              When a buyer asks ChatGPT about dealerships, the response typically includes:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {whatBuyersSee.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Every element of that answer is drawn from publicly available information. If your dealership isn't represented clearly in those sources, it won't be represented in the answer — regardless of how good your actual operation is.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How to Influence ChatGPT's Recommendations
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This isn't about gaming the system — it's about making your dealership's real strengths visible and interpretable. Here are the highest-impact actions:
            </p>
            <div className="mt-6 space-y-5">
              {influenceSteps.map((item, index) => (
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
              Why This Is an Opportunity Right Now
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The AI recommendation landscape for dealerships is still early. Here's why acting now matters:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {opportunityPoints.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              To see where you stand today, start with a VizBiz AI Visibility Snapshot. For the complete diagnostic, explore the <Link href="/ai-visibility-audit-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">AI Visibility Audit for automotive retailers</Link>. For broader context on how dealerships appear in AI search, visit <Link href="/how-dealerships-show-up-in-ai-search/" className="text-[var(--neon-cyan)] hover:text-white">how dealerships show up in AI search</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Get your snapshot</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              See What ChatGPT Says About Your Dealership
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Find out how your dealership appears in ChatGPT and other AI platforms — and get a clear plan to improve your visibility.
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
  );
}
