export function stripeTierToPaidPlan(tier: string): 'full_report_fix' | 'monthly_growth' {
  return tier === 'fix_and_monitor' ? 'monthly_growth' : 'full_report_fix';
}

export function buildStripeCheckoutSuccessUrl(leadId: string, tier: string): string {
  return `https://vizbiz.ai/paid-intake/${encodeURIComponent(leadId)}?plan=${stripeTierToPaidPlan(tier)}&paid=1`;
}

export function buildStripeCheckoutFallbackUrl(tier: string): string {
  return tier === 'fix_and_monitor'
    ? 'https://buy.stripe.com/5kQ7sMdn103Q2P22MM24003'
    : 'https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002';
}
