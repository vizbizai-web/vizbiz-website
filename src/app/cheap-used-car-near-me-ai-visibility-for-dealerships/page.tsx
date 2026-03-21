import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Cheap Used Car Near Me: AI Visibility for Dealerships | VizBiz",
  description:
    "Learn why affordability prompts matter for dealerships and how inventory, pricing, financing, and local relevance shape AI visibility.",
};

const buyerIntentPrompts = [
  "cheap used car near me",
  "affordable used cars in [city]",
  "used [make model] near me",
  "best place to buy a used [make] in [city]",
];

const visibilityFactors = [
  {
    title: "Inventory structure",
    body: "Vehicles, pricing, make/model labels, and condition details need to be easy for AI and search systems to interpret.",
  },
  {
    title: "Pricing clarity",
    body: "If affordability and pricing information are weak, inconsistent, or hard to read, the dealership is less likely to show up for price-sensitive queries.",
  },
  {
    title: "Financing content",
    body: "Buyers asking affordability questions are often also evaluating financing. Weak financing content makes visibility less competitive.",
  },
  {
    title: "Local relevance",
    body: "Inventory pages, used-car pages, and affordability pages need clear city and market signals.",
  },
  {
    title: "Used inventory theme coverage",
    body: "Theme pages like used cars under a budget, used SUVs in a city, or used [make] inventory help AI understand the dealership’s relevance for buyer-intent prompts.",
  },
];

const whyDealersMiss = [
  "used inventory is difficult to crawl or understand",
  "pricing and affordability signals are weak",
  "there is little content tied to buyer budget questions",
  "financing pages are thin or generic",
  "inventory pages lack local relevance and supporting category pages",
];

const revenueReasons = [
  "Price-sensitive buyers are still high-intent buyers.",
  "Used-car discovery often happens early in the purchase journey.",
  "When competitors appear first for affordability queries, they often gain the first look, first click, and first visit.",
  "Visibility for used and affordable inventory prompts can directly affect actual sales opportunities, not just traffic.",
];

const improvementActions = [
  {
    title: "Create stronger affordability and used-inventory theme pages",
    body: "Pages like used cars under a budget threshold or used SUVs in a city help connect real buyer queries to live inventory.",
  },
  {
    title: "Make pricing and vehicle details easier to interpret",
    body: "Titles, descriptions, condition, and pricing need to be readable and current.",
  },
  {
    title: "Improve financing support content",
    body: "Affordability queries are often tied to financing questions. Strong finance explanations improve recommendation likelihood.",
  },
  {
    title: "Strengthen local inventory relevance",
    body: "Used inventory pages should reinforce city, market, and local buying context.",
  },
];

const faqItems = [
  {
    question: "Why does 'cheap used car near me' matter for dealerships?",
    answer:
      "Because it is a high-intent affordability prompt that can directly influence where buyers look first when searching for used inventory.",
  },
  {
    question: "Why do many dealerships not appear for price-sensitive AI queries?",
    answer:
      "They often lack strong affordability pages, clear inventory structure, pricing clarity, financing content, and local inventory relevance.",
  },
  {
    question: "How does inventory visibility affect AI search inclusion?",
    answer:
      "AI systems are more likely to include dealerships whose inventory is easier to interpret, locally relevant, and clearly aligned with buyer-intent prompts.",
  },
  {
    question: "How can dealerships improve visibility for affordability prompts?",
    answer:
      "Improve inventory structure, pricing clarity, financing content, local relevance, and theme pages built around buyer budget and used-car intent.",
  },
];

export default function CheapUsedCarNearMeAiVisibilityForDealershipsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">Affordability visibility</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            Cheap Used Car Near Me: AI Visibility for Dealerships
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Prompts like “cheap used car near me” matter because they reveal real buyer intent tied to affordability, used inventory, and immediate sales opportunities dealerships can capture.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Common examples include:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {buyerIntentPrompts.map((prompt) => (
                <li key={prompt} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If a dealership does not appear for these searches, it can miss buyers who are already close to action and ready to compare options.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For the broader category view, read <Link href="/ai-visibility-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">AI visibility for automotive retailers</Link>. For the signals behind these outcomes, see <Link href="/how-dealerships-show-up-in-ai-search" className="text-[var(--neon-cyan)] hover:text-white">how dealerships show up in AI search</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why These Prompts Matter
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Affordability prompts are not low-value traffic. They often represent real buyers comparing realistic options, monthly payment pressure, and used inventory nearby.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For many dealerships, used and affordable inventory is one of the clearest paths to actual sales volume. That makes AI visibility in these prompts commercially important.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How Affordability and Inventory Visibility Affect AI Search Inclusion
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {visibilityFactors.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why Many Dealerships Appear Less Often
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Many dealerships show up less often because the signals supporting affordability and used-inventory discovery are not yet strong enough.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The <Link href="/ai-visibility-audit-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">AI Visibility Audit for automotive retailers</Link> shows whether these affordability gaps are giving competitors an advantage in visibility.
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {whyDealersMiss.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why This Matters for Actual Sales Opportunities
            </h2>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {revenueReasons.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Dealerships Can Do to Improve Visibility
            </h2>
            <div className="mt-6 space-y-5">
              {improvementActions.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Get your snapshot</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Get Your AI Visibility Snapshot
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              See whether your dealership is showing up for used inventory, affordability, financing, and competitor-sensitive buyer prompts.
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
