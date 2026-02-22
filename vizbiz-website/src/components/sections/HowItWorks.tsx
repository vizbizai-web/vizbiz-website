"use client";

import { ClipboardCheck, Map, Wrench, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: ClipboardCheck,
      title: "The Audit",
      duration: "Week 1",
      description: "We analyze your dealership across 23 data points in 5 critical categories. We test real AI queries, audit your review presence, check your technical foundation, and benchmark you against every competitor in your market.",
      deliverables: [
        "Complete AVI Score assessment",
        "20 AI query test results",
        "Competitor benchmarking report",
        "Technical audit findings",
      ],
    },
    {
      number: "02",
      icon: Map,
      title: "The Roadmap",
      duration: "Week 2",
      description: "You get your complete AVI Scorecard with specific recommendations prioritized by impact. We walk you through it together—no jargon, just clear actions with clear outcomes.",
      deliverables: [
        "Priority action roadmap",
        "Effort vs. impact analysis",
        "Quick wins identification",
        "1-hour strategy call",
      ],
    },
    {
      number: "03",
      icon: Wrench,
      title: "Implementation",
      duration: "Weeks 3-4",
      description: "We help you implement the quick wins immediately. Schema markup, Google Business optimization, review response strategy—whatever moves your score fastest. You see improvement within 30 days.",
      deliverables: [
        "Hands-on implementation support",
        "Schema markup installation",
        "GBP optimization",
        "30-day progress check",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            From Audit to AI Visibility in 30 Days
          </h2>
          <p className="text-lg text-gray-600">
            A simple, proven process to transform your AI visibility
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              )}
              
              <div className="relative z-10 bg-gray-50 rounded-2xl p-8 border border-gray-200 h-full">
                {/* Step Header */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-bold text-gray-200">{step.number}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {step.duration}
                  </span>
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-6">{step.description}</p>
                
                {/* Deliverables */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What you get:</p>
                  <ul className="space-y-2">
                    {step.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline Summary */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Most dealerships see measurable improvement in their AVI Score within 30 days. 
            The sooner you start, the harder it is for competitors to catch up.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Get Your Free Assessment
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
