import React from 'react';

export default function EADanceReport() {
  const businessData = {
    name: "E&A Dance Studio",
    website: "eadancestudiosnz.com",
    location: "Auckland, NZ",
    contact: "enrique.amydance@gmail.com",
    niche: "Dance Studio"
  };

  const auditResults = {
    overallScore: 11,
    totalPrompts: 84,
    appearedIn: 9,
    competitorsTracked: 4,
    quickWins: 6,
    categories: {
      discovery: { score: 0, prompts: 0, color: "red" },
      trust: { score: 58, prompts: 7, color: "amber" },
      classBooking: { score: 0, prompts: 0, color: "red" },
      styleSpecific: { score: 17, prompts: 2, color: "red" },
      localRegional: { score: 0, prompts: 0, color: "red" },
      buyerIntent: { score: 0, prompts: 0, color: "red" },
      competitivePosition: { score: 0, prompts: 0, color: "red" }
    }
  };

  const competitors = [
    { name: "Viva Dance", score: 40, highlight: "top" },
    { name: "Neverland Studios", score: 37 },
    { name: "E&A Dance Studio", score: 11, highlight: "client" },
    { name: "KD Dance", score: 11 },
    { name: "Ceroc Dance", score: 8 }
  ];

  const categoryDeepDive = {
    trust: [
      { prompt: "E&A Dance Studio review", visible: true },
      { prompt: "E&A Dance Studios Auckland review", visible: true },
      { prompt: "E&A Dance Studio feedback", visible: true },
      { prompt: "best reviewed dance studio Auckland", visible: true },
      { prompt: "Enrique dance teacher Auckland", visible: true },
      { prompt: "Amy dance instructor Auckland", visible: true },
      { prompt: "E&A Dance Studio testimonials", visible: true },
      { prompt: "trusted dance studio Auckland", visible: false },
      { prompt: "reliable dance lessons Auckland", visible: false },
      { prompt: "highly rated dance studio Auckland", visible: false },
      { prompt: "best dance instructors Auckland", visible: false },
      { prompt: "top rated dance classes Auckland", visible: false }
    ],
    styleSpecific: [
      { prompt: "Latin dance classes Auckland", visible: true },
      { prompt: "best dance studio for couples Auckland", visible: true },
      { prompt: "salsa classes Auckland", visible: false },
      { prompt: "ballroom dancing Auckland", visible: false },
      { prompt: "wedding dance lessons Auckland", visible: false },
      { prompt: "social dance classes Auckland", visible: false },
      { prompt: "beginner dance lessons Auckland", visible: false },
      { prompt: "advanced dance training Auckland", visible: false },
      { prompt: "competitive dance coaching Auckland", visible: false },
      { prompt: "dance workshops Auckland", visible: false },
      { prompt: "private dance lessons Auckland", visible: false },
      { prompt: "group dance classes Auckland", visible: false }
    ]
  };

  const progressPlan = {
    phase1: {
      name: "Foundation",
      timeline: "Month 1",
      subtitle: "Quick Wins",
      color: "amber",
      items: [
        { icon: "🔧", text: "Audit all online listings (Google Business, Yelp, Yellow NZ) for consistency" },
        { icon: "📝", text: "Create dedicated pages for ballroom, salsa, and wedding dance lessons" },
        { icon: "⭐", text: "Launch Google Business review campaign (target: 15 new reviews)" },
        { icon: "🎯", text: "Claim \"ballroom dancing Auckland\" and \"Latin dance Auckland\" in AI results" },
        { icon: "📊", text: "Baseline AVI score: 11/100" }
      ],
      targetScore: 11,
      hasSubtitle: true
    },
    phase2: {
      name: "Build Momentum",
      timeline: "Months 2-3",
      color: "blue",
      items: [
        { icon: "📈", text: "Expand to cover all 12 dance style queries with dedicated content" },
        { icon: "🔗", text: "Build backlinks from Auckland event/wedding directories" },
        { icon: "💬", text: "Start social proof content: student testimonials, class videos, success stories" },
        { icon: "🏆", text: "Target: Trust & Reviews category → 80%+" },
        { icon: "📊", text: "Target AVI score: 25/100" }
      ],
      targetScore: 25
    },
    phase3: {
      name: "Competitive Advantage",
      timeline: "Months 3-4",
      color: "purple",
      items: [
        { icon: "⚔️", text: "Target Neverland Studios and Viva Dance visibility gaps" },
        { icon: "🗺️", text: "Expand coverage to North Shore, CBD, and other Auckland suburbs" },
        { icon: "📱", text: "Optimize for \"dance classes near me\" mobile queries" },
        { icon: "🎯", text: "Own \"wedding dance lessons Auckland\" (currently wide open)" },
        { icon: "📊", text: "Target AVI score: 40/100" }
      ],
      targetScore: 40
    },
    phase4: {
      name: "Market Leadership",
      timeline: "Months 5-6",
      color: "green",
      items: [
        { icon: "👑", text: "Own \"best dance studio Auckland\" in AI results" },
        { icon: "🌐", text: "Multi-platform presence (ChatGPT, Gemini, Perplexity, Google AI Overviews)" },
        { icon: "📋", text: "Monthly competitor monitoring and response" },
        { icon: "🔄", text: "Ongoing content optimization cycle" },
        { icon: "📊", text: "Target AVI score: 55/100" },
        { icon: "🏅", text: "Goal: Top 3 AI-recommended dance studio in Auckland" }
      ],
      targetScore: 55
    }
  };

  const pricingTiers = [
    {
      name: "Snapshot",
      price: "Free",
      description: "One-time audit, 20 prompts",
      features: ["Single audit report", "Basic visibility analysis", "20 prompt coverage"],
      badge: "Your current plan",
      recommended: false
    },
    {
      name: "Growth",
      price: "$XXX/mo",
      description: "Monthly audits, competitor tracking, content plan, 84 prompts",
      features: ["Monthly audit reports", "Competitor tracking", "Content optimization plan", "84 prompt coverage", "Priority support"],
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

  // Helper function for circular progress
  const CircularProgress = ({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) => {
    const radius = size / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const getColor = () => {
      if (color === "green") return "#28a745";
      if (color === "amber") return "#e8a317";
      return "#dc3545"; // red
    };

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={radius}
          cy={radius}
          r={radius - 4}
          stroke="#e0e0e0"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius - 4}
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // Donut chart component
  const DonutChart = () => {
    const size = 200;
    const radius = size / 2;
    const visiblePercentage = 11;
    const invisiblePercentage = 89;
    const circumference = 2 * Math.PI * radius;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={radius}
            cy={radius}
            r={radius - 10}
            stroke="#dc3545"
            strokeWidth="20"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - invisiblePercentage / 100)}
            strokeLinecap="round"
          />
          <circle
            cx={radius}
            cy={radius}
            r={radius - 10}
            stroke="#28a745"
            strokeWidth="20"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - (invisiblePercentage + visiblePercentage) / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{visiblePercentage}%</div>
            <div className="text-sm text-gray-600">Visible</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">VizBiz.ai</div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-800">Full AVI Audit Report</h1>
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
            <div className="lg:w-1/2 mb-6 lg:mb-0">
              <div className="flex items-center mb-4">
                <span className="text-6xl font-bold mr-4">{auditResults.overallScore}</span>
                <span className="text-2xl text-blue-200">/100</span>
              </div>
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
                Weak
              </div>
              <p className="mt-4 text-blue-100">
                {businessData.name} has limited visibility in AI-driven search results. 
                Significant opportunities exist to improve your digital presence.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(auditResults.categories).map(([key, category]) => (
              <div key={key} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <div className={`text-2xl font-bold ${category.color === 'red' ? 'text-red-500' : category.color === 'amber' ? 'text-amber-500' : 'text-green-500'}`}>
                    {category.score}%
                  </div>
                </div>
                <div className="flex items-center justify-center mb-3">
                  <CircularProgress percentage={category.score} color={category.color} size={60} />
                </div>
                <div className="text-center text-sm text-gray-600">
                  {category.prompts}/12 prompts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Visibility Overview</h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <DonutChart />
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Competitor Comparison</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-right pr-4">
                    <span className="font-medium text-gray-800">{competitor.name}</span>
                    {competitor.highlight === "top" && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Top Competitor</span>
                    )}
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
          </div>
        </div>

        {/* Category Deep Dive */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Category Deep Dive</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-8">
              {Object.entries(auditResults.categories).map(([key, category]) => (
                <div key={key} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryDeepDive[key as keyof typeof categoryDeepDive]?.map((item, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className={`mr-3 ${item.visible ? 'text-green-500' : 'text-red-500'}`}>
                          {item.visible ? '✅' : '❌'}
                        </span>
                        <span className={`text-sm ${item.visible ? 'text-gray-800' : 'text-gray-500'}`}>
                          {item.prompt}
                        </span>
                      </div>
                    )) || Array(12).fill(0).map((_, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className="mr-3 text-red-500">❌</span>
                        <span className="text-sm text-gray-500">Prompt {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">⭐ 30/60/90/6-Month Progress Plan</h2>
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
          <h2 className="text-2xl font-bold mb-4">Ready to dominate AI search in Auckland?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Start implementing your 30-day plan and watch your visibility grow month over month.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors mb-4">
            Start Your 30-Day Plan
          </button>
          <div className="text-sm text-blue-200">
            or <a href="#" className="underline hover:no-underline">Book a free review call</a>
          </div>
        </div>

        {/* Branded Footer */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          <div className="text-xl font-bold text-blue-600 mb-2">VizBiz.ai</div>
          <p>Full AVI Audit Report — Generated {new Date().toLocaleDateString()}</p>
          <p className="mt-2">CONFIDENTIAL: This report is for {businessData.name} internal use only.</p>
        </div>
      </div>
    </div>
  );
}