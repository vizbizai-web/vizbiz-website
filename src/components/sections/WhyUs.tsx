"use client";

import { Eye, Search, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

const reasons = [
  {
    icon: Search,
    title: "Buyers already use AI to narrow choices",
    description: "Shoppers now ask AI who to trust and where to shop before they compare inventory pages or listing sites.",
  },
  {
    icon: Eye,
    title: "Existing reports don't show AI answers",
    description: "Your agency can show rankings, traffic, and ad spend. That still doesn't tell you what ChatGPT or Gemini says about your store.",
  },
  {
    icon: TrendingUp,
    title: "Competitors can win share before you know",
    description: "If a rival dealership is the name AI recommends first, they get researched first — and often visited first.",
  },
];

export default function WhyUs() {
  return (
    <section
      className="section-shell section-transition section-divider relative isolate overflow-hidden bg-[#081220] py-16 text-white sm:py-20 lg:py-28"
      style={{ ["--transition-from" as string]: "#0d1f3a" }}
    >
      <div className="hero-mesh opacity-45" aria-hidden="true" />
      <div className="hero-glow hero-glow-one opacity-30" aria-hidden="true" />
      <div className="hero-glow hero-glow-two opacity-25" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%,rgba(6,182,212,0.04))]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <AnimateIn className="max-w-3xl">
          <div className="section-kicker">Why now</div>
          <h2 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.02em] text-white sm:text-[2.5rem] lg:text-[3rem]">
            Why Dealerships Buy This Now
          </h2>
          <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-white/72 sm:text-[1.18rem] sm:leading-9">
            This is not about chasing a trend. It&apos;s about seeing a visibility layer that already
            affects who gets considered, compared, and contacted.
          </p>
        </AnimateIn>

        <AnimateIn stagger className="mt-10 grid gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              whileHover={{ y: -2, boxShadow: "0 28px 70px rgba(2, 8, 23, 0.32)" }}
              className="glass-card rounded-[1.6rem] p-5 sm:p-6 lg:p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-[color:var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                <reason.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white sm:text-xl">{reason.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base sm:leading-7">{reason.description}</p>
            </motion.div>
          ))}
        </AnimateIn>

        <AnimateIn className="mt-8 rounded-[1.8rem] border border-white/8 bg-white/[0.05] p-5 shadow-[0_24px_70px_rgba(2,8,23,0.28)] backdrop-blur-xl sm:mt-10 sm:p-7">
          <p className="max-w-4xl text-base leading-7 text-white/84 sm:text-lg sm:leading-8">
            You already pay for visibility on Google, Cars.com, and AutoTrader. AI is now another layer.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
            If you can&apos;t see how that layer treats your store, you can&apos;t manage it early.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
