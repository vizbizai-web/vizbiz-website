import type { AuditSnapshot } from './audit-snapshots';
import { diffSnapshots, renderMovementCopy, type SnapshotDiff } from './snapshot-diff';

export type MonthlyTrendPoint = {
  sequence: number;
  label: string;
  score: number | null;
  band: string | null;
  createdAt?: string;
  platformRates: { provider: string; label: string; rate: number | null }[];
};

export type MonthlyTrendModel = {
  hasComparison: boolean;
  baselineCopy: string;
  points: MonthlyTrendPoint[];
  latestDiff: SnapshotDiff | null;
  movementCopy: string[];
};

function monthLabel(createdAt?: string, sequence?: number): string {
  if (!createdAt) return `Snapshot ${sequence || ''}`.trim();
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return `Snapshot ${sequence || ''}`.trim();
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function pctScore(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export function buildMonthlyTrendModel(snapshots: AuditSnapshot[]): MonthlyTrendModel {
  const ordered = [...(snapshots || [])].filter((snapshot) => snapshot.status === 'complete').sort((a, b) => a.sequence - b.sequence);
  const points = ordered.map((snapshot) => ({
    sequence: snapshot.sequence,
    label: monthLabel(snapshot.createdAt, snapshot.sequence),
    score: pctScore(snapshot.blendedScore),
    band: snapshot.band,
    createdAt: snapshot.createdAt,
    platformRates: (snapshot.platformScores || []).map((score) => ({
      provider: score.provider,
      label: score.label,
      rate: pctScore(score.appearanceRate),
    })),
  }));
  const latest = ordered.at(-1);
  const previous = ordered.length >= 2 ? ordered.at(-2) : null;
  const latestDiff = latest && previous ? diffSnapshots(latest, previous) : null;
  const baselineDate = ordered[0]?.createdAt ? monthLabel(ordered[0].createdAt, ordered[0].sequence) : 'this audit';
  return {
    hasComparison: Boolean(latestDiff?.comparable),
    baselineCopy: latestDiff
      ? latestDiff.comparable
        ? 'Trend comparison is based on immutable audit snapshots.'
        : 'Re-baselined this month because prompt counts changed; next comparable monthly snapshot will restart trend movement.'
      : `Baseline recorded ${baselineDate} — first trend comparison arrives next month.`,
    points,
    latestDiff,
    movementCopy: latestDiff ? renderMovementCopy(latestDiff) : [],
  };
}
