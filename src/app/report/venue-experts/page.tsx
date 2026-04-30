import React from 'react';
import { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Full AVI Audit Report - The Venue Experts | VizBiz.ai',
  description: 'Comprehensive AI Visibility Intelligence audit for The Venue Experts',
};

export default function VenueExpertsReport() {
  const businessName = "The Venue Experts";
  const website = "thevenueexperts.co.uk";
  const location = "Melton Mowbray / Loughborough, UK";
  const contact = "Stacey Ferguson-Czersovski";
  const niche = "Venue/Wedding Consultancy";
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Audit data
  const overallScore = 39;
  const totalPrompts = 84;
  const appearedIn = 33;
  const competitorsTracked = 4;
  const quickWins = 5;

  const categories = [
    { name: "Discovery & Brand", score: 33, prompts: 4, color: "red" },
    { name: "Trust & Reviews", score: 67, prompts: 8, color: "green" },
    { name: "Booking & Inquiry Visibility", score: 58, prompts: 7, color: "amber" },
    { name: "Local & Regional", score: 25, prompts: 3, color: "red" },
    { name: "Buyer Intent", score: 25, prompts: 3, color: "red" },
    { name: "Competitive Position", score: 17, prompts: 2, color: "red" },
    { name: "Content & Authority", score: 50, prompts: 6, color: "amber" },
  ];

  const competitors = [
    { name: "The Venue Experts", percentage: 39, highlight: true },
    { name: "Kelly Chandler", percentage: 12, highlight: false },
    { name: "Karen Lindsey", percentage: 4, highlight: false },
    { name: "Kelly Mortimer", percentage: 2, highlight: false },
    { name: "Coco Wedding Venues", percentage: 2, highlight: false },
  ];

  // Category deep dive data
  const categoryDetails = [
    {
      name: "Discovery & Brand",
      score: 33,
      prompts: [
        { text: "best wedding venue consultant in the UK", visible: true },
        { text: "wedding venue advisory service UK", visible: true },
        { text: "The Venue Experts UK", visible: true },
        { text: "venue consultant near me UK", visible: true },
        { text: "best venue finding service UK", visible: false },
        { text: "wedding venue sales consultant", visible: false },
        { text: "venue consultancy services UK", visible: false },
        { text: "wedding venue consultant UK", visible: false },
        { text: "venue finding service UK", visible: false },
        { text: "wedding venue advisor UK", visible: false },
        { text: "venue consultant UK", visible: false },
        { text: "wedding venue sales UK", visible: false },
      ],
      note: "The Venue Experts appears in basic discovery queries but misses many key terms. Opportunity to expand brand visibility."
    },
    {
      name: "Trust & Reviews",
      score: 67,
      prompts: [
        { text: "The Venue Experts review", visible: true },
        { text: "The Venue Experts UK reviews", visible: true },
        { text: "is The Venue Experts any good", visible: true },
        { text: "The Venue Experts wedding venue sales", visible: true },
        { text: "best rated wedding venue consultant", visible: true },
        { text: "trusted venue consultancy UK", visible: true },
        { text: "venue consultant testimonials UK", visible: true },
        { text: "who is the best wedding venue consultant UK", visible: true },
        { text: "wedding venue sales service reviews", visible: false },
        { text: "venue consultant reviews UK", visible: false },
        { text: "wedding venue consultancy reviews", visible: false },
        { text: "venue sales service reviews UK", visible: false },
      ],
      note: "Strong performance in trust signals. Review presence is solid but could be expanded."
    },
    {
      name: "Booking & Inquiry Visibility",
      score: 58,
      prompts: [
        { text: "wedding venue sales service UK", visible: true },
        { text: "venue marketing consultant UK", visible: true },
        { text: "wedding venue outsourcing sales UK", visible: true },
        { text: "venue lead generation service UK", visible: true },
        { text: "venue consultancy services UK", visible: true },
        { text: "outsourced venue sales UK", visible: true },
        { text: "wedding venue business growth UK", visible: true },
        { text: "venue booking consultancy Leicestershire", visible: false },
        { text: "wedding venue sales consultant UK", visible: false },
        { text: "venue sales service UK", visible: false },
        { text: "wedding venue booking service UK", visible: false },
        { text: "venue inquiry service UK", visible: false },
      ],
      note: "Good coverage in booking-related queries but missing some local and specific terms."
    },
    {
      name: "Local & Regional",
      score: 25,
      prompts: [
        { text: "wedding venue consultant Leicestershire", visible: true },
        { text: "venue consultant East Midlands", visible: true },
        { text: "wedding venue sales service Melton Mowbray", visible: true },
        { text: "venue consultant Loughborough", visible: false },
        { text: "wedding venue consultant UK", visible: false },
        { text: "venue sales service Leicestershire", visible: false },
        { text: "wedding venue consultant East Midlands", visible: false },
        { text: "venue consultant UK", visible: false },
        { text: "wedding venue sales Leicestershire", visible: false },
        { text: "venue consultant services Leicestershire", visible: false },
        { text: "wedding venue consultant services UK", visible: false },
        { text: "venue sales consultant UK", visible: false },
      ],
      note: "Weak local visibility. Significant opportunity to dominate regional queries."
    },
    {
      name: "Buyer Intent",
      score: 25,
      prompts: [
        { text: "best wedding venue consultant UK", visible: true },
        { text: "top wedding venue consultant UK", visible: true },
        { text: "best venue consultant UK", visible: true },
        { text: "top venue consultant UK", visible: false },
        { text: "best wedding venue sales service UK", visible: false },
        { text: "top wedding venue sales service UK", visible: false },
        { text: "best venue sales service UK", visible: false },
        { text: "top venue sales service UK", visible: false },
        { text: "best wedding venue consultancy UK", visible: false },
        { text: "top wedding venue consultancy UK", visible: false },
        { text: "best venue consultancy UK", visible: false },
        { text: "top venue consultancy UK", visible: false },
      ],
      note: "Low visibility in high-intent buyer queries. Critical area for improvement."
    },
    {
      name: "Competitive Position",
      score: 17,
      prompts: [
        { text: "The Venue Experts vs Kelly Chandler", visible: true },
        { text: "best wedding venue consultant UK", visible: true },
        { text: "The Venue Experts vs Karen Lindsey", visible: false },
        { text: "The Venue Experts vs Kelly Mortimer", visible: false },
        { text: "The Venue Experts vs Coco Wedding Venues", visible: false },
        { text: "best venue consultant UK", visible: false },
        { text: "top wedding venue consultant UK", visible: false },
        { text: "best wedding venue sales service UK", visible: false },
        { text: "top wedding venue sales service UK", visible: false },
        { text: "best venue sales service UK", visible: false },
        { text: "top venue sales service UK", visible: false },
        { text: "best wedding venue consultancy UK", visible: false },
      ],
      note: "Minimal competitive visibility. Opportunity to establish market leadership."
    },
    {
      name: "Content & Authority",
      score: 50,
      prompts: [
        { text: "wedding venue consultant UK", visible: true },
        { text: "venue consultant UK", visible: true },
        { text: "wedding venue sales service UK", visible: true },
        { text: "venue sales service UK", visible: true },
        { text: "wedding venue consultancy UK", visible: true },
        { text: "venue consultancy UK", visible: true },
        { text: "wedding venue consultant services UK", visible: false },
        { text: "venue consultant services UK", visible: false },
        { text: "wedding venue sales consultant UK", visible: false },
        { text: "venue sales consultant UK", visible: false },
        { text: "wedding venue consultancy services UK", visible: false },
        { text: "venue consultancy services UK", visible: false },
      ],
      note: "Moderate content visibility. Content strategy needs expansion and optimization."
    },
  ];

  const phases = [
    {
      number: 1,
      name: "Foundation",
      timeline: "Month 1",
      subtitle: "Quick Wins",
      color: "amber",
      items: [
        { icon: "🔧", text: "Audit all online listings and ensure NAP consistency" },
        { icon: "📝", text: "Create 5 venue-specific content pages targeting discovery queries" },
        { icon: "⭐", text: "Launch review collection campaign (target: 10 new reviews)" },
        { icon: "🎯", text: 'Claim "wedding venue consultant Leicestershire" in AI results' },
      ],
      targetScore: 39,
    },
    {
      number: 2,
      name: "Build Momentum",
      timeline: "Months 2-3",
      subtitle: "Content & Trust Expansion",
      color: "blue",
      items: [
        { icon: "📈", text: "Expand content to cover all 12 buyer-intent queries" },
        { icon: "🔗", text: "Build 5 authoritative backlinks from wedding industry sites" },
        { icon: "💬", text: "Establish thought leadership content calendar (2 posts/week)" },
        { icon: "🏆", text: "Target: Trust & Reviews category → 80%+" },
      ],
      targetScore: 50,
    },
    {
      number: 3,
      name: "Competitive Advantage",
      timeline: "Months 3-4",
      subtitle: "Market Positioning",
      color: "purple",
      items: [
        { icon: "⚔️", text: "Competitive gap analysis — target Kelly Chandler's visibility" },
        { icon: "🗺️", text: "Expand to regional coverage (East Midlands, broader UK)" },
        { icon: "📱", text: "Optimize for AI-powered voice and mobile queries" },
        { icon: "🎯", text: 'Claim top 3 positions for "venue consultancy UK" queries' },
      ],
      targetScore: 60,
    },
    {
      number: 4,
      name: "Market Leadership",
      timeline: "Months 5-6",
      subtitle: "Dominance Phase",
      color: "green",
      items: [
        { icon: "👑", text: 'Own "best wedding venue consultant UK" in AI results' },
        { icon: "🌐", text: "Multi-platform presence (ChatGPT, Gemini, Perplexity, AI Overviews)" },
        { icon: "📋", text: "Monthly competitor monitoring and response strategy" },
        { icon: "🔄", text: "Ongoing content refresh and optimization cycle" },
      ],
      targetScore: 70,
    },
  ];

  const pricingTiers = [
    {
      name: "Snapshot",
      price: "Free",
      description: "One-time audit, 20 prompts, basic score",
      features: ["Basic visibility score", "20 prompt analysis", "Single report"],
      current: true,
      recommended: false,
    },
    {
      name: "Growth",
      price: "£XXX/mo",
      description: "Monthly audits, competitor tracking, content recommendations, 84 prompts",
      features: ["Full 84-prompt analysis", "Monthly audits", "Competitor tracking", "Content recommendations", "Priority support"],
      current: false,
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "£XXX/mo",
      description: "Weekly audits, multi-location, dedicated strategist, priority support",
      features: ["Weekly comprehensive audits", "Multi-location tracking", "Dedicated AI strategist", "Custom reporting", "24/7 priority support"],
      current: false,
      recommended: false,
    },
  ];

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 60) return "green";
    if (score >= 35) return "amber";
    return "red";
  };

  // Get badge for score
  const getScoreBadge = (score: number) => {
    if (score >= 70) return "Excellent";
    if (score >= 50) return "Good";
    if (score >= 30) return "Fair";
    return "Weak";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VizBiz.ai</h1>
            <p className="text-sm text-gray-500 mt-1">AI Visibility Intelligence</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">Full AVI Audit Report</h2>
            <p className="text-sm text-gray-600">{businessName}</p>
            <p className="text-xs text-gray-500 mt-1">{date}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
              Generated by VizBiz.ai
            </div>
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-6xl font-bold">{overallScore}</h3>
                  <span className="text-2xl text-blue-200">/100</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-300`}>
                    {getScoreBadge(overallScore)}
                  </span>
                  <span className="text-blue-200">Overall AI Visibility Score</span>
                </div>
                <p className="mt-4 text-blue-100 max-w-md">
                  The Venue Experts currently appears in {appearedIn}/{totalPrompts} AI-driven search prompts.
                  This represents {Math.round(appearedIn / totalPrompts * 100)}% visibility across key buyer queries.
                </p>
              </div>

              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{totalPrompts}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">Total Prompts Tested</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{appearedIn}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">Appeared In</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{competitorsTracked}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">Competitors Tracked</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{quickWins}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">Quick Wins Identified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const colorClass = category.color === "green" ? "text-green-600" : 
                                category.color === "amber" ? "text-amber-600" : "text-red-600";
              const bgColorClass = category.color === "green" ? "bg-green-50" : 
                                  category.color === "amber" ? "bg-amber-50" : "bg-red-50";

              return (
                <div key={index} className={`bg-white rounded-xl p-6 shadow-sm border ${bgColorClass}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <span className={`text-2xl font-bold ${colorClass}`}>{category.score}%</span>
                  </div>
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={category.color === "green" ? "#28a745" : 
                               category.color === "amber" ? "#e8a317" : "#dc3545"}
                        strokeWidth="3"
                        strokeDasharray={`${category.score}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">{category.prompts}/12 prompts</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {category.name === "Discovery & Brand" && "Brand visibility and discovery queries"}
                    {category.name === "Trust & Reviews" && "Review presence and trust signals"}
                    {category.name === "Booking & Inquiry Visibility" && "Booking and inquiry-related queries"}
                    {category.name === "Local & Regional" && "Local and regional visibility"}
                    {category.name === "Buyer Intent" && "High-intent buyer queries"}
                    {category.name === "Competitive Position" && "Competitive positioning"}
                    {category.name === "Content & Authority" && "Content authority and expertise"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Overall Visibility</h3>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="6"
                      strokeDasharray="100, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#28a745"
                      strokeWidth="6"
                      strokeDasharray={`${overallScore}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{overallScore}%</div>
                      <div className="text-sm text-gray-600">Visible</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-900">Visible in AI Results</span>
                    </div>
                    <span className="font-bold text-gray-900">{overallScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-gray-900">Invisible to AI</span>
                    </div>
                    <span className="font-bold text-gray-900">{100 - overallScore}%</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Key Insight:</strong> The Venue Experts has significant room for improvement across most categories.
                    Focus on Discovery, Local, and Buyer Intent queries to drive the most impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Competitor Comparison</h3>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="space-y-6">
              {competitors.map((competitor, index) => {
                const width = `${competitor.percentage}%`;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${competitor.highlight ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                        {competitor.name}
                      </span>
                      <span className="font-bold text-gray-900">{competitor.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${competitor.highlight ? 'bg-blue-600' : 'bg-gray-400'}`}
                        style={{ width }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Competitive Advantage:</strong> The Venue Experts leads the market with {overallScore}% visibility,
                significantly ahead of competitors like Kelly Chandler ({competitors.find(c => c.name === "Kelly Chandler")?.percentage}%).
                This is a strong foundation to build upon.
              </p>
            </div>
          </div>
        </div>

        {/* Category Deep Dive */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Category Deep Dive</h3>
          <div className="space-y-6">
            {categoryDetails.map((category, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{category.score}%</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.score >= 60 ? 'bg-green-100 text-green-800' : 
                                                                           category.score >= 35 ? 'bg-amber-100 text-amber-800' : 
                                                                           'bg-red-100 text-red-800'}`}>
                        {category.score >= 60 ? 'Good' : category.score >= 35 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {category.prompts.map((prompt, promptIndex) => (
                      <div key={promptIndex} className="flex items-center gap-2">
                        <span className={`text-xl ${prompt.visible ? 'text-green-500' : 'text-red-500'}`}>
                          {prompt.visible ? '✅' : '❌'}
                        </span>
                        <span className={`text-sm ${prompt.visible ? 'text-gray-700' : 'text-gray-400'}`}>
                          {prompt.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{category.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 30/60/90/6-Month Progress Plan */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">30/60/90/6-Month Progress Plan</h3>
          <p className="text-gray-600 mb-8">Your roadmap to AI visibility leadership in the wedding venue consultancy market.</p>

          <div className="space-y-6">
            {phases.map((phase, index) => {
              const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
                amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
                blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800" },
                purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800" },
                green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800" },
              };

              const currentColor = colorClasses[phase.color];

              return (
                <div key={index} className={`bg-white rounded-xl shadow-sm border ${currentColor.border}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${currentColor.text}`}>Phase {phase.number}</span>
                          <span className="text-lg font-semibold text-gray-900">{phase.name}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-sm text-gray-500">{phase.timeline}</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${currentColor.bg} ${currentColor.text}`}>
                            {phase.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{phase.targetScore}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Target AVI Score</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {phase.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress indicator */}
                    {index < phases.length - 1 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>→</span>
                        <span>Next: Phase {phase.number + 1} - {phases[index + 1].name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">Your Journey to Market Leadership</h4>
            <p className="text-sm text-gray-700">
              This 6-month plan transforms The Venue Experts from {overallScore}% visibility to 70%+,
              establishing you as the #1 AI-recommended wedding venue consultancy in the UK.
            </p>
          </div>
        </div>

        {/* Investment & Pricing */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment & Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${tier.recommended ? 'border-blue-500' : 'border-gray-200'}`}>
                {tier.recommended && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                    Recommended
                  </div>
                )}
                {tier.current && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-4">
                    Your current plan
                  </div>
                )}
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{tier.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-sm text-gray-500">{tier.price !== "Free" && "/month"}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                <ul className="space-y-2 text-sm mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${tier.current ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 
                                                                                           tier.recommended ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                                                                                           'bg-gray-800 text-white hover:bg-gray-900'}`}
                        disabled={tier.current}>
                  {tier.current ? 'Current Plan' : tier.recommended ? 'Get Started' : 'Contact Sales'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to improve your AI visibility?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start your journey to becoming the #1 AI-recommended wedding venue consultancy in the UK.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Start Your 30-Day Plan
            </button>
            <button className="px-6 py-3 rounded-lg font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Book a free review call
            </button>
          </div>
        </div>

        {/* Branded Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <div className="mb-4">
            <span className="font-bold text-gray-900">VizBiz.ai</span>
            <p className="mt-1">AI Visibility Intelligence</p>
          </div>
          <p className="mb-2">Full AVI Audit Report — Generated {date}</p>
          <p className="text-xs">This report is confidential and intended for The Venue Experts only.</p>
        </div>
      </div>
    </div>
  );
}