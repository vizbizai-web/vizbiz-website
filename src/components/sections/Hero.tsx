"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, Smartphone } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Serving dealerships across the GTA
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              The World Doesn&apos;t Search. It{" "}
              <span className="text-blue-300">Asks.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              ChatGPT, Google AI Overviews, and Perplexity don&apos;t show links anymore—{" "}
              <strong className="text-white">they generate answers.</strong>
            </p>
            
            <p className="text-blue-200 mb-8 max-w-xl mx-auto lg:mx-0">
              When a customer asks <em>&quot;best Honda dealership near me&quot;</em> or{" "}
              <em>&quot;where to buy a Civic in Oakville,&quot;</em> does AI recommend{" "}
              <strong className="text-white">your</strong> dealership or your competitor&apos;s?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Get Your Free AVI Score Assessment
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700/50 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-blue-700/70 transition-colors border border-blue-400/30"
              >
                See Pricing
              </Link>
            </div>
            
            <p className="text-blue-200 text-sm mt-4">
              30 minutes, no obligation
            </p>
          </div>
          
          {/* Right Content - AVI Score Card */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main Score Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Your AVI Score</p>
                    <h3 className="text-2xl font-bold text-gray-900">AI Visibility Intelligence</h3>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">V</span>
                  </div>
                </div>
                
                {/* Score Gauge */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray="440"
                        strokeDashoffset="220"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-gray-900">47</span>
                      <span className="text-sm text-gray-500">of 100</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    Room for Improvement
                  </span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">vs. Top Competitor</span>
                    <span className="font-semibold text-red-600">-23 points</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform -rotate-3">
                <span className="text-sm font-semibold">AI Mentions: 3/20</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3">
                <span className="text-sm font-semibold">Rank: #4 in Market</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Lightning Fast</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Optimized</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-blue-400 rounded-full"></div>
            <span>Serving Oakville, Mississauga, Burlington & Hamilton</span>
          </div>
        </div>
      </div>
    </section>
  );
}
