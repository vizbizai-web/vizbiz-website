"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "One-Time Full Report + Fix",
      price: "$88",
      period: "USD",
      description: "A one-time local AI visibility report with the exact fixes your site/profile can use next.",
      features: [
        "Full local AI visibility report expanded from the free preview",
        "Two nearby competitor recommendation gap analysis",
        "Prompt evidence, answer excerpts, and citation/source notes where available",
        "Website, schema, GBP, reviews, and machine-readiness audit",
        "Prioritized fix list for the signals most likely to block AI recommendations",
      ],
      cta: "Get the $88 Full Report + Fix",
      popular: false,
    },
    {
      name: "Monthly Full Report Growth Plan",
      price: "$188",
      period: "USD / month",
      description: "Monthly reporting, local competitor movement, and ongoing action planning so your AI visibility keeps improving.",
      features: [
        "Everything in the one-time full report",
        "Monthly AI visibility score refresh",
        "Nearby competitor movement alerts",
        "New buyer-question testing and fresh gap checks",
        "Updated monthly action plan for website, reviews, schema, and local trust signals",
      ],
      cta: "Start the $188 Monthly Growth Plan",
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="bg-gradient-to-br from-[#FAF7F2] to-[#F2EDE4] py-20 text-[#0F172A] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#06B6D4]">Paid next steps</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Two simple ways to turn the free preview into action.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            Start with the free local score. Then choose the one-time $88 full report and fix list, or the $188/month growth plan when you want monthly tracking and fresh competitor movement updates.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[2rem] border bg-white/80 p-8 shadow-sm ${
                plan.popular
                  ? "border-[#22D3EE] ring-2 ring-cyan-300/20 shadow-xl"
                  : "border-[#0F172A]/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 rounded-full bg-[#020617] px-4 py-1.5 text-sm font-semibold text-cyan-100">
                    <Sparkles className="h-4 w-4" />
                    Best for local growth
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0F172A]">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-end gap-2">
                <span className="text-5xl font-bold text-[#0F172A]">{plan.price}</span>
                <span className="pb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100">
                      <Check className="h-3 w-3 text-[#06B6D4]" />
                    </div>
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="#free-mini-report"
                className={`block w-full rounded-xl px-6 py-3 text-center font-semibold transition-colors ${
                  plan.popular
                    ? "bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] text-[#020617]"
                    : "bg-[#0F172A] text-white hover:bg-[#020617]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-slate-600">Not sure which option fits?</p>
          <Link href="#free-mini-report" className="inline-flex items-center gap-2 font-semibold text-[#06B6D4] hover:text-[#0891B2]">
            Run my free local AI visibility report
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-sm text-slate-500">No commitment required. See your score before you decide anything.</p>
        </div>
      </div>
    </section>
  );
}
