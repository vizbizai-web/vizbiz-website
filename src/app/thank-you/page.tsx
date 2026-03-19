import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, LineChart, SearchCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Snapshot in Progress | VizBiz",
  description:
    "Your VizBiz AI Visibility Snapshot is in progress. The next step is booking a 15-minute review call.",
};

const nextSteps = [
  {
    icon: CheckCircle2,
    title: "Lead captured",
    body: "We’ve got your dealership, website, market, and contact details.",
  },
  {
    icon: SearchCheck,
    title: "Snapshot in progress",
    body: "We’ll use those inputs to frame how your dealership appears in AI-driven search and where competitors may be beating you.",
  },
  {
    icon: Calendar,
    title: "Review call next",
    body: "Book the 15-minute review call now so the funnel keeps moving while intent is still high.",
  },
];

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#060e1a] text-white">
      <section className="section-shell relative isolate overflow-hidden bg-[#0a1628] pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36">
        <div className="hero-mesh" aria-hidden="true" />
        <div className="hero-grid-overlay" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_36%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[1.6rem] border border-emerald-300/20 bg-emerald-400/12 text-emerald-200 shadow-[0_20px_60px_rgba(16,185,129,0.14)]">
              <LineChart className="h-9 w-9" />
            </div>

            <div className="section-kicker mt-8">Snapshot in progress</div>
            <h1 className="mt-6 text-[3rem] font-bold leading-[0.96] tracking-[-0.03em] text-white sm:text-[3.8rem] lg:text-[4.6rem]">
              Your AI Visibility Snapshot is in progress.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-[1.05rem] leading-8 text-white/72 sm:text-[1.16rem] sm:leading-9 lg:text-[1.22rem]">
              We’ve got the lead. Don’t let it stall here. The next move is booking the 15-minute review call so there’s a real handoff instead of a dead end.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {nextSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="glass-card rounded-[1.7rem] p-5 text-left sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/18 bg-cyan-400/10 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-white">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/66 sm:text-[0.98rem]">{step.body}</p>
                </div>
              );
            })}
          </div>

          <div className="glass-card mx-auto mt-10 max-w-3xl rounded-[2rem] px-5 py-7 text-center shadow-[0_30px_90px_rgba(2,8,23,0.34)] sm:px-8 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/82">
              Keep the funnel moving
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.02em] text-white sm:text-[2.5rem]">
              Book your 15-minute review call now.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[1rem] leading-8 text-white/68 sm:text-[1.08rem]">
              This is the conversion step after the lead magnet. Pick a time and we’ll review the dealership, market, and likely competitor context with you.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/book-call"
                className="premium-button inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold"
              >
                Book a 15-Minute Review Call
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-6 py-4 text-base font-medium text-white/84 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Back to homepage
              </Link>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/54">
              <Sparkles className="h-4 w-4" />
              Your snapshot request is in the system.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
