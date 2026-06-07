export function stripeTierToPaidPlan(tier: string): 'full_report_fix' | 'monthly_growth' {
  return tier === 'fix_and_monitor' ? 'monthly_growth' : 'full_report_fix';
}

export function buildStripeCheckoutSuccessUrl(leadId: string, tier: string): string {
  return `https://vizbiz.ai/paid-intake/${encodeURIComponent(leadId)}?plan=${stripeTierToPaidPlan(tier)}&paid=1`;
}
