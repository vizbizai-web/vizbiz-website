"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";
import PhoneMockup, {
  AuditReportScreen,
  CompetitorAnalysisScreen,
  ScoreScreen,
} from "@/components/PhoneMockup";

const trustItems = [
  "3 AI platforms tested",
  "5 buyer prompts per engine",
  "Local competitor benchmarking",
  "Human-reviewed findings, not raw screenshots",
];

export default function SocialProof() {
  return (
    <section
      id="social-proof"
      className="section-shell section-transition section-divider bg-[#0b1019] py-14 sm:py-18 lg:py-24"
      style={{ ["--transition-from" as string]: "#111722" }}
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] lg:items-center lg:gap-12">
          <AnimateIn className="max-w-2xl">
            <div className="section-kicker">Sample proof</div>
            <h2 className="display-font mt-5 text-[2.3rem] font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-[2.7rem] lg:text-[3.15rem]">
              See the kind of report your team can act on.
            </h2>
            <p className="mt-5 text-[1.02rem] leading-7 text-white/70 sm:text-[1.12rem] sm:leading-8">
              Every finding is built from real buyer-intent prompts, captured responses, competitor
              comparison, and human review.
            </p>

            <div className="mt-6 rounded-[1.45rem] border border-[#ffb161]/18 bg-[linear-gradient(180deg,rgba(255,122,0,0.14)_0%,rgba(255,255,255,0.03)_100%)] p-5 shadow-[0_18px_46px_rgba(255,122,0,0.1)] sm:p-6">
              <p className="display-font text-lg font-bold tracking-[-0.03em] text-white">
                Not opinions. Actual AI responses captured and reviewed.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/66 sm:text-base sm:leading-7">
                The goal is simple: show where you appear, where you do not, and what needs to change first.
              </p>
            </div>

            <AnimateIn stagger className="mt-6 grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -2, boxShadow: "0 18px 34px rgba(2, 8, 23, 0.18)" }}
                  className="glass-card flex items-start gap-3 rounded-2xl p-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#ffb161]/20 bg-[#ff8a2c]/10 text-[#ffe6b9]">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white/76 sm:text-base">{item}</p>
                </motion.div>
              ))}
            </AnimateIn>

            <motion.div whileHover={{ x: 4 }} className="mt-7 inline-block">
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 text-base font-semibold text-[#ffd8a8] transition-colors hover:text-white"
              >
                See pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </AnimateIn>

          <AnimateIn delay={0.1} className="space-y-4">
            <div className="relative">
              <div className="phone-stage-glow bottom-4" aria-hidden="true" />
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5 lg:justify-end">
                <motion.div whileHover={{ y: -4, rotate: -3, boxShadow: "0 30px 90px rgba(2, 8, 23, 0.3)" }} className="w-full max-w-[260px] sm:w-auto">
                  <PhoneMockup className="w-full sm:max-w-[235px] [transform:perspective(1200px)_rotateY(12deg)_rotate(-3deg)]">
                    <ScoreScreen />
                  </PhoneMockup>
                </motion.div>
                <motion.div whileHover={{ y: -4, rotate: 2, boxShadow: "0 30px 90px rgba(2, 8, 23, 0.3)" }} className="hidden sm:block">
                  <PhoneMockup className="sm:max-w-[235px] [transform:perspective(1200px)_rotateY(-8deg)_rotate(2deg)]">
                    <AuditReportScreen />
                  </PhoneMockup>
                </motion.div>
                <motion.div whileHover={{ y: -4, rotate: -2, boxShadow: "0 30px 90px rgba(2, 8, 23, 0.3)" }} className="hidden lg:block">
                  <PhoneMockup className="sm:max-w-[235px] [transform:perspective(1200px)_rotateY(6deg)_rotate(-2deg)]">
                    <CompetitorAnalysisScreen />
                  </PhoneMockup>
                </motion.div>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-white/54 lg:text-right">
              Score view, audit summary, and competitor comparison — all in one report flow.
            </p>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
