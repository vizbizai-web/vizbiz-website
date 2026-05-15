"use client";

import { ArrowRight, CheckCircle2, Clock, FileSearch, Gauge, Send } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

const steps = [
  {
    number: "01",
    icon: Send,
    title: "Enter your business info",
    detail: "Share your business name, market, and website. It takes about 30 seconds.",
  },
  {
    number: "02",
    icon: Gauge,
    title: "Get free score instantly",
    detail: "See your initial AI Visibility Score right away, without waiting on a call or proposal.",
  },
  {
    number: "03",
    icon: FileSearch,
    title: "Upgrade for the full audit",
    detail: "Unlock competitor comparisons, prompt-level findings, and the ranked fix list.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Receive the complete report same day",
    detail: "You get a finished report you can review internally or hand to your agency.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section-shell section-transition section-divider bg-[#0a1628] py-16 sm:py-20 lg:py-28"
      style={{ ["--transition-from" as string]: "#0d1f3a" }}
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <AnimateIn className="max-w-3xl">
          <div className="section-kicker">Fast process</div>
          <h2 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.02em] text-white sm:text-[2.5rem] lg:text-[3rem]">
            How It Works
          </h2>
          <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-white/70 sm:text-[1.18rem] sm:leading-9">
            This should feel like a fast diagnostic, not a consulting project. The process is short,
            clear, and built to get you to an answer fast.
          </p>
        </AnimateIn>

        <AnimateIn className="mt-8 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/16 bg-cyan-400/8 px-4 py-2.5 text-sm font-semibold text-cyan-100 sm:px-5 sm:py-3">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="break-words">Free score in seconds • Full audit same day</span>
        </AnimateIn>

        <AnimateIn stagger className="mt-10 grid gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(100%-1rem)] top-12 hidden h-px w-8 bg-white/10 lg:block">
                  <ArrowRight className="absolute right-[-0.55rem] top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/50" />
                </div>
              )}

              <motion.div
                whileHover={{ y: -2, boxShadow: "0 26px 60px rgba(2, 8, 23, 0.28)" }}
                className="glass-card h-full rounded-[1.6rem] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-2xl font-semibold text-white/24 sm:text-3xl">{step.number}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-[color:var(--accent)]">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white sm:mt-6 sm:text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/66 sm:mt-3 sm:text-base sm:leading-7">{step.detail}</p>
              </motion.div>
            </div>
          ))}
        </AnimateIn>
      </div>
    </section>
  );
}
