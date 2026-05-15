"use client";

import {
  BadgeCheck,
  ClipboardList,
  FileText,
  Gauge,
  ScanSearch,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

const deliverables = [
  {
    icon: FileText,
    title: "Executive summary",
    description:
      "A clear first-page summary of the biggest takeaways, what matters most, and where your business stands now.",
  },
  {
    icon: Gauge,
    title: "AI Visibility Score",
    description:
      "A score across the major AI platforms tested so you can see how often your business shows up in customer-facing answers.",
  },
  {
    icon: ClipboardList,
    title: "Prompt-by-prompt findings",
    description:
      "The actual buyer-intent prompts we tested, plus captured responses showing where you appear, where you do not, and who gets named instead.",
  },
  {
    icon: BadgeCheck,
    title: "Competitor comparison",
    description:
      "A local benchmark against the businesses AI recommends in your market so you can see who leads and why.",
  },
  {
    icon: ScanSearch,
    title: "Gap analysis",
    description:
      "A breakdown of the blind spots, missing trust signals, and weak areas that cause AI to skip over your business.",
  },
  {
    icon: Target,
    title: "Prioritized fix list",
    description:
      "The clearest next moves, ordered by what to fix first so your team or agency can act without guessing.",
  },
];

export default function WhatYouGet() {
  return (
    <section
      id="what-you-get"
      className="section-shell section-transition section-divider bg-[#0d1f3a] py-16 sm:py-20 lg:py-28"
      style={{ ["--transition-from" as string]: "#0a1628" }}
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <AnimateIn className="max-w-3xl">
          <div className="section-kicker">Report contents</div>
          <h2 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.02em] text-white sm:text-[2.5rem] lg:text-[3rem]">
            What You Get
          </h2>
          <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-white/70 sm:text-[1.18rem] sm:leading-9">
            You get a report that shows what AI is saying, who it recommends, and what to fix first.
          </p>
        </AnimateIn>

        <AnimateIn stagger className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {deliverables.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -2, boxShadow: "0 26px 60px rgba(2, 8, 23, 0.28)" }}
              className="glass-card rounded-[1.6rem] p-5 sm:p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-[color:var(--accent)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66 sm:text-base sm:leading-7">{item.description}</p>
            </motion.div>
          ))}
        </AnimateIn>

        <AnimateIn className="mt-8 rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_24px_70px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:mt-10 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center lg:gap-8">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46 sm:text-sm">
                Report format
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[1.9rem]">
                Built to be reviewed fast and shared easily
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 sm:text-base sm:leading-7">
                The deliverable is structured for owners, GMs, and agency partners. You can skim the
                headline findings first, then drop into the detailed prompt evidence and action list.
              </p>
              <p className="mt-4 inline-flex items-center rounded-full border border-cyan-400/16 bg-cyan-400/8 px-4 py-2 text-sm font-medium text-cyan-100">
                Delivered as a branded PDF
              </p>
            </div>

            <motion.div
              whileHover={{ y: -2, boxShadow: "0 26px 60px rgba(2, 8, 23, 0.28)" }}
              className="glass-card rounded-[1.8rem] p-4 sm:p-5"
            >
              <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/46">
                      Audit preview
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-white sm:text-xl">Business visibility report</h4>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-white/10 bg-white/8 px-3 py-2.5 text-right sm:px-4 sm:py-3">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/46 sm:text-[11px]">
                      Score
                    </p>
                    <p className="font-mono text-2xl font-semibold text-white sm:text-3xl">42/100</p>
                  </div>
                </div>

                <AnimateIn stagger className="mt-5 space-y-3 sm:mt-6">
                  {[
                    "Executive summary and key findings",
                    "Platform-by-platform score breakdown",
                    "Competitor comparison and market gaps",
                    "Priority fixes ranked by impact",
                  ].map((line) => (
                    <div
                      key={line}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                      <span className="text-sm font-medium text-white/76">{line}</span>
                    </div>
                  ))}
                </AnimateIn>
              </div>
            </motion.div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
