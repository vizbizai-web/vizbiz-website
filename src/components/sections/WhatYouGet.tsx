"use client";

import { 
  Gauge, 
  Search, 
  Users, 
  Star, 
  Shield, 
  Map, 
  BarChart3, 
  HeadphonesIcon 
} from "lucide-react";

export default function WhatYouGet() {
  const deliverables = [
    {
      icon: Gauge,
      title: "AVI Score™ (0-100)",
      description: "Your proprietary AI Visibility Intelligence score. See exactly where you stand and how you compare to every competitor in your market.",
      highlight: true,
    },
    {
      icon: Search,
      title: "AI Query Test Results",
      description: "We test 20 real queries your customers are asking. See which ones mention you, which ones don't, and why.",
    },
    {
      icon: Users,
      title: "Competitor Benchmarking",
      description: "Head-to-head comparison against the top 5 dealerships competing for your customers. See their scores, their gaps, and exactly how to beat them.",
    },
    {
      icon: Star,
      title: "Review Sentiment Analysis",
      description: "AI systems analyze sentiment, not just star ratings. We show you what AI sees when it reads your reviews—and your competitors'.",
    },
    {
      icon: Shield,
      title: "Trust Signals Audit",
      description: "The 15 trust markers AI systems look for (FAQ schema, entity recognition, citation consistency). See what's missing and the exact impact of fixing each one.",
    },
    {
      icon: Map,
      title: "Priority Action Roadmap",
      description: "Not a generic to-do list. A prioritized sequence of actions based on effort vs. impact. Quick wins first, strategic plays second.",
    },
    {
      icon: BarChart3,
      title: "Monthly Monitoring Dashboard",
      description: "Track your AVI Score over time. Get alerts when competitors move, when your score changes, and when new AI platforms emerge.",
    },
    {
      icon: HeadphonesIcon,
      title: "Implementation Support",
      description: "We don't just hand you a report and disappear. We help you implement the recommendations—whether that's optimizing your Google Business Profile, adding schema markup, or restructuring your content.",
    },
  ];

  return (
    <section id="what-you-get" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Your AI Visibility Audit Includes:
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to understand and improve your AI visibility
          </p>
        </div>
        
        {/* Deliverables Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliverables.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-white rounded-2xl p-6 border card-hover ${
                item.highlight 
                  ? "border-blue-500 ring-2 ring-blue-500/20" 
                  : "border-gray-200"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                item.highlight 
                  ? "bg-blue-600" 
                  : "bg-blue-50 group-hover:bg-blue-100"
              } transition-colors`}>
                <item.icon className={`w-6 h-6 ${
                  item.highlight ? "text-white" : "text-blue-600"
                }`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        
        {/* Sample Report Preview */}
        <div className="mt-16 bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sample AVI Scorecard Preview</h3>
            <p className="text-gray-600">See exactly what you&apos;ll receive</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Score Overview */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Your Score Overview</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full border-8 border-orange-400 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">47</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Score</p>
                  <p className="text-orange-600 font-medium">Needs Work</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Rank</span>
                  <span className="font-medium text-gray-900">#4 of 8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">vs. Leader</span>
                  <span className="font-medium text-red-600">-23 pts</span>
                </div>
              </div>
            </div>
            
            {/* Top Opportunities */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Top 3 Opportunities</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Add FAQ schema markup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Optimize GBP categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Improve review responses</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Potential score improvement: <span className="font-semibold text-green-600">+15 points</span>
                </p>
              </div>
            </div>
            
            {/* AI Mentions */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">AI Query Performance</h4>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Mention Rate</span>
                  <span className="font-medium text-gray-900">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Queries tested</span>
                  <span className="font-medium text-gray-900">20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">You mentioned</span>
                  <span className="font-medium text-gray-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leader mentioned</span>
                  <span className="font-medium text-green-600">18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
