"use client";

import Link from "next/link";
import { ArrowRight, Download, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          Limited spots available this month
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Don&apos;t Let Your Competitors Own the Answer
        </h2>
        
        {/* Description */}
        <p className="text-xl text-blue-100 mb-4 max-w-3xl mx-auto">
          Every day you&apos;re not optimizing for AI search, you&apos;re losing customers to dealerships that are.
        </p>
        <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
          See exactly where you stand. No commitment. No obligation. Just clarity.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-lg"
          >
            Get Your Free AVI Score Assessment
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700/50 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-blue-700/70 transition-colors border border-blue-400/30"
          >
            <Download className="w-5 h-5" />
            Download Sample Scorecard
          </Link>
        </div>
        
        {/* Trust Text */}
        <p className="text-blue-200 text-sm">
          30 minutes. No credit card required. See your score before you decide anything.
        </p>
      </div>
    </section>
  );
}
