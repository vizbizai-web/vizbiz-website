"use client";

import { Sparkles, Target, LineChart, Brain } from "lucide-react";

export default function Solution() {
  const features = [
    {
      icon: Brain,
      title: "AI Systems Analysis",
      description: "We analyze exactly how ChatGPT, Google AI, Perplexity, and other AI systems see your dealership.",
    },
    {
      icon: Target,
      title: "Competitor Intelligence",
      description: "Identify why AI might be choosing your competitors and get the exact playbook to beat them.",
    },
    {
      icon: LineChart,
      title: "Clear Roadmap",
      description: "Get a prioritized action plan with specific steps to improve your AI visibility score.",
    },
    {
      icon: Sparkles,
      title: "Ongoing Monitoring",
      description: "Track your AVI Score over time and stay ahead as AI algorithms evolve.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            The Solution
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            AI Visibility Intelligence for Car Dealerships
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            We help car dealerships become the answer AI systems recommend—across ChatGPT, 
            Google AI Overviews, Perplexity, and emerging AI search platforms.
          </p>
          <p className="text-blue-600 font-semibold">
            Not generic SEO. Not traditional marketing. AI-specific visibility.
          </p>
        </div>
        
        {/* Description */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <p className="text-gray-700 text-lg leading-relaxed">
              We analyze exactly how AI systems see your dealership, identify why they might be 
              choosing your competitors, and give you a clear roadmap to fix it.
            </p>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white rounded-2xl p-6 border border-gray-200 card-hover"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {/* AVI Score Explanation */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                What is the AVI Score™?
              </h3>
              <p className="text-gray-300 mb-6">
                The AI Visibility Intelligence Score is a proprietary metric (0-100) that measures 
                how likely AI systems are to recommend your dealership. It&apos;s calculated across 
                23 data points in 5 critical categories.
              </p>
              <ul className="space-y-3">
                {[
                  "AI query response rate",
                  "Review sentiment analysis",
                  "Entity recognition strength",
                  "Citation consistency",
                  "Technical schema markup",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                {/* Score Visualization */}
                <div className="flex items-end gap-4">
                  <div className="text-center">
                    <div className="w-20 h-32 bg-red-500 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold">0-40</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Poor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-40 bg-orange-500 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold">41-60</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Average</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-48 bg-blue-500 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold">61-80</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Good</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-56 bg-green-500 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold">81-100</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Excellent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
