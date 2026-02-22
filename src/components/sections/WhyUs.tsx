"use client";

import { Car, MapPin, Award, DollarSign, ShieldCheck } from "lucide-react";

export default function WhyUs() {
  const differentiators = [
    {
      icon: Car,
      title: "We're Dealership Specialists",
      description: "Not a generic marketing agency. We only work with car dealerships. We know your business, your customers, and your competition.",
    },
    {
      icon: MapPin,
      title: "Local Market Experts",
      description: "We focus on the GTA—Oakville, Mississauga, Burlington, Hamilton. We know these markets, these customers, and these competitors.",
    },
    {
      icon: Award,
      title: "Proprietary Methodology",
      description: "The AVI Score™ isn't a generic audit. It's a scoring system we developed specifically for dealerships, tested against thousands of real AI queries.",
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "No hidden fees. No 'contact us for pricing.' You know exactly what you're paying for upfront.",
    },
    {
      icon: ShieldCheck,
      title: "Results-Based Guarantee",
      description: "Our Full Management clients get a guarantee: 10+ AVI Score points in 90 days or month 4 is free.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Why Work With Us?
          </h2>
          <p className="text-lg text-gray-300">
            We&apos;re not another marketing agency. We&apos;re AI visibility specialists for car dealerships.
          </p>
        </div>
        
        {/* Differentiators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 ${
                index === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
        
        {/* Comparison Table */}
        <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            VizBiz.ai vs. Traditional SEO Agencies
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-blue-400 font-bold">VizBiz.ai</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Traditional SEO</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "AI-specific optimization", vizbiz: true, traditional: false },
                  { feature: "Dealership-only focus", vizbiz: true, traditional: false },
                  { feature: "AVI Score tracking", vizbiz: true, traditional: false },
                  { feature: "ChatGPT visibility", vizbiz: true, traditional: false },
                  { feature: "Google ranking", vizbiz: true, traditional: true },
                  { feature: "Local market expertise", vizbiz: true, traditional: "Maybe" },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="py-4 px-4 text-gray-300">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.vizbiz === true ? (
                        <svg className="w-6 h-6 text-green-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-gray-500">{row.vizbiz}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.traditional === true ? (
                        <svg className="w-6 h-6 text-green-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : row.traditional === false ? (
                        <svg className="w-6 h-6 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-yellow-400 text-sm">{row.traditional}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
