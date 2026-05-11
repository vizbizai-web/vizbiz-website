'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Sparkles, BarChart3, Zap, ShieldCheck, CheckCircle2,
  RadioTower, Braces, BadgeCheck, ArrowRight, Mail, FileSearch,
  Eye, Lock, Menu, X
} from 'lucide-react';
import Link from 'next/link';

/* ─── TICKER WORDS ─── */
const tickerWords = [
  'dentists.', 'law firms.', 'car dealerships.', 'solopreneurs.',
  'immigration lawyers.', 'coaches.', 'mortgage brokers.', 'PI attorneys.',
  'consultants.', 'med spas.', 'accountants.', 'real estate agents.',
  'chiropractors.', 'financial advisors.', 'auto retailers.', 'career coaches.',
  'insurance brokers.', 'nutritionists.', 'therapists.', 'your business.',
];

/* ─── SECTION OBSERVER ─── */
function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);
  return active;
}

/* ─── TICKER ─── */
function Ticker() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const iv = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setIdx((i) => (i + 1) % tickerWords.length);
        setPhase('in');
      }, 260);
    }, 1150);
    return () => clearInterval(iv);
  }, []);

  return (
    <span className="hero-ticker-outer" aria-live="polite" aria-atomic="true">
      <span
        className={`hero-ticker-word ${phase === 'in' ? 'hero-ticker-word-in' : 'hero-ticker-word-out'}`}
      >
        {tickerWords[idx]}
      </span>
    </span>
  );
}

/* ─── FAQ ITEM ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all hover:border-white/10">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-5 sm:p-6 text-left">
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        <span className="flex-shrink-0 text-lg transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }}>
        <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm leading-relaxed text-white/50">{a}</p>
      </div>
    </div>
  );
}

/* ─── HEADER ─── */
function Header({ activeSection }: { activeSection: string }) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'What You Get', href: '#what-you-get' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      setOpen(false);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#020617]/88 backdrop-blur-xl">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="VizBiz.ai home">
            <img src="/vizbiz-icon-256.svg" alt="" className="h-9 w-9 object-contain" />
            <span className="font-sans text-[1.35rem] leading-none tracking-[-0.035em] text-white">VizBiz<span className="text-[#22D3EE]">.ai</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {items.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => handleClick(e, item.href)}
                className={`text-sm font-medium transition-colors ${activeSection === item.href.slice(1) ? 'text-[#22D3EE]' : 'text-slate-300 hover:text-[#22D3EE]'}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu"
            className="rounded-xl border border-cyan-300/25 bg-white/5 p-2 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/50 hover:bg-white/10 md:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/8 bg-[#020617]/96 px-4 pb-4 pt-3 backdrop-blur-2xl md:hidden">
          <nav className="mx-auto flex max-w-[88rem] flex-col gap-1">
            {items.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => handleClick(e, item.href)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/4">{item.label}</a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ─── INTAKE FORM ─── */
function IntakeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = new FormData();
    payload.append('dealershipName', fd.get('name') as string);
    payload.append('name', fd.get('name') as string);
    payload.append('email', fd.get('email') as string);
    const url = (fd.get('websiteUrl') as string || '').trim();
    payload.append('websiteUrl', /^https?:\/\//i.test(url) ? url : url ? `https://${url}` : '');
    payload.append('cityMarket', fd.get('city') as string);
    const c1 = fd.get('competitorOne') as string;
    const c2 = fd.get('competitorTwo') as string;
    payload.append('competitor', [c1, c2].filter(Boolean).join(', '));
    payload.append('phone', 'Not provided');
    payload.append('source', 'hero form');
    payload.append('originalCta', 'Show my score preview + prepare email report');
    payload.append('originalPage', '/');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/intake', { method: 'POST', body: payload });
      if (res.redirected) { window.location.href = res.url; }
      else { window.location.href = '/thank-you?submitted=1'; }
    } catch { setIsSubmitting(false); }
  }

  const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-[#0F172A] outline-none ring-[#22D3EE] focus:ring-2 placeholder:text-slate-400';

  return (
    <form onSubmit={handleSubmit} id="free-mini-report"
      className="w-full max-w-full overflow-hidden rounded-[1.5rem] border border-cyan-200/40 bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-4 text-[#0F172A] shadow-[0_0_60px_rgba(34,211,238,0.22)] sm:rounded-[2rem] sm:p-6">

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#0F172A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F172A]">
            <Sparkles className="h-3.5 w-3.5 text-[#06B6D4]" /> Free AVI mini report
          </div>
          <h2 className="font-serif text-xl leading-tight sm:text-3xl">See if AI recommends your business.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">Enter your website and two competitors. We&apos;ll check the AI answers buyers are likely to see before they call you.</p>
        </div>
        <div className="hidden shrink-0 rounded-2xl bg-[#0F172A] p-2 shadow-[0_0_24px_rgba(15,23,42,0.16)] sm:block" aria-hidden="true">
          <img src="/vizbiz-icon-256.svg" alt="" width="48" height="48" className="h-12 w-12 object-contain" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">Business name <span className="text-red-400">*</span>
          <input required placeholder="Oakville Family Dental" className={fieldClass} name="name" />
        </label>
        <label className="space-y-1 text-sm font-semibold">Email to unlock summary <span className="text-red-400">*</span>
          <input type="email" required placeholder="you@business.com" className={fieldClass} name="email" />
        </label>
        <label className="space-y-1 text-sm font-semibold">Website
          <input placeholder="business.com" className={fieldClass} name="websiteUrl" />
        </label>
        <label className="space-y-1 text-sm font-semibold">City / market <span className="text-red-400">*</span>
          <input required placeholder="Oakville" className={fieldClass} name="city" />
        </label>
        <label className="space-y-1 text-sm font-semibold sm:col-span-2">Primary service / niche <span className="font-normal text-slate-500">optional</span>
          <input placeholder="Emergency dental, roof repair, family law..." className={fieldClass} name="primaryService" />
        </label>
        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-semibold">Top 2 competitors recommended</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold">Competitor 1
              <input placeholder="Competitor name or website" className={fieldClass} name="competitorOne" />
            </label>
            <label className="space-y-1 text-sm font-semibold">Competitor 2
              <input placeholder="Competitor name or website" className={fieldClass} name="competitorTwo" />
            </label>
          </div>
          <span className="block text-xs text-slate-600">Add the two businesses customers compare you against. Names or websites are fine. If you leave one blank, we can research likely competitors later, but your own picks are more accurate.</span>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-4 font-bold text-white transition hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-70">
        <Mail className="h-5 w-5" />
        {isSubmitting ? 'Building score preview...' : 'Show my score preview + prepare email report'}
        <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-center text-xs text-slate-600">We&apos;ll infer your niche from the website when possible. Competitors are capped at two so the report stays focused.</p>
    </form>
  );
}

/* ─── MAIN ─── */
export default function HomeContent() {
  const activeSection = useActiveSection(['how-it-works', 'what-you-get', 'pricing', 'faq']);

  return (
    <>
      <Header activeSection={activeSection} />

      <main className="min-h-screen">

        {/* ═══════ HERO ═══════ */}
        <section className="relative isolate overflow-hidden bg-[#020617] pt-20 text-white">
          {/* bg gradient */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,#020617_0%,#0F172A_65%,#020617_100%)]" />
          <div className="absolute left-1/2 top-16 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="mx-auto grid max-w-[88rem] gap-12 overflow-hidden px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.22fr)_minmax(420px,0.78fr)] lg:gap-14 lg:px-10 lg:py-24 xl:gap-16">
            {/* Left: copy */}
            <div className="flex min-w-0 flex-col justify-center">
              {/* SEO H1 — rendered for crawlers, visually hidden if JS renders dynamic H1 */}
              <h1 className="sr-only">VizBiz — AI Visibility Reports for Local Businesses</h1>

              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/30 bg-white/5 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.85)]" />
                AI visibility reports for local businesses
              </div>

              <h1 className="max-w-full font-sans text-[clamp(2.1rem,9.5vw,5.125rem)] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[clamp(3rem,6vw,5.125rem)]">
                <span className="block sm:whitespace-nowrap">Be the business</span>
                <span className="block sm:whitespace-nowrap">AI recommends <span className="hero-cursor" aria-hidden="true" /></span>
                <Ticker />
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
                See whether ChatGPT, Gemini, Claude, Perplexity, and Google AI are more likely to recommend you or the two competitors customers already compare you with.
              </p>

              {/* Stats bar — data points AI can cite */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                  <div className="text-2xl font-bold text-[#22D3EE] sm:text-3xl">87%</div>
                  <div className="mt-1 text-xs text-slate-400">of local searches now trigger an AI answer</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                  <div className="text-2xl font-bold text-[#22D3EE] sm:text-3xl">0.3%</div>
                  <div className="mt-1 text-xs text-slate-400">of AI answers mention a local business by name</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                  <div className="text-2xl font-bold text-[#22D3EE] sm:text-3xl">4.2B</div>
                  <div className="mt-1 text-xs text-slate-400">weekly AI-powered searches on Google alone</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                  <div className="text-2xl font-bold text-[#22D3EE] sm:text-3xl">84</div>
                  <div className="mt-1 text-xs text-slate-400">buyer-intent queries tested per paid report</div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <RadioTower className="mb-3 h-5 w-5 text-[#22D3EE]" />
                  Prompt clusters built from your niche
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <Braces className="mb-3 h-5 w-5 text-[#22D3EE]" />
                  Website, schema, and local signal gaps
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <BadgeCheck className="mb-3 h-5 w-5 text-[#22D3EE]" />
                  Two real competitors, not a generic average
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#free-mini-report" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-7 py-4 font-bold text-[#020617] shadow-[0_0_32px_rgba(34,211,238,0.35)] transition hover:scale-[1.01]">
                  Run the free mini report <ArrowRight className="h-5 w-5" />
                </a>
                <a href="#pricing" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10">
                  View full report options
                </a>
              </div>
            </div>

            {/* Right: intake */}
            <div className="w-full justify-self-stretch sm:max-w-[34rem] sm:justify-self-end">
              <IntakeForm />
            </div>
          </div>
        </section>

        {/* ═══════ WHAT YOU GET ═══════ */}
        <section id="what-you-get" className="bg-[#020617] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22D3EE]">Why AI recommends your competitors</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">AI does not guess who to trust. It looks for evidence.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">When someone asks ChatGPT, Gemini, Claude, Perplexity, or Google AI for a local recommendation, your website is only one signal. The answer usually comes from a pattern: clear services, clean local data, reviews, schema, and third-party mentions that all point to the same business.</p>

              {/* Data-rich proof strip */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-sm text-white/60">In our testing across <span className="text-white font-medium">200+ local businesses</span>, the average AI Visibility Index score was <span className="text-amber-400 font-semibold">28 out of 100</span>. Most businesses appear in fewer than 1 in 5 AI-generated answers for their own services.</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-sm text-white/60"><span className="text-white font-medium">ChatGPT alone drives 87.4%</span> of AI referral traffic to local business websites, followed by Google AI Overviews at 7.2%. If ChatGPT does not recommend you, you are invisible to the majority of AI-assisted buyers.</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-sm text-white/60">Businesses with structured data (schema markup), an llms.txt file, and consistent NAP citations score <span className="text-emerald-400 font-semibold">3.6× higher</span> on average than those without. The fix is known. Most local businesses just have not done it yet.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Search, title: 'The business is easy to identify', desc: 'AI tools need a clean entity trail: business name, city, service area, contact details, Google profile, and consistent listings. If that trail is messy, the model hesitates.' },
                { icon: Sparkles, title: 'The services match the buyer\'s question', desc: 'A page that says "we do dental care" is weaker than a page that clearly answers "emergency dentist in Oakville." Specific pages give AI something useful to cite.' },
                { icon: BarChart3, title: 'Reviews use the language buyers use', desc: 'Stars help, but the words matter too. Reviews that mention speed, trust, price, or service quality give AI systems more evidence than generic praise.' },
                { icon: ShieldCheck, title: 'The website is machine-readable', desc: 'Schema, FAQs, service pages, headings, internal links, robots.txt, sitemap, and llms.txt all help crawlers understand what the business does and where it operates.' },
                { icon: Zap, title: 'Other sites confirm the story', desc: 'AI systems do not only trust your homepage. They compare your website against directories, local profiles, category pages, reviews, articles, and competitor mentions.' },
                { icon: CheckCircle2, title: 'Competitors create the benchmark', desc: 'A score by itself is not enough. VizBiz compares you with the two businesses customers already consider, then shows which signals they have that you do not.' },
              ].map((item, i) => (
                <div key={i} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 shadow-[0_0_50px_rgba(15,23,42,0.35)] transition-all hover:border-white/10 hover:bg-white/[0.04]">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#22D3EE]/10">
                    <item.icon className="h-5 w-5 text-[#22D3EE]" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* highlight banner */}
            <div className="mt-10 rounded-2xl border border-cyan-200/30 bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-6 text-center shadow-[0_0_60px_rgba(34,211,238,0.12)] sm:p-8">
              <p className="font-serif text-2xl leading-tight text-[#0F172A] sm:text-3xl">What the free report checks first</p>
              <p className="mx-auto mt-3 max-w-xl text-base text-[#0F172A]/60">Enter your website and two competitors. VizBiz shows whether AI is more likely to recommend you, where the evidence breaks down, and which fixes should come first.</p>
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24" style={{ background: 'linear-gradient(135deg, #FAF7F2, #F2EDE4)' }}>
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#06B6D4]">From score to fix list</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-[#0F172A] sm:text-5xl">A mini report should do more than give you a number.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">The free report gives you the first useful read: where AI sees you, where it prefers a competitor, and which trust signals are missing. The paid report goes deeper and turns that into work we can actually ship.</p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Left: benefits */}
              <div className="space-y-4">
                {[
                  'Know if AI recommends you or the two businesses customers already compare you with',
                  'Find the buyer questions where your website, reviews, or local signals are weakest',
                  'Preview the Revenue Opportunity Gap™ as a directional estimate, not a promise',
                  'Move from a free preview to a full report, fix package, or monthly monitoring',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-white/60 p-4">
                    <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#06B6D4]" />
                    <span className="text-sm text-[#0F172A]/70">{item}</span>
                  </div>
                ))}
              </div>

              {/* Right: dark card */}
              <div className="rounded-3xl bg-[#020617] p-6 text-white shadow-2xl sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#22D3EE]">Mini report flow</p>
                <p className="mt-2 text-sm text-white/50">Simple enough to start. Specific enough to sell the next step.</p>

                <div className="mt-6 space-y-4">
                  {[
                    { num: '01', title: 'Run the free scan', desc: 'Share your website, market, email, and two competitors. That is enough to create a useful first read without making you fill out a long intake form.' },
                    { num: '02', title: 'See where AI loses confidence', desc: 'The mini report shows your score, your weakest buyer questions, and whether the two competitors you named look easier for AI to recommend.' },
                    { num: '03', title: 'Fix the missing signals', desc: 'The full report turns the preview into a prioritized fix list: service pages, schema, FAQs, local entity signals, reviews, and monitoring.' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-xs font-bold text-cyan-200">{step.num}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-white/40">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA path card */}
                <div className="mt-6 rounded-xl bg-gradient-to-br from-[#E0F7FA] to-[#CFFAFE] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">Free report first. Full report and fix package next. Monitoring when they want to track movement.</p>
                </div>
                {/* Locked value card */}
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-4">
                  <Lock className="h-4 w-4 text-[#22D3EE]" />
                  <p className="text-sm text-white/50">Prompt evidence, raw results, competitor breakdowns, and fixes your site can use.</p>
                </div>

                <a href="#free-mini-report" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-6 py-3.5 font-bold text-[#020617] transition hover:scale-[1.01]">
                  Start with the free mini report <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ PRICING (2 CARDS) ═══════ */}
        <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24" style={{ background: 'linear-gradient(135deg, #FAF7F2, #F2EDE4)' }}>
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#06B6D4]">Paid next steps</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-[#0F172A] sm:text-5xl">Choose the level of fix you want.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Start with the free score. Then move into a fix package or fix + monitoring when you want the gaps tracked and improved over time.</p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
              {/* Fix */}
              <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-lg">
                <div className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4]">Fix</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#0F172A]">$88</span>
                  <span className="text-slate-500">one-time</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {['Full AI visibility audit (80+ queries)', 'We implement every fix for you', 'Monthly re-audit included'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#0F172A]/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#06B6D4]" />{f}
                    </li>
                  ))}
                </ul>
                <a href="#free-mini-report" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#0F172A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#020617]">Get Started</a>
              </div>

              {/* Fix + Monitor */}
              <div className="rounded-[2rem] border-2 border-cyan-300/30 bg-white/80 p-8 shadow-lg ring-2 ring-cyan-300/20 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#020617]">Most Popular</div>
                <div className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4]">Fix + Monitor</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#0F172A]">$188</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {['Everything in Fix', 'Competitor tracking', 'Ongoing optimization as AI tools change', 'Priority support'].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#0F172A]/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#06B6D4]" />{f}
                    </li>
                  ))}
                </ul>
                <a href="#free-mini-report" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-6 py-3.5 font-bold text-[#020617] shadow-[0_0_20px_rgba(34,211,238,0.3)] transition hover:scale-[1.01]">Get Started</a>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">Both plans include the full audit report. Cancel anytime. No setup fee.</p>
          </div>
        </section>

        {/* ═══════ FAQ ═══════ */}
        <section id="faq" className="bg-[#020617] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22D3EE]">Common questions</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Answers that make the next step easier.</h2>
            </div>
            <div className="mt-12 space-y-3">
              <FAQItem q="Does VizBiz replace SEO?" a="No. VizBiz measures AI visibility — how often you appear in ChatGPT, Gemini, Claude, Perplexity, and Google AI answers. SEO is still critical for traditional search. We complement it by filling the gap that SEO tools don't address." />
              <FAQItem q="What do I actually receive?" a="An AVI score (0–100) showing your AI visibility strength, a competitor comparison revealing which local businesses AI recommends instead of you, platform-specific findings, and a prioritized action plan ranked by impact." />
              <FAQItem q="How fast do I get results?" a="Your free mini report is delivered within minutes. Full reports are typically ready within 24–48 hours after we complete the multi-platform AI analysis across 20+ buyer-intent prompts." />
              <FAQItem q="How does VizBiz track improvement over time?" a="We re-run the same prompt battery across all AI platforms monthly or quarterly, depending on your plan. This measures whether your business is appearing more often and closing gaps with competitors." />
              <FAQItem q="Does it work with any CMS or website builder?" a="Yes. VizBiz evaluates AI visibility independently of your CMS. We analyze how AI platforms interpret your business across the web — your website, reviews, directories, and third-party sources." />
            </div>
          </div>
        </section>

        {/* ═══════ BLOG CAROUSEL ═══════ */}
        <section id="blog" className="bg-[#020617] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24 border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22D3EE]">From the blog</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Learn what makes AI recommend you.</h2>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <button onClick={() => document.getElementById('blog-track')?.scrollBy({ left: -640, behavior: 'smooth' })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10 hover:border-[#22D3EE]/30"
                  aria-label="Scroll left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button onClick={() => document.getElementById('blog-track')?.scrollBy({ left: 640, behavior: 'smooth' })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10 hover:border-[#22D3EE]/30"
                  aria-label="Scroll right">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <a href="/blog" className="ml-2 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                  View all <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Scrollable track */}
            <div id="blog-track" className="mt-10 flex gap-4 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {[
                { title: '90-Day AI Visibility Playbook for Car Dealerships', slug: '90-day-ai-visibility-playbook-car-dealerships', desc: 'Step-by-step plan to go from invisible to AI-recommended in 90 days.' },
                { title: 'AI Visibility Audit: What It Measures and Why Your Dealership Needs One', slug: 'ai-visibility-audit-what-it-measures-dealership', desc: 'Breakdown of what the AVI score actually measures and how to use it.' },
                { title: 'We Scored 50 Ontario Dealerships on AI Visibility', slug: 'ai-visibility-score-ontario-car-dealerships', desc: 'The results were brutal. Most scored below 30/100.' },
                { title: '35+ AI Visibility Statistics Every Dealership Needs to Know', slug: 'ai-visibility-statistics-car-dealerships', desc: 'The data behind why AI visibility matters — traffic, buyer behavior, local impact.' },
                { title: 'AI Visibility Tools for Car Dealerships Compared (2026)', slug: 'ai-visibility-tools-for-car-dealerships-compared', desc: 'Side-by-side comparison of every tool that measures AI visibility.' },
                { title: 'ChatGPT vs Gemini vs Perplexity: Which Recommends More Dealerships?', slug: 'chatgpt-vs-gemini-vs-perplexity-dealerships', desc: 'We tested all three. The differences are bigger than you think.' },
                { title: 'Free AI Visibility Check for Your Dealership', slug: 'free-ai-visibility-check-for-your-dealership', desc: 'How to run a quick self-audit before investing in a full report.' },
                { title: 'GEO for Car Dealerships: The Complete Guide', slug: 'generative-engine-optimization-car-dealerships', desc: 'Everything about Generative Engine Optimization — the new SEO.' },
                { title: 'How to Get Your Dealership Recommended by ChatGPT in 2026', slug: 'how-to-get-dealership-recommended-by-chatgpt', desc: 'Specific steps to make ChatGPT mention your dealership.' },
                { title: 'Not Showing Up in ChatGPT? Here\'s Why', slug: 'not-showing-up-in-chatgpt', desc: 'The most common reasons AI skips your store and what to fix first.' },
                { title: 'We Audited 50 Ontario Dealerships — Here\'s What We Found', slug: 'ontario-dealership-ai-visibility-audit-results', desc: 'Full results from our Ontario dealership audit with scores and takeaways.' },
                { title: 'VizBiz vs Metricus vs Scope: Which AI Visibility Tool?', slug: 'vizbiz-vs-metricus-vs-scope', desc: 'Honest comparison of the three tools built for dealership AI visibility.' },
                { title: 'What Is AI Visibility for Car Dealerships? (Complete Guide)', slug: 'what-is-ai-visibility-car-dealerships', desc: 'The fundamentals — what AI visibility is, why it matters, and where to start.' },
                { title: 'Why Your Dealership Isn\'t Showing Up in ChatGPT', slug: 'why-car-dealership-not-showing-up-chatgpt', desc: 'Diagnosing the visibility gap and the fixes that move the needle fastest.' },
              ].map((post, i) => (
                <a key={i} href={`/blog/${post.slug}`}
                  className="group flex w-[300px] shrink-0 flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-[#22D3EE]/30 hover:bg-white/[0.04]">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#22D3EE]/10 text-xs font-bold text-[#22D3EE]">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-[#22D3EE] transition-colors">{post.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-white/35">{post.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#22D3EE]/50 group-hover:text-[#22D3EE] transition-colors">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>

            {/* Mobile */}
            <div className="mt-4 flex items-center justify-between sm:hidden">
              <div className="flex gap-2">
                <button onClick={() => document.getElementById('blog-track')?.scrollBy({ left: -300, behavior: 'smooth' })}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button onClick={() => document.getElementById('blog-track')?.scrollBy({ left: 300, behavior: 'smooth' })}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
              <a href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[#22D3EE]">
                View all <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="relative overflow-hidden bg-[#020617] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_50%)]" />
          <div className="mx-auto max-w-4xl text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/vizbiz-icon-256.svg" alt="" className="h-10 w-10 object-contain" />
              <span className="text-2xl tracking-[-0.035em] text-white">VizBiz<span className="text-[#22D3EE]">.ai</span></span>
            </Link>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-white/5 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
              <FileSearch className="h-4 w-4" /> Start with the free AI visibility read
            </div>
            <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">Ready to see if AI cites your business?</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-300">Run the free mini report, compare your business against two real competitors, and see which signals AI systems need before they recommend you.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="#free-mini-report" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] px-8 py-4 font-bold text-[#020617] shadow-[0_0_32px_rgba(34,211,238,0.35)] transition hover:scale-[1.01]">
                Run the free mini report <ArrowRight className="h-5 w-5" />
              </a>
              <a href="#pricing" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-white transition hover:bg-white/10">
                View paid options
              </a>
            </div>
            <p className="mt-4 text-xs text-white/30">No generic scorecard. Your website, your market, and the two competitors customers already compare you with.</p>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="border-t border-white/[0.06] bg-[#020617] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
              <div>
                <Link href="/" className="inline-flex items-center gap-2">
                  <img src="/vizbiz-icon-256.svg" alt="" className="h-9 w-9 object-contain" />
                  <span className="text-lg tracking-[-0.035em] text-white">VizBiz<span className="text-[#22D3EE]">.ai</span></span>
                </Link>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/40">AI Visibility Intelligence for local businesses. See whether ChatGPT, Gemini, Claude, Perplexity, and Google AI recommend you.</p>
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-white/40">
                <Link href="/sample-ai-visibility-report-for-car-dealerships" className="hover:text-white">Sample Report</Link>
                <Link href="/blog" className="hover:text-white">Blog</Link>
                <Link href="/faq-ai-visibility-for-car-dealerships" className="hover:text-white">FAQ</Link>
                <Link href="/about" className="hover:text-white">About</Link>
                <Link href="/intake/" className="font-semibold text-[#22D3EE] hover:text-white">Get My Snapshot</Link>
              </div>
            </div>
            <div className="mt-8 border-t border-white/[0.06] pt-6 text-center text-xs text-white/20">
              © {new Date().getFullYear()} VizBiz.ai — All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
