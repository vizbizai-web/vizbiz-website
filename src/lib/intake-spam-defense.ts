export type IntakeSpamDecision = {
  ok: boolean;
  reason?: 'honeypot_filled' | 'submitted_too_fast' | 'rate_limited';
  score: number;
};

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const MIN_SUBMIT_MS = 2500;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function checkThrottle(key: string, now = Date.now()): boolean {
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  existing.count += 1;
  return existing.count <= MAX_PER_WINDOW;
}

export function assessIntakeSpam(payload: Record<string, string | undefined>, request: Request, now = Date.now()): IntakeSpamDecision {
  const website = (payload.website || payload.companyWebsite || payload.url || '').trim();
  if (website) return { ok: false, reason: 'honeypot_filled', score: 100 };

  const submittedAtRaw = payload.formStartedAt || payload.submittedAt || '';
  if (submittedAtRaw) {
    const submittedAt = Number.parseInt(submittedAtRaw, 10);
    if (Number.isFinite(submittedAt) && now - submittedAt >= 0 && now - submittedAt < MIN_SUBMIT_MS) {
      return { ok: false, reason: 'submitted_too_fast', score: 85 };
    }
  }

  if (!checkThrottle(clientKey(request), now)) return { ok: false, reason: 'rate_limited', score: 75 };
  return { ok: true, score: 0 };
}

export function resetIntakeSpamBucketsForTest() {
  buckets.clear();
}
