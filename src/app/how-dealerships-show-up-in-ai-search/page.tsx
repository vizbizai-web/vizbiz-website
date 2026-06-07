import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "How Local Businesses Show Up in AI Search | VizBiz",
  description:
    "Learn how AI systems choose which local businesses to mention, which signals shape visibility, and what you can improve first.",
  alternates: {
    canonical: "https://vizbiz.ai/how-dealerships-show-up-in-ai-search/",
  },
};

const introSignals = [
  "best plumber near me",
  "where should I get my roof fixed",
  "best family dentist in my area",
];

const aiSelectionSignals = [
  {
    title: "Service clarity",
    body: "Service pages, pricing, specialties, and categories need to be structured in a way AI systems can interpret.",
  },
  {
    title: "Review and trust signals",
    body: "Businesses with stronger review quality, recency, and trust language are more likely to be surfaced in recommendation-style prompts.",
  },
  {
    title: "Offer and specialty explanation",
    body: "Services, guarantees, warranties, and unique benefits need to be clearly explained, not buried in thin pages.",
  },
  {
    title: "FAQ and answer-style content",
    body: "AI systems reward sites that answer real customer questions in a clear and structured way.",
  },
  {
    title: "Entity consistency",
    body: "Business name, location, service categories, and core facts need to be consistent across the web.",
  },
];

const weakSignals = [
  "generic website content with little explanation",
  "services that are hard to crawl or interpret",
  "thin pages for key offerings",
  "inconsistent reviews and trust signals",
  "missing FAQ coverage for customer-intent questions",
];

const improvementActions = [
  {
    title: "Make services easier to interpret",
    body: "Use cleaner page structure, clear service-level organization, readable descriptions, and current pricing/availability signals.",
  },
  {
    title: "Strengthen review and trust signals",
    body: "Improve review quality, volume, recency, and visible trust language on key pages.",
  },
  {
    title: "Explain services and offers clearly",
    body: "Service, pricing, guarantee, and specialty pages should explain what the business offers in plain customer language.",
  },
  {
    title: "Publish stronger FAQ coverage",
    body: "Answer the real questions customers ask about pricing, process, reliability, and how to choose.",
  },
  {
    title: "Improve consistency across the web",
    body: "Keep business identity, location, and service details consistent across the website and external platforms.",
  },
];

const faqItems = [
  {
    question: "How do local businesses show up in AI search?",
    answer:
      "Local businesses show up when AI systems can clearly understand services, trust signals, content, and local relevance.",
  },
  {
    question: "What signals matter most for business AI visibility?",
    answer:
      "Service clarity, review quality, content explanations, FAQ coverage, and entity consistency are some of the strongest signals.",
  },
  {
    question: "Why do some businesses get recommended and others do not?",
    answer:
      "AI systems tend to surface businesses with stronger structured information, clearer trust signals, and better answer coverage for customer-intent questions.",
  },
  {
    question: "What can a local business do to improve AI visibility?",
    answer:
      "Improve service page structure, review signals, content and FAQ coverage, and consistency across platforms.",
  },
];

export default function HowLocalBusinessesShowUpInAiSearchPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">AI search guide</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            How Local Businesses Show Up in AI Search
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI systems do not choose which businesses to mention by accident.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              When someone asks:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {introSignals.map((prompt) => (
                <li key={prompt} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>"{prompt}"</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI tools look for signals that help them decide which businesses are credible, relevant, and useful to mention.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For the category-level overview, see <Link href="/ai-visibility-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">AI visibility for local businesses</Link>. For the commercial deliverable, see the <Link href="/intake/?utm_source=site&utm_medium=cta-button&utm_campaign=how-dealerships-ai-search" className="text-[var(--neon-cyan)] hover:text-white">AI Visibility Audit for local businesses</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How AI Systems Choose Which Businesses to Mention
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI systems pull from patterns, not just keywords.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              They are more likely to mention businesses when the underlying signals are clear, structured, and easy to trust.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {aiSelectionSignals.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why Some Businesses Earn More Visibility Than Others
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Most businesses are not held back by one single issue.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              More often, visibility lags because several weaker signals add up over time.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Common visibility gaps include:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {weakSignals.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              When those signals are weaker, AI systems have less confidence recommending the business consistently.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Signals Matter Most
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The signals that matter most are the ones that help AI understand three things:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />what the business offers</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />why it can be trusted</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />how relevant it is to the local customer's question</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              That is why service pages, reviews, FAQ coverage, content depth, and entity consistency matter so much.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Local Businesses Can Do to Improve Visibility
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Businesses improve AI visibility when they make their information easier to interpret, easier to trust, and easier to connect to local customer intent.
            </p>
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
              See how your business appears in AI-driven search, where competitors are being surfaced instead, and what to fix first.
            </p>
            <div className="mt-8">
              <Link href="/intake/?utm_source=site&utm_medium=cta-button&utm_campaign=how-dealerships-ai-search" className="premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold">
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
