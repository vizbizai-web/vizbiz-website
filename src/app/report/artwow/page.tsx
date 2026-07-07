import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
export default function ARTWOWReport() {
  const businessData = {
    name: "ARTWOW",
    website: "artwow.co",
    location: "London, UK",
    contact: "liz@artwow.co",
    niche: "Art & Creative Business"
  };

  const auditResults = {
    overallScore: 89,
    totalPrompts: 19,
    appearedIn: 17,
    competitorsTracked: 2,
    quickWins: 2,
    categories: {
      discovery: { score: 95, prompts: 6, color: "green" },
      trust: { score: 85, prompts: 5, color: "green" },
      portfolioInquiry: { score: 90, prompts: 4, color: "green" },
      localRegional: { score: 80, prompts: 4, color: "green" }
    }
  };

  const competitors = [
    { name: "ARTWOW", score: 89, highlight: "client" },
    { name: "Red Bubble", score: 72 },
    { name: "Eleanor Bowmer", score: 45 }
  ];

  const progressPlan = {
    phase1: {
      name: "Foundation",
      timeline: "Month 1",
      subtitle: "Quick Wins",
      color: "amber",
      items: [
        { icon: "🔧", text: "Audit all online listings and ensure consistency across platforms" },
        { icon: "📝", text: "Create dedicated pages for key art categories and services" },
        { icon: "⭐", text: "Launch review collection campaign targeting recent clients" },
        { icon: "🎯", text: "Optimize for London-specific art and design search queries" },
        { icon: "📊", text: "Baseline AVI score: 89/100" }
      ],
      targetScore: 92,
      hasSubtitle: true
    },
    phase2: {
      name: "Build Momentum",
      timeline: "Months 2-3",
      color: "blue",
      items: [
        { icon: "📈", text: "Expand content to cover all art style and medium queries" },
        { icon: "🔗", text: "Build backlinks from UK art directories and design publications" },
        { icon: "💬", text: "Start social proof content: client testimonials, portfolio showcases" },
        { icon: "🏆", text: "Target: Trust & Reviews category to 95%+" },
        { icon: "📊", text: "Target AVI score: 94/100" }
      ],
      targetScore: 94
    },
    phase3: {
      name: "Competitive Advantage",
      timeline: "Months 3-4",
      color: "purple",
      items: [
        { icon: "⚔️", text: "Target Red Bubble and Eleanor Bowmer visibility gaps" },
        { icon: "🗺️", text: "Expand coverage to surrounding London boroughs and UK-wide" },
        { icon: "📱", text: "Optimize for mobile and voice search queries" },
        { icon: "🎯", text: "Own specific art niche queries in AI results" },
        { icon: "📊", text: "Target AVI score: 96/100" }
      ],
      targetScore: 96
    },
    phase4: {
      name: "Market Leadership",
      timeline: "Months 5-6",
      color: "green",
      items: [
        { icon: "👑", text: "Own top AI-recommended art business in London" },
        { icon: "🌐", text: "Multi-platform presence (ChatGPT, Gemini, and Perplexity)" },
        { icon: "📋", text: "Monthly competitor monitoring and response" },
        { icon: "🔄", text: "Ongoing content optimization cycle" },
        { icon: "📊", text: "Target AVI score: 98/100" },
        { icon: "🏅", text: "Goal: #1 AI-recommended art business in London" }
      ],
      targetScore: 98
    }
  };

  const pricingTiers = [
    {
      name: "Snapshot",
      price: "Free",
      description: "One-time audit, up to 60 buyer questions per platform",
      features: ["Single audit report", "Basic visibility analysis", "Up to 60 buyer-question coverage per platform"],
      badge: "Your current plan",
      recommended: false
    },
    {
      name: "Growth",
      price: "$XXX/mo",
      description: "Monthly audits, competitor tracking, content plan, paid-depth prompts",
      features: ["Monthly audit reports", "Competitor tracking", "Content optimization plan", "Paid-depth prompt coverage across three engines", "Priority support"],
      badge: "Recommended",
      recommended: true
    },
    {
      name: "Enterprise",
      price: "$XXX/mo",
      description: "Weekly audits, multi-location, dedicated strategist",
      features: ["Weekly audit reports", "Multi-location tracking", "Dedicated strategist", "Full prompt coverage", "24/7 support"],
      badge: "Best Value",
      recommended: false
    }
  ];

  const CircularProgress = ({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) => {
    const radius = size / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const getColor = () => {
      if (color === "green") return "#28a745";
      if (color === "amber") return "#e8a317";
      return "#dc3545";
    };

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={radius} cy={radius} r={radius - 4} stroke="#e0e0e0" strokeWidth="8" fill="none" />
        <circle cx={radius} cy={radius} r={radius - 4} stroke={getColor()} strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </svg>
    );
  };

  const categoryLabels: Record<string, string> = {
    discovery: "Discovery",
    trust: "Trust & Reviews",
    portfolioInquiry: "Portfolio & Inquiry",
    localRegional: "Local & Regional"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">VizBiz.ai</div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-800">AVI Snapshot Report</h1>
            <p className="text-gray-600">{businessData.name}</p>
            <p className="text-sm text-gray-500">Generated {new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Generated by VizBiz.ai
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-6 lg:mb-0 flex flex-col items-center lg:items-start">
              <div className="flex items-center mb-4">
                <span className="text-6xl font-bold mr-4">{auditResults.overallScore}</span>
                <span className="text-2xl text-blue-200">/100</span>
              </div>
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
                Strong
              </div>
              <p className="mt-4 text-blue-100">
                {businessData.name} has strong visibility in AI-driven search results. 
                Your digital presence is well-established with room for targeted improvements.
              </p>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{auditResults.totalPrompts}</div>
                <div className="text-sm text-blue-200">Total Prompts Tested</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{auditResults.appearedIn}</div>
                <div className="text-sm text-blue-200">Appeared In</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{auditResults.competitorsTracked}</div>
                <div className="text-sm text-blue-200">Competitors Tracked</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{auditResults.quickWins}</div>
                <div className="text-sm text-blue-200">Quick Wins Identified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(auditResults.categories).map(([key, category]) => (
              <div key={key} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">
                    {categoryLabels[key] || key}
                  </h3>
                  <div className={`text-2xl font-bold ${category.color === 'red' ? 'text-red-500' : category.color === 'amber' ? 'text-amber-500' : 'text-green-500'}`}>
                    {category.score}%
                  </div>
                </div>
                <div className="flex items-center justify-center mb-3">
                  <CircularProgress percentage={category.score} color={category.color} size={60} />
                </div>
                <div className="text-center text-sm text-gray-600">
                  Appeared in {category.prompts} prompts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why This Matters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why This Matters</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-700 text-lg">
              AI can shape the shortlist before a customer finds you, compares options, or makes contact. 
              With a Strong AVI score, ARTWOW is already well-positioned — but targeted improvements can 
              push visibility even further and lock in competitive advantage against Red Bubble and other 
              competitors in the London market.
            </p>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Competitor Comparison</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm overflow-hidden">
            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-40 text-right pr-4">
                    <span className="font-medium text-gray-800">{competitor.name}</span>
                    {competitor.highlight === "client" && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${competitor.highlight === "client" ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{ width: `${competitor.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right font-bold text-gray-800">
                    {competitor.score}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Your competitors appear less frequently than you</strong> in AI-driven searches. 
                ARTWOW leads the field — maintaining this position requires consistent optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommended Next Steps</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-semibold text-gray-800 mb-2">Audit Online Listings</h3>
                <p className="text-sm text-gray-600">Ensure consistency across all platforms — Google Business, social media, and art directories.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Expand Category Pages</h3>
                <p className="text-sm text-gray-600">Create dedicated pages for key art categories, services, and London-specific queries.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl mb-2">⭐</div>
                <h3 className="font-semibold text-gray-800 mb-2">Collect Client Reviews</h3>
                <p className="text-sm text-gray-600">Launch a review collection campaign targeting recent clients to strengthen trust signals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">30/60/90/6-Month Progress Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(progressPlan).map(([key, phase]) => (
              <div key={key} className={`bg-white rounded-xl p-6 shadow-sm border-t-4 ${phase.color === 'amber' ? 'border-amber-400' : phase.color === 'blue' ? 'border-blue-400' : phase.color === 'purple' ? 'border-purple-400' : 'border-green-400'}`}>
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 uppercase">Phase {key.replace('phase', '')}</span>
                  <h3 className="text-lg font-bold text-gray-800">{phase.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${phase.color === 'amber' ? 'bg-amber-100 text-amber-800' : phase.color === 'blue' ? 'bg-blue-100 text-blue-800' : phase.color === 'purple' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {phase.timeline}
                  </span>
                  {'hasSubtitle' in phase && phase.hasSubtitle && phase.subtitle && <p className="text-sm font-medium text-gray-600 mt-1">{phase.subtitle}</p>}
                </div>
                <ul className="space-y-2 mb-4">
                  {phase.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="mr-2">{item.icon}</span>
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">Target AVI Score</div>
                  <div className="text-2xl font-bold text-gray-800">{phase.targetScore}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment & Pricing */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Investment & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`bg-white rounded-xl p-6 shadow-sm border ${tier.recommended ? 'border-blue-400 border-2' : 'border-gray-200'}`}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{tier.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{tier.price}</div>
                  <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <span className="mr-2 text-green-500">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.badge && (
                  <div className={`text-center text-xs font-medium py-1 rounded-full ${tier.badge === 'Recommended' ? 'bg-green-100 text-green-800' : tier.badge === 'Best Value' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {tier.badge}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Ready to strengthen your AI visibility in London?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            You are already performing well. A full AVI Audit reveals exactly where to push for market leadership.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors mb-4">
            Get Your Full AVI Audit Report
          </button>
          <div className="text-sm text-blue-200">
            or <a href="https://calendly.com/vizbiz-ai/avi-assessment" className="underline hover:no-underline">Book a free review call</a>
          </div>
        </div>

        {/* Branded Footer */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          <div className="text-xl font-bold text-blue-600 mb-2">VizBiz.ai</div>
          <p>AVI Snapshot Report — Generated {new Date().toLocaleDateString()}</p>
          <p className="mt-2">CONFIDENTIAL: This report is for {businessData.name} internal use only.</p>
        </div>
      </div>
    </div>
  );
}
