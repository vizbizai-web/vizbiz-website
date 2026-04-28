import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { CALENDLY_URL } from "@/lib/lead-flow";

export const metadata: Metadata = {
  title: "Book a 15-Minute Review Call | VizBiz",
  description:
    "Book a 15-minute review call with VizBiz to review your dealership’s AI visibility snapshot and next steps.",
  alternates: {
    canonical: "https://vizbiz.ai/book-call",
  },
};

const callReasons = [
  "Review how your dealership appears in AI-driven search.",
  "Talk through where nearby competitors may be showing up more often.",
  "Decide the right next step based on real visibility signal.",
];

export default function BookCallPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="logo-wordmark text-xl sm:text-[1.35rem]">
            <span>VizBiz</span>
            <span className="logo-ai">.ai</span>
          </Link>
        </div>
      </header>

      <section className="section-shell px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-18 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-3xl">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <div className="section-kicker">15-minute review call</div>
            <h1 className="display-font mt-6 text-[2.6rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[3.4rem]">
              Book your review call.
            </h1>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Pick a time to review your AI visibility snapshot and what it suggests about your local market.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[var(--text-secondary)]">
              {callReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3 leading-7">
                  <CheckCircle2 className="mt-1 h-4.5 w-4.5 flex-shrink-0 text-[var(--neon-cyan)]" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 border-t border-[var(--border)] pt-8 text-sm text-[var(--text-secondary)] leading-7 space-y-3">
              <p><strong className="text-[var(--text-primary)]">What happens on the call:</strong> We walk through your AVI score (0–100), show which AI platforms are — and aren’t — recommending your dealership, and identify the highest-impact fixes for your market.</p>
              <p><strong className="text-[var(--text-primary)]">Who it’s for:</strong> Dealership owners, GMs, and marketing managers who want to understand how ChatGPT, Gemini, Google AI, and Perplexity surface their business to local buyers.</p>
              <p><strong className="text-[var(--text-primary)]">No pressure:</strong> This is a 15-minute review of real data. No sales pitch, no obligation.</p>
            </div>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-button mt-8 min-h-13 w-full rounded-2xl px-6 py-3.5 text-sm font-semibold"
            >
              Book Your 15-Minute Review Call
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
