"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How is this different from regular SEO?",
      answer: "Traditional SEO gets you to rank #1 on Google. AI visibility gets you cited when someone asks ChatGPT for a recommendation. Different algorithms, different signals, same goal: more customers. While traditional SEO focuses on keywords and backlinks, AI visibility focuses on entity recognition, sentiment analysis, and becoming a trusted source that AI systems cite.",
    },
    {
      question: "Can you guarantee we'll be #1 in AI search?",
      answer: "No. Anyone who guarantees that is lying—AI systems are opaque and constantly changing. What we guarantee is measurable improvement in your AVI Score, which correlates with AI visibility. Most clients see significant improvement within 60 days, and we offer a guarantee for our Full Management clients: 10+ AVI Score points in 90 days or month 4 is free.",
    },
    {
      question: "Do we need to change our website?",
      answer: "Sometimes. Often the fixes are technical (schema markup, entity optimization) that don't change how your site looks to humans. When content changes are needed, we guide you through them. Our implementation support includes hands-on help with any changes required.",
    },
    {
      question: "How long until we see results?",
      answer: "You'll see your AVI Score and competitive position immediately after the audit. Most clients see score improvements within 30 days of implementation. Full results typically show within 60-90 days. AI systems need time to re-crawl and process changes, but the timeline is much faster than traditional SEO.",
    },
    {
      question: "What if our competitors are already doing this?",
      answer: "Then you're already behind. But most dealerships aren't—yet. The window to establish AI visibility dominance in your market is closing. The earlier you start, the harder it is for competitors to catch up. We've seen dealerships go from invisible to #1 in their market in just a few months.",
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Common Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about AI visibility
          </p>
        </div>
        
        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Still have questions */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
