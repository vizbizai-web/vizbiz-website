import type { LeadRow } from './google-sheets';
import { cleanIntakeBusinessCategory, cleanIntakeText } from './intake-normalization';

export type PaidPlan = 'full_report_fix' | 'monthly_growth';

export type PaidIntakeInput = Record<string, string | undefined> & {
  leadId?: string;
  contactPersonName?: string;
  confirmedBusinessCategory?: string;
  confirmedServices?: string;
  confirmedCompetitors?: string;
  confirmedLocation?: string;
  customerQuestions?: string;
  proofAssets?: string;
  webVendorEmail?: string;
  gbpAccessStatus?: string;
  priorityService?: string;
};

export type PaidIntakePrefill = {
  businessCategory: string;
  services: string;
  competitors: string;
  location: string;
  googleBusinessProfile: string;
  source: 'resolved_profile_places';
};

export type PaidIntakePayload = {
  plan: PaidPlan;
  submittedAt: string;
  estimatedMinutes: 3;
  contactPersonName: string;
  businessCategory: string;
  mainServices: string;
  competitors: Array<{ name: string; website: string }>;
  location: string;
  customerQuestions: string[];
  proofAssets: string[];
  webVendorEmail: string;
  gbpAccessStatus: string;
  priorityService: string;
  clientVerified: {
    evidenceTier: 'client_verified';
    source: 'paid_intake_confirm_and_enrich';
    verifiedAt: string;
    corrections: string[];
    prefill: PaidIntakePrefill;
  };
  // Backward-compatible aliases consumed by existing report/fix-kit code.
  proofSignals: string;
  trustAssets: string[];
  requiredComplete: boolean;
};

export function normalizePaidPlan(value?: string | null): PaidPlan {
  return value === 'monthly_growth' ? 'monthly_growth' : 'full_report_fix';
}

export function derivePaidPlanFromLead(lead: Pick<LeadRow, 'notes'>): PaidPlan {
  const notes = lead.notes || '';
  const intake = parseExistingPaidIntake(notes);
  if (intake?.plan) return normalizePaidPlan(intake.plan);
  const payment = Array.from(notes.matchAll(/\[PAYMENT_CONFIRMED[^\]]*\]\s*tier=([^;\n]+)/gi)).at(-1)?.[1]?.trim();
  if (payment === 'fix_and_monitor' || payment === 'monthly_growth') return 'monthly_growth';
  return 'full_report_fix';
}

export function getPaidIntakeStatusAfterPayment(): string {
  return 'paid_intake_pending';
}

export function getPaidIntakeNextStepUrl(leadId: string): string {
  return `/paid-intake/${encodeURIComponent(leadId)}`;
}

function clean(value?: string): string {
  return cleanIntakeText(value);
}

function normalizeUrl(value?: string): string {
  const trimmed = clean(value);
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function splitLines(value?: string, limit = 5): string[] {
  return (value || '').trim()
    .split(/\n|\r|;/)
    .map((item) => clean(item))
    .filter(Boolean)
    .slice(0, limit);
}

function splitCompetitors(value?: string): Array<{ name: string; website: string }> {
  return (value || '')
    .split(/\n|\r|;/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((item) => {
      const [name, website = ''] = item.split('|').map((part) => clean(part));
      return { name, website: normalizeUrl(website) };
    })
    .filter((competitor) => competitor.name);
}

function safeJsonAfterMarker(notes: string, marker: string): any | null {
  const idx = notes.indexOf(marker);
  if (idx < 0) return null;
  const start = notes.indexOf('{', idx + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < notes.length; i++) {
    const ch = notes[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(notes.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

function parseExistingPaidIntake(notes?: string | null): any | null {
  return safeJsonAfterMarker(notes || '', 'PAID_INTAKE:');
}

function parseResearchData(notes?: string | null): any | null {
  return safeJsonAfterMarker(notes || '', 'RESEARCH_DATA:');
}

function joinList(value: unknown): string {
  return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean).join(', ') : '';
}

export function buildPaidIntakePrefill(lead: Pick<LeadRow, 'notes' | 'competitor' | 'clientProvidedCompetitors' | 'city' | 'serviceVisibility' | 'placesValidationStatus'>): PaidIntakePrefill {
  const notes = lead.notes || '';
  const paid = parseExistingPaidIntake(notes);
  const research = parseResearchData(notes);
  const preflight = research?.preflight || research || {};
  const paidPreflight = preflight?.paidIntake || paid || {};
  const competitors = Array.isArray(paid?.competitors) && paid.competitors.length
    ? paid.competitors.map((c: any) => c?.website ? `${c.name} | ${c.website}` : c?.name).filter(Boolean).join('\n')
    : (lead.clientProvidedCompetitors || lead.competitor || '').split(',').map((s) => s.trim()).filter(Boolean).join('\n');

  return {
    businessCategory: cleanIntakeBusinessCategory(paid?.businessCategory || preflight.clientDeclaredNiche || preflight.nicheLabel || preflight.businessType || ''),
    services: clean(paid?.mainServices || paidPreflight.mainServices || joinList(preflight.services) || lead.serviceVisibility || ''),
    competitors,
    location: clean(preflight.primaryMarket || preflight.market || lead.city || ''),
    googleBusinessProfile: clean(preflight.googleBusiness?.mapsUri || preflight.googleBusinessProfile || lead.placesValidationStatus || ''),
    source: 'resolved_profile_places',
  };
}

function correctionsFor(prefill: PaidIntakePrefill, payload: Pick<PaidIntakePayload, 'businessCategory' | 'mainServices' | 'competitors' | 'location'>): string[] {
  const corrections: string[] = [];
  if (prefill.businessCategory && payload.businessCategory.toLowerCase() !== prefill.businessCategory.toLowerCase()) corrections.push('business_category');
  if (prefill.services && payload.mainServices.toLowerCase() !== prefill.services.toLowerCase()) corrections.push('services');
  const incomingCompetitors = payload.competitors.map((c) => c.name).join(', ').toLowerCase();
  const existingCompetitors = prefill.competitors.replace(/\s*\|[^\n]+/g, '').replace(/\n/g, ', ').toLowerCase();
  if (prefill.competitors && incomingCompetitors !== existingCompetitors) corrections.push('competitors');
  if (prefill.location && payload.location.toLowerCase() !== prefill.location.toLowerCase()) corrections.push('location');
  return corrections;
}

export function buildPaidIntakePayload(input: PaidIntakeInput, lead?: Pick<LeadRow, 'notes' | 'competitor' | 'clientProvidedCompetitors' | 'city' | 'serviceVisibility' | 'placesValidationStatus'>, now = new Date()): PaidIntakePayload {
  const prefill = lead ? buildPaidIntakePrefill(lead) : { businessCategory: '', services: '', competitors: '', location: '', googleBusinessProfile: '', source: 'resolved_profile_places' as const };
  const customerQuestions = splitLines(input.customerQuestions, 5);
  const proofAssets = splitLines(input.proofAssets, 12);
  const competitors = splitCompetitors(input.confirmedCompetitors || prefill.competitors);
  const businessCategory = cleanIntakeBusinessCategory(input.confirmedBusinessCategory || prefill.businessCategory);
  const mainServices = clean(input.confirmedServices || prefill.services);
  const location = clean(input.confirmedLocation || prefill.location);
  const submittedAt = now.toISOString();

  const payload: PaidIntakePayload = {
    plan: lead ? derivePaidPlanFromLead(lead as LeadRow) : normalizePaidPlan(undefined),
    submittedAt,
    estimatedMinutes: 3,
    contactPersonName: clean(input.contactPersonName),
    businessCategory,
    mainServices,
    competitors,
    location,
    customerQuestions,
    proofAssets,
    webVendorEmail: clean(input.webVendorEmail),
    gbpAccessStatus: clean(input.gbpAccessStatus),
    priorityService: clean(input.priorityService),
    clientVerified: {
      evidenceTier: 'client_verified',
      source: 'paid_intake_confirm_and_enrich',
      verifiedAt: submittedAt,
      corrections: [],
      prefill,
    },
    proofSignals: proofAssets.join('; '),
    trustAssets: proofAssets,
    requiredComplete: false,
  };
  payload.clientVerified.corrections = correctionsFor(prefill, payload);
  payload.requiredComplete = Boolean(
    payload.contactPersonName &&
    payload.businessCategory &&
    payload.mainServices &&
    payload.location &&
    payload.competitors.length > 0 &&
    payload.customerQuestions.length >= 1 &&
    payload.gbpAccessStatus &&
    payload.priorityService
  );
  return payload;
}

export function paidIntakeNotesBlock(payload: PaidIntakePayload): string {
  return `PAID_INTAKE:${JSON.stringify(payload)}`;
}

export function clientVerifiedNotesBlock(payload: PaidIntakePayload): string {
  return `CLIENT_VERIFIED_PROFILE:${JSON.stringify({
    evidenceTier: 'client_verified',
    verifiedAt: payload.clientVerified.verifiedAt,
    corrections: payload.clientVerified.corrections,
    businessCategory: payload.businessCategory,
    services: payload.mainServices,
    competitors: payload.competitors,
    location: payload.location,
    priorityService: payload.priorityService,
    customerQuestions: payload.customerQuestions,
    proofAssets: payload.proofAssets,
  })}`;
}
