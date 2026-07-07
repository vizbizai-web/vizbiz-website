import { parseResearchDataFromNotes } from './report-data';
import type { LeadRow } from './google-sheets';
import type { FixKitInput, FixKitPage } from './fix-kit-generator';

function extractBalancedJson(text: string, start: number): string | null {
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    if (text[i] === '}') depth -= 1;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return null;
}
export function parsePipelinePayload(notes?: string | null): any | null {
  const str = notes || '';
  const start = str.lastIndexOf('{"preflight"');
  if (start < 0) return null;
  const blob = extractBalancedJson(str, start);
  if (!blob) return null;
  try { return JSON.parse(blob); } catch { return null; }
}
function splitCsv(value?: string | null) { return String(value || '').split(',').map(s => s.trim()).filter(Boolean); }
function pagesFromPreflight(preflight: any, website: string): FixKitPage[] {
  const raw = preflight?.pages || preflight?.crawlPages || preflight?.seoAudit?.pages || [];
  if (Array.isArray(raw) && raw.length) return raw.map((p: any) => ({ url: String(p.url || p.href || website), title: p.title, metaDescription: p.metaDescription || p.description, h1: Array.isArray(p.h1) ? p.h1[0] : p.h1, description: p.description, schemaTypes: p.schemaTypes })).filter((p: FixKitPage) => p.url).slice(0, 15);
  return [{ url: website, title: preflight?.title || undefined, metaDescription: preflight?.metaDescription || undefined, h1: preflight?.h1 || undefined, description: preflight?.valueProposition || undefined, schemaTypes: preflight?.schemaTypes || [] }];
}
export function buildFixKitInputFromLead(lead: LeadRow): FixKitInput {
  const payload = parsePipelinePayload(lead.notes);
  const research = payload?.research || parseResearchDataFromNotes(lead.notes);
  const preflight = payload?.preflight || {};
  if (!research?.promptResults?.length) throw new Error('Fix Kit generation requires completed research prompt evidence. Run paid research first.');
  const services = Array.isArray(preflight.services) && preflight.services.length ? preflight.services : splitCsv(preflight.mainServices || preflight.paidIntake?.mainServices || '');
  const pages = pagesFromPreflight(preflight, lead.website);
  return {
    leadId: lead.leadId,
    profile: {
      businessName: lead.dealershipName,
      website: lead.website,
      niche: preflight.niche || research.niche || 'local_business',
      nicheLabel: preflight.nicheLabel || research.nicheLabel || preflight.businessType || 'Local business',
      businessType: preflight.businessType || preflight.nicheLabel || research.nicheLabel || 'local business',
      services: services.length ? services : [preflight.businessType || 'Core service'],
      serviceAreas: Array.isArray(preflight.serviceAreas) && preflight.serviceAreas.length ? preflight.serviceAreas : splitCsv(preflight.market || preflight.primaryMarket || lead.city),
      primaryMarket: preflight.primaryMarket || preflight.market || lead.city,
      searchLanguage: preflight.searchLanguage || 'English',
      valueProposition: preflight.valueProposition || '',
      customerSegments: Array.isArray(preflight.customerSegments) ? preflight.customerSegments : [],
    },
    seoAudit: { hasSchema: Boolean(preflight.hasSchema), schemaTypes: preflight.schemaTypes || preflight.seoAudit?.schemaTypes || [], robotsTxt: preflight.robotsTxt || null },
    research: { promptResults: research.promptResults, appearedCount: research.appearedCount, totalPrompts: research.totalPrompts, originalScore: research.aviScore },
    places: research.googlePlaceEnrichment || preflight.googlePlaceEnrichment || undefined,
    paidIntake: { trustAssets: splitCsv(preflight.paidIntake?.trustAssets || preflight.proofAssets), customerQuestions: splitCsv(preflight.paidIntake?.customerQuestions || preflight.customerQuestions), implementationPreference: preflight.paidIntake?.implementationPreference },
    crawl: { pages, robotsTxt: preflight.robotsTxt || preflight.seoAudit?.robotsTxt || null },
  };
}
