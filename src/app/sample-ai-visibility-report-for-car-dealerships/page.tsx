import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Sample AI Visibility Report for Car Dealerships | VizBiz",
  description:
    "See a sample AI visibility report for dealerships with score breakdowns, competitor insights, and practical recommendations tied to inventory, service, and trust.",
  alternates: {
    canonical: "https://vizbiz.ai/sample-ai-visibility-report-for-car-dealerships",
  },
};

const categoryBreakdown = [
  { category: "Local dealer discovery", score: "58/100", note: "Moderate" },
  { category: "Inventory / affordability visibility", score: "34/100", note: "Emerging" },
  { category: "Service visibility", score: "39/100", note: "Emerging" },
  { category: "Review / trust signals", score: "52/100", note: "Moderate" },
  { category: "Finance / FAQ coverage", score: "44/100", note: "Moderate" },
];

const competitorExamples = [
  "A nearby Kia competitor appears more often for used inventory and affordability prompts.",
  "A local competitor shows stronger service visibility for maintenance-related queries.",
  "Trust-driven prompts are more likely to surface a competitor with stronger review signals.",
];

const sampleRecommendations = [
  {
    title: "Build a used inventory theme page",
    category: "Inventory / Affordability Visibility",
    priority: "High",
    body: "A dedicated used inventory page improves the dealership’s visibility for affordable and model-specific used-car discovery prompts.",
  },
  {
    title: "Add service FAQ coverage",
    category: "Service Visibility",
    priority: "High",
    body: "Clear answer-style service content helps AI systems understand where the dealership should be recommended for maintenance and ownership questions.",
  },
  {
    title: "Strengthen trust language on core pages",
    category: "Review / Trust Signals",
    priority: "Medium",
    body: "Trust-focused prompts often reward clearer review support, stronger credibility language, and cleaner local relevance.",
  },
];

const sampleAssets = [
  {
    name: "Used Inventory Theme Page Brief",
    type: "Page brief",
    location: "Used inventory section",
  },
  {
    name: "Service FAQ Block",
    type: "FAQ content block",
    location: "Service page",
  },
  {
    name: "Finance Questions Block",
    type: "Content block",
    location: "Finance page",
  },
];

export default function SampleAiVisibilityReportForCarDealershipsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SiteHeader ctaLabel="Get My Snapshot" />

      <section className="section-shell px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="section-kicker">Sample report</div>
          <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[4rem]">
            Sample AI Visibility Report for Automotive Retailers
          </h1>

          <div className="glass-card mt-10 rounded-[2rem] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              This page shows the kind of output a dealership actually receives from a VizBiz AI Visibility Audit.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The goal is not to give a generic score. The goal is to show what categories are strong, where competitors are winning today, and what should be improved first.
            </p>
            <p className="mt-6 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              If you want to understand the deliverable itself, see the <Link href="/intake/" className="text-[var(--neon-cyan)] hover:text-white">AI Visibility Audit for automotive retailers</Link>. If you want the category background, read <Link href="/ai-visibility-for-car-dealerships/" className="text-[var(--neon-cyan)] hover:text-white">AI visibility for automotive retailers</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Sample Score and Category Breakdown
            </h2>
            <div className="mt-6 rounded-[1.6rem] border border-[var(--border-subtle)] bg-white/4 p-5 sm:p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Overall score</p>
              <div className="mt-4 flex items-end justify-between gap-6 border-b border-white/8 pb-5">
                <div>
                  <p className="text-5xl font-semibold text-[var(--neon-cyan)]">46/100</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Status: Moderate</p>
                </div>
                <div className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Baseline month
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {categoryBreakdown.map((item) => (
                  <div key={item.category} className="metric-row flex items-center justify-between rounded-2xl px-4 py-3 text-sm sm:text-base">
                    <span>{item.category}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{item.score} · {item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Competitor Gap Examples
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              A dealership report should make competitor pressure clear, practical, and actionable.
            </p>
            <ul className="mt-6 space-y-3 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {competitorExamples.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Sample Recommendations
            </h2>
            <div className="mt-6 space-y-5">
              {sampleRecommendations.map((item) => (
                <div key={item.title} className="metric-row rounded-2xl p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <div className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      {item.priority}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">{item.category}</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Sample Upload-Ready Assets
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              The report should lead to practical assets that a dealership or webmaster can actually use.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              For the affordability / inventory angle specifically, see <Link href="/intake/" className="text-[var(--neon-cyan)] hover:text-white">cheap used car near me: AI visibility for dealerships</Link>.
            </p>
            <div className="mt-6 space-y-3">
              {sampleAssets.map((item) => (
                <div key={item.name} className="metric-row rounded-2xl px-4 py-4 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  <p><span className="text-[var(--text-primary)]">Asset:</span> {item.name}</p>
                  <p><span className="text-[var(--text-primary)]">Type:</span> {item.type}</p>
                  <p><span className="text-[var(--text-primary)]">Intended page/location:</span> {item.location}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-font text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Why This Matters
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              A good report helps a dealership understand where visibility can improve, why that gap exists, and what to do next.
            </p>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              It should connect visibility gaps to practical action across inventory, reviews, service, finance, and FAQ content.
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
              See where your dealership appears, where competitors are showing up instead, and what the strongest next move should be.
            </p>
            <div className="mt-8">
              <Link href="/intake/" className="premium-button rounded-2xl px-6 py-3.5 text-sm font-semibold">
                Get My AI Visibility Snapshot
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
