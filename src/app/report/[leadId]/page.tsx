import { getLeadByLeadId, isSheetsConfigured } from '@/lib/google-sheets';
import { validateReportToken } from '@/lib/report-token';
import ReportContent from './report-content';
import ReportPending from './report-pending';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type ResearchData = {
  leadId: string;
  businessName: string;
  website: string;
  city: string;
  contactName: string;
  competitor: string;
  niche: string;
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

        // Try to extract research data from notes
        const marker = 'RESEARCH_DATA:';
        const idx = lead.notes.indexOf(marker);
        if (idx >= 0) {
          try {
            researchData = JSON.parse(lead.notes.slice(idx + marker.length));
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      console.error('[report] Failed to fetch lead from Sheets:', err);
    }
  }

  // Gate 1: Lead must exist
  if (!leadFound || !leadData) {
    return <ReportPending leadId={leadId} status="not_found" />;
  }

  // Gate 2: Valid token required (owner_ tokens bypass HMAC check)
  if (!token) {
    return <ReportPending leadId={leadId} status="no_token" businessName={leadData.businessName} />;
  }

  if (!token.startsWith('owner_')) {
    const tokenResult = validateReportToken(leadId, token);
    if (!tokenResult.valid) {
      console.warn(`[report] Invalid token for ${leadId}: ${tokenResult.reason}`);
      return <ReportPending leadId={leadId} status="invalid_token" businessName={leadData.businessName} />;
    }
  }

  // Gate 3: Lead must have completed research
  if (leadData.researchStatus !== 'complete') {
    return <ReportPending leadId={leadId} status="processing" businessName={leadData.businessName} />;
  }

  // Gate 4: Lead must be approved by Vlad (status must not be pending_review)
  // Owner bypass: token starting with 'owner_' can see report at any stage
  if (leadData.status === 'pending_review' && !token.startsWith('owner_')) {
    return <ReportPending leadId={leadId} status="processing" businessName={leadData.businessName} />;
  }

  // All gates passed — show the full report
  return <ReportContent leadId={leadId} leadData={leadData} researchData={researchData} />;
}
