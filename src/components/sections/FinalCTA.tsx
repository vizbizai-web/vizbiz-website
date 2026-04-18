"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

export default function FinalCTA() {
  return (
    <section
      id="cta"
      className="section-shell section-transition section-divider relative isolate overflow-hidden bg-[#070a11] py-14 text-white sm:py-18 lg:py-24"
      style={{ ["--transition-from" as string]: "#111722" }}
    >
      <div className="hero-mesh opacity-70" aria-hidden="true" />
      <div className="hero-glow hero-glow-one opacity-70" aria-hidden="true" />
      <div className="hero-glow hero-glow-two opacity-55" aria-hidden="true" />
      <div className="hero-sweep opacity-80" aria-hidden="true" />
      <div className="hero-orb hero-orb-one opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_36%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-3 text-center sm:px-6 lg:px-8">
        <AnimateIn className="mx-auto max-w-4xl rounded-[2rem] border border-[#ffb161]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.045)_100%)] px-4 py-8 shadow-[0_30px_90px_rgba(2,8,23,0.38)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-14 lg:py-14">
          <div className="instrument-badge max-w-full">Free score first. Full audit when you want more depth.</div>

          <h2 className="display-font mt-5 text-[2.45rem] font-bold leading-[0.92] tracking-[-0.05em] text-white sm:text-[3rem] lg:text-[4rem]">
            Find out whether AI is recommending your dealership — or leaving you out.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-[1.02rem] leading-7 text-white/74 sm:text-[1.12rem] sm:leading-8 lg:text-[1.22rem]">
            Start with the intake, get your baseline, and move forward with a report that shows what
            buyers actually see when they ask AI where to shop.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.02, y: -1 }}>
              <Link
                href="/intake/"
                className="premium-button inline-flex min-h-14 items-center justify-center rounded-2xl px-7 py-4 text-base font-bold"
              >
                Get My Free Score
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -1, boxShadow: "0 20px 40px rgba(2, 8, 23, 0.24)" }}>
              <Link
                href="/book-call/"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-6 py-4 text-base font-medium text-white/84 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Book a 15-minute call
              </Link>
            </motion.div>
          </div>

          <p className="mt-4 text-sm text-white/56 sm:mt-5 sm:text-[0.95rem]">
            Short intake form. One-time audit. Clear next steps.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
