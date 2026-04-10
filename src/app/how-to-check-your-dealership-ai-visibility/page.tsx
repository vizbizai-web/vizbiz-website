import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "How to Check Your Dealership's AI Visibility | Step-by-Step Guide | VizBiz",
  description:
    "A practical guide for car dealerships to test how they appear in ChatGPT, Google AI Overviews, Gemini, and Perplexity. Learn which prompts to use, what to look for, and how to measure AI visibility with the AVI Score.",
  openGraph: {
    title: "How to Check Your Dealership's AI Visibility",
    description:
      "Test how your dealership appears in AI-driven search. Step-by-step prompts, scoring method, and improvement guide.",
    url: "https://vizbiz.ai/how-to-check-your-dealership-ai-visibility",
    type: "article",
  },
};

const testPrompts = [
  {
    category: "Dealer Discovery",
    prompts: [
      "best [your make] dealer in [your city]",
      "top-rated car dealership in [your city]",
      "most trusted car dealership near me",
    ],
  },
  {
    category: "Trust & Reviews",
    prompts: [
      "which dealership has the best reviews in [your city]",
      "most reputable car dealer in [your city]",
    ],
  },
  {
    category: "Service Visibility",
    prompts: [
      "best [your make] service center in [your city]",
      "where should I get my car serviced in [your city]",
    ],
  },
  {
    category: "Inventory & Affordability",
    prompts: [
      "best place to buy a used [your make] in [your city]",
      "affordable used cars in [your city]",
    ],
  },
  {
    category: "Finance & Trade-In",
    prompts: [
      "where can I finance a [your make] in [your city]",
      "best dealership for trade-in near me",
    ],
  },
];

const scoringScale = [
  { range: "80–100", label: "Strong", color: "text-green-400", desc: "Your dealership appears consistently and often as a top recommendation across AI platforms." },
  { range: "55–79", label: "Moderate", color: "text-yellow-400", desc: "You appear in some categories but competitors are often recommended ahead of you." },
  { range: "30–54", label: "Weak", color: "text-orange-400", desc: "You occasionally appear but most AI answers favor other dealerships." },
  { range: "0–29", label: "Not Visible", color: "text-red-400", desc: "AI systems rarely or never mention your dealership when buyers ask about dealers in your area." },
];

const improvementSteps = [
  {
    step: 1,
    title: "Fix your foundation",
    items: [
      "Make sure your Google Business Profile is complete and accurate",
      "Ensure consistent NAP (name, address, phone) across all directories",
      "Add Organization + LocalBusiness schema markup to your website",
      "Verify your robots.txt allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)",
    ],
  },
  {
    step: 2,
    title: "Build AI-friendly content",
    items: [
      "Create FAQ pages answering real buyer questions in natural language",
      "Publish model-specific inventory pages with pricing, features, and availability",
      "Write service content that explains what you service, turnaround times, and certifications",
      "Add finance and trade-in pages with clear process descriptions",
    ],
  },
  {
    step: 3,
    title: "Strengthen trust signals",
    items: [
      "Actively collect detailed Google reviews (not just star ratings — written reviews matter more for AI)",
      "Respond to reviews consistently",
      "Highlight awards, certifications, and community involvement on your site",
      "Build backlinks from local news, community organizations, and industry publications",
    ],
  },
  {
    step: 4,
    title: "Measure and iterate",
    items: [
      "Run the same set of prompts every 2–4 weeks and track changes",
      "Note which categories improve and which stay flat",
      "Compare your results against your top 2–3 local competitors",
      "Adjust content and signals based on what the data shows",
    ],
  },
];

export default function HowToCheckDealershipAiVisibilityPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">Guide</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            How to Check Your Dealership's AI Visibility
          </h1>
          <p className="mt-8 text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            Buyers are asking ChatGPT, Google AI Overviews, Gemini, and Perplexity where to buy their next car.
            If your dealership isn't showing up in those answers, you're losing leads you don't even know about.
            Here's how to find out — and what to do about it.
          </p>
        </div>
      </section>

      {/* What is AI Visibility */}
      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Is AI Visibility for Dealerships?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI visibility measures how often and how prominently your dealership appears in AI-generated search results —
              the conversational answers buyers see when they ask ChatGPT "what's the best Chevrolet dealer near me"
              or when Google's AI Overviews summarizes dealership recommendations.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              It's different from traditional SEO. You can rank well on Google and still be invisible to AI systems
              because they weigh different signals: entity clarity, review depth, content structure, and conversational relevance.
            </p>
          </div>

          {/* Step-by-step test */}
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Step-by-Step: Test Your Own Dealership
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              You don't need any tools to get started. Open ChatGPT, Google (with AI Overviews enabled), Gemini, and Perplexity,
              then run these prompts — replacing <span className="text-[var(--neon-cyan)]">[your city]</span> and{" "}
              <span className="text-[var(--neon-cyan)]">[your make]</span> with your actual details.
            </p>

            <div className="mt-8 space-y-6">
              {testPrompts.map((group) => (
                <div key={group.category}>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--neon-cyan)]">
                    {group.category}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {group.prompts.map((prompt) => (
                      <li key={prompt} className="metric-row rounded-2xl px-4 py-3 text-sm font-mono text-[var(--text-secondary)] sm:text-base">
                        "{prompt}"
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-8 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For each prompt, note: (1) whether your dealership is mentioned, (2) whether it's the first recommendation,
              (3) which competitors appear instead, and (4) what the AI says about them that it doesn't say about you.
            </p>
          </div>

          {/* Scoring */}
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How to Score Your Results (The AVI Score)
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The <strong className="text-[var(--text-primary)]">AVI Score</strong> (AI Visibility Index) is a 0–100 scale
              that measures how visible your dealership is across AI-driven search. Here's how the bands break down:
            </p>
            <div className="mt-6 space-y-4">
              {scoringScale.map((band) => (
                <div key={band.range} className="metric-row rounded-2xl px-4 py-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-semibold ${band.color}`}>{band.range}</span>
                    <span className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">{band.label}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{band.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The AVI Score is weighted across five categories: Dealer Discovery (30%), Trust &amp; Reviews (25%),
              Service Department Visibility (20%), Affordability / Used Inventory (15%), and Finance / Trade-In (10%).
              Most dealerships score below 40 on their first audit.
            </p>
          </div>

          {/* Improvement */}
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How to Improve Your AI Visibility
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI visibility isn't a one-time fix — it's a process. Here's the order that works:
            </p>
            <div className="mt-8 space-y-8">
              {improvementSteps.map((step) => (
                <div key={step.step}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--neon-cyan)] text-sm font-bold text-black">
                      {step.step}
                    </span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <ul className="mt-3 space-y-2 pl-11">
                    {step.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Why it matters */}
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why This Matters Now
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              AI-driven search is growing fast. ChatGPT has over 200 million weekly users.
              Google now shows AI Overviews on a majority of search results. Perplexity and Gemini are climbing.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Dealerships that build AI visibility now will have a compounding advantage —
              the content, signals, and authority you build today make you stronger in every future AI model update.
              Dealerships that wait will find themselves further behind with every passing month.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="cta-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="section-kicker">Get your baseline</div>
            <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3rem]">
              Don't Want to Test Manually?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              VizBiz runs the full 11-prompt audit automatically across multiple AI platforms, scores your dealership with the AVI framework,
              identifies competitor gaps, and delivers prioritized recommendations.
            </p>
            <div className="mt-8">
              <Link href="/intake" className="premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold">
                Get My AI Visibility Snapshot
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
