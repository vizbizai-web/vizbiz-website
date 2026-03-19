import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Calendar, CheckCircle2, Clock3, PhoneCall } from "lucide-react";
import { CALENDLY_URL } from "@/lib/lead-flow";

export const metadata: Metadata = {
  title: "Book a 15-Minute Review Call | VizBiz",
  description:
    "Book a 15-minute review call with VizBiz to discuss your dealership’s AI visibility snapshot and next steps.",
};

const callReasons = [
  "Review your dealership, website, and local market context",
  "Discuss where AI-driven search may be favoring nearby competitors",
  "Turn the snapshot into a real next step instead of a passive lead",
];

export default function BookCallPage() {
  return (
    <main className="min-h-screen bg-[#060e1a] text-white">
      <section className="section-shell relative isolate overflow-hidden bg-[#0a1628] pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36">
        <div className="hero-mesh" aria-hidden="true" />
        <div className="hero-grid-overlay" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
            <div>
              <div className="section-kicker">15-minute review call</div>
              <h1 className="mt-6 text-[2.9rem] font-bold leading-[0.96] tracking-[-0.03em] text-white sm:text-[3.6rem] lg:text-[4.2rem]">
                Book the review call.
              </h1>
              <p className="mt-6 max-w-xl text-[1.05rem] leading-8 text-white/72 sm:text-[1.15rem] sm:leading-9">
                This is the secondary CTA on the homepage and the post-submit push after the snapshot form.
                Short call. Clear purpose. No bloated sales routine.
              </p>

              <div className="mt-8 space-y-4">
                {callReasons.map((reason) => (
                  <div key={reason} className="glass-card rounded-[1.4rem] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-300" />
                      <p className="text-sm leading-7 text-white/72 sm:text-[0.98rem]">{reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-6 shadow-[0_30px_90px_rgba(2,8,23,0.34)] sm:p-8">
              <div className="flex h-13 w-13 items-center justify-center rounded-[1.1rem] border border-cyan-400/18 bg-cyan-400/10 text-cyan-100">
                <PhoneCall className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-[2rem] font-semibold tracking-[-0.02em] text-white sm:text-[2.35rem]">
                Book a 15-Minute Review Call
              </h2>
              <p className="mt-4 text-[1rem] leading-8 text-white/68 sm:text-[1.06rem]">
                Use the booking link below to lock in the review call tied to the snapshot funnel.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-white/8 bg-white/5 p-4">
                  <Clock3 className="h-5 w-5 text-cyan-200" />
                  <p className="mt-3 font-medium text-white">15 minutes</p>
                  <p className="mt-1 text-white/56">Tight, focused, useful.</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-white/5 p-4">
                  <Calendar className="h-5 w-5 text-cyan-200" />
                  <p className="mt-3 font-medium text-white">Immediate next step</p>
                  <p className="mt-1 text-white/56">Built to catch intent while it’s hot.</p>
                </div>
              </div>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold"
              >
                Open Booking Link
                <ArrowUpRight className="h-4.5 w-4.5" />
              </a>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/intake"
                  className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-5 py-3.5 text-sm font-medium text-white/84 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Start the snapshot first
                </Link>
                <Link href="/" className="text-sm font-medium text-white/56 transition-colors hover:text-white">
                  Back to homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
