'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';

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

interface SocialPresence {
  instagram: number | null;
  facebook: number | null;
  googleReviews: number;
  overallScore: number;
}

interface CompetitorSocial {
  name: string;
  instagram: number | null;
  facebook: number | null;
  googleReviews: number;
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
  socialPresence: SocialPresence;
  competitorSocial: CompetitorSocial[];
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

const getScoreColorClass = (score: number): string => {
  if (score >= 60) return 'text-emerald-400';
  if (score >= 35) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBgClass = (score: number): string => {
  if (score >= 60) return 'bg-emerald-400';
  if (score >= 35) return 'bg-amber-400';
  return 'bg-red-400';
};

const formatCurrency = (val: number, sym: string): string =>
  sym + Math.round(val).toLocaleString();

/* ── FadeIn Wrapper ──────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── CountUp Number ──────────────────────────── */
function CountUp({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    Math.round(v).toLocaleString()
  );
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ── Score Ring ───────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const radius = 110;
  const stroke = 10;
  const normalized = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * radius;
  const accent = getScoreAccent(score);

  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimatedOffset(circumference - (normalized / 100) * circumference);
    }, 300);
    return () => clearTimeout(t);
  }, [normalized, circumference]);

  return (
    <div className="relative w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 260 260"
        className="-rotate-90"
      >
        <circle
          cx="130"
          cy="130"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx="130"
          cy="130"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animatedOffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp
          value={score}
          className={cn('text-5xl sm:text-7xl font-extrabold tracking-tight', getScoreColorClass(score))}
        />
        <span className="text-sm text-white/40 mt-1 font-medium">/ 100</span>
      </div>
    </div>
  );
}

/* ── Lead Data ─────────────────────────────────── */
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
      { name: 'Brand Discovery', score: 65, description: 'How often you appear when venue owners search for consultancy services' },
      { name: 'Trust & Reviews', score: 50, description: 'What AI platforms say about your reputation' },
      { name: 'Consultancy Visibility', score: 35, description: 'Whether you appear for venue consultancy queries' },
      { name: 'Competitive Position', score: 40, description: 'How you compare to Kelly Chandler and Kelly Mortimer' },
      { name: 'Content & Authority', score: 30, description: 'Whether AI tools see you as an authority in venue consulting' },
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
      { id: 1, title: 'Strengthen venue consultancy content', description: 'Create detailed guides and case studies about venue consultancy services to improve visibility for consultancy-related queries.', impact: 'High' },
      { id: 2, title: 'Build trust signals', description: 'Encourage more client testimonials and case studies to improve trust and review scores.', impact: 'Medium' },
      { id: 3, title: 'Expand competitive positioning', description: 'Highlight what makes The Venue Experts unique compared to Kelly Chandler and Kelly Mortimer.', impact: 'Medium' },
    ],
    socialPresence: {
      instagram: 1240,
      facebook: 890,
      googleReviews: 12,
      overallScore: 4.2,
    },
    competitorSocial: [
      { name: 'Kelly Chandler Consulting', instagram: 5430, facebook: 2100, googleReviews: 28 },
      { name: 'Kelly Mortimer', instagram: 8900, facebook: 3400, googleReviews: 45 },
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
      { name: 'Brand Discovery', score: 35, description: 'How often you appear in dance studio searches' },
      { name: 'Trust & Reviews', score: 40, description: 'What AI platforms say about your reputation' },
      { name: 'Class & Booking Visibility', score: 15, description: 'Whether you appear for class-related queries' },
      { name: 'Competitive Position', score: 20, description: 'How you compare to Neverland Studios and Ceroc' },
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
      { id: 1, title: 'Improve class booking visibility', description: 'Create specific content about dance classes, booking options, and schedules to appear for class-related queries.', impact: 'High' },
      { id: 2, title: 'Expand style-specific content', description: 'Add detailed information about different dance styles offered (ballroom, latin, contemporary) to capture more specific searches.', impact: 'High' },
      { id: 3, title: 'Build local reputation signals', description: 'Encourage more reviews and testimonials from Auckland-based students to improve local trust scores.', impact: 'Medium' },
    ],
    socialPresence: {
      instagram: 680,
      facebook: 420,
      googleReviews: 8,
      overallScore: 3.5,
    },
    competitorSocial: [
      { name: 'Neverland Studios', instagram: 3200, facebook: 1800, googleReviews: 22 },
      { name: 'Ceroc French Jive', instagram: 5400, facebook: 3100, googleReviews: 35 },
      { name: 'Viva Dance', instagram: 2100, facebook: 1200, googleReviews: 15 },
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
      { name: 'Portfolio & Inquiry Visibility', score: 92, description: 'How often your products appear in art print searches' },
      { name: 'Brand Discovery', score: 88, description: 'Whether AI tools recognize your brand' },
      { name: 'Trust & Reviews', score: 85, description: 'What AI platforms say about your quality' },
      { name: 'Content & Authority', score: 82, description: 'Whether AI tools see you as an authority' },
      { name: 'Competitive Position', score: 95, description: 'How you compare to Redbubble and Eleanor Bowmer' },
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
      { id: 1, title: 'Maintain strong portfolio visibility', description: 'Continue showcasing your unique art prints and maintain the strong portfolio presence that is working well.', impact: 'Low' },
      { id: 2, title: 'Expand into gift markets', description: 'Create content targeting gift-related searches like wedding gifts and housewarming presents to capture additional market share.', impact: 'Medium' },
      { id: 3, title: 'Leverage competitive advantage', description: 'Highlight what makes ARTWOW unique compared to larger marketplaces like Redbubble to maintain your strong competitive position.', impact: 'Medium' },
    ],
    socialPresence: {
      instagram: 15400,
      facebook: 8900,
      googleReviews: 67,
      overallScore: 8.5,
    },
    competitorSocial: [
      { name: 'Redbubble', instagram: 280000, facebook: 450000, googleReviews: 3200 },
      { name: 'Eleanor Bowmer', instagram: 24500, facebook: 12300, googleReviews: 89 },
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
      { name: 'Brand Discovery', score: 30, description: 'How often you appear in restaurant consulting searches' },
      { name: 'Trust & Authority', score: 25, description: 'What AI platforms say about your expertise' },
      { name: 'Service Offering Visibility', score: 40, description: 'Whether you appear for Zomato/Swiggy consulting queries' },
      { name: 'Competitive Position', score: 35, description: 'How you compare to Restrosol' },
      { name: 'Content & Authority', score: 20, description: 'Whether AI tools see you as an authority' },
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
      { id: 1, title: 'Improve brand discovery', description: 'Create more content about your restaurant consulting services and expertise to appear in more searches.', impact: 'High' },
      { id: 2, title: 'Build trust and authority signals', description: 'Showcase client testimonials, case studies, and credentials to improve trust scores.', impact: 'High' },
      { id: 3, title: 'Expand service offering visibility', description: 'Create specific content about Zomato and Swiggy optimization services to capture platform-specific searches.', impact: 'High' },
    ],
    socialPresence: {
      instagram: 450,
      facebook: 320,
      googleReviews: 5,
      overallScore: 3.1,
    },
    competitorSocial: [
      { name: 'Restrosol', instagram: 2800, facebook: 1900, googleReviews: 18 },
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
      { name: 'Brand Discovery', score: 28, description: 'How often you appear in spice brand searches' },
      { name: 'Trust & Reviews', score: 35, description: 'What AI platforms say about your quality' },
      { name: 'Product Visibility', score: 30, description: 'Whether your products appear in spice searches' },
      { name: 'Competitive Position', score: 25, description: 'How you compare to Zoff, Catch, and MDH' },
      { name: 'Content & Authority', score: 20, description: 'Whether AI tools see you as an authority' },
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
      { id: 1, title: 'Improve brand recognition', description: 'Create more content about your spice brand, quality standards, and unique offerings to appear in more brand searches.', impact: 'High' },
      { id: 2, title: 'Expand product visibility', description: 'Add detailed product information, usage guides, and recipes to capture more specific spice-related searches.', impact: 'High' },
      { id: 3, title: 'Build competitive differentiation', description: 'Highlight what makes Old Touch Spices unique compared to established brands like MDH, Catch, and Zoff.', impact: 'Medium' },
    ],
    socialPresence: {
      instagram: 1200,
      facebook: 850,
      googleReviews: 11,
      overallScore: 3.8,
    },
    competitorSocial: [
      { name: 'MDH Masala', instagram: 45000, facebook: 28000, googleReviews: 450 },
      { name: 'Catch', instagram: 32000, facebook: 19000, googleReviews: 280 },
      { name: 'Zoff', instagram: 18500, facebook: 12000, googleReviews: 165 },
    ],
  },
};

/* ── Client Component ─────────────────────────── */
export function ReportContent({ leadId }: { leadId: string }) {
  const leadData = LEADS[leadId];

  if (!leadData) {
    return (
      <div className="min-h-screen bg-[#02091F] text-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-[#25D1F2] text-[80px] font-extralight mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">Report not found</h1>
          <p className="text-white/50 mb-8 text-base">
            The report you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <a
            href="https://vizbiz.ai"
            className="inline-block bg-[#25D1F2] text-[#02091F] px-8 py-3 text-base font-semibold hover:bg-[#06B6D4] transition-colors rounded-xl"
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
    socialPresence,
    competitorSocial,
  } = leadData;

  const dateGenerated = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const competitorsBeating = competitors.filter(
    (c) => !c.isYou && c.score > promptsAppeared
  ).length;

  const gapsFound = invisibleQueries.length;

  const scoreLabel = getScoreLabel(aviScore);
  const scoreAccent = getScoreAccent(aviScore);

  // Category chart data
  const categoryChartData = categories.map((c) => ({
    name: c.name,
    score: c.score,
    fill:
      c.score >= 60 ? '#22C55E' : c.score >= 35 ? '#F59E0B' : '#EF4444',
  }));

  // Radar chart data
  const radarData = categories.map((c) => ({
    category: c.name,
    score: c.score,
    fullMark: 100,
  }));

  // Competitor chart data
  const competitorChartData = competitors.map((c) => ({
    name: c.name.replace(' (You)', ''),
    score: c.score,
    isYou: c.isYou || false,
    fill: c.isYou ? '#25D1F2' : '#64748B',
  }));

  // Social chart data
  const socialChartData = [
    {
      name: businessName,
      instagram: socialPresence.instagram || 0,
      facebook: socialPresence.facebook || 0,
      googleReviews: socialPresence.googleReviews,
      isYou: true,
    },
    ...competitorSocial.map((c) => ({
      name: c.name,
      instagram: c.instagram || 0,
      facebook: c.facebook || 0,
      googleReviews: c.googleReviews,
      isYou: false,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#02091F] text-white antialiased overflow-x-hidden">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#22D3EE]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[100px]" />
      </div>

      {/* ── 1. Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#02091F]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="VizBiz.ai"
                width={44}
                height={44}
                className="rounded-lg"
              />
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight">
                  VizBiz.ai
                </span>
                <span className="hidden sm:inline text-sm text-white/40 ml-2">
                  AI Visibility Report
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm sm:text-base font-semibold text-white/80">
                {businessName}
              </div>
              <div className="text-xs text-white/30 hidden sm:block">
                {location} · {dateGenerated}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Score + Stats ── */}
      <section className="relative z-10 py-14 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: score ring */}
              <div className="flex flex-col items-center lg:items-start gap-4 lg:gap-6">
                <div className="text-sm uppercase tracking-widest text-white/40 font-medium">
                  Your AI Visibility Score
                </div>
                <div className="flex items-center gap-4 lg:gap-8">
                  <ScoreRing score={aviScore} />
                  <div className="flex flex-col gap-3">
                    <div
                      className="text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full"
                      style={{
                        color: scoreAccent,
                        background: `${scoreAccent}15`,
                        border: `1px solid ${scoreAccent}40`,
                      }}
                    >
                      {scoreLabel}
                    </div>
                    <div className="text-sm text-white/30">Benchmark: 60+</div>
                  </div>
                </div>
              </div>

              {/* Right: stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-white/50 uppercase tracking-wider text-xs sm:text-sm">
                      AI Visibility Score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className={cn('text-2xl sm:text-4xl', getScoreColorClass(aviScore))}>
                      <CountUp value={aviScore} />
                    </CardTitle>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-white/50 uppercase tracking-wider text-xs sm:text-sm">
                      Prompts Appeared
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl sm:text-4xl text-[#25D1F2]">
                      <CountUp value={promptsAppeared} />
                      <span className="text-xl text-white/30 ml-1">
                        /{totalPrompts}
                      </span>
                    </CardTitle>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-white/50 uppercase tracking-wider text-xs sm:text-sm">
                      Competitors Ahead
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl sm:text-4xl text-red-400">
                      <CountUp value={competitorsBeating} />
                    </CardTitle>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-white/50 uppercase tracking-wider text-xs sm:text-sm">
                      Gaps Found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl sm:text-4xl text-amber-400">
                      <CountUp value={gapsFound} />
                    </CardTitle>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. Profit at Risk ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 text-center py-8 sm:py-12">
              <CardHeader>
                <CardDescription className="text-white/40 uppercase tracking-widest text-sm">
                  Estimated Monthly Profit at Risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl sm:text-4xl sm:text-5xl font-extralight tracking-tight mb-2">
                  <span className="text-[#25D1F2]">
                    {currencySymbol}
                    <CountUp value={profitAtRisk.low} />
                  </span>
                  <span className="text-white/20 mx-3">—</span>
                  <span className="text-[#25D1F2]">
                    {currencySymbol}
                    <CountUp value={profitAtRisk.high} />
                  </span>
                  <span className="text-white/30 text-xl font-normal ml-2">
                    /mo
                  </span>
                </CardTitle>
                <p className="text-base text-white/40 max-w-lg mx-auto mt-4 leading-relaxed">
                  Profit currently flowing to competitors who rank higher in AI
                  recommendations.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ── 4. Category Scores (BarChart) ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-sm sm:text-base uppercase tracking-widest text-white/40 font-medium mb-4 lg:mb-6">
              Category Scores
            </div>
            <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
              <CardContent className="pt-6">
                <ChartContainer
                  config={{
                    score: {
                      label: 'Score',
                    },
                  }}
                  className="h-[280px] sm:h-[320px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 40, bottom: 10, left: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="rgba(255,255,255,0.08)"
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                        width={120}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(2, 9, 31, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
                        {categoryChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ── 5. Visibility Radar ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-sm sm:text-base uppercase tracking-widest text-white/40 font-medium mb-4 lg:mb-6">
              Visibility Radar
            </div>
            <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
              <CardContent className="pt-6">
                <ChartContainer
                  config={{
                    score: { label: 'Score' },
                  }}
                  className="mx-auto aspect-square max-h-[400px] min-h-[280px] w-full"
                >
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid
                      stroke="rgba(255,255,255,0.15)"
                    />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#25D1F2"
                      fill="#25D1F2"
                      fillOpacity={0.35}
                      strokeWidth={2.5}
                      isAnimationActive
                      animationDuration={1500}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(2, 9, 31, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ── 6. Competitor Comparison ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-sm sm:text-base uppercase tracking-widest text-white/40 font-medium mb-4 lg:mb-6">
              Competitor Comparison
            </div>
            <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
              <CardContent className="pt-6">
                <ChartContainer
                  config={{
                    score: { label: 'Score' },
                  }}
                  className="h-[240px] sm:h-[280px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={competitorChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 40, bottom: 10, left: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="rgba(255,255,255,0.08)"
                      />
                      <XAxis
                        type="number"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                        width={140}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(2, 9, 31, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={32}>
                        {competitorChartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.isYou ? '#25D1F2' : '#8B5CF6'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ── 7. Social Media Presence ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-sm sm:text-base uppercase tracking-widest text-white/40 font-medium mb-4 lg:mb-6">
              Social Media Presence
            </div>
            <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 overflow-hidden">
              <CardContent className="pt-6">
                {/* Social stats summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="text-center p-4 rounded-xl bg-white/[0.12]">
                    <div className="text-3xl font-bold text-[#25D1F2]">
                      {socialPresence.instagram?.toLocaleString() || '—'}
                    </div>
                    <div className="text-sm text-white/40 uppercase tracking-wider mt-1">
                      Instagram
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/[0.12]">
                    <div className="text-3xl font-bold text-[#25D1F2]">
                      {socialPresence.facebook?.toLocaleString() || '—'}
                    </div>
                    <div className="text-sm text-white/40 uppercase tracking-wider mt-1">
                      Facebook
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/[0.12]">
                    <div className="text-3xl font-bold text-[#25D1F2]">
                      {socialPresence.googleReviews}
                    </div>
                    <div className="text-sm text-white/40 uppercase tracking-wider mt-1">
                      Google Reviews
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/[0.12]">
                    <div className="text-3xl font-bold text-[#25D1F2]">
                      {socialPresence.overallScore}
                      <span className="text-lg text-white/30">/10</span>
                    </div>
                    <div className="text-sm text-white/40 uppercase tracking-wider mt-1">
                      Overall Score
                    </div>
                  </div>
                </div>

                {/* Instagram comparison chart */}
                <div className="mb-6">
                  <div className="text-sm uppercase tracking-wider text-white/50 mb-3">
                    Instagram Followers
                  </div>
                  <ChartContainer
                    config={{ followers: { label: 'Followers' } }}
                    className="h-[220px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={socialChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 40, bottom: 5, left: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="rgba(255,255,255,0.08)"
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          tickFormatter={(v: number) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
                          }
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                          width={120}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          formatter={(value) =>
                            (value as number).toLocaleString()
                          }
                          contentStyle={{
                            background: 'rgba(2, 9, 31, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                        />
                        <Bar
                          dataKey="instagram"
                          radius={[0, 6, 6, 0]}
                          barSize={24}
                        >
                          {socialChartData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.isYou ? '#25D1F2' : '#8B5CF6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Facebook comparison chart */}
                <div className="mb-6">
                  <div className="text-sm uppercase tracking-wider text-white/50 mb-3">
                    Facebook Likes
                  </div>
                  <ChartContainer
                    config={{ likes: { label: 'Likes' } }}
                    className="h-[220px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={socialChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 40, bottom: 5, left: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="rgba(255,255,255,0.08)"
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          tickFormatter={(v: number) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
                          }
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                          width={120}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          formatter={(value) =>
                            (value as number).toLocaleString()
                          }
                          contentStyle={{
                            background: 'rgba(2, 9, 31, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                        />
                        <Bar
                          dataKey="facebook"
                          radius={[0, 6, 6, 0]}
                          barSize={24}
                        >
                          {socialChartData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.isYou ? '#25D1F2' : '#8B5CF6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Google Reviews comparison */}
                <div>
                  <div className="text-sm uppercase tracking-wider text-white/50 mb-3">
                    Google Reviews
                  </div>
                  <ChartContainer
                    config={{ reviews: { label: 'Reviews' } }}
                    className="h-[220px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={socialChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 40, bottom: 5, left: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="rgba(255,255,255,0.08)"
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                          width={120}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          formatter={(value) =>
                            (value as number).toLocaleString()
                          }
                          contentStyle={{
                            background: 'rgba(2, 9, 31, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                        />
                        <Bar
                          dataKey="googleReviews"
                          radius={[0, 6, 6, 0]}
                          barSize={24}
                        >
                          {socialChartData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.isYou ? '#25D1F2' : '#8B5CF6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ── 8. Where You Appear / Where You're Invisible ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-sm sm:text-base uppercase tracking-widest text-white/40 font-medium mb-4 lg:mb-6">
              Visibility Map
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Visible */}
            <FadeIn delay={100}>
              <Card className="bg-white/[0.06] border-white/10 border-l-4 border-l-emerald-400 text-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <CardDescription className="text-emerald-400 uppercase tracking-wider text-sm font-semibold">
                      Where you appear
                    </CardDescription>
                    <span className="text-xs text-white/20 ml-auto bg-white/[0.12] px-2 py-0.5 rounded-full">
                      {visibleQueries.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {visibleQueries.map((q, i) => (
                      <li
                        key={i}
                        className="text-base text-white/70 flex items-center gap-3"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Invisible */}
            <FadeIn delay={200}>
              <Card className="bg-white/[0.06] border-white/10 border-l-4 border-l-red-400 text-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <CardDescription className="text-red-400 uppercase tracking-wider text-sm font-semibold">
                      Where you&apos;re invisible
                    </CardDescription>
                    <span className="text-xs text-white/20 ml-auto bg-white/[0.12] px-2 py-0.5 rounded-full">
                      {invisibleQueries.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {invisibleQueries.map((q, i) => (
                      <li
                        key={i}
                        className="text-base text-white/40 flex items-center gap-3"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/50 flex-shrink-0" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 9. Pricing ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="text-sm uppercase tracking-widest text-white/30 font-medium mb-3">
                Pricing
              </div>
              <h2 className="text-3xl lg:text-2xl sm:text-4xl font-extralight leading-tight">
                We found {recommendations.length} specific gaps costing you
                visibility
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
            {/* Fix */}
            <FadeIn delay={100}>
              <Card className="bg-white/[0.18] border-white/30 text-white backdrop-blur-md shadow-lg shadow-black/20 hover:border-white/20 transition-all">
                <CardHeader>
                  <CardDescription className="text-[#25D1F2] uppercase tracking-widest text-sm font-medium">
                    Fix
                  </CardDescription>
                  <CardTitle className="text-2xl sm:text-4xl font-extralight">
                    $299
                    <span className="text-lg text-white/30 font-normal">
                      /mo
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Full AI visibility audit (80+ queries)',
                      'We implement every fix for you',
                      'Monthly re-audit included',
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="text-base text-white/60 flex items-start gap-3"
                      >
                        <svg
                          className="w-5 h-5 text-[#22D3EE] mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:alex@vizbiz.ai"
                    className="block w-full text-center border border-[#22D3EE] text-[#22D3EE] py-3.5 text-base font-semibold hover:bg-[#22D3EE]/10 transition-all rounded-xl"
                  >
                    Get Started
                  </a>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Fix + Monitor */}
            <FadeIn delay={200}>
              <Card className="relative bg-white/[0.07] border-2 border-[#22D3EE]/50 text-white shadow-[0_0_30px_rgba(34,211,238,0.08)]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#02091F] px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <CardHeader className="pt-8">
                  <CardDescription className="text-[#25D1F2] uppercase tracking-widest text-sm font-medium">
                    Fix + Monitor
                  </CardDescription>
                  <CardTitle className="text-2xl sm:text-4xl font-extralight">
                    $499
                    <span className="text-lg text-white/30 font-normal">
                      /mo
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Everything in Fix',
                      'Competitor tracking',
                      'Ongoing optimization as AI tools change',
                      'Priority support',
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="text-base text-white/80 flex items-start gap-3"
                      >
                        <svg
                          className="w-5 h-5 text-[#22D3EE] mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:alex@vizbiz.ai"
                    className="block w-full text-center bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white py-3.5 text-base font-semibold hover:opacity-90 transition-opacity rounded-xl shadow-lg shadow-[#22D3EE]/20"
                  >
                    Get Started
                  </a>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <p className="text-center text-sm text-white/20 mt-8">
            Both plans include the full audit report. Cancel anytime. No setup
            fee.
          </p>
        </div>
      </section>

      {/* ── 10. Bottom CTA + Footer ── */}
      <section className="relative z-10 py-12 lg:py-20">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h3 className="text-2xl font-light mb-3">
              Prefer to talk first?
            </h3>
            <p className="text-base text-white/40 mb-8">
              Book a free 15-minute audit review call. No pressure, no
              obligation.
            </p>
            <a
              href="mailto:alex@vizbiz.ai"
              className="inline-block border border-[#22D3EE]/40 text-[#22D3EE] px-8 py-3.5 text-base font-medium hover:bg-[#22D3EE]/10 transition-all rounded-xl"
            >
              Book a Free Call
            </a>
          </FadeIn>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Image
                src="/logo.jpg"
                alt="VizBiz.ai"
                width={56}
                height={56}
                className="rounded-lg opacity-70"
              />
              <span className="text-base font-semibold">
                VizBiz<span className="text-[#25D1F2]">.ai</span>
              </span>
            </div>
            <p className="text-sm text-white/20 mb-1">
              Generated by VizBiz.ai — AI Visibility Intelligence
            </p>
            <a
              href="https://vizbiz.ai"
              className="text-sm text-[#22D3EE]/50 hover:text-[#22D3EE] transition-colors"
            >
              vizbiz.ai
            </a>
          </FadeIn>
        </div>
      </footer>
    </div>
  );
}
