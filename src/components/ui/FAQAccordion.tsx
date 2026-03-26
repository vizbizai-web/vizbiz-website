"use client";

import { useState } from "react";

type Item = { question: string; answer: string };

export default function FAQAccordion({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.question} className="glass-card rounded-[1.75rem] p-4 sm:p-6">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
            >
              <h3 className="text-lg font-semibold leading-7 sm:text-xl">{item.question}</h3>

              <svg
                className="h-6 w-6 shrink-0 text-[var(--text-secondary)] transition-transform duration-200"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                {isOpen ? (
                  <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <>
                    <path d="M12 6V18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 12H18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
            </button>

            {isOpen && (
              <p id={`faq-answer-${idx}`} className="mt-4 text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
