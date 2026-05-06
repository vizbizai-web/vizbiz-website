import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Lock, AlertCircle, ShieldCheck, Zap } from "lucide-react";
import { CALENDLY_URL } from "@/lib/lead-flow";

export const metadata: Metadata = {
  title: "Your AI Visibility Snapshot Is Being Prepared | VizBiz",
  description:
    "We're checking how your dealership appears in AI-driven search and where nearby competitors may be winning attention first.",
  alternates: {
    canonical: "https://vizbiz.ai/thank-you",
  },
};

const expectations = [
  "We've received your dealership details.",
  "We're checking how your dealership appears in AI-driven search.",
  "We're comparing where nearby competitors may be winning attention first.",
];

function formatBand(value: string | undefined) {
  if (!value) return "Moderate";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatServiceVisibility(value: string | undefined) {
  if (!value) return "Weak";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const blurredRows = [
  "Prompt-by-prompt AI answer breakdown",
  "Additional competitor mentions and visibility gaps",
  "Recommended fixes prioritized by impact",
];

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ appeared?: string; band?: string; service?: string; competitor?: string; lid?: string; score?: string; llms?: string; schema?: string; niche?: string; revLossMin?: string; revLossMax?: string; nicheLabel?: string }>;
}) {
  const params = await searchParams;
  const appeared = Number(params.appeared || "3");
  const band = formatBand(params.band);
  const serviceVisibility = formatServiceVisibility(params.service);
  const competitorMention = typeof params.competitor === "string" && params.competitor.trim()
    ? params.competitor
    : "nearby competitors";
  const leadId = params.lid || '';
  
  // AI Readiness Data
  const score = Number(params.score || "0");
  const hasLlms = params.llms === "1";
  const hasSchema = params.schema === "1";
  const detectedNiche = params.niche || "local business";
  const revLossMin = Number(params.revLossMin || "0");
  const revLossMax = Number(params.revLossMax || "0");
  const nicheLabel = params.nicheLabel ? decodeURIComponent(params.nicheLabel) : detectedNiche.replace("_", " ");

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <img src="/logo.jpg" alt="VizBiz.ai" style={{ height: '36px', width: 'auto' }} />
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
              Here&apos;s what we found so far. Book a 15-minute call to review the full picture.
            </p>
          </div>

          <div className="mt-10 mx-auto max-w-4xl space-y-6">
            <div className="glass-card rounded-[2rem] p-6 border-2 border-[var(--neon-cyan)]/30 bg-[rgba(37,209,242,0.05)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Instant AI-Readiness Scan</p>
                <div className="flex items-center gap-2 rounded-full bg-[var(--neon-cyan)] px-3 py-1 text-xs font-bold text-[var(--bg-primary)]">
                  <Zap className="h-3 w-3" />
                  SCORE: {score}/100
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className={`flex flex-col gap-2 rounded-2xl border p-4 transition-all ${hasLlms ? "border-green-500/50 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {hasLlms ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-white/40" />}
                    AI Manifest (llms.txt)
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {hasLlms ? "Found. Your site is communicating with LLMs." : "Missing. AI models are guessing your data."}
                  </p>
                </div>
                <div className={`flex flex-col gap-2 rounded-2xl border p-4 transition-all ${hasSchema ? "border-green-500/50 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {hasSchema ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-white/40" />}
                    Structured Data
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {hasSchema ? "Found. Services are logically mapped." : "Missing. AI can't verify your specifics."}
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4 text-[var(--neon-cyan)]" />
                    Detected Niche
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Identified as <span className="text-white font-medium">{detectedNiche.replace("_", " ")}</span>
                  </p>
                </div>
              </div>

              {revLossMin > 0 && revLossMax > 0 && (
                <div className="mt-6 rounded-2xl p-5 border" style={{
                  background: 'rgba(255, 200, 0, 0.06)',
                  borderColor: 'rgba(255, 200, 0, 0.2)'
                }}>
                  <p className="text-sm uppercase tracking-[0.18em] font-semibold text-amber-400 mb-2">Estimated Revenue Leak</p>
                  <p className="text-3xl font-bold text-white">
                    ${revLossMin.toLocaleString()} – ${revLossMax.toLocaleString()}
                    <span className="text-base font-normal text-amber-300 ml-1">/month</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Based on your niche ({nicheLabel}) and current AI infrastructure score — this is how much you may be losing in AI-driven leads each month.
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-white/5 p-4 border border-white/10">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  <strong className="text-white">What this means:</strong> This is a technical check of your site's AI infrastructure. We've detected that your site is <span className={score < 50 ? "text-red-400" : "text-green-400"}>{score < 50 ? "under-optimized" : "well-optimized"}</span> for AI agents. Your full report will show exactly which gaps are costing you revenue.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Free AI Visibility Report (Pending)</p>

              <div className="mt-5 border-b border-white/8 pb-5">
                <p className="text-4xl font-semibold text-[var(--text-primary)]">We&apos;re preparing your full deep-dive analysis</p>
              </div>

              <div className="border-b border-white/8 py-5">
                <p className="text-4xl font-semibold text-[var(--text-primary)]">Overall AI Visibility: Analysis in Progress</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  We're simulating 20+ buyer-intent prompts to see exactly where you appear and where competitors are stealing your leads.
                </p>
              </div>

              <div className="border-b border-white/8 py-5">
                <p className="text-4xl font-semibold text-[var(--text-primary)]">Service Department Visibility: Analysis in Progress</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  We're analyzing how your service department shows up compared to nearby competitors.
                </p>
              </div>

              <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                <p>This full report will be delivered to your email shortly.</p>
                <p>Once delivered, you'll get a link to the <span className="text-white font-medium">Visual Breakdown</span> of your visibility gaps.</p>
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
            </div>

            {leadId && (
              <div className="text-center">
                <Link
                  href={`/report/${leadId}`}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(to right, #22D3EE, #06B6D4)',
                    color: '#02091F',
                    boxShadow: '0 0 20px rgba(37,209,242,0.2)',
                  }}
                >
                  View Your AI Visibility Report
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-xs text-[var(--text-secondary)]/70">
                  Your report is being generated now. Refresh in 1-2 minutes if it's still loading.
                </p>
              </div>
            )}

            <p className="text-center text-xs text-[var(--text-secondary)]/70">
              We&apos;re running your AI visibility analysis now. Your free report will be delivered to your email shortly — usually within a few minutes.
            </p>

            <div className="glass-card rounded-[2rem] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(0,240,255,0.06)] text-[var(--neon-cyan)]">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">Book Your 15-Minute Review Call</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                This is the next step. We'll review your snapshot, where competitors are showing up first, and whether a deeper audit is worth doing.
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
