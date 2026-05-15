"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

const plans = [
  {
    name: "Starter",
    price: "$497",
    description: "Best if you want a clear baseline on where your business stands now.",
    features: ["Full audit", "20 prompts", "3 competitors", "PDF report"],
    featured: false,
    helper: "Good for a first look",
  },
  {
    name: "Standard",
    price: "$997",
    description: "Best fit for most businesses that want a fuller competitive picture.",
    features: [
      "Full audit",
      "25 prompts",
      "5 competitors",
      "PDF report",
      "30-minute walkthrough call",
    ],
    featured: true,
    helper: "Best fit for most businesses",
  },
  {
    name: "Premium",
    price: "$1,500+",
    description: "Best for multi-location groups or custom scope that needs more depth.",
    features: [
      "Expanded audit",
      "25+ prompts",
      "5+ competitors",
      "Walkthrough call",
      "Multi-location/custom scope",
    ],
    featured: false,
    helper: "Custom scope available",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="section-shell section-transition section-divider bg-[#0c1018] py-14 sm:py-18 lg:py-24"
      style={{ ["--transition-from" as string]: "#070a11" }}
    >
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <AnimateIn className="mx-auto max-w-3xl text-center">
          <div className="section-kicker">One-time pricing</div>
          <h2 className="display-font mt-5 text-[2.3rem] font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-[2.7rem] lg:text-[3.15rem]">
            Pick the audit scope and move.
          </h2>
          <p className="mt-5 text-[1.02rem] leading-7 text-white/70 sm:text-[1.12rem] sm:leading-8">
            Choose the level of competitive detail you need, complete the intake, and we handle the
            rest.
          </p>
        </AnimateIn>

        <AnimateIn className="mx-auto mt-6 max-w-4xl rounded-[1.6rem] border border-[#ffb161]/18 bg-[linear-gradient(180deg,rgba(255,122,0,0.12)_0%,rgba(255,255,255,0.03)_100%)] p-4 text-sm text-[#ffe7c4]/90 shadow-[0_18px_48px_rgba(2,8,23,0.22)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5 sm:text-base">
          <p>One-time purchase. No subscription. No long-term contract.</p>
          <Link href="/book-call/" className="mt-3 inline-flex font-semibold text-white transition-colors hover:text-[#ffd8a8] sm:mt-0">
            Need custom scope? Book a quick call.
          </Link>
        </AnimateIn>

        <div className="mt-8 grid gap-4 overflow-visible lg:grid-cols-3 lg:items-stretch lg:gap-5">
          {plans.map((plan, index) => (
            <AnimateIn key={plan.name} delay={index === 1 ? 0.16 : index * 0.08}>
              <motion.div
                whileHover={{
                  y: -2,
                  boxShadow: plan.featured
                    ? "0 34px 90px rgba(255, 122, 0, 0.2)"
                    : "0 28px 70px rgba(2, 8, 23, 0.3)",
                }}
                className={`relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl ${
                  plan.featured ? "p-6 pt-10 sm:p-7 sm:pt-10" : "p-6 sm:p-7"
                } ${
                  plan.featured
                    ? "border-[#ffb161]/45 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,0,0.18),transparent_28%),rgba(255,255,255,0.07)]"
                    : "border-white/8 bg-white/[0.05]"
                }`}
              >
                {plan.featured && (
                  <>
                    <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.18)_0%,transparent_62%)]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffd278]/80 to-transparent" />
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(50%+1px)]">
                      <span className="instrument-badge whitespace-nowrap border-[#ffd278]/30 bg-[#ffb161]/14 text-[#fff0d5]">
                        Recommended
                      </span>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/42">{plan.helper}</p>
                  <h3 className="display-font mt-3 text-[2rem] font-bold tracking-[-0.04em] text-white">{plan.name}</h3>
                  <p className="display-font mt-3 text-[2.9rem] font-bold tracking-[-0.05em] text-white sm:text-[3.2rem]">
                    {plan.price}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-white/66 sm:text-base sm:leading-7">{plan.description}</p>
                </div>

                <div className="mt-5 accent-rule" />

                <ul className="mt-6 space-y-3.5 sm:space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/78 sm:text-base">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#ffb161]/20 bg-[#ff8a2c]/10 text-[#ffe6b9]">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/62">
                  Start with intake. We confirm scope before delivery.
                </div>

                <div className="mt-7 flex-1" />

                <motion.div whileHover={{ scale: 1.02, y: -1 }} className="mt-7">
                  <Link
                    href={`/intake?plan=${plan.name.toLowerCase()}`}
                    className={`inline-flex min-h-13 w-full items-center justify-center rounded-2xl px-6 py-3.5 text-base font-bold transition-all duration-200 ${
                      plan.featured
                        ? "premium-button"
                        : "border border-white/12 bg-white/6 text-white hover:border-white/18 hover:bg-white/10"
                    }`}
                  >
                    Choose {plan.name}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
