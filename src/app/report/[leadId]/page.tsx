import { getLeadByLeadId, isSheetsConfigured } from '@/lib/google-sheets';
import ReportContent from './report-content';

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
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  let leadData: LeadPageData | null = null;
  let researchData: ResearchData | null = null;

  if (isSheetsConfigured()) {
    try {
      const lead = await getLeadByLeadId(leadId);
      if (lead) {
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

  return <ReportContent leadId={leadId} leadData={leadData} researchData={researchData} />;
}
