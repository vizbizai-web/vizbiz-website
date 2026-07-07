import type { SnapshotDiff } from './snapshot-diff';

export type MonthlyOnePager = {
  title: string;
  scoreLine: string;
  platformLines: string[];
  movementLines: string[];
  nextFocus: string;
};

export function buildMonthlyOnePager(input: { businessName: string; diff: SnapshotDiff; fixDropTitles: string[] }): MonthlyOnePager {
  if (!input.diff.comparable) {
    return {
      title: `${input.businessName}: monthly AI visibility report`,
      scoreLine: 'Re-baselined this month — score trend will resume after the next comparable snapshot.',
      platformLines: ['Re-baselined: prompt counts changed, so platform deltas are intentionally withheld.'],
      movementLines: ['This cycle created a new baseline instead of a month-over-month delta.'],
      nextFocus: input.fixDropTitles.length ? `This month's Fix Drop: ${input.fixDropTitles.join(', ')}` : 'No Fix Drop was generated this month.',
    };
  }
  const prev = input.diff.scoreDelta.blended.previous;
  const curr = input.diff.scoreDelta.blended.current;
  const prevScore = prev === null ? null : Math.round(prev * 100);
  const currScore = curr === null ? null : Math.round(curr * 100);
  const delta = input.diff.scoreDelta.blended.delta === null ? null : Math.round(input.diff.scoreDelta.blended.delta * 100);
  const scoreLine = prevScore === null || currScore === null
    ? 'Score trend will appear after the next comparable snapshot.'
    : `${prevScore} → ${currScore}${delta === null ? '' : delta >= 0 ? ` ▲ +${delta}` : ` ▼ ${delta}`}`;
  return {
    title: `${input.businessName}: monthly AI visibility report`,
    scoreLine,
    platformLines: input.diff.scoreDelta.platforms.map((p) => `${p.provider}: ${Math.round((p.previousRate || 0) * 100)}% → ${Math.round((p.currentRate || 0) * 100)}%`),
    movementLines: [
      ...input.diff.promptMovements.gained.slice(0, 5).map((m) => `Newly appearing for: ${m.prompt}`),
      ...input.diff.promptMovements.lost.slice(0, 5).map((m) => `No longer appearing for: ${m.prompt}`),
      ...input.diff.readinessChanges.disappeared.slice(0, 5).map((key) => `Readiness item went missing: ${key}`),
      ...input.diff.readinessChanges.appeared.slice(0, 5).map((key) => `Readiness item now present: ${key}`),
    ],
    nextFocus: input.fixDropTitles.length ? `This month's Fix Drop: ${input.fixDropTitles.join(', ')}` : 'No Fix Drop was generated this month.',
  };
}

export function validateOnePagerNumbers(onePager: MonthlyOnePager, diff: SnapshotDiff): string[] {
  const errors: string[] = [];
  const comparableText = JSON.stringify({ scoreLine: onePager.scoreLine, platformLines: onePager.platformLines, movementLines: onePager.movementLines, nextFocus: onePager.nextFocus });
  const numbersInText = (comparableText.match(/\b\d+\b/g) || [])
    .map((raw) => ({ raw, value: Number(raw) }))
    // QA/business names can contain timestamp-like identifiers. Those are not
    // narrative performance numbers, and blocking them previously hid the real
    // risk: incomparable snapshot deltas. Keep validation focused on human-scale
    // report metrics while fixture 11 blocks fake deltas mechanically.
    .filter(({ raw }) => raw.length < 8)
    .map(({ value }) => value);
  const allowed = new Set<number>();
  for (const value of [diff.scoreDelta.blended.previous, diff.scoreDelta.blended.current, diff.scoreDelta.blended.delta]) {
    if (typeof value === 'number') allowed.add(Math.abs(Math.round(value * 100)));
  }
  for (const p of diff.scoreDelta.platforms) {
    for (const value of [p.previousRate, p.currentRate, p.delta]) if (typeof value === 'number') allowed.add(Math.abs(Math.round(value * 100)));
    allowed.add(p.previousCount); allowed.add(p.currentCount); allowed.add(p.totalPrompts);
  }
  for (const n of numbersInText) {
    if (n > 0 && !allowed.has(Math.abs(n))) errors.push(`unsupported_number:${n}`);
  }
  return [...new Set(errors)];
}
