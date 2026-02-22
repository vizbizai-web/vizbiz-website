"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles, Shield } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "AVI Audit Only",
      price: "$1,500-2,500",
      description: "Complete AI visibility assessment",
      features: [
        "Complete AI visibility assessment",
        "AVI Score with competitor benchmarking",
        "20 AI query test results",
        "Priority action roadmap",
        "1-hour strategy call",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Audit + Implementation",
      price: "$3,500-5,000",
      description: "We implement the quick wins for you",
      features: [
        "Everything in Audit Only",
        "We implement the quick wins for you",
        "Google Business Profile optimization",
        "Schema markup installation",
        "Review response templates",
        "30-day implementation support",
      ],
      cta: "Most Popular",
      popular: true,
    },
    {
      name: "Monthly Monitoring",
      price: "$750-1,500",
      period: "/month",
      description: "Ongoing tracking and optimization",
      features: [
        "Monthly AVI Score updates",
        "Competitor movement alerts",
        "Ongoing optimization",
        "Quarterly strategy reviews",
        "Priority support",
      ],
      cta: "Subscribe",
      popular: false,
    },
    {
      name: "Full AI Visibility Management",
      price: "$2,000-3,500",
      period: "/month",
      description: "Complete AI visibility management",
      features: [
        "Everything in Monthly Monitoring",
        "We handle all ongoing optimization",
        "Content updates and schema maintenance",
        "Review monitoring and response",
        "Monthly performance reports",
        "Guaranteed 10+ point AVI Score improvement in 90 days or month 4 is free",
      ],
      cta: "Get Full Management",
      popular: false,
      guarantee: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Investment
          </h2>
          <p className="text-lg text-gray-600">
            Transparent pricing. No hidden fees. Know exactly what you&apos;re paying for upfront.
          </p>
        </div>
        
        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 border ${
                plan.popular
                  ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xl"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              {/* Guarantee Badge */}
              {plan.guarantee && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-full">
                    <Shield className="w-4 h-4" />
                    Guaranteed Results
                  </div>
                </div>
              )}
              
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </div>
              
              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Link
                href="#contact"
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-colors ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Not sure which plan is right for you?
          </p>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
          >
            Schedule a Free Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            No commitment required. See your score before you decide anything.
          </p>
        </div>
      </div>
    </section>
  );
}
