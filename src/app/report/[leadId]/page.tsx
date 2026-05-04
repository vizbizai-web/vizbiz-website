import { getLeadByLeadId, isSheetsConfigured, type LeadRow } from '@/lib/google-sheets';
import ReportContent from './report-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  let leadData: LeadPageData | null = null;

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
        };
      }
    } catch (err) {
      console.error('[report] Failed to fetch lead from Sheets:', err);
    }
  }

  return <ReportContent leadId={leadId} leadData={leadData} />;
}
