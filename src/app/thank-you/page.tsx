import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Lock, AlertCircle, ShieldCheck, Zap, Search } from "lucide-react";
import { CALENDLY_URL } from "@/lib/lead-flow";

export const metadata: Metadata = {
  title: "Your AI Visibility Snapshot Is Being Prepared | VizBiz",
  description:
    "We're analyzing how your business appears in AI-driven search results and where you may be missing out on visibility.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://vizbiz.ai/thank-you/",
  },
};

const expectations = [
  "We've received your business details.",
  "We're running a deep analysis of how AI search engines see your business.",
  "We'll show you exactly where you appear — and where you're invisible.",
];

const blurredRows = [
  "Prompt-by-prompt AI answer breakdown",
  "Competitor mentions and visibility gaps",
  "Recommended fixes prioritized by impact",
];

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ appeared?: string; band?: string; service?: string; competitor?: string; lid?: string; score?: string; llms?: string; schema?: string; niche?: string; revLossMin?: string; revLossMax?: string; nicheLabel?: string; token?: string }>;
}) {
  const params = await searchParams;
  const leadId = params.lid || '';
  const reportToken = params.token || '';
  // AI Readiness Data — safe to show (technical, not niche-dependent)
  const score = Number(params.score || "0");
  const hasLlms = params.llms === "1";
  const hasSchema = params.schema === "1";

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <img src="/logo.jpg" alt="VizBiz.ai" style={{ height: '48px', width: 'auto' }} />
          </Link>
        </div>
      </header>

      <section className="section-shell px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-18 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-kicker">Step 2 of 2</div>
            <h1 className="display-font mt-6 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[3.8rem]">
              Your AI Visibility Snapshot Is Being Prepared
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Here&apos;s what we found from a quick scan. Your full report is being generated now.
            </p>
          </div>

          <div className="mt-10 mx-auto max-w-4xl space-y-6">
            {/* Instant technical scan — safe because it's infrastructure, not niche-dependent */}
            <div className="glass-card rounded-[2rem] p-6 border-2 border-[var(--neon-cyan)]/30 bg-[rgba(37,209,242,0.05)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Quick AI-Readiness Scan</p>
                <div className="flex items-center gap-2 rounded-full bg-[var(--neon-cyan)] px-3 py-1 text-xs font-bold text-[var(--bg-primary)]">
                  <Zap className="h-3 w-3" />
                  SCORE: {score}/100
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={`flex flex-col gap-2 rounded-2xl border p-4 transition-all ${hasLlms ? "border-green-500/50 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {hasLlms ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-white/40" />}
                    AI Manifest (llms.txt)
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {hasLlms ? "Found. Your site is communicating with AI models." : "Missing. AI models are guessing your business data."}
                  </p>
                </div>
                <div className={`flex flex-col gap-2 rounded-2xl border p-4 transition-all ${hasSchema ? "border-green-500/50 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {hasSchema ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-white/40" />}
                    Structured Data
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {hasSchema ? "Found. Your services are logically mapped for AI." : "Missing. AI can't verify what you offer."}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 p-4 border border-white/10">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  <strong className="text-white">What this means:</strong> This is a quick technical check of your site&apos;s AI infrastructure. Your full report will show exactly how visible you are in AI-powered search results, where the gaps are, and what to fix first.
                </p>
              </div>
            </div>

            {/* Full report section — always "in progress" until the report page is ready */}
            <div className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--neon-cyan)]/10">
                  <Search className="h-5 w-5 text-[var(--neon-cyan)]" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Full AI Visibility Report</p>
              </div>

              <div className="mt-6 border-b border-white/8 pb-5">
                <p className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">Analysis in progress</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  We&apos;re simulating real customer searches to see exactly where your business appears in AI-generated answers — and where it doesn&apos;t.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {blurredRows.map((row) => (
                  <div
                    key={row}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="blur-[2px] select-none">{row}</span>
                    <Lock className="h-4 w-4 text-[var(--neon-cyan)]/80" />
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                <p>Your full AI visibility report is being generated. Our AI analyzes your presence across 20+ real search scenarios and benchmarks you against competitors. You'll receive an email with your interactive report shortly.</p>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(0,240,255,0.06)] text-[var(--neon-cyan)]">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">Book Your 15-Minute Review Call</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                This is the fastest way to understand your results. We&apos;ll walk through your visibility snapshot, explain what the numbers mean, and show you where the biggest opportunities are.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
                {expectations.map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-7">
                    <CheckCircle2 className="mt-1 h-4.5 w-4.5 flex-shrink-0 text-[var(--neon-cyan)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button mt-8 min-h-13 w-full rounded-2xl px-6 py-3.5 text-sm font-semibold"
              >
                Book Your 15-Minute Review Call
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
