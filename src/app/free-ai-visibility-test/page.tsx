'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Search, BarChart3, Zap, ChevronDown, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import StickyMobileCTA from '@/components/StickyMobileCTA';

/* ─── Data ─── */
const stats = [
  { value: '50%', label: 'of buyers start research in AI chatbots', source: 'G2 Research' },
  { value: '1.2%', label: 'of businesses get cited by ChatGPT', source: 'Internal Study' },
  { value: '18%', label: 'of strong Google rankers appear in ChatGPT', source: 'Internal Study' },
  { value: '4-5x', label: 'AI traffic converts vs traditional search', source: 'Industry Data' },
];

const faqItems = [
  {
    question: 'What is an AI Visibility Score?',
    answer: 'The AI Visibility Score (AVI) measures how likely an AI platform (like ChatGPT or Gemini) is to recommend your dealership when a buyer asks for a recommendation based on specific intent, such as "Best used SUVs near me" or "Most reliable Toyota dealer in [City]".',
  },
  {
    question: 'How is this different from Google SEO?',
    answer: 'Traditional SEO focuses on rankings in a list of links. AI Visibility is about being the *answer* or the *recommendation* given by the AI. As the data shows, only 18% of high-ranking Google sites actually get cited by AI, meaning a great SEO score no longer guarantees AI visibility.',
  },
  {
    question: 'Is the test accurate?',
    answer: 'This free test provides a high-level visibility snapshot based on common AI recommendation patterns. For a precise, 252-point data audit including competitor gap analysis, we recommend the Full AVI Report.',
  },
  {
    question: 'How do I improve my score?',
    answer: 'AI platforms rely on "trust signals" that differ from standard SEO. We analyze your citations, sentiment, and structured data to create a prioritized action plan to make your dealership the preferred AI recommendation.',
  },
];

/* ─── Components ─── */

function FAQItem({ item, i }: { item: typeof faqItems[0]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <h3 className="text-base font-semibold text-white pr-4">{item.question}</h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} className="flex-shrink-0">
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-sm leading-7 text-[var(--text-secondary)]">{item.answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default function FreeTestPage() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    make: '',
    website: '',
  });

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    // Simulate "processing" time
    setTimeout(() => setStep('results'), 3000);
  };

  const resetTest = () => {
    setStep('form');
    setFormData({ name: '', city: '', make: '', website: '' });
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        
        {/* ─── HERO ─── */}
        <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="mx-auto max-w-5xl text-center relative z-10">
            <div className="section-kicker">Free AI Visibility Check</div>
            <h1 className="super-display mt-6 text-[2.8rem] leading-[0.9] tracking-[-0.05em] text-white sm:text-[4rem] lg:text-[5rem]">
              Does ChatGPT<br />Recommend You?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
              Find out if your dealership is invisible to AI-driven buyers. Get your instant visibility snapshot in 60 seconds.
            </p>

            {/* Stats Bar */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass-card p-4 rounded-xl"
                >
                  <p className="text-2xl font-bold text-[var(--accent-blue)]">{s.value}</p>
                  <p className="text-xs text-white/70 leading-tight">{s.label}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">{s.source}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TEST AREA ─── */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              {step === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card rounded-[2rem] p-8 sm:p-12"
                >
                  <form onSubmit={handleStartTest} className="grid gap-6 sm:grid-cols-2">
                    <div className="col-span-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">Dealership Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Oakville Honda"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--accent-blue)] focus:outline-none transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">City</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Oakville"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--accent-blue)] focus:outline-none transition-colors"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">Make/Brand</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Honda"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--accent-blue)] focus:outline-none transition-colors"
                        value={formData.make}
                        onChange={(e) => setFormData({...formData, make: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">Website (Optional)</label>
                      <input 
                        type="url" 
                        placeholder="https://..."
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--accent-blue)] focus:outline-none transition-colors"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                    <div className="col-span-full mt-4">
                      <button 
                        type="submit" 
                        className="premium-button w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                      >
                        Test My AI Visibility <Search className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card rounded-[2rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="relative h-24 w-24 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[var(--accent-blue)] animate-spin" />
                    <Search className="absolute inset-0 m-auto h-8 w-8 text-[var(--accent-blue)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Analyzing AI Recommendations...</h3>
                  <p className="mt-2 text-[var(--text-secondary)] max-w-xs">
                    Querying ChatGPT, Gemini, and Perplexity for your dealership in {formData.city}...
                  </p>
                  <div className="mt-8 space-y-3 w-full max-w-xs text-left">
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <div className="h-2 w-2 rounded-full bg-[var(--accent-blue)] animate-pulse" />
                      Scanning ChatGPT citations...
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <div className="h-2 w-2 rounded-full bg-white/20" />
                      Checking Gemini recommendation engine...
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <div className="h-2 w-2 rounded-full bg-white/20" />
                      Analyzing Perplexity visibility...
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-[2rem] p-8 sm:p-12 text-center">
                    <div className="section-kicker">Your Results</div>
                    <h2 className="text-2xl font-semibold text-white mt-4">AI Visibility Snapshot: {formData.name}</h2>
                    
                    <div className="mt-10 relative inline-flex items-center justify-center">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                        <circle 
                          cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                          strokeDasharray={440} 
                          strokeDashoffset={440 - (42 / 100) * 440} 
                          className="text-[var(--accent-blue)] transition-all duration-1000 ease-out" 
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-white">42</span>
                        <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">AVI Score</span>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {[
                        { name: 'ChatGPT', status: '❌' },
                        { name: 'Gemini', status: '✅' },
                        { name: 'Perplexity', status: '❌' },
                        { name: 'Copilot', status: '❌' },
                      ].map((p) => (
                        <div key={p.name} className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <p className="text-xs text-white/60 mb-1">{p.name}</p>
                          <p className="text-lg">{p.status}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex gap-4 text-left">
                      <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                      <p className="text-sm leading-relaxed text-yellow-200/80">
                        Your dealership appears in 1 of 4 analyzed AI platforms. Most dealerships in {formData.city} score between 25-45. You are currently in the <strong>Average</strong> band, but missing critical citations in ChatGPT.
                      </p>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        href="/intake?page=free-test&cta=Get%20Full%20Report" 
                        className="premium-button rounded-xl px-8 py-4 font-semibold text-lg flex items-center justify-center gap-2"
                      >
                        Get the Full AVI Report <ArrowRight className="h-5 w-5" />
                      </Link>
                      <button 
                        onClick={resetTest} 
                        className="secondary-button rounded-xl px-8 py-4 font-medium flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" /> Try Again
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ─── EXPLAINER ─── */}
        <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div>
                <div className="section-kicker">The AI Gap</div>
                <h2 className="display-font mt-5 text-3xl font-semibold text-white sm:text-4xl">
                  Why Google Rankings<br />Aren't Enough Anymore.
                </h2>
                <p className="mt-6 text-lg leading-8 text-[var(--text-secondary)]">
                  For decades, the goal was simple: rank #1 on Google. But AI has changed the buyer's journey. 
                  People no longer just click links; they ask AI for <strong>recommendations</strong>.
                </p>
                <div className="mt-8 p-6 glass-card rounded-2xl border-l-4 border-l-[var(--accent-blue)]">
                  <p className="text-2xl font-bold text-white">Only 18%</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    of dealerships with strong Google rankings are actually cited by ChatGPT when buyers ask for recommendations.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[var(--accent-blue)]/20 flex items-center justify-center shrink-0">
                    <Zap className="h-6 w-6 text-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">AI Traffic Converts Higher</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Buyers who arrive via an AI recommendation have higher intent and convert at 4-5x the rate of traditional search.</p>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[var(--accent-blue)]/20 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-6 w-6 text-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">The Recommendation Engine</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">AI doesn't look at keywords; it looks at trust, sentiment, and authority across the entire web.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <div className="section-kicker">FAQ</div>
              <h2 className="display-font mt-5 text-3xl font-semibold text-white sm:text-4xl">
                Got questions?
              </h2>
            </div>
            <div className="grid gap-4">
              {faqItems.map((item, i) => (
                <FAQItem key={i} item={item} i={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="chapter-final px-4 py-24 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="section-kicker">Stop Being Invisible</div>
            <h2 className="super-display mt-6 text-[2.8rem] leading-[0.9] tracking-[-0.05em] text-white sm:text-[4rem]">
              Get Your Full AVI Report.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              Move beyond the snapshot. Get a complete, 252-point audit of your dealership's AI visibility and a prioritized plan to dominate your local market.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/intake" className="premium-button rounded-xl px-8 py-4 font-semibold text-lg">
                Get My Full Report
              </Link>
              <Link href="/sample-ai-visibility-report-for-car-dealerships" className="secondary-button rounded-xl px-8 py-4 font-medium">
                See Sample Audit
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/6 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Link href="/" className="logo-wordmark text-xl">
              <span>VizBiz</span><span className="logo-ai">.ai</span>
            </Link>
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} VizBiz.ai — All rights reserved.
            </p>
          </div>
        </footer>

        <StickyMobileCTA />
      </main>
    </>
  );
}
