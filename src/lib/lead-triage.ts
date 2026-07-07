import type { LeadRow } from './google-sheets';

export type LeadTriageLabel = 'junk_candidate' | 'uncertain' | 'clean';

export type LeadTriage = {
  label: LeadTriageLabel;
  reasons: string[];
  score: number;
};

const FREE_EMAIL_RX = /@(gmail|yahoo|hotmail|outlook|icloud|aol|protonmail)\./i;
const SPAM_KEYWORDS_RX = /\b(casino|crypto|forex|loan|payday|escort|adult|viagra|porn|backlink|guest post|seo package|rank first|whatsapp only)\b/i;
const QA_RX = /\b(qa|test|battery v2|phase3|mop wringers)\b/i;

function domainFromWebsite(website?: string): string {
  try {
    return new URL((website || '').startsWith('http') ? website || '' : `https://${website || ''}`).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function emailDomain(email?: string): string {
  return String(email || '').split('@')[1]?.toLowerCase() || '';
}

export function classifyLeadTriage(lead: Pick<LeadRow, 'dealershipName' | 'website' | 'email' | 'city' | 'contactName' | 'notes' | 'status'>): LeadTriage {
  const haystack = [lead.dealershipName, lead.website, lead.email, lead.city, lead.contactName, lead.notes].join(' ');
  const reasons: string[] = [];
  let score = 0;

  if (QA_RX.test(haystack)) return { label: 'clean', reasons: ['QA/test lead excluded from junk candidate rules'], score: 0 };

  if (SPAM_KEYWORDS_RX.test(haystack)) { score += 70; reasons.push('spam keyword pattern'); }
  if (!lead.website || !domainFromWebsite(lead.website)) { score += 20; reasons.push('missing or invalid website'); }
  if (FREE_EMAIL_RX.test(lead.email || '')) { score += 15; reasons.push('free email domain'); }
  const webDomain = domainFromWebsite(lead.website);
  const mailDomain = emailDomain(lead.email);
  if (webDomain && mailDomain && !FREE_EMAIL_RX.test(lead.email || '') && !webDomain.includes(mailDomain.replace(/^mail\./, '')) && !mailDomain.includes(webDomain)) {
    score += 15; reasons.push('business website and email domain do not match');
  }
  if (!lead.city || String(lead.city).trim().length < 2) { score += 10; reasons.push('missing city/market'); }
  if (!lead.dealershipName || String(lead.dealershipName).trim().length < 2) { score += 20; reasons.push('missing business name'); }

  if (score >= 70) return { label: 'junk_candidate', reasons, score };
  if (score >= 25) return { label: 'uncertain', reasons, score };
  return { label: 'clean', reasons, score };
}
