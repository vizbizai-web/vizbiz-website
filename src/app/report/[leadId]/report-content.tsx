'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/use-mobile';
import { isJunkCompetitor } from '@/lib/junk-filter';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import type { LeadPageData, ResearchData } from './page';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

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
  isYours?: boolean;
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
  googleReviews: number | null;
  overallScore: number;
}

interface CompetitorSocial {
  name: string;
  googleReviews: number | null;
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
  socialNarrative?: string;
  socialVsVisibility?: { hasStrongVisibilityLowSocial: boolean; hasWeakVisibilityHighSocial: boolean; socialGapMultiplier: number | null };
  // Edward Sturm AI Discovery
  aiDiscovery?: {
    qfoQueries: string[];
    qfoResults: { query: string; appeared: boolean; sourcesCited: string[] }[];
    competitorCitations: { domain: string; count: number; sampleUrls: string[] }[];
    bingWmtVerified: boolean;
    contentReadiness: {
      qfoCoverage: number;
      groundingQueryReadiness: number;
      citationCompetitiveness: number;
      contentDepth: number;
      overall: number;
    };
    recommendations: { title: string; description: string; impact: 'High' | 'Medium' | 'Low' }[];
  };
  // Competitor mode tracking
  competitorMode?: "client_provided" | "client_only";
  // Google Places enrichment
  googlePlaceEnrichment?: {
    placeId: string | null;
    displayName?: string | null;
    rating: number | null;
    userReviewCount: number | null;
    websiteMatch: boolean | null;
    validationStatus?: "validated" | "needs_review" | "not_found" | "unavailable";
    confidence?: "high" | "medium" | "low" | "none";
    googleProfileFound?: boolean;
    warnings?: string[];
  } | null;
  localEntityTrustScore?: number | null;
  competitorValidations?: { name: string; validationStatus: string; rating: number | null; userReviewCount: number | null; distanceFromClientKm: number | null }[];
}

type Theme = 'dark' | 'light';

/* ── Theme Provider ──────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

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
      bgPage: '#FAF7F2',
      bgBase: '#FAF7F2',
      bgCard: '#FFFFFF',
      bgFooter: '#F2EDE4',
      bgSection: '#FFFFFF',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
      borderSubtle: '#E2E8F0',
      borderAccent: 'rgba(6, 182, 212, 0.3)',
      glassBg: '#FFFFFF',
      glassBorder: '#E2E8F0',
      gridStroke: 'rgba(15, 23, 42, 0.06)',
      axisText: '#475569',
      ringBg: '#E2E8F0',
      shadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
      barBg: '#E2E8F0',
      barTrack: '#E2E8F0',
      headerBg: 'rgba(250, 247, 242, 0.92)',
      headerBorder: '#E2E8F0',
      radarFill: 'rgba(6, 182, 212, 0.15)',
      radarStroke: '#06B6D4',
      ctaOutlineBorder: 'rgba(6, 182, 212, 0.4)',
      ctaOutlineText: '#06B6D4',
      ctaOutlineHover: 'rgba(6, 182, 212, 0.06)',
      pricingBadgeBg: 'linear-gradient(to right, #22D3EE, #06B6D4)',
      pricingBadgeText: '#020617',
      pricingHighlightBorder: 'rgba(6, 182, 212, 0.4)',
      footerText: 'rgba(15, 23, 42, 0.4)',
      footerLink: '#06B6D4',
      profitRiskText: '#0F172A',
      scoreBarBg: '#E2E8F0',
    };
  }
  return {
    bgPage: '#020617',
    bgBase: '#0F172A',
    bgCard: '#0F172A',
    bgFooter: '#020617',
    bgSection: '#0F172A',
    textPrimary: '#F0F4FF',
    textSecondary: '#B0BAD4',
    textMuted: '#5D6680',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderAccent: 'rgba(34, 211, 238, 0.35)',
    glassBg: '#0F172A',
    glassBorder: 'rgba(34, 211, 238, 0.12)',
    gridStroke: 'rgba(255, 255, 255, 0.1)',
    axisText: '#B0BAD4',
    ringBg: 'rgba(255, 255, 255, 0.07)',
    shadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    barBg: 'rgba(255, 255, 255, 0.07)',
    barTrack: 'rgba(255, 255, 255, 0.06)',
    headerBg: 'rgba(8, 12, 26, 0.88)',
    headerBorder: 'rgba(255, 255, 255, 0.08)',
    radarFill: 'rgba(34, 211, 238, 0.2)',
    radarStroke: '#22D3EE',
    ctaOutlineBorder: 'rgba(34, 211, 238, 0.45)',
    ctaOutlineText: '#22D3EE',
    ctaOutlineHover: 'rgba(34, 211, 238, 0.06)',
    pricingBadgeBg: 'linear-gradient(to right, #22D3EE, #06B6D4)',
    pricingBadgeText: '#020617',
    pricingHighlightBorder: 'rgba(34, 211, 238, 0.4)',
    footerText: 'rgba(255, 255, 255, 0.2)',
    footerLink: 'rgba(34, 211, 238, 0.5)',
    profitRiskText: '#FFFFFF',
    scoreBarBg: 'rgba(255, 255, 255, 0.06)',
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

const getImpactBg = (impact: string): string => {
  switch (impact) {
    case 'High': return 'rgba(239,68,68,0.1)';
    case 'Medium': return 'rgba(245,158,11,0.1)';
    case 'Low': return 'rgba(34,197,94,0.1)';
    default: return 'rgba(148,163,184,0.1)';
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Section Component (white card on linen) ─── */
function Section({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('rounded-xl', className)}
      style={{
        background: 'var(--section-bg, #FFFFFF)',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Theme Toggle ───────────────────────────── */
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </motion.div>
      <motion.div
        animate={{ rotate: isDark ? -180 : 0, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
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

/* ── Recharts Tooltip ───────────────────────── */
function DarkTooltip({ active, payload, label, theme }: any) {
  if (!active || !payload?.length) return null;
  const t = getThemeStyles(theme);
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm shadow-xl"
      style={{
        background: theme === 'dark' ? '#111827' : '#FFFFFF',
        border: `1px solid ${theme === 'dark' ? 'rgba(34,211,238,0.2)' : '#E2E8F0'}`,
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

/* ── Sticky Header ───────────────────────────── */
function StickyHeader({ data, theme, onToggle }: { data: LeadData; theme: Theme; onToggle: () => void }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-14 sm:h-16"
      style={{
        background: t.headerBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.headerBorder}`,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/logo.jpg" alt="VizBiz" width={isMobile ? 48 : 64} height={isMobile ? 48 : 64} className="rounded-lg" />
          <span className="hidden sm:inline text-xs" style={{ color: t.textMuted }}>AI Visibility Report</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggle} />
          <div className="text-right">
            <div className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none" style={{ color: t.textPrimary }}>
              {data.businessName}
            </div>
            <div className="text-[10px] hidden sm:block" style={{ color: t.textMuted }}>
              {data.location}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Section Title (editorial serif + cyan underline) ─── */
function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div>
      <h2
        style={{ fontFamily: "'Lora', serif", ...style }}
        className="text-2xl sm:text-3xl tracking-tight"
      >
        {children}
      </h2>
      <div style={{ width: 32, height: 2, background: '#22D3EE', marginTop: 8 }} />
    </div>
  );
}

/* ── Report Hero (premium fintech editorial) ── */
function ReportHero({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const accent = getScoreAccent(data.aviScore);
  const label = getScoreLabel(data.aviScore);
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const totalPrompts = data.totalPrompts || 20;
  const promptsAppeared = data.promptsAppeared ?? 0;
  const missedRate = totalPrompts > 0 ? (totalPrompts - promptsAppeared) / totalPrompts : 0;
  const revLow = Math.round((data.profitAtRisk?.low || 1500) * missedRate);
  const revHigh = Math.round((data.profitAtRisk?.high || 6000) * missedRate);
  const missedPct = Math.round(missedRate * 100);

  const topCompetitor = data.competitors.find(c => !c.isYou && !c.isYours && c.score > 0);
  const compData = data.competitors.filter(c => !c.isYou && !c.isYours && !isJunkCompetitor(c.name));
  const yourRank = [...data.competitors].sort((a, b) => b.score - a.score).findIndex(c => c.isYou) + 1;

  const isClientOnly = data.competitorMode === "client_only";

  const summaryText = data.aviScore >= 60
    ? `${data.businessName} appears in ${promptsAppeared} of ${totalPrompts} AI queries — solid, but ${missedPct}% of buyer-intent searches still return ${isClientOnly ? 'other businesses' : 'competitors'} first. Closing those gaps could unlock ${formatCurrency(revLow, data.currencySymbol)}–${formatCurrency(revHigh, data.currencySymbol)}/mo in additional revenue.`
    : data.aviScore >= 35
      ? `${data.businessName} appears in ${promptsAppeared} of ${totalPrompts} queries — ${missedPct}% of AI recommendations go to ${isClientOnly ? 'other businesses' : 'competitors'}${!isClientOnly && topCompetitor ? `, led by ${topCompetitor.name}` : ''}. That's ${formatCurrency(revLow, data.currencySymbol)}–${formatCurrency(revHigh, data.currencySymbol)}/mo in revenue going elsewhere.`
      : `${data.businessName} appears in only ${promptsAppeared} of ${totalPrompts} AI queries. When buyers in ${data.location} search for recommendations, they find ${isClientOnly ? 'other businesses' : 'your competitors'} instead — costing you an estimated ${formatCurrency(revLow, data.currencySymbol)}–${formatCurrency(revHigh, data.currencySymbol)}/mo.`;

  return (
    <FadeIn>
      <section className="py-12 sm:py-16">
        {/* Muted label */}
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.textMuted, marginBottom: 8 }}>
          AI Visibility Report
        </p>

        {/* Business name - Lora serif */}
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: '1.875rem', lineHeight: 1.2, color: t.textPrimary, marginBottom: 4 }} className="sm:text-4xl">
          {data.businessName}
        </h1>

        {/* Location + date */}
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: t.textMuted, marginBottom: 24 }}>
          {data.location} · {dateStr}
        </p>

        {/* Thin cyan divider */}
        <div style={{ width: '100%', height: 1, background: '#22D3EE', marginBottom: 24, opacity: 0.5 }} />

        {/* Executive summary */}
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, lineHeight: 1.7, color: t.textSecondary, marginBottom: 40, maxWidth: 600 }}>
          {summaryText}
        </p>

        {/* Score - massive serif number */}
        <div style={{ marginBottom: 8 }}>
          <span
            style={{ fontFamily: "'Lora', serif", fontSize: '80px', fontWeight: 300, lineHeight: 1, color: t.textPrimary, letterSpacing: '-0.02em' }}
            className="sm:text-[96px]"
          >
            {data.aviScore}
          </span>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, color: t.textMuted, marginLeft: 2 }}>/100</span>
        </div>

        {/* Thin progress bar (4px) */}
        <div style={{ maxWidth: 320, marginBottom: 12 }}>
          <div style={{ height: 4, background: t.scoreBarBg, width: '100%' }}>
            <div
              style={{ height: '100%', width: `${data.aviScore}%`, background: '#22D3EE', transition: 'width 1s ease' }}
            />
          </div>
        </div>

        {/* Score label - outlined pill */}
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: accent,
            background: theme === 'dark' ? 'transparent' : '#FFFFFF',
            border: `1px solid ${accent}40`,
            borderRadius: 9999,
            padding: '4px 14px',
            display: 'inline-block',
            marginBottom: 40,
          }}
        >
          {label}
        </span>

        {/* 3 KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{
            background: t.bgCard,
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '16px 12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
          }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 400, color: t.textPrimary, margin: 0, lineHeight: 1.2 }} className="sm:text-2xl">
              {promptsAppeared}/{totalPrompts}
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.textMuted, margin: '4px 0 0' }}>Queries</p>
          </div>
          <div style={{
            background: t.bgCard,
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '16px 12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
          }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 400, color: t.textPrimary, margin: 0, lineHeight: 1.2 }} className="sm:text-2xl">
              #{yourRank || '—'}
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.textMuted, margin: '4px 0 0' }}>Your Rank</p>
          </div>
          <div style={{
            background: theme === 'dark' ? 'rgba(239,68,68,0.04)' : '#FFFFFF',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 12,
            padding: '16px 12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
          }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 400, color: '#EF4444', margin: 0, lineHeight: 1.2 }} className="sm:text-2xl">
              {formatCurrency(revLow, data.currencySymbol)}{revHigh > revLow ? `–${formatCurrency(revHigh, '')}` : ''}
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EF4444', margin: '4px 0 0' }}>Monthly Risk</p>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Category Scores (thin flat bars) ───────── */
function CategoryScores({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);

  return (
    <FadeIn>
      <section className="py-12">
        <div style={{ background: t.bgCard, border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)', padding: '24px' }} className="sm:p-8">
          <SectionTitle style={{ color: t.textPrimary }}>
            Score Breakdown
          </SectionTitle>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: t.textMuted, marginTop: 8, marginBottom: 32, lineHeight: 1.6 }}>
            Each score (0–100) reflects how often {data.businessName} appeared in real buyer-intent queries. Above 60 = strong. 35–60 = moderate. Below 35 = weak.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {data.categories.map((cat) => {
              const accent = getScoreAccent(cat.score);
              return (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: t.textPrimary }}>{cat.name}</span>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: accent, fontVariantNumeric: 'tabular-nums' }}>{cat.score}/100</span>
                  </div>
                  {/* Thin flat bar - 4px height, no rounding */}
                  <div style={{ height: 4, background: t.barTrack, width: '100%' }}>
                    <div
                      style={{ height: '100%', width: `${cat.score}%`, background: accent, transition: 'width 0.8s ease' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
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

  const chartH = isMobile ? 280 : 360;
  const outerR = isMobile ? 70 : 100;

  const shortNames: Record<string, string> = {
    'Brand Discovery': 'Brand',
    'Trust & Reviews': 'Trust',
    'Service Visibility': 'Service',
    'Competitive Position': 'Competition',
    'Content & Authority': 'Authority',
  };

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            Visibility Radar
          </SectionTitle>
          <p className="text-xs sm:text-sm mt-2 mb-6" style={{ color: t.textMuted }}>
            A visual map of your strengths and gaps. Bigger area = more visible.
          </p>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2 flex items-center justify-center" style={{ minHeight: chartH }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height={chartH}>
                  <RadarChart data={radarData} outerRadius={outerR} cx="50%" cy="50%">
                    <PolarGrid stroke={t.gridStroke} gridType="polygon" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: t.axisText, fontSize: 11, fontFamily: 'Poppins, sans-serif' }}
                      tickFormatter={(value: string) => shortNames[value] || value}
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
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Competitor Comparison (clean bars) ──────── */
function CompetitorComparison({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  const totalQ = data.totalPrompts || 20;
  const compDataRaw = data.competitors.map(c => ({
    name: c.isYou ? `${data.businessName.split(' ')[0]} (You)` : c.name,
    score: c.score,
    pct: totalQ > 0 ? Math.round((c.score / totalQ) * 100) : 0,
    isYou: c.isYou,
    isYours: c.isYours,
  }));
  const compData = compDataRaw.filter(c => c.isYou || c.isYours || !isJunkCompetitor(c.name));

  const maxScore = Math.max(...compData.map(c => c.score), 1);
  const yourScore = compData.find(c => c.isYou)?.score || 0;
  const yourRank = [...compData].sort((a, b) => b.score - a.score).findIndex(c => c.isYou) + 1;

  const compColors = ['#8B5CF6', '#F97316', '#EC4899'];

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            How You Compare
          </SectionTitle>
          <p className="text-xs sm:text-sm mt-2 mb-6" style={{ color: t.textMuted }}>
            We tested {totalQ} buyer-intent queries using AI-search tools to see which businesses get recommended.
          </p>

          {/* Rank summary */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="text-center p-3 rounded-xl" style={{ background: t.barTrack }}>
              <p className="text-xl sm:text-2xl font-light tabular-nums" style={{ color: yourRank === 1 ? '#22C55E' : '#EF4444' }}>#{yourRank}</p>
              <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Your Rank</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: t.barTrack }}>
              <p className="text-xl sm:text-2xl font-light tabular-nums" style={{ color: t.textPrimary }}>{yourScore}/{totalQ}</p>
              <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Times Recommended</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: t.barTrack }}>
              <p className="text-xl sm:text-2xl font-light tabular-nums" style={{ color: maxScore > yourScore ? '#EF4444' : '#22C55E' }}>
                {maxScore > yourScore ? `−${maxScore - yourScore}` : '—'}
              </p>
              <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Behind Leader</p>
            </div>
          </div>

          {/* Comparison bars */}
          <div className="space-y-4">
            {/* You */}
            {compData.filter(c => c.isYou).map((entry) => (
              <div key={entry.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: '#22D3EE' }}>{entry.name}</span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: '#22D3EE', fontVariantNumeric: 'tabular-nums' }}>{entry.score}/{totalQ}</span>
                </div>
                <div style={{ height: 4, background: t.barTrack, width: '100%' }}>
                  <div style={{ height: '100%', width: `${entry.pct}%`, background: 'linear-gradient(to right, #22D3EE, #06B6D4)', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}

            {/* User-entered competitors */}
            {compData.some(c => c.isYours) && (
              <div className="pt-2">
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.textMuted, marginBottom: 12 }}>Your competitors</p>
                {compData.filter(c => c.isYours).map((entry, i) => (
                  <div key={entry.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: t.textPrimary }}>{entry.score > 0 ? entry.name : `${entry.name} (not visible)`}</span>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#A78BFA', fontVariantNumeric: 'tabular-nums' }}>{entry.score}/{totalQ}</span>
                    </div>
                    <div style={{ height: 4, background: t.barTrack, width: '100%' }}>
                      <div style={{ height: '100%', width: `${entry.pct}%`, background: '#A78BFA', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Discovered competitors */}
            {compData.filter(c => !c.isYou && !c.isYours).length > 0 && (
              <div className="pt-2">
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.textMuted, marginBottom: 12 }}>Competitors AI recommends instead of you</p>
                {compData.filter(c => !c.isYou && !c.isYours).map((entry, i) => (
                  <div key={entry.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: t.textPrimary }}>{entry.name}</span>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: compColors[i % compColors.length], fontVariantNumeric: 'tabular-nums' }}>{entry.score}/{totalQ}</span>
                    </div>
                    <div style={{ height: 4, background: t.barTrack, width: '100%' }}>
                      <div style={{ height: '100%', width: `${entry.pct}%`, background: compColors[i % compColors.length], transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gap callout */}
          {maxScore > yourScore && yourScore > 0 && (
            <div className="mt-6 p-4 rounded-xl text-sm" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              {compData.some(c => c.isYours && c.score > 0)
                ? `Your competitor appeared ${maxScore - yourScore} more times than you in AI recommendations. When a buyer asks ChatGPT for a recommendation, they're getting your competitor's name instead of yours.`
                : `You appeared in only ${yourScore} out of ${totalQ} AI recommendations. There's significant room to improve your AI visibility.`
              }
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}

/* ── AI Discovery Analysis (Edward Sturm Playbook) ─── */
function AIDiscoveryAnalysis({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const discovery = data.aiDiscovery;
  
  if (!discovery) return null;

  const readiness = discovery.contentReadiness;
  const readinessCategories = [
    { name: 'QFO Coverage', score: readiness.qfoCoverage, desc: 'How many query fan-out paths mention your business' },
    { name: 'Grounding Queries', score: readiness.groundingQueryReadiness, desc: 'Whether your site matches AI search patterns' },
    { name: 'Citation Authority', score: readiness.citationCompetitiveness, desc: 'How often AI models cite you vs competitors' },
    { name: 'Content Depth', score: readiness.contentDepth, desc: 'llms.txt, schema, reviews, and blog presence' },
  ];

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            AI Discovery Analysis
          </SectionTitle>
          <p className="text-xs sm:text-sm mt-2 mb-8" style={{ color: t.textMuted }}>
            How AI models discover, evaluate, and recommend your business — based on real AI behavior patterns.
          </p>

          {/* Bing WMT Alert */}
          {!discovery.bingWmtVerified && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: t.textSecondary }}>Bing Webmaster Tools Not Connected</p>
                  <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>
                    Connecting Bing Webmaster Tools unlocks free AI visibility data including grounding queries. This is optional and does not affect your score.
                    <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="underline ml-1" style={{ color: '#22D3EE' }}>Learn more →</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Readiness Score */}
          <div className="mb-8 p-5 rounded-xl" style={{ background: t.bgCard, border: `1px solid ${t.borderSubtle}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium" style={{ color: t.textPrimary }}>AI Content Readiness Score</h3>
              <span className="text-2xl font-light tabular-nums" style={{ color: getScoreAccent(readiness.overall) }}>{readiness.overall}/100</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {readinessCategories.map((cat) => (
                <div key={cat.name} className="p-3 rounded-lg" style={{ background: t.barTrack }}>
                  <p className="text-xs mb-1" style={{ color: t.textMuted }}>{cat.name}</p>
                  <p className="text-lg font-semibold tabular-nums" style={{ color: getScoreAccent(cat.score) }}>{cat.score}</p>
                  <p className="text-[10px] leading-tight mt-1" style={{ color: t.textMuted }}>{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* QFO Results Table */}
          {discovery.qfoResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3" style={{ color: t.textPrimary }}>Query Fan-Out Results</h3>
              <p className="text-xs mb-4" style={{ color: t.textMuted }}>
                When AI models research your business, they perform follow-up searches. Here's what they find:
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.borderSubtle}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: t.barTrack, borderBottom: `1px solid ${t.borderSubtle}` }}>
                      <th className="text-left py-2.5 px-3 text-xs font-medium" style={{ color: t.textMuted }}>Query</th>
                      <th className="text-center py-2.5 px-3 text-xs font-medium" style={{ color: t.textMuted, width: 80 }}>Status</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium" style={{ color: t.textMuted }}>Top Source Cited</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discovery.qfoResults.slice(0, 10).map((qfo, i) => (
                      <tr key={i} className={i > 0 ? 'border-t' : ''} style={{ borderColor: t.borderSubtle }}>
                        <td className="py-2.5 px-3 text-sm" style={{ color: t.textSecondary }}>{qfo.query}</td>
                        <td className="py-2.5 px-3 text-center">
                          {qfo.appeared ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: '#22C55E', background: 'rgba(34,197,94,0.1)' }}>Found</span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}>Missing</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-xs truncate max-w-[200px]" style={{ color: t.textMuted }}>
                          {qfo.sourcesCited[0] || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {discovery.qfoResults.length > 10 && (
                  <p className="text-xs py-2 px-3 text-center" style={{ color: t.textMuted, borderTop: `1px solid ${t.borderSubtle}` }}>
                    + {discovery.qfoResults.length - 10} more queries
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Competitor Citations */}
          {discovery.competitorCitations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3" style={{ color: t.textPrimary }}>Who AI Trusts Instead of You</h3>
              <p className="text-xs mb-4" style={{ color: t.textMuted }}>
                These domains are cited by AI models when your business doesn't appear:
              </p>
              <div className="space-y-2">
                {discovery.competitorCitations.map((citation, i) => (
                  <div key={citation.domain} className="flex items-center justify-between p-3 rounded-lg" style={{ background: t.barTrack }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium tabular-nums" style={{ color: t.textMuted }}>#{i + 1}</span>
                      <span className="text-sm" style={{ color: t.textPrimary }}>{citation.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: t.textMuted }}>Cited {citation.count} times</span>
                      <div className="w-16 h-1.5 rounded-full" style={{ background: t.barTrack }}>
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${Math.min((citation.count / discovery.competitorCitations[0].count) * 100, 100)}%`,
                            background: ['#8B5CF6', '#F97316', '#EC4899', '#22D3EE', '#10B981'][i % 5]
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Discovery Recommendations */}
          {discovery.recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: t.textPrimary }}>AI Discovery Recommendations</h3>
              <div className="space-y-3">
                {discovery.recommendations.map((rec, i) => {
                  const impactColor = getImpactColor(rec.impact);
                  const impactBg = getImpactBg(rec.impact);
                  return (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: t.barTrack, border: `1px solid ${t.borderSubtle}` }}>
                      <span className="text-lg flex-shrink-0">{rec.impact === 'High' ? '🔴' : rec.impact === 'Medium' ? '🟡' : '🟢'}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium" style={{ color: t.textPrimary }}>{rec.title}</h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: impactColor, background: impactBg }}>
                            {rec.impact}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>{rec.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Revenue at Risk ─────────────────────────── */
function RevenueImpact({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);

  const totalPrompts = data.totalPrompts || 20;
  const promptsAppeared = data.promptsAppeared ?? 0;
  const appearanceRate = totalPrompts > 0 ? promptsAppeared / totalPrompts : 0;
  const missedRate = 1 - appearanceRate;
  const missedPct = Math.round(missedRate * 100);

  const low = data.profitAtRisk?.low || 1500;
  const high = data.profitAtRisk?.high || 6000;
  const revenueLeak = Math.round(low * missedRate);
  const revenueLeakHigh = Math.round(high * missedRate);

  const hasCompetitors = data.competitors.some(c => !c.isYou && !c.isYours && c.score > 0);

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <SectionTitle style={{ color: t.textPrimary }}>
            Estimated Revenue at Risk
          </SectionTitle>
          <p className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mt-4" style={{ color: t.profitRiskText }}>
            {formatCurrency(revenueLeak, data.currencySymbol)}<span className="text-lg sm:text-xl">&ndash;{formatCurrency(revenueLeakHigh, data.currencySymbol)}</span><span className="text-lg sm:text-xl">/mo</span>
          </p>
          <p className="text-sm mt-3" style={{ color: t.textSecondary }}>
            {hasCompetitors
              ? `Based on your ${missedPct}% miss rate, that's revenue going to competitors who appear in AI recommendations`
              : `Your business is invisible in ${missedPct}% of AI-driven searches — that's real buyer traffic you're not capturing`
            }
          </p>
          <div className="mt-6 inline-block rounded-xl px-5 py-3" style={{ background: theme === 'dark' ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)', border: `1px solid ${theme === 'dark' ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.1)'}` }}>
            <p className="text-xs sm:text-sm" style={{ color: t.textSecondary }}>
              You appeared in only <strong style={{ color: t.textPrimary }}>{promptsAppeared}/{totalPrompts}</strong> AI recommendation scenarios.{' '}
              <strong style={{ color: '#EF4444' }}>{missedPct}%</strong> of the time, AI is sending buyers elsewhere.
            </p>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Query Lists (editorial findings) ────────── */
function QueryLists({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();
  const [showAllVisible, setShowAllVisible] = useState(false);
  const [showAllInvisible, setShowAllInvisible] = useState(false);

  const visibleToShow = isMobile && !showAllVisible ? 5 : data.visibleQueries.length;
  const invisibleToShow = isMobile && !showAllInvisible ? 5 : data.invisibleQueries.length;

  const invisibleCount = data.invisibleQueries.length;
  const totalCount = data.visibleQueries.length + invisibleCount;

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            Query Findings
          </SectionTitle>

          {/* Editorial finding statement */}
          <p className="text-sm mt-2 mb-8" style={{ color: t.textSecondary }}>
            In {invisibleCount} of {totalCount} queries tested, AI platforms recommended competitors instead of {data.businessName}. Here's the breakdown.
          </p>

          <div className={isMobile ? 'space-y-10' : 'grid grid-cols-2 gap-8'}>
            {/* Visible */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                <h3 className="font-['Lora'] text-lg sm:text-xl tracking-tight" style={{ color: t.textPrimary }}>
                  Where You Appear
                </h3>
              </div>
              <p className="text-xs mb-4" style={{ color: t.textMuted }}>
                {data.visibleQueries.length} queries where AI mentions you
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.borderSubtle}`, background: t.barTrack }}>
                <table className="w-full">
                  <tbody>
                    {data.visibleQueries.slice(0, visibleToShow).map((q, i) => (
                      <tr key={i} className={i > 0 ? `border-t` : ''} style={{ borderColor: t.borderSubtle }}>
                        <td className="py-2.5 px-3 text-sm" style={{ color: t.textSecondary }}>{q}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isMobile && data.visibleQueries.length > 5 && (
                <button
                  onClick={() => setShowAllVisible(!showAllVisible)}
                  className="mt-2 text-xs font-medium"
                  style={{ color: '#22D3EE' }}
                >
                  {showAllVisible ? 'Show less' : `+ ${data.visibleQueries.length - 5} more`}
                </button>
              )}
            </div>

            {/* Invisible */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
                <h3 className="font-['Lora'] text-lg sm:text-xl tracking-tight" style={{ color: t.textPrimary }}>
                  Where You're Invisible
                </h3>
              </div>
              <p className="text-xs mb-4" style={{ color: t.textMuted }}>
                {invisibleCount} queries where competitors appear instead
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.borderSubtle}`, background: t.barTrack }}>
                <table className="w-full">
                  <tbody>
                    {data.invisibleQueries.slice(0, invisibleToShow).map((q, i) => (
                      <tr key={i} className={i > 0 ? `border-t` : ''} style={{ borderColor: t.borderSubtle }}>
                        <td className="py-2.5 px-3 text-sm" style={{ color: t.textSecondary }}>{q}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isMobile && data.invisibleQueries.length > 5 && (
                <button
                  onClick={() => setShowAllInvisible(!showAllInvisible)}
                  className="mt-2 text-xs font-medium"
                  style={{ color: '#22D3EE' }}
                >
                  {showAllInvisible ? 'Show less' : `+ ${data.invisibleQueries.length - 5} more`}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Recommendations (numbered action plan) ──── */
function Recommendations({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);

  const allRecs = [...data.recommendations].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return (order[a.impact] ?? 3) - (order[b.impact] ?? 3);
  });

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            Priority Action Plan
          </SectionTitle>
          <p className="text-xs sm:text-sm mt-2 mb-8" style={{ color: t.textMuted }}>
            What to fix first, ranked by impact. Start at the top and work down.
          </p>

          <div className="space-y-4">
            {allRecs.map((rec, i) => {
              const impactColor = getImpactColor(rec.impact);
              const impactBg = getImpactBg(rec.impact);
              return (
                <div
                  key={rec.id}
                  className="flex items-start gap-4 p-4 sm:p-5 rounded-xl"
                  style={{ background: t.barTrack, border: `1px solid ${t.borderSubtle}` }}
                >
                  {/* Number */}
                  <span
                    className="text-lg font-light tabular-nums flex-shrink-0 mt-0.5"
                    style={{ color: t.textMuted }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="text-sm font-semibold" style={{ color: t.textPrimary }}>{rec.title}</h4>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ color: impactColor, background: impactBg }}
                      >
                        {rec.impact} Impact
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Social Media ────────────────────────────── */
function SocialMedia({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  const platforms = [
    { label: 'Google Reviews', value: data.socialPresence.googleReviews, icon: 'google' },
  ].filter(p => p.value !== null && p.value !== undefined);

  const hasSocialData = data.socialPresence.googleReviews !== null && data.socialPresence.googleReviews !== undefined;
  const hasCompetitorSocialData = data.competitorSocial && data.competitorSocial.length > 0;

  if (!hasSocialData && !hasCompetitorSocialData) return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            Social Media & AI Visibility
          </SectionTitle>
          <p className="text-sm mt-2 mb-4" style={{ color: t.textMuted }}>What social media agencies won't tell you about AI recommendations</p>
          <div className="rounded-xl p-5" style={{ background: t.barTrack, borderLeft: '3px solid #22D3EE' }}>
            <p className="text-sm leading-7" style={{ color: t.textSecondary }}>
              Social media following is just <strong style={{ color: t.textPrimary }}>one signal</strong> among many that AI platforms use. Businesses with zero social presence regularly outrank competitors with thousands of followers — because AI recommendations are driven by <strong style={{ color: t.textPrimary }}>content quality, structured data, and local authority</strong>, not follower counts.
            </p>
          </div>
        </div>
      </section>
    </FadeIn>
  );

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            Social Media Presence
          </SectionTitle>
          <p className="text-xs sm:text-sm mt-2 mb-6" style={{ color: t.textMuted }}>
            How you compare on social platforms
          </p>

          {/* Your profiles */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Your Profiles</p>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((p) => (
                <div key={p.label} className="text-center p-3 sm:p-4 rounded-xl" style={{ background: t.barTrack }}>
                  <div className="text-xl mb-1 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  </div>
                  <p className="text-xl sm:text-2xl font-semibold tabular-nums" style={{ color: t.textPrimary }}>
                    {p.value ? p.value.toLocaleString() : '—'}
                  </p>
                  <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor comparison */}
          {data.competitorSocial.length > 0 && (
            <div>
              <div className="border-t my-5" style={{ borderColor: t.borderSubtle }} />
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Competitor Comparison</p>

              {/* Mobile: stacked cards */}
              <div className="flex flex-col gap-3 sm:hidden">
                {([
                  { label: 'Google Reviews', yours: data.socialPresence.googleReviews, getTheirs: (c: CompetitorSocial) => c.googleReviews },
                ] as const).filter(p => p.yours !== null && p.yours !== undefined).map((platform) => (
                  <div key={platform.label} className="rounded-xl p-3" style={{ background: t.barTrack }}>
                    <p className="text-xs font-medium mb-2" style={{ color: t.textMuted }}>{platform.label}</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-semibold tabular-nums" style={{ color: t.textPrimary }}>{platform.yours ? platform.yours.toLocaleString() : '—'}</span>
                      <span className="text-[10px]" style={{ color: '#22D3EE' }}>You</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {data.competitorSocial.map((c, i) => {
                        const theirs = platform.getTheirs(c) || 0;
                        const yours = platform.yours || 0;
                        const ratio = yours > 0 ? Math.round(theirs / yours) : 0;
                        return (
                          <div key={c.name} className="flex items-baseline justify-between text-xs">
                            <span className="truncate mr-2" style={{ color: ['#8B5CF6', '#F97316', '#EC4899'][i % 3] }}>{c.name}</span>
                            <span className="tabular-nums flex-shrink-0" style={{ color: ratio > 2 ? '#EF4444' : ratio > 1 ? '#F59E0B' : t.textSecondary }}>
                              {theirs.toLocaleString()}{ratio > 1 && <span className="text-[10px] ml-1">({ratio}x)</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.borderSubtle}` }}>
                      <th className="text-xs font-medium text-left py-2 pr-4" style={{ color: t.textMuted }}>Platform</th>
                      <th className="text-xs font-medium text-center py-2 px-3" style={{ color: '#22D3EE' }}>You</th>
                      {data.competitorSocial.map((c, i) => (
                        <th key={c.name} className="text-xs font-medium text-center py-2 px-3" style={{ color: ['#8B5CF6', '#F97316', '#EC4899'][i % 3] }}>
                          <span className="truncate max-w-[100px] block">{c.name.split(' ').slice(0, 2).join(' ')}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      { label: 'Google Reviews', yours: data.socialPresence.googleReviews, getTheirs: (c: CompetitorSocial) => c.googleReviews },
                    ] as const).filter(p => p.yours !== null && p.yours !== undefined).map((platform) => (
                      <tr key={platform.label} style={{ borderBottom: `1px solid ${t.borderSubtle}` }}>
                        <td className="text-sm py-2.5 pr-4" style={{ color: t.textMuted }}>{platform.label}</td>
                        <td className="text-sm text-center py-2.5 px-3 font-semibold tabular-nums" style={{ color: t.textPrimary }}>{platform.yours ? platform.yours.toLocaleString() : '—'}</td>
                        {data.competitorSocial.map((c, i) => {
                          const val = platform.getTheirs(c) || 0;
                          return (
                            <td key={c.name} className="text-sm text-center py-2.5 px-3 tabular-nums" style={{ color: val > 2 * (platform.yours || 1) ? '#EF4444' : t.textSecondary }}>
                              {val.toLocaleString() || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insight */}
              <div className="mt-4 rounded-xl p-4" style={{ background: t.barTrack, borderLeft: '3px solid #22D3EE' }}>
                <p className="text-sm leading-7" style={{ color: t.textSecondary }}>
                  {data.aviScore === 0
                    ? <>You have an active presence online, but <strong style={{ color: t.textPrimary }}>AI platforms aren't recommending you</strong>. Social media alone doesn't get you into AI answers. What matters is structured content, schema markup, and being cited by trusted sources.</>
                    : data.socialVsVisibility?.socialGapMultiplier
                      ? <>Your competitor has <strong style={{ color: t.textPrimary }}>{data.socialVsVisibility.socialGapMultiplier}x your reviews</strong> — but that doesn't mean they own AI visibility. Content depth, schema markup, and local authority often matter more.</>
                      : <>Social following is just <strong style={{ color: t.textPrimary }}>one signal</strong> among many. Your AI Visibility Score determines whether customers find you when they ask AI platforms for recommendations.</>
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Social Proof Strip ─────────────────────── */
function SocialProofStrip({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const leader = data.competitors.find(c => !c.isYou && c.score > (data.competitors.find(c2 => c2.isYou)?.score || 0));

  return (
    <FadeIn>
      <div
        className="py-6 px-5 sm:px-8 rounded-2xl text-center sm:text-left"
        style={{
          background: theme === 'dark' ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)',
          border: `1px solid ${theme === 'dark' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.12)'}`,
        }}
      >
        <p className="text-sm sm:text-base font-medium mb-1" style={{ color: t.textPrimary }}>
          Every day you wait, more buyers find your competitors instead of you.
        </p>
        <p className="text-xs sm:text-sm" style={{ color: t.textSecondary }}>
          {leader
            ? `${leader.name} is already being recommended by AI-search tools when buyers ask for suggestions.`
            : 'Right now, AI platforms don\'t have enough signals to recommend your business.'
          }
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
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#22D3EE' }}>Free Preview</p>
          <SectionTitle style={{ color: t.textPrimary }}>
            This is a summary. Your full report goes deeper.
          </SectionTitle>
          <p className="text-xs sm:text-sm mt-2 mb-8" style={{ color: t.textMuted }}>
            The complete audit includes everything below — plus ongoing monitoring.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {teaserItems.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: t.barTrack, border: `1px solid ${t.borderSubtle}` }}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: t.textPrimary }}>{item.title}</p>
                  <p className="text-xs" style={{ color: t.textSecondary }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Blurred Report Preview ─────────────────── */
function BlurredReportPreview({ theme, leadId }: { theme: Theme; leadId: string }) {
  const t = getThemeStyles(theme);
  const isMobile = useIsMobile();

  return (
    <FadeIn>
      <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.borderSubtle}` }}>
        <div className="p-5 sm:p-6 space-y-4" style={{ background: t.bgSection }}>
          {/* Fake header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #22D3EE, #06B6D4)' }} />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 rounded-full" style={{ background: t.textPrimary, opacity: 0.15, width: '35%' }} />
              <div className="h-1.5 rounded-full" style={{ background: t.textPrimary, opacity: 0.08, width: '55%' }} />
            </div>
          </div>

          {/* Fake score */}
          <div className="flex items-center justify-center gap-6 py-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center" style={{ border: `3px solid ${theme === 'dark' ? 'rgba(34,211,238,0.3)' : 'rgba(6,182,212,0.3)'}` }}>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#F59E0B' }}>42</div>
            </div>
            <div className="space-y-2 flex-1 max-w-[200px]">
              <div className="h-2 rounded-full" style={{ background: t.textPrimary, opacity: 0.12, width: '80%' }} />
              <div className="h-2 rounded-full" style={{ background: t.textPrimary, opacity: 0.08, width: '60%' }} />
            </div>
          </div>

          {/* Fake rows */}
          <div className="space-y-2 pt-2">
            {[0.6, 0.45, 0.7, 0.55, 0.3].map((w, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg" style={{ background: t.barTrack }}>
                <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="h-2 rounded-full flex-1" style={{ background: t.textPrimary, opacity: 0.1, width: `${w * 100}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Blur overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, rgba(2,6,23,0.2) 0%, rgba(2,6,23,0.85) 40%, rgba(2,6,23,0.95) 100%)'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.95) 100%)',
            backdropFilter: isMobile ? 'none' : 'blur(3px)',
          }}
        >
          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold" style={{ color: t.textPrimary }}>Full Report Preview</p>
            <p className="text-xs mt-1" style={{ color: t.textMuted }}>Complete audit: 84 queries, competitor analysis, fix plan</p>
          </div>
          <a
            href="#"
            onClick={async (e) => { e.preventDefault(); try { const r = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: leadId, tier: 'fix' }) }); const d = await r.json(); if (d.url) window.location.href = d.url; } catch { window.location.href = 'https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002'; } }}
            className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all"
            style={{
              background: 'linear-gradient(to right, #22D3EE, #06B6D4)',
              color: '#020617',
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
function PricingCards({ data, theme, leadId }: { data: LeadData; theme: Theme; leadId: string }) {
  const t = getThemeStyles(theme);

  const plans = [
    {
      name: 'Fix',
      price: 88,
      description: 'Full audit + one-time fix',
      features: ['Full AI visibility audit (84 queries)', 'Content optimization for AI platforms', 'Local listing cleanup & schema markup', 'Competitor gap analysis', '30-day email support'],
      highlighted: false,
    },
    {
      name: 'Fix + Monitor',
      price: 188,
      description: 'Full fix + we keep you visible every month',
      features: ['Everything in the Fix plan', 'Monthly re-audit across 84 queries', 'Score tracking dashboard — watch your AVI climb', 'Competitor movement alerts', 'Ongoing content & listing optimization', 'Dedicated support channel'],
      highlighted: true,
    },
  ];

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <SectionTitle style={{ color: t.textPrimary }}>
              Ready to Fix This?
            </SectionTitle>
            <p className="text-xs sm:text-sm mt-2" style={{ color: t.textMuted }}>
              Choose the plan that fits your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-6 sm:p-8"
                style={{
                  background: t.bgSection,
                  border: plan.highlighted
                    ? `2px solid ${t.pricingHighlightBorder}`
                    : `1px solid ${t.borderSubtle}`,
                  boxShadow: plan.highlighted && theme === 'dark'
                    ? '0 0 40px rgba(34, 211, 238, 0.08)'
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
                href="#"
                  onClick={async (e: any) => { e.preventDefault(); const t2 = plan.name === 'Fix' ? 'fix' : 'fix_and_monitor'; try { const r = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: leadId, tier: t2 }) }); const d = await r.json(); if (d.url) window.location.href = d.url; } catch { window.location.href = plan.name === 'Fix' ? 'https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002' : 'https://buy.stripe.com/5kQ7sMdn103Q2P22MM24003'; } }}
                  className="block w-full py-3.5 text-base font-semibold rounded-xl text-center transition-all"
                  style={plan.highlighted
                    ? {
                        background: 'linear-gradient(to right, #22D3EE, #06B6D4)',
                        color: '#020617',
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
                  {plan.name === 'Fix' ? 'Get the Full Audit — $88' : 'Fix + Monitor — $188/mo'}
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-center mt-6" style={{ color: t.textMuted }}>
            Both plans include the full audit report. Cancel anytime. No setup fee.
          </p>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Bottom CTA ──────────────────────────────── */
function BottomCTA({ theme }: { theme: Theme }) {
  const t = getThemeStyles(theme);

  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto py-8 sm:py-10 text-center">
        <h3 className="font-['Lora'] text-xl sm:text-2xl tracking-tight mb-3" style={{ color: t.textPrimary }}>
          Prefer to talk first?
        </h3>
        <p className="text-sm sm:text-base mb-6 sm:mb-8" style={{ color: t.textSecondary }}>
          Book a free 15-minute audit review call. No pressure, no obligation.
        </p>
        <a
          href="https://calendly.com/vizbiz-ai/15min"
          className="inline-block px-8 py-3.5 text-base font-semibold rounded-xl border transition-all"
          style={{
            borderColor: t.ctaOutlineBorder,
            color: t.ctaOutlineText,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = t.ctaOutlineHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Image src="/logo.jpg" alt="VizBiz.ai" width={36} height={36} className="rounded-lg opacity-70" />
            <span className="text-base font-semibold" style={{ color: t.textPrimary }}>
              VizBiz<span style={{ color: '#22D3EE' }}>.ai</span>
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

/* ── Google Trust Signals ─── */
function GoogleTrustSignals({ data, theme }: { data: LeadData; theme: Theme }) {
  const t = getThemeStyles(theme);
  const gpe = data.googlePlaceEnrichment;
  
  // If Places data is null, show unavailable message
  if (!gpe) {
    return (
      <FadeIn>
        <section className="py-12">
          <div className="max-w-4xl mx-auto">
            <SectionTitle style={{ color: t.textPrimary }}>Google Profile Signal</SectionTitle>
            <div className="p-4 rounded-xl" style={{ background: t.barTrack }}>
              <p className="text-sm" style={{ color: t.textMuted }}>Google Business Profile not detected — we couldn't verify a matching listing for this location. This is a key visibility gap we can help you fix.</p>
            </div>
          </div>
        </section>
      </FadeIn>
    );
  }

  // If Places looked but didn't find a profile (no placeId AND no display name)
  if (!gpe.placeId && !gpe.displayName) {
    const statusMsg = gpe.validationStatus === 'unavailable'
      ? "Google Business Profile not detected — we couldn't verify your listing. This is a key visibility gap we can help you fix."
      : "We couldn't find a matching Google Business profile. Claiming and verifying your listing can strengthen your AI visibility signals.";
    return (
      <FadeIn>
        <section className="py-12">
          <div className="max-w-4xl mx-auto">
            <SectionTitle style={{ color: t.textPrimary }}>Google Profile Signal</SectionTitle>
            <div className="p-4 rounded-xl" style={{ background: t.barTrack }}>
              <p className="text-sm" style={{ color: t.textMuted }}>{statusMsg}</p>
            </div>
          </div>
        </section>
      </FadeIn>
    );
  }

  const trustScore = data.localEntityTrustScore;
  const compValidations = data.competitorValidations || [];
  const isClientOnly = data.competitorMode === "client_only";

  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            Google Profile & Trust Signals
          </SectionTitle>
          <p className="text-xs sm:text-sm mt-2 mb-6" style={{ color: t.textMuted }}>
            How your business appears on Google — a key signal AI platforms use to evaluate credibility.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {gpe.rating !== null && (
              <div className="text-center p-3 rounded-xl" style={{ background: t.barTrack }}>
                <p className="text-xl sm:text-2xl font-light tabular-nums" style={{ color: gpe.rating >= 4 ? '#22C55E' : gpe.rating >= 3 ? '#F59E0B' : '#EF4444' }}>{gpe.rating}</p>
                <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Google Rating</p>
              </div>
            )}
            {gpe.userReviewCount !== null && (
              <div className="text-center p-3 rounded-xl" style={{ background: t.barTrack }}>
                <p className="text-xl sm:text-2xl font-light tabular-nums" style={{ color: t.textPrimary }}>{gpe.userReviewCount}</p>
                <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Google Reviews</p>
              </div>
            )}
            {gpe.websiteMatch !== null && (
              <div className="text-center p-3 rounded-xl" style={{ background: t.barTrack }}>
                <p className="text-xl sm:text-2xl font-light" style={{ color: gpe.websiteMatch ? '#22C55E' : '#F59E0B' }}>{gpe.websiteMatch ? '✓' : '✗'}</p>
                <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Website Match</p>
              </div>
            )}
            {trustScore !== null && trustScore !== undefined && (
              <div className="text-center p-3 rounded-xl" style={{ background: t.barTrack }}>
                <p className="text-xl sm:text-2xl font-light tabular-nums" style={{ color: trustScore >= 60 ? '#22C55E' : trustScore >= 40 ? '#F59E0B' : '#EF4444' }}>{trustScore}</p>
                <p className="text-[10px] sm:text-xs" style={{ color: t.textMuted }}>Trust Score</p>
              </div>
            )}
          </div>

          {/* Competitor comparison — only when client provided competitors */}
          {!isClientOnly && compValidations.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Competitor Google Comparison</p>
              <div className="space-y-2">
                {compValidations.map((cv, i) => (
                  <div key={cv.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: t.barTrack }}>
                    <span className="text-sm" style={{ color: ['#8B5CF6', '#F97316', '#EC4899'][i % 3] }}>{cv.name}</span>
                    <div className="flex gap-4 text-xs tabular-nums" style={{ color: t.textSecondary }}>
                      {cv.rating !== null && <span>{cv.rating}⭐</span>}
                      {cv.userReviewCount !== null && <span>{cv.userReviewCount} reviews</span>}
                      {cv.distanceFromClientKm !== null && <span>{cv.distanceFromClientKm}km</span>}
                      <span>{cv.validationStatus === 'validated' ? '✅' : '⚠️'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Competitor Fallback (client-only snapshot) ─── */
function CompetitorFallback({ theme }: { theme: Theme }) {
  const t = getThemeStyles(theme);
  return (
    <FadeIn>
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <SectionTitle style={{ color: t.textPrimary }}>
            Local Competitor Tracking
          </SectionTitle>
          <div className="mt-4 p-6 rounded-xl" style={{ background: t.bgCard, border: `1px solid ${t.borderSubtle}` }}>
            <p className="text-sm leading-7" style={{ color: t.textSecondary }}>
              No competitors were provided for this free snapshot, so this report focuses on your business only.
            </p>
            <p className="text-sm leading-7 mt-4" style={{ color: t.textSecondary }}>
              In the full report, VizBiz can compare you against 1–2 named local competitors to show:
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-7" style={{ color: t.textSecondary }}>
              <li className="flex items-start gap-2">
                <span style={{ color: '#22D3EE' }}>•</span>
                <span>which businesses AI/search systems recommend instead</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#22D3EE' }}>•</span>
                <span>what trust signals and pages they have that you do not</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#22D3EE' }}>•</span>
                <span>what fixes can help you win more local recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Main Component ────────────────────────────── */
export default function ReportContent({ leadId, leadData, researchData }: { leadId: string; leadData: LeadPageData | null; researchData: ResearchData | null }) {
  const { theme, toggle } = useTheme();
  const t = getThemeStyles(theme);

  // Build report data from research or lead data
  let data: LeadData | null = null;
  
  if (researchData) {
    const appearanceRate = researchData.appearedCount / Math.max(researchData.totalPrompts, 1);
    const aviScore = Math.round(appearanceRate * 100);
    
    const totalPrompts = researchData.promptResults.length;
    const nichePrompts = researchData.promptResults.slice(0, 15);
    const brandPrompts = researchData.promptResults.slice(15);
    
    const brandAppeared = brandPrompts.filter(r => r.businessAppeared).length;
    const brandScore = brandPrompts.length > 0 ? Math.round((brandAppeared / brandPrompts.length) * 100) : 0;
    
    const serviceAppeared = nichePrompts.filter(r => r.businessAppeared).length;
    const serviceScore = nichePrompts.length > 0 ? Math.round((serviceAppeared / nichePrompts.length) * 100) : 0;
    
    const reviewPrompts = researchData.promptResults.filter(r => 
      r.prompt.toLowerCase().includes('review') || 
      r.prompt.toLowerCase().includes('rating') || 
      r.prompt.toLowerCase().includes('top rated') || 
      r.prompt.toLowerCase().includes('best')
    );
    const reviewAppeared = reviewPrompts.filter(r => r.businessAppeared).length;
    const trustScore = reviewPrompts.length > 0 ? Math.round((reviewAppeared / reviewPrompts.length) * 100) : Math.round(appearanceRate * 60);
    
    const competitorAppearedCount = researchData.promptResults.filter(r => r.competitorAppeared).length;
    const competitiveScore = (() => {
      if (competitorAppearedCount === 0 && researchData.appearedCount === 0) return 5;
      if (competitorAppearedCount === 0) return Math.round(appearanceRate * 80);
      const compRate = competitorAppearedCount / totalPrompts;
      const bizRate = researchData.appearedCount / totalPrompts;
      if (bizRate >= compRate) return Math.round(bizRate * 100);
      return Math.round((bizRate / Math.max(compRate, 0.01)) * 50);
    })();
    
    const contentScore = Math.round(appearanceRate * 70);
    
    const categories = [
      { name: 'Brand Discovery', score: brandScore, description: 'How often you appear when people search for your business by name' },
      { name: 'Trust & Reviews', score: trustScore, description: 'What AI platforms say about your reputation' },
      { name: 'Service Visibility', score: serviceScore, description: 'Whether you appear for service-related queries' },
      { name: 'Competitive Position', score: Math.min(competitiveScore, 100), description: 'How you stack up against competitors' },
      { name: 'Content & Authority', score: contentScore, description: 'Whether AI tools see you as an authority' },
    ];

    const competitorFreq: Record<string, number> = {};
    for (const r of researchData.promptResults) {
      if (r.competitorName && r.competitorAppeared) {
        competitorFreq[r.competitorName] = (competitorFreq[r.competitorName] || 0) + 1;
      }
    }
    const genericCompetitors = ['tanning salons', 'hair salons', 'nail salons', 'beauty salons', 'dentists', 'restaurants', 'gyms', 'real estate', 'cleaners', 'photographers', 'local competitors', 'nearby businesses', 'similar companies', 'mapquest', 'google maps', 'yelp', 'tripadvisor', 'yellow pages', 'white pages', 'foursquare', 'bbb', 'wikipedia', 'medium', 'facebook', 'instagram', 'linkedin', 'pinterest', 'reddit', 'youtube', 'bbb', 'whereis', 'best in', 'top rated', 'featured', 'recommended by', 'nearby', 'local options', 'others in the area'];
    const realCompetitors = Object.entries(competitorFreq)
      .filter(([name]) => !genericCompetitors.some(g => name.toLowerCase() === g || name.toLowerCase().startsWith(g + ' ')))
      .map(([name, count]) => {
        const cleaned = name.replace(/^[^:]+:\s*/, (match) => {
          const parts = match.split(':');
          return parts[0].trim().split(' ').length >= 3 ? '' : match;
        }).trim();
        return [cleaned, count] as [string, number];
      })
      .filter(([name]) => name.length > 0)
      .sort((a, b) => b[1] - a[1]);
    
    const topCompetitor = realCompetitors.length > 0 ? realCompetitors[0][0] : null;
    const hasRealCompetitor = !!topCompetitor;
    const competitorName = topCompetitor || researchData.competitorMention || 'Top Competitor';

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
      : researchData.competitorMention || `Top businesses in ${researchData.city}`;

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
      profitAtRisk: (() => {
        // Use actual research data if available (from niche-economics.ts)
        if (researchData.revenueLoss && researchData.revenueLoss > 0) {
          // revenueLoss is monthly — derive low/high from it
          const loss = researchData.revenueLoss;
          return { low: Math.round(loss * 0.3), high: Math.round(loss * 1.2) };
        }
        // Fallback: use preflight estimatedRevenueGap if present
        // (stored in PREFLIGHT data in notes)
        const nicheRevenueMap: Record<string, { low: number; high: number }> = {
          spray_tanning: { low: 300, high: 1200 },
          beauty_salon: { low: 800, high: 3000 },
          nail_salon: { low: 500, high: 2000 },
          car_dealership: { low: 5600, high: 45000 },
          venue_wedding: { low: 2000, high: 8000 },
          dance_studio: { low: 400, high: 1500 },
          real_estate: { low: 3000, high: 15000 },
          restaurant: { low: 1500, high: 6000 },
          fine_jewelry: { low: 2000, high: 12000 },
          fitness: { low: 800, high: 3500 },
        };
        return nicheRevenueMap[researchData.niche] || { low: 1500, high: 6000 };
      })(),
      categories,
      visibleQueries,
      invisibleQueries,
      competitors: (() => {
        // Client-only mode: only show the business itself, no competitor comparison
        if (researchData.competitorMode === 'client_only') {
          return [
            { name: `${researchData.businessName} (You)`, score: researchData.appearedCount, isYou: true },
          ];
        }
        // Client-provided mode: show client competitors + discovered ones
        const userCompetitors = (leadData?.competitor || '')
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c.length > 0);
        const userCompWithScores = userCompetitors.map((uc: string) => {
          const ucKey = uc.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
          let appearances = 0;
          for (const r of researchData.promptResults) {
            if (r.competitorName && r.competitorName.toLowerCase().includes(ucKey)) {
              appearances++;
            }
          }
          return { name: uc, score: appearances, isYours: true } as Competitor;
        });
        const discoveredNames = new Set(realCompetitors.map(([n]) => n.toLowerCase()));
        const uniqueUserComps = userCompWithScores.filter(uc =>
          !discoveredNames.has(uc.name.toLowerCase()) &&
          !discoveredNames.has(uc.name.toLowerCase().split('.')[0])
        );
        return [
          { name: `${researchData.businessName} (You)`, score: researchData.appearedCount, isYou: true },
          ...uniqueUserComps,
          ...realCompetitors.slice(0, 3).map(([name, count]) => ({ name, score: count as number })),
          ...(realCompetitors.length === 0 && uniqueUserComps.length === 0 ? [{ name: competitorDisplay, score: compScore }] : []),
        ];
      })(),
      recommendations: [
        { id: 1, title: 'Strengthen brand content', description: 'Create detailed guides and case studies about your services to improve visibility.', impact: 'High' as const },
        { id: 2, title: 'Build trust signals', description: 'Encourage more client testimonials and case studies to improve trust and review scores.', impact: 'Medium' as const },
        { id: 3, title: 'Improve competitive positioning', description: 'Highlight what makes your business unique compared to competitors.', impact: 'Medium' as const },
      ],
      socialPresence: {
        googleReviews: researchData.socialPresence?.googleReviews ?? null,
        overallScore: 0,
      },
      competitorSocial: researchData.competitorSocial?.map(c => ({
        name: c.name,
        googleReviews: c.googleReviews,
      })) || [],
      socialNarrative: researchData.socialNarrative,
      socialVsVisibility: researchData.socialVsVisibility,
      // Edward Sturm AI Discovery
      aiDiscovery: researchData.aiDiscovery,
      // Competitor mode tracking
      competitorMode: researchData.competitorMode,
      // Google Places enrichment
      googlePlaceEnrichment: researchData.googlePlaceEnrichment || null,
      localEntityTrustScore: researchData.localEntityTrustScore ?? null,
      competitorValidations: researchData.competitorValidations || [],
    };
  }

  if (!data && leadData) {
    const snapshot = leadData.snapshotAppeared || '';
    const appearedMatch = snapshot.match(/(\d+)\s+of\s+(\d+)/);
    const promptsAppeared = appearedMatch ? parseInt(appearedMatch[1]) : 0;
    const totalPrompts = appearedMatch ? parseInt(appearedMatch[2]) : 20;
    const band = leadData.visibilityBand || 'Pending';
    const aviScore = band === 'Strong' ? 72 : band === 'Moderate' ? 42 : 18;

    const competitorName = leadData.competitor || 'Top Competitor';
    
    const fallbackAppearanceRate = totalPrompts > 0 ? promptsAppeared / totalPrompts : 0;
    const fallbackCategories = [
      { name: 'Brand Discovery', score: Math.max(Math.round(fallbackAppearanceRate * 100), 3), description: 'How often you appear when people search for your business by name' },
      { name: 'Trust & Reviews', score: Math.max(Math.round(fallbackAppearanceRate * 80), 3), description: 'What AI platforms say about your reputation' },
      { name: 'Service Visibility', score: Math.max(Math.round(fallbackAppearanceRate * 90), 3), description: 'Whether you appear for service-related queries' },
      { name: 'Competitive Position', score: Math.max(Math.round(fallbackAppearanceRate * 70), 3), description: 'How you stack up against competitors' },
      { name: 'Content & Authority', score: Math.max(Math.round(fallbackAppearanceRate * 60), 3), description: 'Whether AI tools see you as an authority' },
    ];

    // Parse competitorMode from lead data for fallback path
    const fallbackCompetitorMode = (() => {
      const modeMatch = leadData.notes?.match(/CompetitorMode:\s*(\w+)/);
      return modeMatch?.[1] === 'client_provided' ? 'client_provided' as const : 'client_only' as const;
    })();

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
      profitAtRisk: { low: 1500, high: 6000 },
      categories: fallbackCategories,
      visibleQueries: [],
      invisibleQueries: [],
      competitors: fallbackCompetitorMode === 'client_only'
        ? [{ name: `${leadData.businessName} (You)`, score: promptsAppeared, isYou: true }]
        : [
            { name: `${leadData.businessName} (You)`, score: promptsAppeared, isYou: true },
            { name: competitorName, score: Math.min(promptsAppeared + 5, totalPrompts) },
          ],
      recommendations: [
        { id: 1, title: 'Strengthen brand content', description: 'Create detailed guides and case studies about your services to improve visibility.', impact: 'High' as const },
        { id: 2, title: 'Build trust signals', description: 'Encourage more client testimonials and case studies to improve trust and review scores.', impact: 'Medium' as const },
        { id: 3, title: 'Improve competitive positioning', description: 'Highlight what makes your business unique compared to competitors.', impact: 'Medium' as const },
      ],
      socialPresence: {
        googleReviews: 0,
        overallScore: 0,
      },
      competitorSocial: [],
      competitorMode: fallbackCompetitorMode,
    };
  }

  if (!data) {
    data = {
      businessName: leadData?.businessName || "Unknown Business",
      contactName: leadData?.contactName || "Client",
      location: leadData?.location || "Unknown",
      website: leadData?.website || "",
      aviScore: 0,
      totalPrompts: 0,
      promptsAppeared: 0,
      currencySymbol: "$",
      currencyCode: "USD",
      profitAtRisk: { low: 0, high: 0 },
      categories: [],
      visibleQueries: [],
      invisibleQueries: [],
      competitors: [],
      recommendations: [],
      socialPresence: { googleReviews: 0, overallScore: 0 },
      competitorSocial: [],
    };
  }

  // Section background style based on theme
  const sectionBg = theme === 'dark' ? '#0F172A' : '#FFFFFF';
  // Override CSS variable for Section component
  const sectionStyle = { '--section-bg': sectionBg } as React.CSSProperties;

  return (
    <>
      {theme === 'dark' && (
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(2, 6, 23)"
          gradientBackgroundEnd="rgb(15, 23, 42)"
          firstColor="34, 211, 238"
          secondColor="6, 182, 212"
          thirdColor="34, 211, 238"
          fourthColor="20, 150, 200"
          fifthColor="16, 120, 180"
          pointerColor="34, 211, 238"
          size="40%"
          blendingValue="lighten"
          containerClassName="fixed inset-0 z-0 opacity-40"
        />
      )}
      <div className="relative z-10 min-h-screen" style={{ ...sectionStyle, background: t.bgPage, color: t.textPrimary, fontFamily: "'Poppins', Inter, sans-serif" }}>
        <StickyHeader data={data} theme={theme} onToggle={toggle} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 space-y-12 sm:space-y-16">
          {/* 1. Hero */}
          <ReportHero data={data} theme={theme} />

          {/* 2. Score Breakdown */}
          <CategoryScores data={data} theme={theme} />

          {/* 2b. Google Trust Signals (if Places data available) */}
          <GoogleTrustSignals data={data} theme={theme} />

          {/* 3. How You Compare — only show when client provided competitors */}
          {data.competitorMode !== "client_only" ? (
            <CompetitorComparison data={data} theme={theme} />
          ) : (
            <CompetitorFallback theme={theme} />
          )}

          {/* 4. Where You Appear / Where You're Invisible */}
          <QueryLists data={data} theme={theme} />

          {/* 5. Revenue at Risk */}
          <RevenueImpact data={data} theme={theme} />

          {/* 6. AI Discovery Analysis (Edward Sturm Playbook) */}
          <AIDiscoveryAnalysis data={data} theme={theme} />

          {/* 7. Priority Actions */}
          <Recommendations data={data} theme={theme} />

          {/* 8. Social Context */}
          <SocialMedia data={data} theme={theme} />

          {/* 8. Full Report Teaser */}
          <FullReportTeaser data={data} theme={theme} />
          <SocialProofStrip data={data} theme={theme} />

          {/* 9. Pricing */}
          <PricingCards data={data} theme={theme} leadId={leadId} />
          <BottomCTA theme={theme} />
        </main>

        <ReportFooter theme={theme} />
      </div>
    </>
  );
}
