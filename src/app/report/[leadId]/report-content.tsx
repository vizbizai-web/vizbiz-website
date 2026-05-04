'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/use-mobile';
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
} from 'recharts';

import type { LeadPageData, ResearchData } from './page';

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

type Theme = 'dark' | 'light';

/* ── Theme Provider (self-contained) ─────────── */
function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('vizbiz-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vizbiz-theme', next);
      return next;
    });
  };

  return { theme, toggle };
}

/* ── Theme Styles ────────────────────────────── */
function getThemeStyles(theme: Theme) {
  if (theme === 'light') {
    return {
      bgPage: '#FFFFFF',
      bgBase: '#F8FAFC',
      bgCard: '#F8FAFC',
      bgFooter: '#F1F5F9',
      textPrimary: '#02091F',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
      borderSubtle: '#E2E8F0',
      borderAccent: 'rgba(37, 209, 242, 0.25)',
      glassBg: '#F8FAFC',
      glassBorder: '#E2E8F0',
      glassHover: 'rgba(37, 209, 242, 0.06)',
      gridStroke: 'rgba(0,0,0,0.06)',
      axisText: '#475569',
      ringBg: '#E2E8F0',
      shadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
      barBg: '#E2E8F0',
      barTrack: '#E2E8F0',
      queryBorderVisible: 'rgba(34, 197, 94, 0.3)',
      queryBorderInvisible: 'rgba(239, 68, 68, 0.3)',
      queryDotVisible: '#22C55E',
      queryDotInvisible: '#EF4444',
      queryBgVisible: 'rgba(34, 197, 94, 0.04)',
      queryBgInvisible: 'rgba(239, 68, 68, 0.04)',
      headerBg: 'rgba(255, 255, 255, 0.9)',
      headerBorder: '#E2E8F0',
      statCardTintCyan: 'rgba(37, 209, 242, 0.04)',
      statCardTintGreen: 'rgba(34, 197, 94, 0.04)',
      statCardTintAmber: 'rgba(245, 158, 11, 0.04)',
      statCardTintRed: 'rgba(239, 68, 68, 0.04)',
      radarFill: 'rgba(37, 209, 242, 0.12)',
      radarStroke: '#25D1F2',
      competitorBarYou: ['#22D3EE', '#06B6D4'],
      ctaOutlineBorder: 'rgba(37, 209, 242, 0.4)',
      ctaOutlineText: '#06B6D4',
      ctaOutlineHover: 'rgba(37, 209, 242, 0.06)',
      pricingBadgeBg: 'linear-gradient(to right, #22D3EE, #06B6D4)',
      pricingBadgeText: '#02091F',
      pricingHighlightBorder: 'rgba(37, 209, 242, 0.4)',
      footerText: 'rgba(2, 9, 31, 0.4)',
      footerLink: 'rgba(6, 182, 212, 0.7)',
      profitRiskText: '#02091F',
    };
  }
  return {
    bgPage: '#02091F',
    bgBase: '#0A0F1E',
    bgCard: '#111827',
    bgFooter: '#020617',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderAccent: 'rgba(37, 209, 242, 0.25)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(37, 209, 242, 0.12)',
    glassHover: 'rgba(37, 209, 242, 0.08)',
    gridStroke: 'rgba(255, 255, 255, 0.04)',
    axisText: '#94A3B8',
    ringBg: 'rgba(255, 255, 255, 0.05)',
    shadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    barBg: 'rgba(255, 255, 255, 0.05)',
    barTrack: 'rgba(255, 255, 255, 0.05)',
    queryBorderVisible: 'rgba(34, 197, 94, 0.2)',
    queryBorderInvisible: 'rgba(239, 68, 68, 0.2)',
    queryDotVisible: '#22C55E',
    queryDotInvisible: '#EF4444',
    queryBgVisible: 'rgba(34, 197, 94, 0.03)',
    queryBgInvisible: 'rgba(239, 68, 68, 0.03)',
    headerBg: 'rgba(2, 9, 31, 0.85)',
    headerBorder: 'rgba(255, 255, 255, 0.06)',
    statCardTintCyan: 'rgba(37, 209, 242, 0.04)',
    statCardTintGreen: 'rgba(34, 197, 94, 0.04)',
    statCardTintAmber: 'rgba(245, 158, 11, 0.04)',
    statCardTintRed: 'rgba(239, 68, 68, 0.04)',
    radarFill: 'rgba(37, 209, 242, 0.15)',
    radarStroke: '#25D1F2',
    competitorBarYou: ['#22D3EE', '#06B6D4'],
    ctaOutlineBorder: 'rgba(34, 211, 238, 0.4)',
    ctaOutlineText: '#22D3EE',
    ctaOutlineHover: 'rgba(34, 211, 238, 0.06)',
    pricingBadgeBg: 'linear-gradient(to right, #22D3EE, #06B6D4)',
    pricingBadgeText: '#02091F',
    pricingHighlightBorder: 'rgba(37, 209, 242, 0.4)',
    footerText: 'rgba(255, 255, 255, 0.2)',
    footerLink: 'rgba(34, 211, 238, 0.5)',
    profitRiskText: '#FFFFFF',
  };
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
  if (score >= 60) return 'text-emerald-500';
  if (score >= 35) return 'text-amber-500';
  return 'text-red-500';
};

const formatCurrency = (val: number, sym: string): string =>
  sym + Math.round(val).toLocaleString();

const getImpactColor = (impact: string): string => {
  switch (impact) {
    case 'High': return '#EF4444';
    case 'Medium': return '#F59E0B';
    case 'Low': return '#22C55E';
    default: return '#94A3B8';
  }
};

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
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString());
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
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

/* ── Theme Toggle Icon ───────────────────────── */
function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      }}
    >
      <motion.div
        animate={{ rotate: isDark ? 0 : 180, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        {/* Moon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </motion.div>
      <motion.div
        animate={{ rotate: isDark ? -180 : 0, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        {/* Sun */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </motion.div>
    </button>
  );
}

/* ── DarkTooltip for Recharts ────────────────── */
function DarkTooltip({ active, payload, label, theme }: any) {
  if (!active || !payload?.length) return null;
  const t = getThemeStyles(theme);
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm shadow-xl"
      style={{
        background: theme === 'dark' ? '#111827' : '#FFFFFF',
        border: `1px solid ${theme === 'dark' ? 'rgba(37,209,242,0.2)' : '#E2E8F0'}`,
        color: t.textPrimary,
      }}
    >
      {label && <p className="font-medium mb-1" style={{ color: t.textSecondary }}>{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
          <span style={{ color: t.textSecondary }}>{entry.name || entry.dataKey}:</span>
          <span className="font-semibold" style={{ color: t.textPrimary }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Glass Card ──────────────────────────────── */
function GlassCard({
  children,
  className = '',
  style,
  theme,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  theme: Theme;
}) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  return (
    <div
      className={cn('rounded-3xl', className)}
      style={{
        background: t.glassBg,
        border: `1px solid ${t.glassBorder}`,
        borderRadius: '1.5rem',
        backdropFilter: isMobile || theme === 'light' ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: isMobile || theme === 'light' ? 'none' : 'blur(12px)',
        boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)' : '0 4px 30px rgba(0, 0, 0, 0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Score Ring ───────────────────────────────── */
function ScoreRing({ score, theme }: { score: number; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  const radius = isMobile ? 80 : 120;
  const stroke = isMobile ? 8 : 10;
  const normalized = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * radius;
  const accent = getScoreAccent(score);

  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const tmr = setTimeout(() => {
      setAnimatedOffset(circumference - (normalized / 100) * circumference);
    }, 300);
    return () => clearTimeout(tmr);
  }, [normalized, circumference]);

  const size = isMobile ? 180 : 280;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${radius * 2 + stroke * 2} ${radius * 2 + stroke * 2}`} className="-rotate-90">
        <defs>
          <linearGradient id={`scoreGrad-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id={`scoreGlow-${score}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke={t.ringBg}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke={`url(#scoreGrad-${score})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animatedOffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          filter={isMobile ? undefined : `url(#scoreGlow-${score})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp
          value={score}
          className={cn('font-extrabold tracking-tight tabular-nums', isMobile ? 'text-5xl' : 'text-7xl sm:text-8xl', getScoreColorClass(score))}
        />
        <span className="text-sm mt-1 font-medium" style={{ color: t.textSecondary }}>/ 100</span>
      </div>
    </div>
  );
}

/* ── Animated Bar (Category Scores) ──────────── */
function AnimatedBar({ score, label, description, theme, delay = 0 }: {
  score: number;
  label: string;
  description: string;
  theme: Theme;
  delay?: number;
}) {
  const t = getThemeStyles(theme);
  const accent = getScoreAccent(score);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const tmr = setTimeout(() => setWidth(score), 300 + delay);
    return () => clearTimeout(tmr);
  }, [score, delay]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: t.textPrimary }}>{label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: accent }}>{score}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: t.barTrack }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: delay / 1000 }}
          style={{
            background: `linear-gradient(to right, ${accent}, ${accent}88)`,
            boxShadow: theme === 'dark' ? `0 0 8px ${accent}40` : 'none',
          }}
        />
      </div>
      <p className="text-xs" style={{ color: t.textMuted }}>{description}</p>
    </div>
  );
}

/* ── Sticky Header ───────────────────────────── */
function StickyHeader({ data, theme, onToggle }: { data: LeadData; theme: Theme; onToggle: () => void }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-14 sm:h-16 lg:h-[72px]"
      style={{
        background: t.headerBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.headerBorder}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/logo.jpg" alt="VizBiz" width={isMobile ? 48 : 64} height={isMobile ? 48 : 64} className="rounded-lg" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ color: t.textPrimary }}>
              VizBiz<span style={{ color: '#25D1F2' }}>.ai</span>
            </span>
            <span className="text-xs" style={{ color: t.textMuted }}>AI Visibility Report</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle theme={theme} onToggle={onToggle} />
          <div className="text-right">
            <div className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none" style={{ color: t.textPrimary }}>
              {data.businessName}
            </div>
            <div className="text-[10px] hidden sm:block" style={{ color: t.textMuted }}>
              {data.location} · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Stats Row ───────────────────────────────── */
function StatsRow({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  const stats = [
    {
      label: 'AVI Score',
      value: data.aviScore,
      subtext: `${getScoreLabel(data.aviScore)} visibility`,
      tint: t.statCardTintCyan,
    },
    {
      label: 'Prompts Appeared',
      value: data.promptsAppeared,
      subtext: `of ${data.totalPrompts} tested`,
      tint: t.statCardTintGreen,
    },
    {
      label: 'Competitors Ahead',
      value: data.competitors.filter(c => !c.isYou && c.score > (data.competitors.find(x => x.isYou)?.score || 0)).length,
      subtext: 'in your market',
      tint: t.statCardTintAmber,
    },
    {
      label: 'Profit at Risk',
      value: data.profitAtRisk.high,
      prefix: data.currencySymbol,
      subtext: 'monthly revenue',
      tint: t.statCardTintRed,
    },
  ];

  return (
    <FadeIn>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5"
            style={{
              background: `${t.glassBg}`,
              border: `1px solid ${t.glassBorder}`,
              boxShadow: isMobile ? 'none' : t.shadow,
            }}
          >
            <p className="text-[10px] sm:text-xs uppercase tracking-widest" style={{ color: t.textMuted }}>{stat.label}</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold mt-1 tabular-nums" style={{ color: t.textPrimary }}>
              <CountUp value={stat.value} prefix={stat.prefix || ''} />
            </p>
            <p className="text-[10px] sm:text-xs mt-1 hidden sm:block" style={{ color: t.textMuted }}>{stat.subtext}</p>
          </motion.div>
        ))}
      </div>
    </FadeIn>
  );
}

/* ── Hero Score Section ──────────────────────── */
function HeroScore({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  const label = getScoreLabel(data.aviScore);
  const accent = getScoreAccent(data.aviScore);

  return (
    <FadeIn>
      <section className="py-12 sm:py-20 lg:py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(ellipse at center, rgba(37, 209, 242, 0.06) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at center, rgba(37, 209, 242, 0.04) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest mb-6 sm:mb-8" style={{ color: t.textMuted }}>
            Your AI Visibility Score
          </p>
          <ScoreRing score={data.aviScore} theme={theme} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              background: `${accent}15`,
              border: `1px solid ${accent}30`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
            <span className="text-sm font-semibold" style={{ color: accent }}>{label}</span>
          </motion.div>
          <p className="text-xs sm:text-sm mt-4 max-w-md mx-auto" style={{ color: t.textSecondary }}>
            {data.aviScore >= 60
              ? `Great visibility. ${data.businessName} is well-positioned in AI-driven searches.`
              : data.aviScore >= 35
                ? `Moderate visibility. ${data.businessName} appears in some AI responses, but there's room to grow.`
                : `Low visibility. ${data.businessName} is rarely mentioned by AI platforms — a significant opportunity gap.`}
          </p>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Category Scores ─────────────────────────── */
function CategoryScores({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);

  return (
    <FadeIn>
      <GlassCard className="max-w-4xl mx-auto p-5 sm:p-6 lg:p-8" theme={theme}>
        <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>Score Breakdown</h3>
        <p className="text-xs sm:text-sm mb-6 sm:mb-8" style={{ color: t.textMuted }}>
          Your AI visibility broken into 5 categories that affect whether AI platforms recommend you. Each score is based on how often {data.businessName} appeared in real buyer-intent queries across ChatGPT, Gemini, and Perplexity.
        </p>
        <div className="space-y-5 sm:space-y-6">
          {data.categories.map((cat, i) => (
            <AnimatedBar
              key={cat.name}
              score={cat.score}
              label={cat.name}
              description={cat.description}
              theme={theme}
              delay={i * 100}
            />
          ))}
        </div>
      </GlassCard>
    </FadeIn>
  );
}

/* ── Visibility Radar ────────────────────────── */
function VisibilityRadar({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const radarData = data.categories.map(c => ({
    category: c.name,
    score: c.score,
    fullMark: 100,
  }));

  const chartH = isMobile ? 300 : 400;
  const outerR = isMobile ? 90 : 130;

  return (
    <FadeIn>
      <GlassCard className="p-5 sm:p-6 lg:p-8" theme={theme}>
        <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>Visibility Radar</h3>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: t.textMuted }}>
          A visual map of your strengths and gaps. Bigger area = more visible. Categories where the shape pulls in are where AI platforms are least likely to recommend you.
        </p>
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <div className="w-full lg:w-1/2 flex items-center justify-center" style={{ minHeight: chartH }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <RadarChart data={radarData} outerRadius={outerR} cx="50%" cy="50%">
                  <PolarGrid stroke={t.gridStroke} gridType="polygon" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: t.axisText, fontSize: 11, fontFamily: 'Poppins, sans-serif' }}
                  />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    fill={t.radarFill}
                    stroke={t.radarStroke}
                    strokeWidth={2}
                    fillOpacity={1}
                  />
                  <Tooltip content={(props) => <DarkTooltip {...props} theme={theme} />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: chartH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: t.textMuted, fontSize: 14 }}>Loading radar...</span>
              </div>
            )}
          </div>
          <div className="w-full lg:w-1/2 space-y-3">
            {data.categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: getScoreAccent(cat.score) }} />
                  <span className="text-sm" style={{ color: t.textSecondary }}>{cat.name}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: getScoreAccent(cat.score) }}>
                  {cat.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  );
}

/* ── Competitor Comparison ───────────────────── */
function CompetitorComparison({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const totalQ = data.totalPrompts || 20;
  const compData = data.competitors.map(c => ({
    name: c.isYou ? `${data.businessName.split(' ')[0]} (You)` : c.name,
    score: c.score,
    pct: Math.round((c.score / totalQ) * 100),
    isYou: c.isYou,
  }));

  const maxScore = Math.max(...compData.map(c => c.score));
  const yourScore = compData.find(c => c.isYou)?.score || 0;
  const yourRank = [...compData].sort((a, b) => b.score - a.score).findIndex(c => c.isYou) + 1;

  const compColors = ['#8B5CF6', '#F97316', '#EC4899'];
  const chartH = isMobile ? 220 : 320;

  return (
    <FadeIn>
      <GlassCard className="p-5 sm:p-6 lg:p-8" theme={theme}>
        <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>How You Compare</h3>
        <p className="text-xs sm:text-sm mb-2" style={{ color: t.textMuted }}>
          How often {data.businessName} appears in AI answers vs competitors in {data.location}
        </p>
        <p className="text-xs mb-4 sm:mb-6" style={{ color: t.textSecondary }}>
          We tested {totalQ} real buyer-intent queries across ChatGPT, Gemini, and Perplexity. Each bar shows how many times the business was recommended.
        </p>

        {/* Summary stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <p className="text-xl sm:text-2xl font-semibold tabular-nums" style={{ color: yourRank === 1 ? '#22C55E' : '#EF4444' }}>#{yourRank}</p>
            <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Your Rank</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <p className="text-xl sm:text-2xl font-semibold tabular-nums" style={{ color: t.textPrimary }}>{yourScore}/{totalQ}</p>
            <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Times Recommended</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <p className="text-xl sm:text-2xl font-semibold tabular-nums" style={{ color: yourScore < maxScore ? '#EF4444' : '#22C55E' }}>
              {maxScore - yourScore > 0 ? `−${maxScore - yourScore}` : '—'}
            </p>
            <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Behind Leader</p>
          </div>
        </div>

        {mounted ? (
          <div style={{ height: chartH }}>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={compData} layout="vertical" margin={{ left: isMobile ? 80 : 140, right: 40, top: 10, bottom: 10 }}>
                <CartesianGrid stroke={t.gridStroke} horizontal={false} />
                <XAxis type="number" domain={[0, totalQ]} tick={{ fill: t.axisText, fontSize: 11 }} label={{ value: `out of ${totalQ} queries`, position: 'insideBottomRight', fill: t.textMuted, fontSize: 10, offset: -5 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: t.axisText, fontSize: 11, fontFamily: 'Poppins, sans-serif' }}
                  width={isMobile ? 100 : 180}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={(props) => <DarkTooltip {...props} theme={theme} />} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={isMobile ? 24 : 32}>
                  {compData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isYou
                        ? '#22D3EE'
                        : compColors[(index - 1) % compColors.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: chartH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: t.textMuted, fontSize: 14 }}>Loading comparison...</span>
          </div>
        )}

        {yourScore < maxScore && (
          <p className="text-xs mt-4 p-3 rounded-xl" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            Your top competitor appeared {maxScore - yourScore} more times than you in AI recommendations. When a buyer asks ChatGPT for a recommendation, they're getting your competitor's name instead of yours.
          </p>
        )}
      </GlassCard>
    </FadeIn>
  );
}

/* ── Profit at Risk ──────────────────────────── */
function ProfitAtRisk({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);

  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto text-center py-10 sm:py-14">
        <p className="text-[10px] sm:text-xs uppercase tracking-widest mb-3" style={{ color: t.textMuted }}>
          Estimated Profit at Risk
        </p>
        <p className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight" style={{ color: t.profitRiskText }}>
          {formatCurrency(data.profitAtRisk.low, data.currencySymbol)} – {formatCurrency(data.profitAtRisk.high, data.currencySymbol)}
        </p>
        <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: t.textSecondary }}>
          Monthly revenue currently going to competitors who rank higher in AI-driven searches
        </p>
      </div>
    </FadeIn>
  );
}

/* ── Visible vs Invisible Queries ───────────── */
function QueryLists({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  const [showAllVisible, setShowAllVisible] = useState(false);
  const [showAllInvisible, setShowAllInvisible] = useState(false);

  const visibleToShow = isMobile && !showAllVisible ? 5 : data.visibleQueries.length;
  const invisibleToShow = isMobile && !showAllInvisible ? 5 : data.invisibleQueries.length;

  const QueryItem = ({ query, visible }: { query: string; visible: boolean }) => (
    <div
      className="flex items-start gap-2.5 py-2.5 border-b"
      style={{
        borderColor: t.borderSubtle,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: visible ? t.queryDotVisible : t.queryDotInvisible }}
      />
      <span className="text-sm" style={{ color: t.textSecondary }}>{query}</span>
    </div>
  );

  return (
    <FadeIn>
      <div className={isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-6 lg:gap-8'}>
        {/* Visible */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>
            Where You Appear
          </h3>
          <p className="text-xs sm:text-sm mb-3" style={{ color: t.textMuted }}>
            {data.visibleQueries.length} queries where AI mentions you
          </p>
          <GlassCard
            className="p-4 sm:p-5"
            style={{ borderLeft: `3px solid ${t.queryDotVisible}` }}
            theme={theme}
          >
            <div className="space-y-0">
              {data.visibleQueries.slice(0, visibleToShow).map((q, i) => (
                <QueryItem key={i} query={q} visible />
              ))}
            </div>
            {isMobile && data.visibleQueries.length > 5 && (
              <button
                onClick={() => setShowAllVisible(!showAllVisible)}
                className="mt-3 text-xs font-medium"
                style={{ color: '#25D1F2' }}
              >
                {showAllVisible ? 'Show less' : `+ ${data.visibleQueries.length - 5} more`}
              </button>
            )}
          </GlassCard>
        </div>

        {/* Invisible */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>
            Where You're Invisible
          </h3>
          <p className="text-xs sm:text-sm mb-3" style={{ color: t.textMuted }}>
            {data.invisibleQueries.length} queries where competitors appear instead
          </p>
          <GlassCard
            className="p-4 sm:p-5"
            style={{ borderLeft: `3px solid ${t.queryDotInvisible}` }}
            theme={theme}
          >
            <div className="space-y-0">
              {data.invisibleQueries.slice(0, invisibleToShow).map((q, i) => (
                <QueryItem key={i} query={q} visible={false} />
              ))}
            </div>
            {isMobile && data.invisibleQueries.length > 5 && (
              <button
                onClick={() => setShowAllInvisible(!showAllInvisible)}
                className="mt-3 text-xs font-medium"
                style={{ color: '#25D1F2' }}
              >
                {showAllInvisible ? 'Show less' : `+ ${data.invisibleQueries.length - 5} more`}
              </button>
            )}
          </GlassCard>
        </div>
      </div>
    </FadeIn>
  );
}

/* ── Recommendations ─────────────────────────── */
function Recommendations({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);

  return (
    <FadeIn>
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>Recommendations</h3>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: t.textMuted }}>
          Priority actions to improve your AI visibility
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {data.recommendations.map((rec, i) => (
            <GlassCard key={rec.id} className="p-4 sm:p-5" theme={theme}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: `${getImpactColor(rec.impact)}15`,
                    color: getImpactColor(rec.impact),
                    border: `1px solid ${getImpactColor(rec.impact)}30`,
                  }}
                >
                  {rec.impact} Impact
                </span>
              </div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: t.textPrimary }}>{rec.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>{rec.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

/* ── Social Media ────────────────────────────── */
function SocialMedia({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  const platforms = [
    { label: 'Instagram', value: data.socialPresence.instagram, icon: 'instagram' },
    { label: 'Facebook', value: data.socialPresence.facebook, icon: 'facebook' },
    { label: 'Google Reviews', value: data.socialPresence.googleReviews, icon: 'google' },
  ];

  const socialCompData = data.competitorSocial.map(c => ({
    name: c.name,
    instagram: c.instagram || 0,
    facebook: c.facebook || 0,
    googleReviews: c.googleReviews,
  }));

  const hasSocialData = data.socialPresence.instagram || data.socialPresence.facebook || data.socialPresence.googleReviews;

  if (!hasSocialData) return null;

  return (
    <FadeIn>
      <GlassCard className="p-5 sm:p-6 lg:p-8" theme={theme}>
        <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>Social Media Presence</h3>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: t.textMuted }}>
          How you compare on social platforms
        </p>

        {/* Client Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 sm:mb-8">
          {platforms.map((p) => (
            <div key={p.label} className="text-center p-3 rounded-2xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <div className="text-xl mb-1 flex items-center justify-center">
                {p.icon === 'instagram' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E1306C' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="5.5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
                ) : p.icon === 'facebook' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                )}
              </div>
              <p className="text-lg sm:text-xl font-semibold tabular-nums" style={{ color: t.textPrimary }}>
                {p.value ? p.value.toLocaleString() : '—'}
              </p>
              <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>{p.label}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        {data.competitorSocial.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                <thead>
                  <tr>
                    <th className="text-left pb-2 text-xs font-medium" style={{ color: t.textMuted }}>Platform</th>
                    <th className="text-right pb-2 text-xs font-medium" style={{ color: '#22D3EE' }}>{data.businessName.split(' ')[0]} (You)</th>
                    {data.competitorSocial.map((c, i) => (
                      <th key={c.name} className="text-right pb-2 text-xs font-medium" style={{ color: ['#8B5CF6', '#F97316', '#EC4899'][i % 3] }}>
                        {c.name.length > 15 ? c.name.slice(0, 15) + '\u2026' : c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-4" style={{ color: t.textSecondary }}>Instagram</td>
                    <td className="text-right py-2 font-semibold tabular-nums" style={{ color: t.textPrimary }}>{(data.socialPresence.instagram || 0).toLocaleString()}</td>
                    {data.competitorSocial.map((c) => {
                      const yours = data.socialPresence.instagram || 0;
                      const theirs = c.instagram || 0;
                      const ratio = yours > 0 ? Math.round(theirs / yours) : 0;
                      return (
                        <td key={c.name} className="text-right py-2 tabular-nums" style={{ color: ratio > 2 ? '#EF4444' : ratio > 1 ? '#F59E0B' : t.textSecondary }}>
                          {theirs.toLocaleString()}{ratio > 1 && <span className="text-[10px] ml-1">({ratio}x)</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4" style={{ color: t.textSecondary }}>Facebook</td>
                    <td className="text-right py-2 font-semibold tabular-nums" style={{ color: t.textPrimary }}>{(data.socialPresence.facebook || 0).toLocaleString()}</td>
                    {data.competitorSocial.map((c) => {
                      const yours = data.socialPresence.facebook || 0;
                      const theirs = c.facebook || 0;
                      const ratio = yours > 0 ? Math.round(theirs / yours) : 0;
                      return (
                        <td key={c.name} className="text-right py-2 tabular-nums" style={{ color: ratio > 2 ? '#EF4444' : ratio > 1 ? '#F59E0B' : t.textSecondary }}>
                          {theirs.toLocaleString()}{ratio > 1 && <span className="text-[10px] ml-1">({ratio}x)</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4" style={{ color: t.textSecondary }}>Google Reviews</td>
                    <td className="text-right py-2 font-semibold tabular-nums" style={{ color: t.textPrimary }}>{data.socialPresence.googleReviews}</td>
                    {data.competitorSocial.map((c) => {
                      const yours = data.socialPresence.googleReviews;
                      const theirs = c.googleReviews;
                      const ratio = yours > 0 ? Math.round(theirs / yours) : 0;
                      return (
                        <td key={c.name} className="text-right py-2 tabular-nums" style={{ color: ratio > 2 ? '#EF4444' : ratio > 1 ? '#F59E0B' : t.textSecondary }}>
                          {theirs}{ratio > 1 && <span className="text-[10px] ml-1">({ratio}x)</span>}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            {data.socialPresence.instagram != null && data.socialPresence.instagram < (data.competitorSocial[0]?.instagram || 0) && (
              <p className="text-xs mt-4 p-3 rounded-xl" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                {data.competitorSocial[0].name} has {Math.round((data.competitorSocial[0].instagram || 0) / Math.max(data.socialPresence.instagram || 1, 1))}x your Instagram followers. AI platforms use social following as a trust signal.
              </p>
            )}
          </div>
        )}
      </GlassCard>
    </FadeIn>
  );
}

/* ── Competitor Urgency Strip ───────────────── */
function SocialProofStrip({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const leader = data.competitors.find(c => !c.isYou && c.score > (data.competitors.find(c2 => c2.isYou)?.score || 0));

  return (
    <FadeIn>
      <div
        className="py-5 px-5 sm:px-8 rounded-2xl text-center sm:text-left"
        style={{
          background: theme === 'dark' ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.03)',
          border: `1px solid ${theme === 'dark' ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.1)'}`,
        }}
      >
        <p className="text-sm sm:text-base font-medium mb-1" style={{ color: t.textPrimary }}>
          Every day you wait, more buyers find your competitors instead of you.
        </p>
        <p className="text-xs sm:text-sm" style={{ color: t.textSecondary }}>
          {leader
            ? `${leader.name} is already being recommended by ChatGPT, Gemini, and Perplexity when buyers ask for suggestions. Your full report includes a step-by-step fix plan to close that gap.`
            : 'Your competitors are already being recommended by ChatGPT, Gemini, and Perplexity. The full report includes a prioritized fix plan to close the gap.'}
        </p>
      </div>
    </FadeIn>
  );
}

/* ── Full Report Teaser ─────────────────────── */
function FullReportTeaser({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);

  const teaserItems = [
    { icon: '🔍', title: '84 Query Breakdown', desc: 'See every prompt we tested, which AI recommended you, and exactly what it said.' },
    { icon: '📊', title: 'Competitor Deep Dive', desc: `Full analysis of how ${data.competitors.filter(c => !c.isYou).length} competitors outperform you and where they're weak.` },
    { icon: '📝', title: 'Step-by-Step Fix Plan', desc: 'Prioritized actions to improve your AI visibility within 30 days.' },
    { icon: '📈', title: 'Monthly Tracking', desc: 'Watch your visibility score climb as improvements take effect.' },
  ];

  return (
    <FadeIn>
      <GlassCard className="p-5 sm:p-6 lg:p-8" theme={theme}>
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#22D3EE' }}>Free Preview</p>
          <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: t.textPrimary }}>This is a summary. Your full report goes deeper.</h3>
          <p className="text-xs sm:text-sm" style={{ color: t.textMuted }}>
            The complete audit includes everything below — plus ongoing monitoring so you never lose visibility again.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teaserItems.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${t.borderSubtle}` }}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: t.textPrimary }}>{item.title}</p>
                <p className="text-xs" style={{ color: t.textSecondary }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </FadeIn>
  );
}

/* ── Blurred Report Preview ─────────────────── */
function BlurredReportPreview({ theme }: { theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  const previewRows = [
    { label: 'Query', width: '60%', visible: true },
    { label: '', width: '45%', visible: false },
    { label: '', width: '70%', visible: true },
    { label: '', width: '55%', visible: false },
    { label: '', width: '50%', visible: true },
  ];

  return (
    <FadeIn>
      <div className="relative rounded-3xl overflow-hidden" style={{ border: `1px solid ${t.glassBorder}` }}>
        {/* Fake report structure */}
        <div
          className="p-5 sm:p-6 space-y-4"
          style={{ background: t.glassBg }}
        >
          {/* Fake header bar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #22D3EE, #06B6D4)' }} />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 rounded-full" style={{ background: t.textPrimary, opacity: 0.15, width: '35%' }} />
              <div className="h-1.5 rounded-full" style={{ background: t.textPrimary, opacity: 0.08, width: '55%' }} />
            </div>
          </div>

          {/* Fake score circle */}
          <div className="flex items-center justify-center gap-6 py-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" style={{ border: `3px solid ${theme === 'dark' ? 'rgba(37,209,242,0.3)' : 'rgba(6,182,212,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#F59E0B' }}>42</div>
            </div>
            <div className="space-y-2 flex-1 max-w-[200px]">
              <div className="h-2 rounded-full" style={{ background: t.textPrimary, opacity: 0.12, width: '80%' }} />
              <div className="h-2 rounded-full" style={{ background: t.textPrimary, opacity: 0.08, width: '60%' }} />
              <div className="h-2 rounded-full" style={{ background: t.textPrimary, opacity: 0.1, width: '90%' }} />
            </div>
          </div>

          {/* Fake query rows */}
          <div className="space-y-2 pt-2">
            {previewRows.map((row, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                <div className={`w-2 h-2 rounded-full ${row.visible ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="h-2 rounded-full flex-1" style={{ background: t.textPrimary, opacity: 0.1, width: row.width }} />
              </div>
            ))}
          </div>

          {/* Fake bar chart */}
          <div className="space-y-2 pt-2">
            {[0.7, 0.45, 0.55, 0.3].map((pct, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 rounded-full" style={{ background: t.textPrimary, opacity: 0.08, width: '20%' }} />
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: i === 0 ? 'linear-gradient(to right, #22D3EE, #06B6D4)' : ['#8B5CF6', '#F97316', '#EC4899'][i - 1] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blur overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, rgba(2,9,31,0.3) 0%, rgba(2,9,31,0.85) 40%, rgba(2,9,31,0.95) 100%)'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.95) 100%)',
            backdropFilter: isMobile ? 'none' : 'blur(3px)',
          }}
        >
          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold" style={{ color: t.textPrimary }}>Full Report Preview</p>
            <p className="text-xs mt-1" style={{ color: t.textMuted }}>The complete audit includes 84 queries, competitor analysis, and a fix plan</p>
          </div>
          <a
            href="https://buy.stripe.com/5kQbJ2beTcQCexKdrq24000"
            className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all"
            style={{
              background: 'linear-gradient(to right, #22D3EE, #06B6D4)',
              color: '#02091F',
              boxShadow: theme === 'dark' ? '0 0 20px rgba(37,209,242,0.2)' : '0 4px 12px rgba(6,182,212,0.15)',
            }}
          >
            Get the Full Report
          </a>
        </div>
      </div>
    </FadeIn>
  );
}

/* ── Pricing Cards ───────────────────────────── */
function PricingCards({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  const plans = [
    {
      name: 'Fix',
      price: 299,
      description: 'Full audit + one-time fix',
      features: ['Full AI visibility audit (84 queries)', 'Content optimization for AI platforms', 'Local listing cleanup & schema markup', 'Competitor gap analysis', '30-day email support'],
      highlighted: false,
    },
    {
      name: 'Fix + Monitor',
      price: 499,
      description: 'Full fix + we keep you visible every month',
      features: ['Everything in the Fix plan', 'Monthly re-audit across 84 queries', 'Score tracking dashboard — watch your AVI climb', 'Competitor movement alerts', 'Ongoing content & listing optimization', 'Dedicated support channel'],
      highlighted: true,
    },
  ];

  return (
    <FadeIn>
      <div className="max-w-4xl mx-auto py-8 sm:py-12">
        <h3 className="text-lg sm:text-xl font-semibold text-center mb-1" style={{ color: t.textPrimary }}>Ready to Fix This?</h3>
        <p className="text-xs sm:text-sm text-center mb-6 sm:mb-8" style={{ color: t.textMuted }}>
          Choose the plan that fits your business
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-3xl p-6 sm:p-8"
              style={{
                background: t.glassBg,
                border: plan.highlighted
                  ? `2px solid ${t.pricingHighlightBorder}`
                  : `1px solid ${t.glassBorder}`,
                boxShadow: plan.highlighted && theme === 'dark'
                  ? '0 0 40px rgba(37, 209, 242, 0.1)'
                  : t.shadow,
              }}
            >
              {plan.highlighted && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: t.pricingBadgeBg,
                    color: t.pricingBadgeText,
                  }}
                >
                  Most Popular
                </div>
              )}
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: t.textMuted }}>{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl sm:text-5xl font-light tabular-nums" style={{ color: t.textPrimary }}>
                  ${plan.price}
                </span>
                <span className="text-sm" style={{ color: t.textMuted }}>{plan.name === 'Fix' ? 'one-time' : '/mo'}</span>
              </div>
              <p className="text-xs mb-5" style={{ color: t.textMuted }}>{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: t.textSecondary }}>
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#22D3EE" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.name === 'Fix' ? 'https://buy.stripe.com/5kQbJ2beTcQCexKdrq24000' : 'https://buy.stripe.com/eVq8wQ4QvdUG4Xaevu24001'}
                className="block w-full py-3.5 text-base font-semibold rounded-xl text-center transition-all"
                style={plan.highlighted
                  ? {
                      background: 'linear-gradient(to right, #22D3EE, #06B6D4)',
                      color: '#02091F',
                      boxShadow: theme === 'dark' ? '0 0 30px rgba(37, 209, 242, 0.25)' : '0 4px 12px rgba(6, 182, 212, 0.2)',
                    }
                  : {
                      border: `1px solid ${t.ctaOutlineBorder}`,
                      color: t.ctaOutlineText,
                      background: 'transparent',
                    }
                }
                onMouseEnter={(e) => {
                  if (!plan.highlighted) {
                    (e.target as HTMLElement).style.background = t.ctaOutlineHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.highlighted) {
                    (e.target as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {plan.name === 'Fix' ? 'Get the Full Audit — $299' : 'Fix + Monitor — $499/mo'}
              </a>
            </div>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-center mt-6" style={{ color: t.textMuted }}>
          Both plans include the full audit report. Cancel anytime. No setup fee.
        </p>
      </div>
    </FadeIn>
  );
}

/* ── Bottom CTA ──────────────────────────────── */
function BottomCTA({ theme }: { theme: Theme }) {
  const t = getThemeStyles(theme);

  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto py-8 sm:py-10 text-center">
        <h3 className="text-xl sm:text-2xl font-light mb-3" style={{ color: t.textPrimary }}>Prefer to talk first?</h3>
        <p className="text-sm sm:text-base mb-6 sm:mb-8" style={{ color: t.textSecondary }}>
          Book a free 15-minute audit review call. No pressure, no obligation.
        </p>
        <a
            href="mailto:alex@vizbiz.ai?subject=Free%20Audit%20Review%20Call"
          style={{
            borderColor: t.ctaOutlineBorder,
            color: t.ctaOutlineText,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = t.ctaOutlineHover;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'transparent';
          }}
        >
          Book a Free Call
        </a>
      </div>
    </FadeIn>
  );
}

/* ── Footer ──────────────────────────────────── */
function ReportFooter({ theme }: { theme: Theme }) {
  const t = getThemeStyles(theme);

  return (
    <footer
      className="border-t py-10 sm:py-12"
      style={{
        borderColor: t.borderSubtle,
        background: t.bgFooter,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Image src="/logo.jpg" alt="VizBiz.ai" width={40} height={40} className="rounded-lg opacity-70" />
            <span className="text-base font-semibold" style={{ color: t.textPrimary }}>
              VizBiz<span style={{ color: '#25D1F2' }}>.ai</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm mb-1" style={{ color: t.footerText }}>
            Generated by VizBiz.ai — AI Visibility Intelligence
          </p>
          <a href="https://vizbiz.ai" className="text-xs sm:text-sm transition-colors" style={{ color: t.footerLink }}>
            vizbiz.ai
          </a>
        </FadeIn>
      </div>
    </footer>
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
      { id: 3, title: 'Expand service content', description: 'Create detailed content about Zomato and Swiggy optimization services to capture more service-specific queries.', impact: 'Medium' },
    ],
    socialPresence: {
      instagram: 320,
      facebook: 180,
      googleReviews: 5,
      overallScore: 3.8,
    },
    competitorSocial: [
      { name: 'Restrosol', instagram: 1200, facebook: 900, googleReviews: 18 },
    ],
  },
  'VZB-MOOLDT0J': {
    businessName: 'Old Touch Spices',
    contactName: 'Madhavi',
    location: 'Ahmedabad, India',
    website: 'oldtouchspices.com',
    aviScore: 72,
    totalPrompts: 22,
    promptsAppeared: 16,
    currencySymbol: '₹',
    currencyCode: 'INR',
    profitAtRisk: { low: 8000, high: 25000 },
    categories: [
      { name: 'Product Discovery', score: 78, description: 'How often your spice products appear in searches' },
      { name: 'Brand Recognition', score: 70, description: 'Whether AI tools recognize Old Touch Spices' },
      { name: 'Trust & Reviews', score: 68, description: 'What AI platforms say about your product quality' },
      { name: 'Competitive Position', score: 75, description: 'How you compare to other spice brands' },
      { name: 'Content & Authority', score: 65, description: 'Whether AI tools see you as an authority in spices' },
    ],
    visibleQueries: [
      'buy spices online India',
      'authentic Indian spices',
      'organic spices Ahmedabad',
      'best spice brand India',
      'premium quality spices',
    ],
    invisibleQueries: [
      'wholesale spices supplier',
      'export quality spices India',
      'spice gift boxes',
      'custom spice blends',
      'ayurvedic spices',
    ],
    competitors: [
      { name: 'Old Touch Spices (You)', score: 16, isYou: true },
      { name: 'Masala Monk', score: 14 },
      { name: 'The Spice Company', score: 12 },
      { name: 'Spice Tribe', score: 10 },
    ],
    recommendations: [
      { id: 1, title: 'Expand wholesale visibility', description: 'Create content targeting wholesale and export queries to capture B2B market opportunities.', impact: 'Medium' },
      { id: 2, title: 'Leverage product authority', description: 'Highlight your expertise in authentic Indian spices and traditional processing methods.', impact: 'Medium' },
      { id: 3, title: 'Build review momentum', description: 'Encourage more customer reviews to improve trust scores and competitive positioning.', impact: 'Low' },
    ],
    socialPresence: {
      instagram: 4500,
      facebook: 2800,
      googleReviews: 32,
      overallScore: 4.6,
    },
    competitorSocial: [
      { name: 'Masala Monk', instagram: 8900, facebook: 5600, googleReviews: 45 },
      { name: 'The Spice Company', instagram: 6200, facebook: 4100, googleReviews: 38 },
      { name: 'Spice Tribe', instagram: 3400, facebook: 2100, googleReviews: 22 },
    ],
  },
};

/* ── Main Component ────────────────────────────── */
export default function ReportContent({ leadId, leadData, researchData }: { leadId: string; leadData: LeadPageData | null; researchData: ResearchData | null }) {
  const { theme, toggle } = useTheme();
  const t = getThemeStyles(theme);

  // Resolve data: use mock LEADS if available, otherwise build from research/lead data
  let data = LEADS[leadId];

  if (!data && researchData) {
    // Build from detailed research results
    const aviScore = researchData.statusBand === 'Strong' ? 72 : researchData.statusBand === 'Moderate' ? 42 : 18;
    const competitorName = researchData.competitorMention || 'Top Competitor';
    const hasRealCompetitor = competitorName &&
      !['local competitors', 'nearby businesses', 'similar companies', 'Companies in'].some(g => competitorName.startsWith(g));

    const visibleQueries = researchData.promptResults
      .filter(r => r.businessAppeared)
      .map(r => r.prompt);
    const invisibleQueries = researchData.promptResults
      .filter(r => !r.businessAppeared)
      .map(r => r.prompt);

    const compScore = hasRealCompetitor
      ? researchData.promptResults.filter(r => r.competitorAppeared).length
      : Math.max(researchData.appearedCount + 3, Math.round(researchData.totalPrompts * 0.5));

    const competitorDisplay = hasRealCompetitor
      ? competitorName
      : `Top businesses in ${researchData.city}`;

    data = {
      businessName: researchData.businessName,
      contactName: researchData.contactName,
      location: researchData.city,
      website: researchData.website,
      aviScore,
      totalPrompts: researchData.totalPrompts,
      promptsAppeared: researchData.appearedCount,
      currencySymbol: '$',
      currencyCode: 'USD',
      profitAtRisk: { low: 2300, high: 9900 },
      categories: [
        { name: 'Brand Discovery', score: Math.min(aviScore + 15, 100), description: 'How often you appear when people search for your services' },
        { name: 'Trust & Reviews', score: Math.min(aviScore + 5, 100), description: 'What AI platforms say about your reputation' },
        { name: 'Service Visibility', score: Math.max(aviScore - 10, 5), description: 'Whether you appear for service-related queries' },
        { name: 'Competitive Position', score: Math.max(aviScore - 5, 5), description: 'How you stack up against competitors' },
        { name: 'Content & Authority', score: Math.max(aviScore - 15, 5), description: 'Whether AI tools see you as an authority' },
      ],
      visibleQueries,
      invisibleQueries,
      competitors: [
        { name: `${researchData.businessName} (You)`, score: researchData.appearedCount, isYou: true },
        { name: competitorDisplay, score: compScore },
      ],
      recommendations: [
        { id: 1, title: 'Strengthen brand content', description: 'Create detailed guides and case studies about your services to improve visibility.', impact: 'High' as const },
        { id: 2, title: 'Build trust signals', description: 'Encourage more client testimonials and case studies to improve trust and review scores.', impact: 'Medium' as const },
        { id: 3, title: 'Improve competitive positioning', description: 'Highlight what makes your business unique compared to competitors.', impact: 'Medium' as const },
      ],
      socialPresence: {
        instagram: null,
        facebook: null,
        googleReviews: 0,
        overallScore: 0,
      },
      competitorSocial: [],
    };
  }

  if (!data && leadData) {
    // Build from Sheets lead data (no research yet)
    const snapshot = leadData.snapshotAppeared || '';
    const appearedMatch = snapshot.match(/(\d+)\s+of\s+(\d+)/);
    const promptsAppeared = appearedMatch ? parseInt(appearedMatch[1]) : 0;
    const totalPrompts = appearedMatch ? parseInt(appearedMatch[2]) : 20;
    const band = leadData.visibilityBand || 'Pending';
    const aviScore = band === 'Strong' ? 72 : band === 'Moderate' ? 42 : 18;

    const competitorName = leadData.competitor || 'Top Competitor';

    data = {
      businessName: leadData.businessName,
      contactName: leadData.contactName,
      location: leadData.location,
      website: leadData.website,
      aviScore,
      totalPrompts,
      promptsAppeared,
      currencySymbol: '$',
      currencyCode: 'USD',
      profitAtRisk: { low: 2300, high: 9900 },
      categories: [
        { name: 'Brand Discovery', score: Math.min(aviScore + 15, 100), description: 'How often you appear when people search for your services' },
        { name: 'Trust & Reviews', score: Math.min(aviScore + 5, 100), description: 'What AI platforms say about your reputation' },
        { name: 'Service Visibility', score: Math.max(aviScore - 10, 5), description: 'Whether you appear for service-related queries' },
        { name: 'Competitive Position', score: Math.max(aviScore - 5, 5), description: 'How you stack up against competitors' },
        { name: 'Content & Authority', score: Math.max(aviScore - 15, 5), description: 'Whether AI tools see you as an authority' },
      ],
      visibleQueries: [],
      invisibleQueries: [],
      competitors: [
        { name: `${leadData.businessName.split(' ')[0]} (You)`, score: promptsAppeared, isYou: true },
        { name: competitorName, score: Math.min(promptsAppeared + 5, totalPrompts) },
      ],
      recommendations: [
        { id: 1, title: 'Strengthen brand content', description: 'Create detailed guides and case studies about your services to improve visibility.', impact: 'High' as const },
        { id: 2, title: 'Build trust signals', description: 'Encourage more client testimonials and case studies to improve trust and review scores.', impact: 'Medium' as const },
        { id: 3, title: 'Improve competitive positioning', description: 'Highlight what makes your business unique compared to competitors.', impact: 'Medium' as const },
      ],
      socialPresence: {
        instagram: null,
        facebook: null,
        googleReviews: 0,
        overallScore: 0,
      },
      competitorSocial: [],
    };
  }

  // Fallback to first mock lead
  if (!data) {
    data = LEADS['VZB-MOJSCVQM'];
  }

  return (
    <div className="min-h-screen" style={{ background: t.bgPage, color: t.textPrimary, fontFamily: 'Poppins, Inter, sans-serif' }}>
      <StickyHeader data={data} theme={theme} onToggle={toggle} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-8 space-y-8 sm:space-y-10 lg:space-y-12">
        <StatsRow data={data} theme={theme} />
        <HeroScore data={data} theme={theme} />
        <CategoryScores data={data} theme={theme} />
        <VisibilityRadar data={data} theme={theme} />
        <CompetitorComparison data={data} theme={theme} />
        <ProfitAtRisk data={data} theme={theme} />
        <QueryLists data={data} theme={theme} />
        <Recommendations data={data} theme={theme} />
        <SocialMedia data={data} theme={theme} />
        <BlurredReportPreview theme={theme} />
        <FullReportTeaser data={data} theme={theme} />
        <SocialProofStrip data={data} theme={theme} />
        <PricingCards data={data} theme={theme} />
        <BottomCTA theme={theme} />
      </main>

      <ReportFooter theme={theme} />
    </div>
  );
}
