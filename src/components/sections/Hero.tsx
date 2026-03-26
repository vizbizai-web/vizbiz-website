"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";
import PhoneMockup, { AuditReportScreen, ScoreScreen } from "@/components/PhoneMockup";

const proofPills = ["5 AI platforms tested", "20–25 buyer prompts", "Same-day audit delivery"];
const trustStats = [
  { value: "5", label: "AI platforms checked" },
  { value: "20–25", label: "Buyer-intent prompts" },
  { value: "Same day", label: "Full audit turnaround" },
];

export default function Hero() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.hash = "pricing";
  };

  return (
    <section
      className="section-shell relative isolate overflow-hidden bg-[#050505] pt-24 text-white sm:pt-28 lg:pt-32"
      style={{ ["--transition-from" as string]: "#030303" }}
    >
      <div className="hero-mesh" aria-hidden="true" />
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="hero-sweep" aria-hidden="true" />
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-halo-ring" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-3 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-center lg:gap-14">
          <div className="max-w-3xl text-left">
            <AnimateIn stagger className="space-y-0">
              <div className="section-kicker max-w-full">
                <span className="min-w-0 break-words">AI-assisted, expert-reviewed audit for car dealerships</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5 sm:gap-3">
                {proofPills.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72 sm:text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <h1 className="display-font mt-6 max-w-4xl text-[3rem] font-black uppercase leading-[0.88] tracking-[-0.06em] text-white sm:text-[4.15rem] lg:text-[5.1rem]">
                Is AI Recommending <span className="text-accent-gradient">Your Dealership?</span>
              </h1>

              <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-white/70 sm:text-[1.12rem] sm:leading-8 lg:text-[1.18rem]">
                VizBiz shows how visible your dealership is when buyers ask ChatGPT, Gemini,
                Perplexity, and other AI tools who to trust, where to shop, and which dealer to
                choose.
              </p>

              <form onSubmit={handleSubmit} className="hero-form-panel mt-8 max-w-2xl rounded-[1.9rem] p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(212,255,114,0.86)] sm:text-xs">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_16px_rgba(182,255,46,0.8)]" />
                  Get your score first
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label htmlFor="hero-email" className="sr-only">
                    Enter your email
                  </label>
                  <input
                    id="hero-email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="h-14 w-full rounded-2xl border border-white/12 bg-[#0a0a0a] px-4 text-base text-white outline-none transition placeholder:text-white/28 focus:border-[rgba(182,255,46,0.55)] focus:bg-[#101010]"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="premium-button inline-flex h-14 shrink-0 items-center justify-center rounded-2xl px-7 text-base font-bold uppercase tracking-[0.04em] sm:min-w-[230px]"
                  >
                    Get My Free Score
                  </motion.button>
                </div>
                <p className="mt-3 text-sm text-white/56">
                  Free score first. Upgrade only if you want the full audit and competitor detail.
                </p>
              </form>

              <div className="hero-trust-strip mt-5 grid max-w-3xl gap-3 rounded-[1.7rem] p-4 sm:grid-cols-3 sm:p-5">
                {trustStats.map((stat) => (
                  <div key={stat.label} className="hero-stat-card rounded-[1.2rem] px-4 py-3">
                    <p className="display-font text-xl font-black uppercase tracking-[-0.05em] text-white sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-white/56">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/62 sm:text-[0.95rem]">
                <span className="font-semibold text-white/86">Free score first</span>
                <span className="text-white/24">•</span>
                <span>One-time audit pricing</span>
                <span className="text-white/24">•</span>
                <span>No subscription</span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4 text-sm sm:text-base">
                <motion.div whileHover={{ y: -1 }}>
                  <Link href="#pricing" className="font-semibold text-[rgba(212,255,114,0.9)] transition-colors hover:text-white">
                    See pricing
                  </Link>
                </motion.div>
                <span className="text-white/20">•</span>
                <motion.div whileHover={{ y: -1 }}>
                  <Link href="/book-call" className="font-semibold text-white/72 transition-colors hover:text-white">
                    Book a 15-minute call
                  </Link>
                </motion.div>
              </div>
            </AnimateIn>

            <AnimateIn className="mt-10 flex justify-center overflow-hidden lg:hidden">
              <div className="relative w-full max-w-[330px]">
                <div className="phone-stage-glow" aria-hidden="true" />
                <div className="hero-device-card rounded-[1.9rem] p-3">
                  <PhoneMockup className="mx-auto max-w-[260px] sm:max-w-[285px]">
                    <ScoreScreen />
                  </PhoneMockup>
                </div>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn className="hidden lg:block lg:justify-self-end" delay={0.15}>
            <div className="relative flex min-h-[720px] w-full max-w-[620px] items-center justify-center">
              <div className="phone-stage-glow" aria-hidden="true" />

              <div className="hero-proof-card absolute left-0 top-18 z-30 max-w-[260px] rounded-[1.6rem] p-4">
                <p className="display-font text-[11px] font-bold uppercase tracking-[0.22em] text-[rgba(212,255,114,0.82)]">
                  What you see fast
                </p>
                <div className="mt-3 space-y-3">
                  {[
                    "Your AI Visibility Score",
                    "Where competitors get named first",
                    "What to fix before you lose more leads",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/72">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--primary)] shadow-[0_0_12px_rgba(182,255,46,0.8)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                whileHover={{ y: -8, rotate: -3, boxShadow: "0 42px 110px rgba(0, 0, 0, 0.54)" }}
                className="absolute left-8 top-28 z-10"
              >
                <PhoneMockup className="max-w-[285px] [transform:perspective(1600px)_rotateY(18deg)_rotateX(3deg)_rotate(-7deg)]">
                  <ScoreScreen />
                </PhoneMockup>
              </motion.div>

              <motion.div
                whileHover={{ y: -8, rotate: 3, boxShadow: "0 42px 110px rgba(0, 0, 0, 0.54)" }}
                className="absolute right-2 top-10 z-20"
              >
                <PhoneMockup className="max-w-[320px] [transform:perspective(1600px)_rotateY(-14deg)_rotateX(4deg)_rotate(4deg)]" priority>
                  <AuditReportScreen />
                </PhoneMockup>
              </motion.div>

              <div className="hero-proof-card absolute bottom-18 right-6 z-30 max-w-[300px] rounded-[1.6rem] p-4">
                <p className="display-font text-[11px] font-bold uppercase tracking-[0.22em] text-[rgba(212,255,114,0.82)]">
                  Built for action
                </p>
                <p className="mt-3 text-base font-semibold leading-7 text-white">
                  Start with the free score. Upgrade when you want the full report and competitor detail.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
