import type { AuditSnapshot, SnapshotPromptResult } from './audit-snapshots';
import { stableJson } from './audit-snapshots';

export type PromptMovement = { prompt: string; provider: string };
export type CompetitorMovement = { competitor: string; prompt: string; provider: string };

export type SnapshotDiff = {
  previousSequence: number;
  currentSequence: number;
  comparable: boolean;
  incomparableReason?: string;
  scoreDelta: {
    blended: { previous: number | null; current: number | null; delta: number | null };
    platforms: { provider: string; previousRate: number | null; currentRate: number | null; delta: number | null; previousCount: number; currentCount: number; previousTotalPrompts: number; currentTotalPrompts: number; totalPrompts: number }[];
    band: { previous: string | null; current: string | null; changed: boolean };
  };
  promptMovements: {
    gained: PromptMovement[];
    lost: PromptMovement[];
    held: PromptMovement[];
    newlyTracked: PromptMovement[];
  };
  competitorMovements: {
    gained: CompetitorMovement[];
    lost: CompetitorMovement[];
    shareOfVoice: { name: string; previous: number; current: number; delta: number }[];
  };
  readinessChanges: {
    appeared: string[];
    disappeared: string[];
    changed: { key: string; previous: unknown; current: unknown }[];
  };
  excludedPromptKeys: string[];
};

function promptKey(result: Pick<SnapshotPromptResult, 'prompt' | 'provider'>): string {
  return `${result.provider || 'unknown'}::${result.prompt}`;
}

function movementFromKey(key: string): PromptMovement {
  const [provider, ...rest] = key.split('::');
  return { provider, prompt: rest.join('::') };
}

function sortedMovements(items: PromptMovement[]): PromptMovement[] {
  return [...items].sort((a, b) => (a.provider + a.prompt).localeCompare(b.provider + b.prompt));
}

function resultMap(snapshot: AuditSnapshot): Map<string, SnapshotPromptResult> {
  const map = new Map<string, SnapshotPromptResult>();
  for (const result of snapshot.promptResults || []) map.set(promptKey(result), result);
  return map;
}

function refreshedKeySet(snapshot: AuditSnapshot): Set<string> {
  const refreshed = new Set<string>();
  const ids = snapshot.promptPlan?.refreshedPromptIds || [];
  for (const id of ids) refreshed.add(id);
  for (const result of snapshot.promptResults || []) {
    if (refreshed.has(result.prompt) || refreshed.has(promptKey(result))) refreshed.add(promptKey(result));
  }
  return refreshed;
}

function round4(n: number): number {
  return Number(n.toFixed(4));
}

function rateDelta(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  return round4(current - previous);
}

function normalizeRate(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function platformScoreDelta(current: AuditSnapshot, previous: AuditSnapshot): SnapshotDiff['scoreDelta']['platforms'] {
  const providers = new Set<string>();
  for (const score of previous.platformScores || []) providers.add(score.provider);
  for (const score of current.platformScores || []) providers.add(score.provider);
  return Array.from(providers).sort().map((provider) => {
    const prev = previous.platformScores?.find((score) => score.provider === provider);
    const curr = current.platformScores?.find((score) => score.provider === provider);
    const previousRate = normalizeRate(prev?.appearanceRate);
    const currentRate = normalizeRate(curr?.appearanceRate);
    return {
      provider,
      previousRate,
      currentRate,
      delta: rateDelta(currentRate, previousRate),
      previousCount: prev?.appearedCount || 0,
      currentCount: curr?.appearedCount || 0,
      previousTotalPrompts: prev?.totalPrompts || 0,
      currentTotalPrompts: curr?.totalPrompts || 0,
      totalPrompts: Math.max(prev?.totalPrompts || 0, curr?.totalPrompts || 0),
    };
  });
}


function comparabilityFailure(current: AuditSnapshot, previous: AuditSnapshot): string | null {
  const providers = new Set<string>();
  for (const score of previous.platformScores || []) providers.add(score.provider);
  for (const score of current.platformScores || []) providers.add(score.provider);
  for (const provider of Array.from(providers).sort()) {
    const prev = previous.platformScores?.find((score) => score.provider === provider);
    const curr = current.platformScores?.find((score) => score.provider === provider);
    const prevTotal = prev?.totalPrompts || 0;
    const currTotal = curr?.totalPrompts || 0;
    if (prevTotal !== currTotal) return `platform_total_prompts_mismatch:${provider}:${prevTotal}->${currTotal}`;
  }
  return null;
}

function emptyMovements(): SnapshotDiff['promptMovements'] {
  return { gained: [], lost: [], held: [], newlyTracked: [] };
}

function computePromptMovements(current: AuditSnapshot, previous: AuditSnapshot): SnapshotDiff['promptMovements'] & { excluded: string[] } {
  const prev = resultMap(previous);
  const curr = resultMap(current);
  const refreshed = refreshedKeySet(current);
  const gained: PromptMovement[] = [];
  const lost: PromptMovement[] = [];
  const held: PromptMovement[] = [];
  const newlyTracked: PromptMovement[] = [];
  const keys = new Set([...prev.keys(), ...curr.keys()]);
  for (const key of Array.from(keys).sort()) {
    const c = curr.get(key);
    const p = prev.get(key);
    if (refreshed.has(key) || (!p && c)) {
      if (c) newlyTracked.push(movementFromKey(key));
      continue;
    }
    const was = Boolean(p?.businessAppeared);
    const is = Boolean(c?.businessAppeared);
    if (!was && is) gained.push(movementFromKey(key));
    else if (was && !is) lost.push(movementFromKey(key));
    else if (was && is) held.push(movementFromKey(key));
  }
  return { gained: sortedMovements(gained), lost: sortedMovements(lost), held: sortedMovements(held), newlyTracked: sortedMovements(newlyTracked), excluded: Array.from(refreshed).sort() };
}

function competitorKey(result: SnapshotPromptResult): string | null {
  const name = (result.competitorName || '').trim();
  if (!name) return null;
  return `${name}::${result.provider || 'unknown'}::${result.prompt}`;
}

function competitorMovementFromKey(key: string): CompetitorMovement {
  const [competitor, provider, ...promptParts] = key.split('::');
  return { competitor, provider, prompt: promptParts.join('::') };
}

function computeCompetitorMovements(current: AuditSnapshot, previous: AuditSnapshot): SnapshotDiff['competitorMovements'] {
  const prev = new Map<string, boolean>();
  const curr = new Map<string, boolean>();
  for (const result of previous.promptResults || []) {
    const key = competitorKey(result);
    if (key) prev.set(key, Boolean(result.competitorAppeared));
  }
  for (const result of current.promptResults || []) {
    const key = competitorKey(result);
    if (key) curr.set(key, Boolean(result.competitorAppeared));
  }
  const gained: CompetitorMovement[] = [];
  const lost: CompetitorMovement[] = [];
  const keys = new Set([...prev.keys(), ...curr.keys()]);
  for (const key of Array.from(keys).sort()) {
    const was = Boolean(prev.get(key));
    const is = Boolean(curr.get(key));
    if (!was && is) gained.push(competitorMovementFromKey(key));
    if (was && !is) lost.push(competitorMovementFromKey(key));
  }

  const byName = new Map<string, { prevAppear: number; prevTotal: number; currAppear: number; currTotal: number }>();
  for (const result of previous.promptResults || []) {
    if (!result.competitorName) continue;
    const item = byName.get(result.competitorName) || { prevAppear: 0, prevTotal: 0, currAppear: 0, currTotal: 0 };
    item.prevTotal += 1;
    if (result.competitorAppeared) item.prevAppear += 1;
    byName.set(result.competitorName, item);
  }
  for (const result of current.promptResults || []) {
    if (!result.competitorName) continue;
    const item = byName.get(result.competitorName) || { prevAppear: 0, prevTotal: 0, currAppear: 0, currTotal: 0 };
    item.currTotal += 1;
    if (result.competitorAppeared) item.currAppear += 1;
    byName.set(result.competitorName, item);
  }
  const shareOfVoice = Array.from(byName.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([name, v]) => {
    const previousShare = v.prevTotal ? v.prevAppear / v.prevTotal : 0;
    const currentShare = v.currTotal ? v.currAppear / v.currTotal : 0;
    return { name, previous: round4(previousShare), current: round4(currentShare), delta: round4(currentShare - previousShare) };
  });

  return {
    gained: gained.sort((a, b) => stableJson(a).localeCompare(stableJson(b))),
    lost: lost.sort((a, b) => stableJson(a).localeCompare(stableJson(b))),
    shareOfVoice,
  };
}

function readinessChanges(current: AuditSnapshot, previous: AuditSnapshot): SnapshotDiff['readinessChanges'] {
  const appeared: string[] = [];
  const disappeared: string[] = [];
  const changed: { key: string; previous: unknown; current: unknown }[] = [];
  const keys = new Set([...Object.keys(previous.readiness || {}), ...Object.keys(current.readiness || {})]);
  for (const key of Array.from(keys).sort()) {
    const prev = previous.readiness?.[key];
    const curr = current.readiness?.[key];
    if ((prev === null || prev === undefined || prev === false) && curr === true) appeared.push(key);
    else if (prev === true && (curr === null || curr === undefined || curr === false)) disappeared.push(key);
    else if (stableJson(prev) !== stableJson(curr)) changed.push({ key, previous: prev, current: curr });
  }
  return { appeared, disappeared, changed };
}

export function diffSnapshots(current: AuditSnapshot, previous: AuditSnapshot): SnapshotDiff {
  const incomparableReason = comparabilityFailure(current, previous);
  const comparable = !incomparableReason;
  const promptMovements = comparable ? computePromptMovements(current, previous) : { ...emptyMovements(), excluded: [] };
  const previousBlended = comparable ? normalizeRate(previous.blendedScore) : null;
  const currentBlended = comparable ? normalizeRate(current.blendedScore) : null;
  return {
    previousSequence: previous.sequence,
    currentSequence: current.sequence,
    comparable,
    incomparableReason: incomparableReason || undefined,
    scoreDelta: {
      blended: { previous: previousBlended, current: currentBlended, delta: comparable ? rateDelta(currentBlended, previousBlended) : null },
      platforms: comparable ? platformScoreDelta(current, previous) : platformScoreDelta(current, previous).map((p) => ({ ...p, previousRate: null, currentRate: null, delta: null })),
      band: { previous: comparable ? previous.band : null, current: comparable ? current.band : null, changed: comparable ? previous.band !== current.band : false },
    },
    promptMovements: {
      gained: promptMovements.gained,
      lost: promptMovements.lost,
      held: promptMovements.held,
      newlyTracked: promptMovements.newlyTracked,
    },
    competitorMovements: comparable ? computeCompetitorMovements(current, previous) : { gained: [], lost: [], shareOfVoice: [] },
    readinessChanges: comparable ? readinessChanges(current, previous) : { appeared: [], disappeared: [], changed: [] },
    excludedPromptKeys: promptMovements.excluded,
  };
}

export function renderMovementCopy(diff: SnapshotDiff): string[] {
  if (!diff.comparable) return ['This cycle was re-baselined because the prompt counts changed; trend movement will resume after the next comparable run.'];
  const lines: string[] = [];
  if (diff.promptMovements.gained.length) {
    lines.push(`Newly appearing for: ${diff.promptMovements.gained.map((m) => m.prompt).slice(0, 5).join('; ')}`);
  }
  if (diff.promptMovements.lost.length) {
    lines.push(`No longer appearing for: ${diff.promptMovements.lost.map((m) => m.prompt).slice(0, 5).join('; ')}`);
  }
  if (!lines.length) lines.push('No prompt-level visibility movement this cycle.');
  return lines;
}
