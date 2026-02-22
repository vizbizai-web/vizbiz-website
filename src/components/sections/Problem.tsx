"use client";

import { Search, MessageSquare, AlertTriangle, TrendingUp } from "lucide-react";

export default function Problem() {
  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            You&apos;re Losing Customers Before They Even Visit Your Website
          </h2>
          <p className="text-lg text-gray-600">
            The way people find dealerships has fundamentally changed.
          </p>
        </div>
        
        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Old Way */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Old Way</h3>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">1</span>
                <span className="text-gray-600">Customer Googles &quot;Honda dealership Oakville&quot;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">2</span>
                <span className="text-gray-600">Clicks 3-4 websites to compare</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">3</span>
                <span className="text-gray-600">Visits the one they like best</span>
              </li>
            </ol>
          </div>
          
          {/* New Way */}
          <div className="bg-blue-600 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">New Way</h3>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-sm font-medium text-white">1</span>
                <span className="text-blue-100">Customer asks ChatGPT <em>&quot;best car dealership near me&quot;</em></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-sm font-medium text-white">2</span>
                <span className="text-white font-semibold">Gets ONE answer</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-sm font-medium text-white">3</span>
                <span className="text-blue-100">Visits that dealership</span>
              </li>
            </ol>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">73%</div>
            <p className="text-gray-600">of car buyers now use AI assistants for research</p>
            <p className="text-sm text-gray-400 mt-1">Source: CDK Global, 2024</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">3-5</div>
            <p className="text-gray-600">sources cited per AI answer</p>
            <p className="text-sm text-gray-400 mt-1">If you&apos;re not in, you don&apos;t exist</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">0</div>
            <p className="text-gray-600">chance if AI doesn&apos;t mention you</p>
            <p className="text-sm text-gray-400 mt-1">Customers trust AI recommendations</p>
          </div>
        </div>
        
        {/* Fear/Urgency Box */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Your competitors are already optimizing for this.
              </h3>
              <p className="text-gray-600">
                While you&apos;re focused on traditional SEO, they&apos;re becoming the answer AI recommends. 
                The dealerships that establish AI visibility now will be nearly impossible to displace later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
