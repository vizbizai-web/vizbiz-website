export function stripeTierToPaidPlan(tier: string): 'full_report_fix' | 'monthly_growth' {
  return tier === 'fix_and_monitor' ? 'monthly_growth' : 'full_report_fix';
}

export function buildStripeCheckoutSuccessUrl(leadId: string, tier: string): string {
  return `https://vizbiz.ai/paid-intake/${encodeURIComponent(leadId)}?plan=${stripeTierToPaidPlan(tier)}&paid=1`;
}

const PAYMENT_LINKS: Record<string, { url: string; id: string }> = {
  fix: {
    url: 'https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002',
    id: 'plink_1TVjhDLnxAAOKS2rP9Xo3hPo',
  },
  fix_and_monitor: {
    url: 'https://buy.stripe.com/5kQ7sMdn103Q2P22MM24003',
    id: 'plink_1TVjhwLnxAAOKS2r4FSOWweF',
  },
};

export function stripePaymentLinkToTier(paymentLinkId?: string | null): 'fix' | 'fix_and_monitor' {
  return paymentLinkId === PAYMENT_LINKS.fix_and_monitor.id ? 'fix_and_monitor' : 'fix';
}

export function buildStripeCheckoutFallbackUrl(tier: string, leadId?: string, email?: string): string {
  const link = tier === 'fix_and_monitor' ? PAYMENT_LINKS.fix_and_monitor.url : PAYMENT_LINKS.fix.url;
  const url = new URL(link);
  if (leadId) url.searchParams.set('client_reference_id', leadId);
  if (email) url.searchParams.set('prefilled_email', email);
  return url.toString();
}
