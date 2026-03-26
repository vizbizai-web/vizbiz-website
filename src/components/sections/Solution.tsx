"use client";

import { BarChart3, CheckCircle2, MapPinned, Search, Target } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

const findings = [
  {
    icon: BarChart3,
    title: "AI Visibility Score",
    description: "A simple score that shows how often your dealership appears across the AI platforms tested.",
  },
  {
    icon: Search,
    title: "Platform-by-platform findings",
    description: "See where you show up in ChatGPT, Gemini, Perplexity, Claude, and Copilot — and where you don't.",
  },
  {
    icon: CheckCircle2,
    title: "Prompt-level examples",
    description: "Real prompts, captured responses, and clear examples of how AI talks about your store.",
  },
  {
    icon: MapPinned,
    title: "Local competitor comparison",
    description: "Spot which nearby dealerships get recommended first and where they are beating you.",
  },
  {
    icon: Target,
    title: "Ranked action plan",
    description: "A practical fix list ordered by what matters first, so your team or agency knows where to start.",
  },
];

export default function Solution() {
  return (
    <section
      className="section-shell section-transition section-divider bg-[#111722] py-16 sm:py-20 lg:py-28"
      style={{ ["--transition-from" as string]: "#0b1019" }}
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <AnimateIn className="max-w-3xl">
          <div className="section-kicker">Audit output</div>
          <h2 className="display-font mt-6 text-[2.45rem] font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-[2.9rem] lg:text-[3.45rem]">
            What the Audit Tells You
          </h2>
          <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-white/70 sm:text-[1.18rem] sm:leading-9">
            We show you where your dealership appears, where it doesn&apos;t, and which competitors AI
            recommends instead.
          </p>
        </AnimateIn>

        <AnimateIn stagger className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-5">
          {findings.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -2, boxShadow: "0 26px 60px rgba(2, 8, 23, 0.28)" }}
              className="glass-card rounded-[1.6rem] p-5 sm:p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-[color:var(--primary)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="display-font mt-4 text-lg font-bold tracking-[-0.03em] text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/66">{item.description}</p>
            </motion.div>
          ))}
        </AnimateIn>

        <AnimateIn className="mt-8 rounded-[1.8rem] border border-[#ffb161]/16 bg-[radial-gradient(circle_at_right_top,rgba(255,122,0,0.18),transparent_32%),rgba(255,255,255,0.05)] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:mt-10 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="display-font text-[11px] font-bold uppercase tracking-[0.24em] text-[#ffd8a8]/74 sm:text-sm">
                Evidence, not guesswork
              </p>
              <p className="mt-2 max-w-2xl text-base leading-7 text-white sm:text-lg sm:leading-8">
                Not opinions. Actual AI responses captured and reviewed.
              </p>
            </div>
            <div className="instrument-badge self-start">Built to share with your team or agency</div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
