import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "AI Visibility Audit for Car Dealerships | VizBiz",
  description:
    "See what a VizBiz AI Visibility Audit covers for dealerships, including competitive visibility, category scoring, and practical next-step recommendations.",
};

const auditDeliverables = [
  "Where your dealership appears in AI-driven search",
  "Which competitors appear instead or more often",
  "Which visibility categories are strongest and where the biggest opportunities sit",
  "What to fix first to improve visibility",
];

const auditCategories = [
  {
    title: "Inventory Visibility",
    body: "How clearly vehicles, pricing, categories, and used inventory are structured and surfaced.",
  },
  {
    title: "Review Signals",
    body: "How review strength, recency, detail, and trust language support recommendation likelihood.",
  },
  {
    title: "Service Visibility",
    body: "How well service, maintenance, and post-sale support pages help AI understand the dealership’s service value.",
  },
  {
    title: "Finance & Offer Content",
    body: "How clearly financing, trade-in, warranty, and offer information are explained for buyer-intent prompts.",
  },
  {
    title: "FAQ Coverage",
    body: "Whether the dealership answers the real buyer questions AI systems often rely on.",
  },
];

const competitorReveals = [
  "which nearby competitors are surfaced more often",
  "which prompt categories they are winning",
  "where your dealership has room to improve or is not yet being surfaced enough",
  "where inventory, trust, or service signals appear to be stronger for competitors",
];

const revenueReasons = [
  "Sales revenue is affected when buyers are sent toward competitors before they ever visit your website.",
  "Service revenue is affected when AI does not trust or understand your service offering well enough to mention it.",
  "Used inventory and affordability prompts influence high-intent shoppers who are close to action.",
  "An audit helps the dealership see whether stronger visibility could unlock more acquisition and retention opportunities.",
];

const faqItems = [
  {
    question: "What does an AI Visibility Audit include?",
    answer:
      "It shows where your dealership appears in AI-driven search, which competitors are being recommended instead, which categories are weak, and what to improve first.",
  },
  {
    question: "What categories are evaluated in the audit?",
    answer:
      "The audit evaluates inventory visibility, review signals, service visibility, finance and offer content, and FAQ coverage.",
  },
  {
    question: "How does the audit reveal competitor visibility?",
    answer:
      "It shows which nearby competitors appear more often, where they are stronger, and which prompt categories they are winning.",
  },
  {
    question: "Why does this matter for dealership revenue?",
    answer:
      "It matters because AI-driven discovery can influence both vehicle sales and service revenue before a buyer ever visits your site or calls your store.",
  },
];

export default function AiVisibilityAuditForCarDealershipsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">Audit page</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            AI Visibility Audit for Automotive Retailers
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The VizBiz AI Visibility Audit shows how your dealership appears in AI-driven search, where competitors are getting surfaced instead, and what changes can improve visibility.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The goal is simple: show where the dealership stands now, where it can improve, and what matters most to address first.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If you want to see how this fits into the bigger category, read <Link href="/ai-visibility-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">AI visibility for automotive retailers</Link>. If you want a proof example, review the <Link href="/sample-ai-visibility-report-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">sample AI visibility report for automotive retailers</Link>.
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
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What the Audit Includes
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              A VizBiz audit reveals:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {auditDeliverables.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Dealerships Receive in the Audit
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Dealerships receive a clear visibility readout, competitor context, category-level diagnosis, and a practical set of recommendations your team can act on.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This is not just a score. It is a visibility diagnosis built around the areas that influence whether AI systems recommend your dealership.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              What Categories Are Evaluated
            </h2>
            <div className="mt-6 space-y-5">
              {auditCategories.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              How Competitor Visibility Is Revealed
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The audit shows:
            </p>
            <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {competitorReveals.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This helps dealerships understand not just whether they are visible, but where nearby competitors are currently outperforming them and where the next gains can come from.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For direct answers to common buyer questions, visit the <Link href="/faq-ai-visibility-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">FAQ page</Link>.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why This Matters for Sales and Service Revenue
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
              See how your dealership appears across inventory, reviews, service, finance, FAQ, and competitor visibility signals.
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
