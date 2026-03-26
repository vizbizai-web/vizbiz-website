"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";

const faqs = [
  {
    question: "Is AI search actually changing how people find dealerships?",
    answer:
      'Yes. Buyers now ask ChatGPT, Gemini, and Perplexity questions like "best Honda dealer near me" before they ever visit a listing site. We show you the actual AI responses about your store — not theory, real answers.',
  },
  {
    question: "What exactly do you test?",
    answer:
      'We run 20-25 real buyer-intent questions across five AI platforms: ChatGPT, Gemini, Perplexity, Claude, and Copilot. Questions like "most trusted used car lot in [your city]" and "best financing options near me." We record every response.',
  },
  {
    question: "When will I see my results?",
    answer:
      "Free AI Visibility Score: instantly. Full paid audit: same day. No waiting weeks or months.",
  },
  {
    question: "Do I need to do anything technical?",
    answer:
      "No. Give us your dealership name, market, and top competitors. We handle everything else.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. One-time purchase. No recurring charges, no contracts, nothing to cancel.",
  },
  {
    question: "How is this different from what my marketing agency does?",
    answer:
      "Your agency handles ads, listings, and search rankings. AI visibility is a separate channel — when buyers ask AI directly, different rules apply. This audit covers what they don't. Hand them the report and they'll know what to act on.",
  },
  {
    question: "What format is the report?",
    answer:
      "PDF with an executive summary, score breakdown, competitor comparison, prompt-by-prompt findings, and a prioritized list of what to fix first. Designed to share with your team or agency.",
  },
  {
    question: "What if AI doesn't recommend any dealership in my area?",
    answer:
      "That's a finding worth knowing. It means the market is wide open and whoever moves first wins the recommendations.",
  },
  {
    question: "What if the report isn't useful?",
    answer: "If we can't complete the audit as scoped, you don't pay.",
  },
  {
    question: "What if I have multiple locations?",
    answer:
      "Premium tier handles multi-location audits with custom scope. Contact us and we'll figure out the right fit.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="section-shell section-transition section-divider bg-[#0d1f3a] py-14 sm:py-18 lg:py-24"
      style={{ ["--transition-from" as string]: "#0a1628" }}
    >
      <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
        <AnimateIn className="mx-auto max-w-3xl text-center">
          <div className="section-kicker">Objection handling</div>
          <h2 className="mt-5 text-[2.1rem] font-semibold tracking-[-0.02em] text-white sm:text-[2.45rem] lg:text-[2.9rem]">
            Questions buyers ask before they commit.
          </h2>
          <p className="mt-5 text-[1.02rem] leading-7 text-white/70 sm:text-[1.12rem] sm:leading-8">
            These are the common concerns we hear before a dealership decides to run the audit.
          </p>
        </AnimateIn>

        <AnimateIn className="mt-8 rounded-[1.8rem] border border-cyan-400/14 bg-[linear-gradient(180deg,rgba(6,182,212,0.1)_0%,rgba(255,255,255,0.03)_100%)] p-4 text-sm text-white/72 shadow-[0_24px_70px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5 sm:text-base">
          <p>Still unsure? Start with the free score and decide after you see the baseline.</p>
          <Link href="#pricing" className="mt-3 inline-flex font-semibold text-cyan-100 transition-colors hover:text-white sm:mt-0">
            Jump to pricing
          </Link>
        </AnimateIn>

        <AnimateIn className="mt-8 rounded-[1.9rem] border border-white/8 bg-white/[0.04] p-3 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl sm:p-4">
          <div className="rounded-[1.5rem] bg-white/[0.02] px-4 py-1 sm:px-6 sm:py-2">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={faq.question} className="border-b border-white/8 last:border-b-0">
                  <motion.button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    whileHover={{ y: -1 }}
                    className="flex w-full items-start justify-between gap-4 py-5 text-left sm:items-center sm:gap-6 sm:py-6"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-2 text-base font-semibold leading-7 text-white sm:text-lg">{faq.question}</span>
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/72 shadow-[0_8px_20px_rgba(2,8,23,0.14)]">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-0 text-sm leading-6 text-white/66 sm:pb-6 sm:pr-14 sm:text-base sm:leading-7">
                          {faq.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </AnimateIn>

        <AnimateIn className="mt-8 text-center sm:mt-10">
          <p className="text-sm leading-6 text-white/62 sm:text-base">
            Ready to see where AI is helping you — and where it is costing you visibility?
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm sm:gap-4">
            <motion.div whileHover={{ y: -1 }}>
              <Link href="#social-proof" className="font-semibold text-cyan-200 transition-colors hover:text-white">
                See sample proof
              </Link>
            </motion.div>
            <span className="text-white/22">•</span>
            <motion.div whileHover={{ y: -1 }}>
              <Link href="#pricing" className="font-semibold text-cyan-200 transition-colors hover:text-white">
                Get my score
              </Link>
            </motion.div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
