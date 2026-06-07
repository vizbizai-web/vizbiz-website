import type { Metadata } from 'next';
import { getLeadByLeadId, isSheetsConfigured } from '@/lib/google-sheets';
import { validateReportToken } from '@/lib/report-token';
import { getClientReportAccessState } from '@/lib/funnel-logic';
import { parseResearchDataFromNotes } from '@/lib/report-data';
import ReportContent from './report-content';
import ReportPending from './report-pending';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export type ResearchData = {
  leadId: string;
  businessName: string;
  website: string;
  city: string;
  contactName: string;
  competitor: string;
  niche: string;
  nicheLabel?: string;
  appearedCount: number;
  totalPrompts: number;
  statusBand: string;
  serviceVisibility: string;
  promptResults: { prompt: string; businessAppeared: boolean; competitorAppeared: boolean; competitorName?: string }[];
  competitorMention: string;
  competitorLine: string;
  competitorCategories: string[];
  whyThisMatters: string;
  processedAt: string;
  socialPresence?: { instagram: number | null; facebook: number | null; googleReviews: number | null; googleRating: number | null; instagramUrl: string | null; facebookUrl: string | null };
  competitorSocial?: { name: string; instagram: number | null; facebook: number | null; googleReviews: number | null; googleRating: number | null }[];
  socialNarrative?: string;
  revenueLoss?: number;
  leadsLost?: number;
  recoveryPotential?: string;
  socialVsVisibility?: { hasStrongVisibilityLowSocial: boolean; hasWeakVisibilityHighSocial: boolean; socialGapMultiplier: number | null };
  // Edward Sturm AI Discovery
  aiDiscovery?: {
    qfoQueries: string[];
    qfoResults: { query: string; appeared: boolean; sourcesCited: string[] }[];
    competitorCitations: { domain: string; count: number; sampleUrls: string[] }[];
    bingWmtVerified: boolean;
    contentReadiness: {
      qfoCoverage: number;
      groundingQueryReadiness: number;
      citationCompetitiveness: number;
      contentDepth: number;
      overall: number;
    };
    recommendations: { title: string; description: string; impact: 'High' | 'Medium' | 'Low' }[];
  };
  // Competitor mode tracking
  competitorMode?: "client_provided" | "client_only";
  internalCompetitorSuggestions?: { name: string; appearances: number; urls: string[] }[];
  // Google Places enrichment
  googlePlaceEnrichment?: { placeId: string | null; rating: number | null; userReviewCount: number | null; websiteMatch: boolean | null } | null;
  localEntityTrustScore?: number | null;
  competitorValidations?: { name: string; validationStatus: string; rating: number | null; userReviewCount: number | null; distanceFromClientKm: number | null }[];
};

export type LeadPageData = {
  leadId: string;
  businessName: string;
  contactName: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  competitor: string;
  source: string;
  status: string;
  researchStatus: string;
  snapshotAppeared: string;
  visibilityBand: string;
  notes: string;
};

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { leadId } = await params;
  const { token } = await searchParams;

  let leadData: LeadPageData | null = null;
  let researchData: ResearchData | null = null;
  let leadFound = false;

  if (isSheetsConfigured()) {
    try {
      const lead = await getLeadByLeadId(leadId);
      if (lead) {
        leadFound = true;
        leadData = {
          leadId: lead.leadId,
          businessName: lead.dealershipName,
          contactName: lead.contactName,
          location: lead.city,
          website: lead.website,
          email: lead.email,
          phone: lead.phone,
          competitor: lead.competitor,
          source: lead.source,
          status: lead.status,
          researchStatus: lead.researchStatus,
          snapshotAppeared: lead.snapshotAppeared,
          visibilityBand: lead.visibilityBand,
          notes: lead.notes,
        };

        researchData = parseResearchDataFromNotes(lead.notes);

        // Fallback: parse competitorMode from notes text if still not available
        if (researchData && !researchData.competitorMode) {
          const modeMatch = lead.notes?.match(/CompetitorMode:\s*(\w+)/);
          researchData.competitorMode = modeMatch?.[1] === 'client_provided' ? 'client_provided' : 'client_only';
        }
      }
    } catch (err) {
      console.error('[report] Failed to fetch lead from CRM:', err);
    }
  }

  // Gate 1: Lead must exist
  if (!leadFound || !leadData) {
    return <ReportPending leadId={leadId} status="not_found" />;
  }

  // Gate 2: Never show a fallback/mock report to clients.
  // A public report needs approval, completed research, and parsed research data.
  const accessState = getClientReportAccessState({
    status: leadData.status,
    researchStatus: leadData.researchStatus,
    hasResearchData: Boolean(researchData),
  });

  if (accessState !== 'ready') {
    return <ReportPending leadId={leadId} status="processing" businessName={leadData.businessName} />;
  }

  // Approved+ leads are accessible without a token. If a token is present, validate it
  // to avoid treating expired/stale private links as successful report views.
  if (token && !token.startsWith('owner_')) {
    const tokenResult = validateReportToken(leadId, token);
    if (!tokenResult.valid) {
      return <ReportPending leadId={leadId} status="processing" businessName={leadData.businessName} />;
    }
  }

  // All gates passed — show the full report
  return <ReportContent leadId={leadId} leadData={leadData} researchData={researchData} />;
}
