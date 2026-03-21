import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "AI Visibility for Car Dealerships | Automotive Retailers Guide | VizBiz",
  description:
    "Learn what AI visibility means for dealerships, which signals matter most, and how automotive retailers can improve how often they appear in AI-driven search.",
};

const introPrompts = [
  "best dealership near me",
  "where should I buy a used SUV",
  "which dealership has the best service",
];

const showUpSignals = [
  {
    title: "Clear inventory structure",
    body: "Vehicles, trims, pricing, and categories are easy to interpret",
  },
  {
    title: "Strong review signals",
    body: "Consistent, detailed, and recent reviews",
  },
  {
    title: "Defined services",
    body: "Service, financing, warranties clearly explained",
  },
  {
    title: "FAQ coverage",
    body: "Answers to real buyer questions",
  },
  {
    title: "Consistent entity signals",
    body: "Same business info across platforms",
  },
];

const visibilityFactors = [
  {
    title: "Inventory Visibility",
    points: [
      "Are vehicles clearly structured?",
      "Is data consistent and readable?",
    ],
  },
  {
    title: "Review Signals",
    points: [
      "Volume, recency, and detail",
      "Do reviews mention real experiences?",
    ],
  },
  {
    title: "Entity Clarity",
    points: [
      "Name, address, phone consistency",
      "Brand identity across platforms",
    ],
  },
  {
    title: "FAQ Coverage",
    points: [
      "Are common buyer questions answered?",
      "Is content structured clearly?",
    ],
  },
  {
    title: "Service & Offer Content",
    points: [
      "Financing, warranties, service pages",
      "Clear explanations of offerings",
    ],
  },
];

const faqItems = [
  {
    question: "What is AI visibility for automotive retailers?",
    answer:
      "AI visibility is how often your dealership appears in AI-generated answers based on your data, content, and signals.",
  },
  {
    question: "How do dealerships show up in ChatGPT results?",
    answer:
      "They appear when their information is clear, structured, and supported by strong signals like reviews, inventory, and content.",
  },
  {
    question: "Does SEO affect AI visibility?",
    answer:
      "Yes, but AI visibility goes beyond SEO. It requires structured, explainable, and consistent information.",
  },
  {
    question: "How can I improve AI visibility?",
    answer:
      "Improve inventory structure, review quality, FAQ coverage, service clarity, and entity consistency.",
  },
];

export default function AiVisibilityForCarDealershipsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">AI visibility guide</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            AI Visibility for Automotive Retailers
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Many automotive retailers have a meaningful opportunity to strengthen how they appear in AI-driven search.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              When someone asks ChatGPT, Google SGE, or Perplexity:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {introPrompts.map((prompt) => (
                <li key={prompt} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>“{prompt}”</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Your dealership may appear less often than it should.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI visibility determines whether your dealership is included in those answers.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If you want the operational view, see <Link href="/how-dealerships-show-up-in-ai-search" className="text-[var(--neon-cyan)] hover:text-white">how dealerships show up in AI search</Link>. If you want the commercial offer, see the <Link href="/ai-visibility-audit-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">AI Visibility Audit for automotive retailers</Link>. If you want direct answers to common dealership questions, use the <Link href="/faq-ai-visibility-for-car-dealerships" className="text-[var(--neon-cyan)] hover:text-white">FAQ hub</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What is AI Visibility?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI visibility is how often your dealership appears in answers generated by AI systems.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Unlike traditional SEO, AI doesn’t just rank websites — it selects and synthesizes sources.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If your dealership:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />lacks structured inventory data</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />has weak or inconsistent reviews</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />doesn’t clearly explain services</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />is missing FAQ content</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI systems are less likely to include the dealership consistently.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How Dealerships Show Up in AI Search
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI systems pull from patterns, not just keywords.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Dealerships show up when they have:
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {showUpSignals.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Affects AI Visibility for Dealers
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              VizBiz evaluates AI visibility across 5 core categories:
            </p>
            <div className="mt-6 space-y-5">
              {visibilityFactors.map((item, index) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {item.title}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why Some Dealerships Show Up Less Often
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Many dealerships still rely on:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />basic inventory feeds</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />generic website content</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />scattered reviews</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              But AI systems need:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />structured information</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />clear explanations</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />consistent signals</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Without that, your dealership is less likely to earn consistent inclusion in AI-generated answers.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What an AI Visibility Audit Shows
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              A VizBiz audit reveals:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />where your dealership already appears and where it has room to grow</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />which competitors are being selected instead</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />which categories need attention</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />what changes will increase visibility</li>
            </ul>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Example (Simplified)
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              A dealership may have:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />strong inventory</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />but weak FAQ coverage</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Result:
            </p>
            <p className="mt-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI may understand what you sell, but still need stronger signals before recommending you more often.
            </p>
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
              See how your dealership performs across:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />inventory</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />reviews</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />services</li>
              <li className="flex items-start gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />AI inclusion likelihood</li>
            </ul>
            <div className="mt-6 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              <p>Identify opportunities</p>
              <p>See competitors</p>
              <p>Get actionable recommendations</p>
            </div>
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
