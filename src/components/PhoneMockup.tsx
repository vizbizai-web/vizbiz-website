"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

type PhoneMockupProps = {
  children: ReactNode;
  className?: string;
  priority?: boolean;
};

type PlatformStatus = {
  name: string;
  hit: boolean;
};

const platformStatus: PlatformStatus[] = [
  { name: "ChatGPT", hit: true },
  { name: "Gemini", hit: false },
  { name: "Perplexity", hit: false },
  { name: "Claude", hit: false },
  { name: "Copilot", hit: true },
];

const competitorRows = [
  { name: "Your store", highlighted: true, hits: [true, false, false, false, true] },
  { name: "Competitor A", highlighted: false, hits: [true, true, true, false, true] },
  { name: "Competitor B", highlighted: false, hits: [true, true, false, true, false] },
  { name: "Competitor C", highlighted: false, hits: [true, false, true, false, false] },
];

function PlatformMark({ hit }: { hit: boolean }) {
  return hit ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/18 text-emerald-600">
      <Check className="h-3.5 w-3.5" />
    </span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/14 text-red-500">
      <X className="h-3.5 w-3.5" />
    </span>
  );
}

function CountUpScore({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return <span>{value}</span>;
}

export function ScoreScreen() {
  const score = 42;
  const circumference = useMemo(() => 2 * Math.PI * 46, []);
  const dashOffset = useMemo(() => circumference * (1 - score / 100), [circumference, score]);

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_18%,#eef2f3_100%)] px-4 pb-4 pt-3 text-slate-900">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        <span>VizBiz</span>
        <span>Result</span>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Your AI Visibility Score
        </p>

        <div className="relative mx-auto mt-4 flex h-34 w-34 items-center justify-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#b6ff2e"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="relative flex flex-col items-center justify-center">
            <div className="font-mono text-[2.25rem] font-bold leading-none text-lime-600">
              <CountUpScore target={score} />
            </div>
            <div className="mt-1 text-xs font-semibold tracking-[0.18em] text-slate-400">/100</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-slate-200 bg-white/90 p-3 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
        <div className="space-y-2.5">
          {platformStatus.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between gap-3 text-sm text-slate-700">
              <span>{platform.name}</span>
              <PlatformMark hit={platform.hit} />
            </div>
          ))}
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.03, y: -1, boxShadow: "0 14px 30px rgba(182,255,46,0.22)" }} className="mt-auto pt-4">
        <Link
          href="/intake"
          className="flex min-h-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111111_0%,#b6ff2e_100%)] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(182,255,46,0.2)]"
        >
          Get My Audit
        </Link>
      </motion.div>
    </div>
  );
}

export function AuditReportScreen() {
  const bars = [
    { name: "Oakville Honda", value: 42, color: "bg-lime-400" },
    { name: "Competitor A", value: 58, color: "bg-emerald-500" },
    { name: "Competitor B", value: 51, color: "bg-cyan-500" },
    { name: "Competitor C", value: 47, color: "bg-slate-400" },
  ];

  return (
    <div className="h-full overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 pb-4 pt-3 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">VizBiz</p>
          <h3 className="mt-1 text-sm font-semibold">AI Visibility Audit</h3>
        </div>
        <div className="rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-800">
          Report
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Dealership</p>
        <p className="mt-1 text-base font-semibold text-slate-900">Oakville Honda</p>
        <p className="mt-3 text-sm leading-5 text-slate-600">Executive summary snippet</p>
        <p className="mt-2 text-sm leading-5 text-slate-600">
          Your store appears inconsistently in buyer-intent answers, while two nearby competitors show
          up far more often in financing and trust-focused prompts.
        </p>
      </div>

      <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Score bar chart</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">You vs 3 competitors</p>
        </div>
        <div className="mt-3 space-y-2.5">
          {bars.map((bar) => (
            <div key={bar.name}>
              <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-600">
                <span>{bar.name}</span>
                <span className="font-mono text-slate-900">{bar.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className={`${bar.color} h-full rounded-full`} style={{ width: `${bar.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Findings</p>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <div className="rounded-xl bg-slate-50 px-3 py-2">Trust signals are weaker than the local average.</div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">Financing prompts favor stores with more review coverage.</div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">Location pages need better model/brand specificity.</div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/85 to-transparent" />
      </div>
    </div>
  );
}

export function CompetitorAnalysisScreen() {
  return (
    <div className="h-full bg-[linear-gradient(180deg,#ffffff_0%,#f7fff0_100%)] px-4 pb-4 pt-3 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">VizBiz</p>
          <h3 className="mt-1 text-sm font-semibold">Competitor Analysis</h3>
        </div>
        <div className="rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-800">
          Snapshot
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="grid grid-cols-[1.2fr_repeat(5,minmax(0,1fr))] gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          <span>Store</span>
          <span className="text-center">CG</span>
          <span className="text-center">GE</span>
          <span className="text-center">PX</span>
          <span className="text-center">CL</span>
          <span className="text-center">CP</span>
        </div>

        <div className="mt-3 space-y-2">
          {competitorRows.map((row) => (
            <div
              key={row.name}
              className={`grid grid-cols-[1.2fr_repeat(5,minmax(0,1fr))] items-center gap-2 rounded-2xl border px-3 py-2.5 ${
                row.highlighted
                  ? "border-lime-200 bg-[linear-gradient(135deg,rgba(182,255,46,0.14)_0%,rgba(17,17,17,0.06)_100%)]"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <span className={`text-xs font-semibold ${row.highlighted ? "text-lime-800" : "text-slate-700"}`}>
                {row.name}
              </span>
              {row.hits.map((hit, index) => (
                <span key={`${row.name}-${index}`} className="flex justify-center">
                  <PlatformMark hit={hit} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-lime-200 bg-lime-50/80 p-3 text-sm leading-5 text-slate-700">
        Your store is visible on fewer platforms than the local leaders.
      </div>
    </div>
  );
}

export default function PhoneMockup({ children, className = "", priority = false }: PhoneMockupProps) {
  return (
    <div
      className={`relative w-full max-w-[280px] rounded-[46px] border border-white/10 bg-[linear-gradient(180deg,#111111_0%,#020202_100%)] p-[10px] shadow-[0_34px_110px_rgba(0,0,0,0.48)] before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[44px] before:border before:border-white/6 before:content-[''] ${className}`}
    >
      <div className="pointer-events-none absolute inset-[3px] rounded-[41px] border border-white/8" />
      <div className="pointer-events-none absolute inset-x-[16%] top-[7px] h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-[14px] z-20 h-7 w-30 -translate-x-1/2 rounded-full bg-black/90 shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]" />
      <div className="pointer-events-none absolute left-[14px] top-30 h-12 w-[3px] rounded-full bg-white/12" />
      <div className="pointer-events-none absolute right-[14px] top-34 h-18 w-[3px] rounded-full bg-white/12" />
      <div className="pointer-events-none absolute right-[14px] top-56 h-12 w-[3px] rounded-full bg-white/12" />

      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[34px] bg-white">
        <div className="relative z-10 h-full">{children}</div>
        <div
          className={`pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(120deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.05)_22%,transparent_42%,rgba(255,255,255,0.1)_74%,transparent_100%)] ${
            priority ? "opacity-100" : "opacity-80"
          }`}
        />
      </div>
    </div>
  );
}
