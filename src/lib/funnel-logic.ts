export type ClientReportAccessInput = {
  status?: string | null;
  researchStatus?: string | null;
  hasResearchData?: boolean;
};

export type ClientReportAccessState = 'ready' | 'processing';

const CLIENT_READY_STATUSES = new Set([
  'approved',
  'email_drafted',
  'contacted',
  'closed_won',
  'paid_report_ready_for_review',
  'paid_report_delivered',
]);

export function buildPostIntakeRedirect(leadId?: string | null): string {
  const suffix = leadId ? `&lid=${encodeURIComponent(leadId)}` : '';
  return `/thank-you?submitted=1${suffix}`;
}

export function getClientReportAccessState(input: ClientReportAccessInput): ClientReportAccessState {
  if (!CLIENT_READY_STATUSES.has(input.status || '')) return 'processing';
  if (input.researchStatus !== 'complete') return 'processing';
  if (!input.hasResearchData) return 'processing';
  return 'ready';
}

export function getSeparateCompetitorNames(value?: string | null): string[] {
  return (value || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

export type LocalTrustInput = {
  googleReviews?: number | null;
  competitorSocial?: Array<{ name?: string; googleReviews?: number | null }> | null;
  competitorValidations?: Array<{ name?: string; validationStatus?: string | null; rating?: number | null; userReviewCount?: number | null; distanceFromClientKm?: number | null }> | null;
};

export function hasVerifiedLocalTrustData(input: LocalTrustInput): boolean {
  if (typeof input.googleReviews === 'number') return true;
  if ((input.competitorSocial || []).some((item) => typeof item.googleReviews === 'number')) return true;
  return (input.competitorValidations || []).some((item) =>
    item.validationStatus === 'validated' ||
    typeof item.rating === 'number' ||
    typeof item.userReviewCount === 'number'
  );
}
