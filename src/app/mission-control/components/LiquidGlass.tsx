'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getLiquidGlassFilter, GLASS_PRESETS } from '../lib/liquid-glass';

type GlassPreset = keyof typeof GLASS_PRESETS;

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
  preset?: GlassPreset;
  tint?: string; // e.g. 'rgba(37, 209, 242, 0.03)' for cyan tint
  blur?: number;
  noFilter?: boolean; // fallback: just glassmorphism, no displacement
}

export function LiquidGlass({
  children,
  className = '',
  borderRadius = 16,
  preset = 'card',
  tint = 'rgba(255, 255, 255, 0.03)',
  blur,
  noFilter = false,
}: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('');
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  const presetConfig = GLASS_PRESETS[preset];
  const effectiveBlur = blur ?? presetConfig.blur;

  useEffect(() => {
    if (noFilter || !containerRef.current) return;

    const el = containerRef.current;
    const { width, height } = el.getBoundingClientRect();

    if (width < 10 || height < 10) return;

    setDimensions({ w: width, h: height });
    setFilter(getLiquidGlassFilter({
      width: Math.round(width),
      height: Math.round(height),
      radius: borderRadius,
      depth: presetConfig.depth,
      strength: presetConfig.strength,
      chromaticAberration: presetConfig.chromaticAberration,
    }));
  }, [borderRadius, presetConfig, noFilter]);

  const backdropStyle = filter
    ? `url("${filter}") blur(${effectiveBlur}px) saturate(150%)`
    : `blur(${effectiveBlur}px) saturate(150%)`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius }}
    >
      {/* Refraction / Glass backdrop layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: backdropStyle,
          WebkitBackdropFilter: backdropStyle,
          zIndex: 1,
        }}
      />

      {/* Tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: tint,
          zIndex: 2,
          borderRadius,
        }}
      />

      {/* Subtle border glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
          zIndex: 3,
        }}
      />

      {/* Content */}
      <div className="relative" style={{ zIndex: 4 }}>
        {children}
      </div>
    </div>
  );
}

// Lightweight version for small elements (buttons, badges, metric cards)
export function GlassCard({
  children,
  className = '',
  tint = 'rgba(255, 255, 255, 0.02)',
  blur = 12,
  borderRadius = 16,
}: {
  children: React.ReactNode;
  className?: string;
  tint?: string;
  blur?: number;
  borderRadius?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius }}
    >
      {/* Glass backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: `blur(${blur}px) saturate(140%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(140%)`,
          zIndex: 1,
        }}
      />
      {/* Tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: tint, zIndex: 2, borderRadius }}
      />
      {/* Border glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
          zIndex: 3,
        }}
      />
      {/* Content */}
      <div className="relative" style={{ zIndex: 4 }}>
        {children}
      </div>
    </div>
  );
}

// Liquid Glass button
export function GlassButton({
  children,
  className = '',
  onClick,
  disabled = false,
  color = '#25D1F2',
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.03] hover:-rotate-[0.5deg] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:hover:rotate-0 ${className}`}
      style={{
        borderRadius: 10,
        background: `${color}10`,
        color,
        border: `1px solid ${color}25`,
        boxShadow: `0 0 1px ${color}40, inset 0 1px 0 0 rgba(255,255,255,0.06)`,
        backdropFilter: 'blur(8px) saturate(130%)',
        WebkitBackdropFilter: 'blur(8px) saturate(130%)',
      }}
    >
      {children}
    </button>
  );
}
