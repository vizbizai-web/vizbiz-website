'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/* ── Types ────────────────────────────────────── */
interface Category {
  name: string;
  score: number;
  description: string;
}

interface Competitor {
  name: string;
  score: number;
  isYou?: boolean;
}

interface ProfitAtRisk {
  low: number;
  high: number;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

interface LeadData {
  businessName: string;
  contactName: string;
  location: string;
  website: string;
  aviScore: number;
  totalPrompts: number;
  promptsAppeared: number;
  currencySymbol: string;
  currencyCode: string;
  profitAtRisk: ProfitAtRisk;
  categories: Category[];
  visibleQueries: string[];
  invisibleQueries: string[];
  competitors: Competitor[];
  recommendations: Recommendation[];
}

/* ── Helpers ──────────────────────────────────── */
const getScoreLabel = (score: number): string => {
  if (score >= 60) return 'Strong';
  if (score >= 35) return 'Moderate';
  return 'Weak';
};

const getScoreAccent = (score: number): string => {
  if (score >= 60) return '#22C55E';
  if (score >= 35) return '#F59E0B';
  return '#EF4444';
};

const formatCurrency = (val: number, sym: string): string =>
  sym + Math.round(val).toLocaleString();

/* ── Animated Score Ring ──────────────────────── */
const AnimatedScoreRing = ({ score }: { score: number }) => {
  const radius = 70;
  const stroke = 9;
  const normalized = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * radius;
  const accent = getScoreAccent(score);
  const [offset, setOffset] = useState(circumference);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setOffset(circumference - (normalized / 100) * circumference), 200);
    return () => clearTimeout(timer);
  }, [normalized, circumference]);

  useEffect(() => {
    const target = score;
    let current = 0;
    const step = () => {
      current += 1;
      if (current >= target) {
        setDisplayScore(target);
        return;
      }
      setDisplayScore(current);
      requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
      <circle cx="100" cy="100" r={radius} fill="none" stroke="#ffffff10" strokeWidth={stroke} />
      <circle
        cx="100" cy="100" r={radius} fill="none" stroke={accent} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-[1500ms] ease-out"
      />
      <text x="100" y="92" textAnchor="middle" fill="#ffffff" fontSize="52" fontWeight="800" className="rotate-90">
        {displayScore}
      </text>
      <text x="100" y="118" textAnchor="middle" fill="#F5F5F7" fontSize="14" opacity="0.5" className="rotate-90">
        / 100
      </text>
    </svg>
  );
};

/* ── Animated Category Card ───────────────────── */
const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  const accent = getScoreAccent(category.score);
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => setAnimatedWidth(category.score), 300 + index * 100);
    return () => clearTimeout(t);
  }, [isVisible, category.score, index]);

  return (
    <div
      ref={cardRef}
      className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20 hover:bg-white/[0.08] transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${index * 80}ms, transform 0.6s ease ${index * 80}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[12px] text-[#F5F5F7]/50 uppercase tracking-wider mb-1">{category.name}</div>
          <div className="text-[32px] font-extralight tracking-tight" style={{ color: accent }}>{category.score}</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[18px]">
          {category.name.includes('Brand') ? '🏷️' : category.name.includes('Trust') ? '⭐' : category.name.includes('Consultancy') || category.name.includes('Service') ? '🔧' : category.name.includes('Competitive') ? '🏆' : category.name.includes('Content') || category.name.includes('Authority') ? '📚' : category.name.includes('Portfolio') || category.name.includes('Product') ? '🎨' : category.name.includes('Class') || category.name.includes('Booking') ? '📅' : '📊'}
        </div>
      </div>
      <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${animatedWidth}%`,
            background: 'linear-gradient(90deg, #22D3EE, #06B6D4)',
            transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
      <p className="text-[12px] text-[#F5F5F7]/40 leading-relaxed">{category.description}</p>
    </div>
  );
};

/* ── Competitor Bars (inside glass card) ────────── */
const CompetitorBar = ({ competitors }: { competitors: Competitor[] }) => {
  const maxScore = Math.max(...competitors.map((c) => c.score), 1);

  return (
    <div className="space-y-5">
      {competitors.map((comp, i) => {
        const width = (comp.score / maxScore) * 100;
        const isYou = comp.isYou;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-[150px] text-[13px] text-[#F5F5F7] font-medium truncate flex items-center gap-2">
              {comp.name}
              {isYou && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#02091F] font-bold uppercase tracking-wider">
                  You
                </span>
              )}
            </div>
            <div className="flex-1 h-9 bg-white/5 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full flex items-center justify-end px-3"
                style={{
                  width: `${width}%`,
                  background: isYou
                    ? 'linear-gradient(90deg, #25D1F2, #06B6D4)'
                    : 'linear-gradient(90deg, #374151, #4B5563)',
                  transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <span className={`text-[12px] font-bold ${isYou ? 'text-[#02091F]' : 'text-[#F5F5F7]'}`}>
                  {comp.score}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── FadeIn Section Wrapper ──────────────────── */
const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ── Animated Profit Number ──────────────────── */
const AnimatedProfit = ({ low, high, symbol }: { low: number; high: number; symbol: string }) => {
  const [displayLow, setDisplayLow] = useState(0);
  const [displayHigh, setDisplayHigh] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let l = 0, h = 0;
    const step = () => {
      l = Math.min(l + Math.max(1, Math.floor(low / 60)), low);
      h = Math.min(h + Math.max(1, Math.floor(high / 60)), high);
      setDisplayLow(l);
      setDisplayHigh(h);
      if (l < low || h < high) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, low, high]);

  return (
    <div ref={ref} className="text-5xl sm:text-6xl font-extralight tracking-tight mb-2 leading-none">
      <span className="text-[#25D1F2]">{symbol}{displayLow.toLocaleString()}</span>
      <span className="text-[#F5F5F7]/20 mx-2">—</span>
      <span className="text-[#25D1F2]">{symbol}{displayHigh.toLocaleString()}</span>
      <span className="text-[#F5F5F7]/30 text-lg font-normal ml-2">/month</span>
    </div>
  );
};

/* ── Page ─────────────────────────────────────── */
export default function ReportPage({ params }: { params: Promise<{ leadId: string }> }) {
  const [leadId, setLeadId] = useState<string>('');

  useEffect(() => {
    params.then(p => setLeadId(p.leadId));
  }, [params]);

  if (!leadId) {
    return (
      <div className="min-h-screen bg-[#02091F] flex items-center justify-center">
        <div className="text-[#25D1F2] text-lg animate-pulse">Loading report…</div>
      </div>
    );
  }

  const LEADS: Record<string, LeadData> = {
    'VZB-MOJSCVQM': {
      businessName: 'The Venue Experts',
      contactName: 'Stacey',
      location: 'Melton Mowbray, UK',
      website: 'thevenueexperts.co.uk',
      aviScore: 42,
      totalPrompts: 20,
      promptsAppeared: 8,
      currencySymbol: '£',
      currencyCode: 'GBP',
      profitAtRisk: { low: 300, high: 900 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 65,
          description:
            'How often you appear when venue owners search for consultancy services',
        },
        {
          name: 'Trust & Reviews',
          score: 50,
          description: 'What AI platforms say about your reputation',
        },
        {
          name: 'Consultancy Visibility',
          score: 35,
          description: 'Whether you appear for venue consultancy queries',
        },
        {
          name: 'Competitive Position',
          score: 40,
          description:
            'How you compare to Kelly Chandler and Kelly Mortimer',
        },
        {
          name: 'Content & Authority',
          score: 30,
          description:
            'Whether AI tools see you as an authority in venue consulting',
        },
      ],
      visibleQueries: [
        'venue consultant UK',
        'wedding venue consultant',
        'venue consultancy services',
      ],
      invisibleQueries: [
        'wedding venue sales training',
        'how to increase wedding bookings',
        'venue profitability consulting',
        'venue marketing strategies',
        'hotel wedding sales consultant',
        'rural venue diversification',
        'venue customer experience training',
        'wedding venue business coach',
        'luxury venue consultant UK',
        'venue sales director',
      ],
      competitors: [
        { name: 'The Venue Experts (You)', score: 8, isYou: true },
        { name: 'Kelly Chandler Consulting', score: 13 },
        { name: 'Kelly Mortimer', score: 15 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Strengthen venue consultancy content',
          description:
            'Create detailed guides and case studies about venue consultancy services to improve visibility for consultancy-related queries.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Build trust signals',
          description:
            'Encourage more client testimonials and case studies to improve trust and review scores.',
          impact: 'Medium',
        },
        {
          id: 3,
          title: 'Expand competitive positioning',
          description:
            'Highlight what makes The Venue Experts unique compared to Kelly Chandler and Kelly Mortimer.',
          impact: 'Medium',
        },
      ],
    },
    'VZB-MOKMWAAI': {
      businessName: 'E&A Dance Studio',
      contactName: 'Enrique & Amy',
      location: 'Auckland, NZ',
      website: 'eadancestudiosnz.com',
      aviScore: 28,
      totalPrompts: 20,
      promptsAppeared: 4,
      currencySymbol: 'NZ$',
      currencyCode: 'NZD',
      profitAtRisk: { low: 400, high: 1200 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 35,
          description: 'How often you appear in dance studio searches',
        },
        {
          name: 'Trust & Reviews',
          score: 40,
          description: 'What AI platforms say about your reputation',
        },
        {
          name: 'Class & Booking Visibility',
          score: 15,
          description: 'Whether you appear for class-related queries',
        },
        {
          name: 'Competitive Position',
          score: 20,
          description: 'How you compare to Neverland Studios and Ceroc',
        },
      ],
      visibleQueries: [
        'dance studio Auckland',
        'ballroom dancing classes',
        'Auckland dance lessons',
        'best dance school',
      ],
      invisibleQueries: [
        'wedding dance lessons Auckland',
        'salsa dancing Auckland',
        'kids dance classes',
        'adult dance classes',
        'hip hop dance studio',
        'contemporary dance Auckland',
        'dance studio near me',
        'private dance lessons',
        'dance classes for beginners',
        'latin dance Auckland',
      ],
      competitors: [
        { name: 'E&A Dance Studio (You)', score: 4, isYou: true },
        { name: 'Neverland Studios', score: 12 },
        { name: 'Ceroc French Jive', score: 11 },
        { name: 'Viva Dance', score: 9 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Improve class booking visibility',
          description:
            'Create specific content about dance classes, booking options, and schedules to appear for class-related queries.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Expand style-specific content',
          description:
            'Add detailed information about different dance styles offered (ballroom, latin, contemporary) to capture more specific searches.',
          impact: 'High',
        },
        {
          id: 3,
          title: 'Build local reputation signals',
          description:
            'Encourage more reviews and testimonials from Auckland-based students to improve local trust scores.',
          impact: 'Medium',
        },
      ],
    },
    'VZB-MOLHDGJK': {
      businessName: 'ARTWOW',
      contactName: 'Liz',
      location: 'London/Essex, UK',
      website: 'artwow.co',
      aviScore: 89,
      totalPrompts: 19,
      promptsAppeared: 17,
      currencySymbol: '£',
      currencyCode: 'GBP',
      profitAtRisk: { low: 400, high: 1250 },
      categories: [
        {
          name: 'Portfolio & Inquiry Visibility',
          score: 92,
          description: 'How often your products appear in art print searches',
        },
        {
          name: 'Brand Discovery',
          score: 88,
          description: 'Whether AI tools recognize your brand',
        },
        {
          name: 'Trust & Reviews',
          score: 85,
          description: 'What AI platforms say about your quality',
        },
        {
          name: 'Content & Authority',
          score: 82,
          description: 'Whether AI tools see you as an authority',
        },
        {
          name: 'Competitive Position',
          score: 95,
          description:
            'How you compare to Redbubble and Eleanor Bowmer',
        },
      ],
      visibleQueries: [
        'art prints UK',
        'unique wall art',
        'independent artist prints',
        'art gifts UK',
        'homeware art prints',
        'buy art prints online UK',
        'modern art prints',
        'affordable art UK',
      ],
      invisibleQueries: [
        'unique wedding gifts UK',
        'personalized housewarming presents',
        'art prints for living room',
        'best art print marketplace UK',
      ],
      competitors: [
        { name: 'Redbubble', score: 18 },
        { name: 'ARTWOW (You)', score: 17, isYou: true },
        { name: 'Eleanor Bowmer', score: 10 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Maintain strong portfolio visibility',
          description:
            'Continue showcasing your unique art prints and maintain the strong portfolio presence that is working well.',
          impact: 'Low',
        },
        {
          id: 2,
          title: 'Expand into gift markets',
          description:
            'Create content targeting gift-related searches like wedding gifts and housewarming presents to capture additional market share.',
          impact: 'Medium',
        },
        {
          id: 3,
          title: 'Leverage competitive advantage',
          description:
            'Highlight what makes ARTWOW unique compared to larger marketplaces like Redbubble to maintain your strong competitive position.',
          impact: 'Medium',
        },
      ],
    },
    'VZB-MOO1ESDC': {
      businessName: 'GoalCraft',
      contactName: 'Akchhat',
      location: 'Kapurthala, India',
      website: 'goalcraft.in',
      aviScore: 35,
      totalPrompts: 18,
      promptsAppeared: 6,
      currencySymbol: '₹',
      currencyCode: 'INR',
      profitAtRisk: { low: 5600, high: 45000 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 30,
          description: 'How often you appear in restaurant consulting searches',
        },
        {
          name: 'Trust & Authority',
          score: 25,
          description: 'What AI platforms say about your expertise',
        },
        {
          name: 'Service Offering Visibility',
          score: 40,
          description: 'Whether you appear for Zomato/Swiggy consulting queries',
        },
        {
          name: 'Competitive Position',
          score: 35,
          description: 'How you compare to Restrosol',
        },
        {
          name: 'Content & Authority',
          score: 20,
          description: 'Whether AI tools see you as an authority',
        },
      ],
      visibleQueries: [
        'restaurant consultant India',
        'Zomato optimization',
        'online food delivery consulting',
      ],
      invisibleQueries: [
        'how to increase Zomato orders',
        'Swiggy listing optimization',
        'restaurant menu engineering India',
        'cloud kitchen consultant',
        'restaurant growth consulting',
        'food delivery app optimization',
        'restaurant online order consultant',
      ],
      competitors: [
        { name: 'GoalCraft (You)', score: 6, isYou: true },
        { name: 'Restrosol', score: 9 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Improve brand discovery',
          description:
            'Create more content about your restaurant consulting services and expertise to appear in more searches.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Build trust and authority signals',
          description:
            'Showcase client testimonials, case studies, and credentials to improve trust scores.',
          impact: 'High',
        },
        {
          id: 3,
          title: 'Expand service offering visibility',
          description:
            'Create specific content about Zomato and Swiggy optimization services to capture platform-specific searches.',
          impact: 'High',
        },
      ],
    },
    'VZB-MOO57ZGT': {
      businessName: 'Old Touch Spices',
      contactName: 'Chaitanya',
      location: 'Delhi, India',
      website: 'oldtouchspices.com',
      aviScore: 32,
      totalPrompts: 22,
      promptsAppeared: 7,
      currencySymbol: '₹',
      currencyCode: 'INR',
      profitAtRisk: { low: 1400, high: 8600 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 28,
          description: 'How often you appear in spice brand searches',
        },
        {
          name: 'Trust & Reviews',
          score: 35,
          description: 'What AI platforms say about your quality',
        },
        {
          name: 'Product Visibility',
          score: 30,
          description: 'Whether your products appear in spice searches',
        },
        {
          name: 'Competitive Position',
          score: 25,
          description: 'How you compare to Zoff, Catch, and MDH',
        },
        {
          name: 'Content & Authority',
          score: 20,
          description: 'Whether AI tools see you as an authority',
        },
      ],
      visibleQueries: [
        'premium spices online India',
        'quality masala brand',
        'buy spices online Delhi',
      ],
      invisibleQueries: [
        'best masala brand India',
        'premium garam masala',
        'organic spices India',
        'best spice for biryani',
        'whole spices online',
        'spice gift set India',
        'authentic Indian spices online',
        'certified spice brand India',
        'BRCGS certified spices',
      ],
      competitors: [
        { name: 'MDH Masala', score: 20 },
        { name: 'Catch', score: 17 },
        { name: 'Zoff', score: 14 },
        { name: 'Old Touch Spices (You)', score: 7, isYou: true },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Improve brand recognition',
          description:
            'Create more content about your spice brand, quality standards, and unique offerings to appear in more brand searches.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Expand product visibility',
          description:
            'Add detailed product information, usage guides, and recipes to capture more specific spice-related searches.',
          impact: 'High',
        },
        {
          id: 3,
          title: 'Build competitive differentiation',
          description:
            'Highlight what makes Old Touch Spices unique compared to established brands like MDH, Catch, and Zoff.',
          impact: 'Medium',
        },
      ],
    },
  };

  const leadData = LEADS[leadId];

  if (!leadData) {
    return (
      <div className="min-h-screen bg-[#02091F] text-white font-[Poppins] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-[#25D1F2] text-[80px] font-extralight mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">Report not found</h1>
          <p className="text-[#F5F5F7]/50 mb-8 text-[14px]">
            The report you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <a
            href="https://vizbiz.ai"
            className="inline-block bg-[#25D1F2] text-[#02091F] px-8 py-3 text-[14px] font-semibold hover:bg-[#06B6D4] transition-colors"
          >
            Return to VizBiz.ai
          </a>
        </div>
      </div>
    );
  }

  const {
    businessName,
    contactName,
    location,
    aviScore,
    totalPrompts,
    promptsAppeared,
    currencySymbol,
    profitAtRisk,
    categories,
    visibleQueries,
    invisibleQueries,
    competitors,
    recommendations,
  } = leadData;

  const dateGenerated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const competitorsBeating = competitors.filter(
    (c) => !c.isYou && c.score > promptsAppeared
  ).length;

  const gapsFound = invisibleQueries.length;

  /* ── Subtle noise texture SVG ── */
  const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-[#02091F] text-white font-[Poppins] antialiased">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: `url("${noiseSvg}")`,
          backgroundRepeat: 'repeat',
          opacity: 0.6,
        }}
      />

      {/* Subtle background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#22D3EE]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[100px]" />
      </div>

      {/* ── 1. Header ── */}
      <header className="relative z-10 border-b border-white/10 bg-[#02091F]/80 backdrop-blur-lg">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="VizBiz.ai"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-[15px] font-bold tracking-tight">
                VizBiz<span className="text-[#25D1F2]">.ai</span>
              </span>
              <span className="hidden sm:inline text-[11px] text-[#F5F5F7]/30 font-medium ml-2 border-l border-white/10 pl-3">
                AI Visibility Report
              </span>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-semibold text-[#F5F5F7]">
                {businessName}
              </div>
              <div className="text-[12px] text-[#F5F5F7]/40">
                {location} · {dateGenerated}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Score Card ── */}
      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/8 via-transparent to-[#06B6D4]/3" />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: score ring */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="text-[12px] uppercase tracking-[0.2em] text-[#F5F5F7]/40 font-medium mb-6">
                  Your AI Visibility Score
                </div>
                <div className="flex items-center gap-8">
                  <AnimatedScoreRing score={aviScore} />
                  <div className="flex flex-col gap-2">
                    <div
                      className="text-[14px] font-bold uppercase tracking-wider px-4 py-2 rounded-full"
                      style={{
                        color: getScoreAccent(aviScore),
                        background: `${getScoreAccent(aviScore)}15`,
                        border: `1px solid ${getScoreAccent(aviScore)}30`,
                      }}
                    >
                      {getScoreLabel(aviScore)}
                    </div>
                    <div className="text-[12px] text-[#F5F5F7]/30">
                      Benchmark: 60+
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: stat pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-6 text-center shadow-lg shadow-black/20">
                  <div className="text-[32px] font-bold text-[#25D1F2]">
                    {promptsAppeared}
                    <span className="text-[16px] text-[#F5F5F7]/30">
                      /{totalPrompts}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#F5F5F7]/40 mt-1 uppercase tracking-wider">
                    Appeared in prompts
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-6 text-center shadow-lg shadow-black/20">
                  <div className="text-[32px] font-bold text-[#EF4444]">
                    {competitorsBeating}
                  </div>
                  <div className="text-[12px] text-[#F5F5F7]/40 mt-1 uppercase tracking-wider">
                    Competitors ahead
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-6 text-center shadow-lg shadow-black/20">
                  <div className="text-[32px] font-bold text-[#F59E0B]">
                    {gapsFound}
                  </div>
                  <div className="text-[12px] text-[#F5F5F7]/40 mt-1 uppercase tracking-wider">
                    Gaps found
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. Profit at Risk ── */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 lg:p-12 text-center shadow-lg shadow-black/20">
              <div className="text-[12px] uppercase tracking-[0.2em] text-[#EF4444]/60 font-medium mb-4">
                Estimated Impact
              </div>
              <AnimatedProfit low={profitAtRisk.low} high={profitAtRisk.high} symbol={currencySymbol} />
              <p className="text-[14px] text-[#F5F5F7]/40 max-w-[480px] mx-auto leading-relaxed mt-4">
                Estimated profit flowing to competitors who appear in AI recommendations when your business does not.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 4. Category Breakdown ── */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-10">
              Category Breakdown
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard key={i} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Visibility Map ── */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-10">
              Visibility Map
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visible */}
            <FadeIn delay={100}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20 border-l-4 border-l-emerald-400">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <h3 className="text-[14px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Where you appear
                  </h3>
                  <span className="text-[12px] text-[#F5F5F7]/20 ml-auto bg-white/5 px-2 py-0.5 rounded-full">
                    {visibleQueries.length}
                  </span>
                </div>
                <ul className="space-y-3">
                  {visibleQueries.map((q, i) => (
                    <li key={i} className="text-[14px] text-[#F5F5F7]/70 flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Invisible */}
            <FadeIn delay={200}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20 border-l-4 border-l-red-400">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                  <h3 className="text-[14px] font-semibold text-red-400 uppercase tracking-wider">
                    Where you&apos;re invisible
                  </h3>
                  <span className="text-[12px] text-[#F5F5F7]/20 ml-auto bg-white/5 px-2 py-0.5 rounded-full">
                    {invisibleQueries.length}
                  </span>
                </div>
                <ul className="space-y-3">
                  {invisibleQueries.map((q, i) => (
                    <li key={i} className="text-[14px] text-[#F5F5F7]/40 flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400/50 flex-shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 6. Competitor Comparison ── */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-[900px] mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-10">
              Competitor Comparison
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg shadow-black/20">
              <CompetitorBar competitors={competitors} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 7. Pricing ── */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-[920px] mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="text-[12px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-3">
                Pricing
              </div>
              <h2 className="text-[28px] lg:text-[40px] font-extralight leading-tight">
                We found {recommendations.length} specific gaps costing you visibility
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {/* Fix */}
            <FadeIn delay={100}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg shadow-black/20 hover:border-white/20 transition-all duration-300">
                <div className="text-[12px] uppercase tracking-[0.2em] text-[#25D1F2] font-medium mb-4">
                  Fix
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[40px] font-extralight">$299</span>
                  <span className="text-[14px] text-[#F5F5F7]/30">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Full AI visibility audit (80+ queries)',
                    'We implement every fix for you',
                    'Monthly re-audit included',
                  ].map((item, i) => (
                    <li key={i} className="text-[14px] text-[#F5F5F7]/60 flex items-start gap-3">
                      <svg className="w-4 h-4 text-[#22D3EE] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:alex@vizbiz.ai"
                  className="block w-full text-center border border-[#22D3EE] text-[#22D3EE] py-3.5 text-[14px] font-semibold hover:bg-[#22D3EE]/10 transition-all rounded-xl"
                >
                  Get Started
                </a>
              </div>
            </FadeIn>

            {/* Fix + Monitor */}
            <FadeIn delay={200}>
              <div className="relative bg-white/[0.07] backdrop-blur-md border-2 border-[#22D3EE]/50 rounded-2xl p-8 shadow-lg shadow-black/20 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#02091F] px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="text-[12px] uppercase tracking-[0.2em] text-[#25D1F2] font-medium mb-4">
                  Fix + Monitor
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[40px] font-extralight">$499</span>
                  <span className="text-[14px] text-[#F5F5F7]/30">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Fix',
                    'Competitor tracking',
                    'Ongoing optimization as AI tools change',
                    'Priority support',
                  ].map((item, i) => (
                    <li key={i} className="text-[14px] text-[#F5F5F7]/80 flex items-start gap-3">
                      <svg className="w-4 h-4 text-[#22D3EE] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:alex@vizbiz.ai"
                  className="block w-full text-center bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white py-3.5 text-[14px] font-semibold hover:opacity-90 transition-opacity rounded-xl shadow-lg shadow-[#22D3EE]/20"
                >
                  Get Started
                </a>
              </div>
            </FadeIn>
          </div>

          <p className="text-center text-[12px] text-[#F5F5F7]/20 mt-8">
            Both plans include the full audit report. Cancel anytime. No setup fee.
          </p>
        </div>
      </section>

      {/* ── 8. Bottom CTA ── */}
      <section className="relative z-10 py-16">
        <div className="max-w-[600px] mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h3 className="text-[24px] font-light mb-3">
              Prefer to talk first?
            </h3>
            <p className="text-[14px] text-[#F5F5F7]/40 mb-8">
              Book a free 15-minute audit review call. No pressure, no obligation.
            </p>
            <a
              href="mailto:alex@vizbiz.ai"
              className="inline-block border border-[#22D3EE]/40 text-[#22D3EE] px-8 py-3.5 text-[14px] font-medium hover:bg-[#22D3EE]/10 transition-all rounded-xl"
            >
              Book a Free Call
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── 9. Footer ── */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Image
                src="/logo.jpg"
                alt="VizBiz.ai"
                width={28}
                height={28}
                className="rounded-lg opacity-70"
              />
              <span className="text-[14px] font-semibold">
                VizBiz<span className="text-[#25D1F2]">.ai</span>
              </span>
            </div>
            <p className="text-[12px] text-[#F5F5F7]/20 mb-1">
              Generated by VizBiz.ai — AI Visibility Intelligence
            </p>
            <a
              href="https://vizbiz.ai"
              className="text-[12px] text-[#22D3EE]/50 hover:text-[#22D3EE] transition-colors"
            >
              vizbiz.ai
            </a>
          </FadeIn>
        </div>
      </footer>
    </div>
  );
}
