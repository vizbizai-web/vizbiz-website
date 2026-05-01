'use client';

import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { CheckCircle2, Search, BarChart3, Zap, ChevronDown } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import StickyMobileCTA from '@/components/StickyMobileCTA';

/* ─── data ─── */
const stats = [
  { value: 84, suffix: '%', label: 'of dealerships score below 60/100 on AI visibility' },
  { value: 30, suffix: '%', label: 'of car buyers now use AI to research vehicles' },
  { value: 252, suffix: '', label: 'data points analyzed per dealership' },
];

const aviCategories = [
  { name: 'Dealer Discovery', weight: '30%', score: 42, description: 'How often AI recommends your dealership for buyer-intent searches' },
  { name: 'Trust & Reviews', weight: '25%', score: 37, description: 'Review signals, ratings, and trust markers AI relies on' },
  { name: 'Service Visibility', weight: '20%', score: 34, description: 'Service department mentions in AI-generated answers' },
  { name: 'Used Inventory', weight: '15%', score: 52, description: 'Pre-owned inventory appearance in AI shopping queries' },
  { name: 'Finance & Trade-In', weight: '10%', score: 28, description: 'Financing and trade-in signal presence' },
];

const recentMentions = [
  { question: 'Best Honda dealerships near Oakville?', position: '#4', context: 'AI recommended 3 competitors before this dealership appeared.' },
  { question: 'Who has the best used car deals in the GTA?', position: 'Not mentioned', context: 'This dealership was invisible. AI recommended 5 other dealers.' },
  { question: 'Reliable Toyota service department in Mississauga?', position: '#2', context: 'Strong service visibility. Appeared early in AI recommendations.' },
];

const howItWorks = [
  { number: '01', title: 'Tell us about your dealership', body: "Share your dealership's website, location, and inventory. Our 84-prompt engine evaluates visibility across ChatGPT, Gemini, Google AI, and Perplexity.", icon: Search },
  { number: '02', title: 'We run your AVI audit', body: '84 buyer-intent prompts across three AI platforms — 252 data points per dealership — compared against your local competitors.', icon: BarChart3 },
  { number: '03', title: 'Get your score and action plan', body: 'Your AVI score (0–100), competitor gap analysis, platform breakdown, and a prioritized action plan telling you exactly what to fix first.', icon: Zap },
];

const signals = ['AVI score and band', 'Competitor comparison', 'Platform visibility review', 'Buyer-intent findings', 'Priority fixes ranked', 'Next-step roadmap'];

const comparisonRows = [
  { option: 'DIY guessing', get: 'Manual searches and scattered impressions', missing: 'No benchmark, no scoring, no competitor view' },
  { option: 'Generic SEO agency', get: 'Broad SEO advice and retainers', missing: 'Not built for AI recommendation behavior' },
  { option: 'Monitoring tools', get: 'Brand mention tracking and dashboards', missing: 'Tells you the score, not what to fix' },
  { option: 'VizBiz', get: 'AVI score, competitor gaps, buyer-intent analysis, action plan', missing: 'Built specifically for dealerships', highlight: true },
];

const faqs = [
  { question: 'Does VizBiz replace SEO?', answer: 'No. VizBiz measures how your dealership appears in AI-generated answers across ChatGPT, Gemini, Google AI Overviews, and Perplexity. It complements SEO — 30% of car buyers now use AI to research vehicles, a channel SEO tools don\'t measure.' },
  { question: 'Does it work with Dealer.com, CDK, or WordPress?', answer: 'Yes. VizBiz evaluates AI visibility independently of your CMS. We analyze how AI platforms interpret your dealership across the web — your website, reviews, directories, and third-party sources.' },
  { question: 'What do I actually receive?', answer: 'An AVI score (0–100), competitor comparison showing which local dealerships AI recommends instead of you, platform-specific findings, and a prioritized action plan. 84 prompts, 252 data points per dealership.' },
  { question: 'How fast do I get results?', answer: 'Your full AVI audit is typically delivered within 24-48 hours. You\'ll receive a detailed report with your score, findings, and recommended next steps.' },
  { question: 'How does VizBiz track improvement over time?', answer: 'We re-run the same 84-prompt battery across all AI platforms to measure whether your dealership is appearing more often, being recommended higher, and closing gaps with competitors.' },
];

/* ─── animated counter ─── */
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── accordion ─── */
function FAQItem({ item, i }: { item: typeof faqs[0]; i: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: i * 0.08, duration: 0.4 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <h3 className="text-base font-semibold text-white pr-4">{item.question}</h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-[0.94rem] leading-[1.85] text-[var(--text-secondary)]">{item.answer}</p>
      </motion.div>
    </motion.div>
  );
}

/* ─── main component ─── */
export default function HomeContent() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* ─── HERO — Bombon-style ─── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090f] via-[#0a0d16] to-[#07090f]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.08),transparent)]" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-6xl mx-auto">
            {/* Top area: centered text + buttons (like Bombon) */}
            <div className="flex flex-col items-center text-center pt-32 pb-16 md:pt-40 md:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wider text-white/60 uppercase"
              >
                AI Visibility Intelligence
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-[3rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7rem] font-bold leading-[0.9] tracking-[-0.04em] text-white"
              >
                AI isn't
                <br />
                recommending
                <br />
                <span className="bg-gradient-to-r from-[#06B6D4] to-[#25D1F2] bg-clip-text text-transparent">
                  your dealership.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-8 max-w-xl text-base sm:text-lg leading-8 text-[var(--text-secondary)]"
              >
                84% of dealerships score below 60 on AI visibility. Find out where you stand — and exactly what to fix.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link
                  href="/intake/"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#25D1F2] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-[1.02] min-h-14 text-base"
                >
                  Get My AVI Snapshot
                </Link>
                <Link
                  href="/sample-ai-visibility-report-for-car-dealerships/"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06] hover:text-white min-h-14"
                >
                  See Sample Report
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-6 text-xs text-white/30"
              >
                Free audit · No credit card · Delivered in 24-48 hours
              </motion.p>
            </div>

            {/* Bottom area: scroll-reveal dashboard card (like Bombon's hero image) */}
            <div className="flex flex-col overflow-hidden pb-20">
              <ContainerScroll
                titleComponent={<></>}
              >
                <div className="h-full w-full bg-[#0f1117] rounded-2xl p-5 md:p-8 relative overflow-hidden">
                  {/* Dashboard header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                      </div>
                      <span className="text-xs text-white/40 ml-2">vizbiz.ai/dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-[#25D1F2] font-medium">AVI Score</span>
                      <span className="text-2xl font-bold text-[#06B6D4]">42</span>
                      <span className="text-xs text-[#06B6D4]/60">/100</span>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="space-y-3">
                    {[
                      { name: 'Dealer Discovery', score: 42, weight: 30, color: '#25D1F2' },
                      { name: 'Trust & Reviews', score: 37, weight: 25, color: '#EF4444' },
                      { name: 'Service Visibility', score: 34, weight: 20, color: '#EF4444' },
                      { name: 'Used Inventory', score: 52, weight: 15, color: '#FBBF24' },
                      { name: 'Finance & Trade-In', score: 28, weight: 10, color: '#EF4444' },
                    ].map((cat) => (
                      <div key={cat.name} className="flex items-center gap-4">
                        <span className="text-xs text-white/50 w-36 text-right shrink-0">{cat.name}</span>
                        <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <span className="text-sm font-bold w-8" style={{ color: cat.color }}>{cat.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Competitor comparison */}
                  <div className="mt-6 pt-5 border-t border-white/[0.06]">
                    <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">Competitor Gap</p>
                    <div className="flex gap-6 items-end">
                      {[{ name: 'Your Store', score: 42, color: '#06B6D4' }, { name: 'Competitor A', score: 78, color: '#22C55E' }, { name: 'Competitor B', score: 65, color: '#22C55E' }].map((c) => (
                        <div key={c.name} className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-full bg-white/[0.03] rounded-lg overflow-hidden h-20 flex items-end">
                            <div
                              className="w-full rounded-lg transition-all duration-1000"
                              style={{ height: `${c.score}%`, backgroundColor: c.color, opacity: 0.8 }}
                            />
                          </div>
                          <span className="text-[10px] text-white/40">{c.name}</span>
                          <span className="text-sm font-bold" style={{ color: c.color }}>{c.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ContainerScroll>
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section className="chapter-dark border-t border-white/6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-[2.8rem] font-bold tracking-[-0.04em] text-[var(--accent-blue)] sm:text-[3.2rem]">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── AVI SCORE ─── */}
        <section className="chapter-dark px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="section-kicker">Your AVI Score</div>
              <h2 className="display-font mt-5 text-[2.4rem] font-semibold tracking-[-0.04em] text-white sm:text-[3rem]">
                Five categories. One score. Clear priorities.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">
                The AI Visibility Index measures your dealership across five dealer-specific categories — weighted by what actually drives buyer decisions.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                {aviCategories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    className="glass-card rounded-2xl p-5 cursor-default"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{cat.name} <span className="text-[var(--accent-blue)]">({cat.weight})</span></p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{cat.description}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0 text-right">
                        <p className={`text-2xl font-bold ${cat.score < 35 ? 'text-red-400' : cat.score < 50 ? 'text-yellow-400' : 'text-[var(--accent-blue)]'}`}>{cat.score}</p>
                      </div>
                    </div>
                    <div className="mt-3 scene-bar-shell">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${cat.score}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className={`scene-bar ${cat.score < 35 ? 'scene-bar-red' : cat.score < 50 ? 'scene-bar-yellow' : 'scene-bar-blue'}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-5"
              >
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between border-b border-white/8 pb-4">
                    <div>
                      <p className="scene-eyebrow">Sample dealership</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Recent AI Mentions</h3>
                    </div>
                    <div className="scene-score-pill">
                      <span>AVI</span>
                      <strong>42</strong>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {recentMentions.map((m, i) => (
                      <motion.div
                        key={m.question}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                        className="rounded-xl bg-white/4 p-4 border border-white/6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-white/90">{m.question}</p>
                          <span className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${m.position === 'Not mentioned' ? 'bg-red-500/16 text-red-400' : 'bg-[var(--accent-blue)]/16 text-[var(--accent-blue)]'}`}>
                            {m.position}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-white/50">{m.context}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <p className="scene-eyebrow">What you get</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {signals.map((s) => (
                      <div key={s} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="section-kicker">How it works</div>
              <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
                From invisible to unmissable in three steps.
              </h2>
            </motion.div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {howItWorks.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  whileHover={{ y: -4, borderColor: 'rgba(59,130,246,0.3)' }}
                  className="glass-card rounded-2xl p-6 border border-transparent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-blue)]/12">
                      <step.icon className="h-5 w-5 text-[var(--accent-blue)]" />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent-blue)]">{step.number}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-[0.94rem] leading-[1.85] text-[var(--text-secondary)]">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── COMPARISON ─── */}
        <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="section-kicker">Why VizBiz</div>
              <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
                Not another dashboard. A diagnosis and a plan.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="comparison-stage-v2 mt-10"
            >
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-0">
                <div className="comparison-head-v2">Approach</div>
                <div className="comparison-head-v2">What you get</div>
                <div className="comparison-head-v2">What's missing</div>
              </div>
              {comparisonRows.map((row) => (
                <div key={row.option} className={`comparison-row-v2 ${row.highlight ? 'comparison-highlight-v2' : ''}`}>
                  <div className="comparison-cell-v2 font-semibold">{row.option}</div>
                  <div className="comparison-cell-v2">{row.get}</div>
                  <div className="comparison-cell-v2">{row.missing}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── IS / ISN'T ─── */}
        <section className="chapter-dark border-t border-white/6 px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="section-kicker">What VizBiz is</div>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A dealership-specific AI visibility audit</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A competitor-aware visibility benchmark</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A strategic scorecard and prioritized action plan</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--accent-blue)]" /> A way to see how AI represents your dealership</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="section-kicker">What VizBiz isn't</div>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A generic SEO retainer</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A vanity score with no explanation</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A website rebuild</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-4 w-4 flex-shrink-0 text-white/30">✕</span> A promise of instant rankings</li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="chapter-dark border-t border-white/6 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="section-kicker">Common questions</div>
              <h2 className="display-font mt-5 text-[2.2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
                Answers that make the next step easier.
              </h2>
            </motion.div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faqs.map((item, i) => (
                <FAQItem key={item.question} item={item} i={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <motion.section
          className="chapter-final px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="mx-auto max-w-4xl text-center">
            <div className="section-kicker">Next step</div>
            <h2 className="super-display mt-6 text-[2.6rem] leading-[0.9] tracking-[-0.05em] text-white sm:text-[4rem] lg:text-[5rem]">
              See whether AI<br />recommends you.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              Get your AVI score, competitor comparison, and a clear view of where your dealership stands across ChatGPT, Gemini, Google AI, and Perplexity.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/intake/" className="premium-button rounded-xl px-7 py-4 text-sm font-semibold min-h-14 px-8 text-base">
                Get My AVI Snapshot
              </Link>
              <Link href="/sample-ai-visibility-report-for-car-dealerships/" className="secondary-button min-h-14 rounded-xl px-7 text-sm font-medium">
                See Sample Report
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-white/6 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link href="/">
                <img src="/logo.jpg" alt="VizBiz.ai" style={{ height: '36px', width: 'auto' }} />
              </Link>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
                AI Visibility Intelligence for car dealerships.
              </p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
              <Link href="/sample-ai-visibility-report-for-car-dealerships" className="transition-colors hover:text-white">Sample Report</Link>
              <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
              <Link href="/faq-ai-visibility-for-car-dealerships" className="transition-colors hover:text-white">FAQ</Link>
              <Link href="/intake/" className="font-semibold text-[var(--accent-blue)] transition-colors hover:text-white">Get My Snapshot</Link>
            </nav>
          </div>
          <div className="mx-auto mt-8 max-w-6xl border-t border-white/6 pt-6 text-center text-xs text-white/30">
            © {new Date().getFullYear()} VizBiz.ai — All rights reserved.
          </div>
        </footer>

        <StickyMobileCTA />
      </main>
    </>
  );
}
