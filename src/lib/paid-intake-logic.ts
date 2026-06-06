export type PaidPlan = 'full_report_fix' | 'monthly_growth';

export type PaidIntakeInput = Record<string, string | undefined> & {
  plan?: string;
  businessCategory?: string;
  mainServices?: string;
  idealCustomer?: string;
  differentiator?: string;
  competitor1Name?: string;
  competitor1Website?: string;
  competitor2Name?: string;
  competitor2Website?: string;
  customerQuestions?: string;
  goal?: string;
  googleBusinessProfile?: string;
  socialLinks?: string;
  proofSignals?: string;
  monthlyFocus?: string;
  websitePlatform?: string;
};

export type PaidIntakePayload = {
  plan: PaidPlan;
  submittedAt: string;
  estimatedMinutes: 5;
  businessCategory: string;
  mainServices: string;
  idealCustomer: string;
  differentiator: string;
  competitors: Array<{ name: string; website: string }>;
  googleBusinessProfile: string;
  socialLinks: string;
  proofSignals: string;
  customerQuestions: string[];
  goal: string;
  monthlyFocus: string;
  websitePlatform: string;
  requiredComplete: boolean;
};

export function normalizePaidPlan(value?: string | null): PaidPlan {
  return value === 'monthly_growth' ? 'monthly_growth' : 'full_report_fix';
}

export function getPaidIntakeStatusAfterPayment(): string {
  return 'paid_intake_pending';
}

export function getPaidIntakeNextStepUrl(leadId: string, plan?: string): string {
  return `/paid-intake/${encodeURIComponent(leadId)}?plan=${normalizePaidPlan(plan)}`;
}

function clean(value?: string): string {
  return (value || '').trim();
}

function normalizeUrl(value?: string): string {
  const trimmed = clean(value);
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function questionList(value?: string): string[] {
  return clean(value)
    .split(/\n|\r|;/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function buildPaidIntakePayload(input: PaidIntakeInput, now = new Date()): PaidIntakePayload {
  const competitors = [
    { name: clean(input.competitor1Name), website: normalizeUrl(input.competitor1Website) },
    { name: clean(input.competitor2Name), website: normalizeUrl(input.competitor2Website) },
  ];

  const payload: PaidIntakePayload = {
    plan: normalizePaidPlan(input.plan),
    submittedAt: now.toISOString(),
    estimatedMinutes: 5,
    businessCategory: clean(input.businessCategory),
    mainServices: clean(input.mainServices),
    idealCustomer: clean(input.idealCustomer),
    differentiator: clean(input.differentiator),
    competitors,
    googleBusinessProfile: normalizeUrl(input.googleBusinessProfile),
    socialLinks: clean(input.socialLinks),
    proofSignals: clean(input.proofSignals),
    customerQuestions: questionList(input.customerQuestions),
    goal: clean(input.goal),
    monthlyFocus: clean(input.monthlyFocus),
    websitePlatform: clean(input.websitePlatform),
    requiredComplete: false,
  };

  payload.requiredComplete = Boolean(
    payload.businessCategory &&
    payload.mainServices &&
    payload.idealCustomer &&
    payload.goal &&
    payload.competitors.length === 2 &&
    payload.competitors.every((competitor) => competitor.name)
  );

  return payload;
}

export function paidIntakeNotesBlock(payload: PaidIntakePayload): string {
  return `PAID_INTAKE:${JSON.stringify(payload)}`;
}
