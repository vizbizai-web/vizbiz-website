"use client";

import { Building2, MessageSquare, Search } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

const prompts = [
  "Best Honda dealer near me",
  "Most reliable used car lot in [city]",
  "Where should I buy a used SUV in [city]?",
  "Which dealership has the best financing options near me?",
  "Top-rated Toyota dealer in [city]",
];

const signals = [
  {
    icon: MessageSquare,
    title: "Buyers ask AI first",
    description: "More shoppers start with ChatGPT, Gemini, or Perplexity before they ever open a listing site.",
  },
  {
    icon: Search,
    title: "AI narrows the field",
    description: "The answer often names a short list of dealers, which shapes who gets researched next.",
  },
  {
    icon: Building2,
    title: "Visibility now happens earlier",
    description: "A store can lose the shopper before its website, inventory page, or ad ever gets a click.",
  },
];

export default function Problem() {
  return (
    <section
      className="section-shell section-transition section-divider bg-[#0b1019] py-16 sm:py-20 lg:py-28"
      style={{ ["--transition-from" as string]: "#090c13" }}
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-14">
          <AnimateIn>
            <div className="section-kicker">Buyer behavior shift</div>
            <h2 className="display-font mt-6 max-w-3xl text-[2.45rem] font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-[2.9rem] lg:text-[3.45rem]">
              The Shift Buyers Are Making
            </h2>
            <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-white/70 sm:text-[1.18rem] sm:leading-9">
              Car buyers are starting with AI answers, not just Google results. They ask who to trust,
              where to shop, and which dealership looks strongest before they visit Cars.com,
              AutoTrader, or your website.
            </p>

            <AnimateIn stagger className="mt-9 grid gap-4 sm:grid-cols-3">
              {signals.map((signal) => (
                <motion.div
                  key={signal.title}
                  whileHover={{ y: -2, boxShadow: "0 26px 60px rgba(2, 8, 23, 0.28)" }}
                  className="glass-card rounded-[1.6rem] p-5 sm:p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-[color:var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <signal.icon className="h-5 w-5" />
                  </div>
                  <h3 className="display-font mt-4 text-lg font-bold tracking-[-0.03em] text-white">{signal.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/66">{signal.description}</p>
                </motion.div>
              ))}
            </AnimateIn>
          </AnimateIn>

          <AnimateIn delay={0.1}>
            <div className="glass-card rounded-[1.8rem] border-[#ffb161]/10 p-4 sm:p-6 lg:p-7">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-[color:var(--primary)]">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="display-font text-[11px] font-bold uppercase tracking-[0.24em] text-white/48 sm:text-sm">
                      What shoppers ask
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/70 sm:text-base">
                      These are the kinds of prompts shaping dealer consideration.
                    </p>
                  </div>
                </div>

                <div className="mt-6 accent-rule" />

                <AnimateIn stagger className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                  {prompts.map((prompt, index) => (
                    <motion.div
                      key={prompt}
                      whileHover={{ y: -2, boxShadow: "0 18px 34px rgba(2, 8, 23, 0.18)" }}
                      className={`glass-card rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${index >= 3 ? "hidden sm:block" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border border-[#ffb161]/20 bg-[#ff8a2c]/10 px-2 text-xs font-semibold text-[#ffe6b9]">
                          {index + 1}
                        </span>
                        <p className="min-w-0 break-words text-sm leading-6 text-white/84 sm:text-base sm:leading-7">“{prompt}”</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimateIn>

                <div className="mt-6 rounded-[1.35rem] border border-[#ffb161]/18 bg-[linear-gradient(180deg,rgba(255,122,0,0.14)_0%,rgba(255,255,255,0.03)_100%)] p-4 shadow-[0_18px_42px_rgba(255,122,0,0.08)] sm:mt-8 sm:p-6">
                  <p className="display-font text-lg font-bold leading-8 tracking-[-0.03em] text-white sm:text-[1.35rem]">
                    If AI doesn&apos;t mention you, you lose the customer before they reach your website.
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
