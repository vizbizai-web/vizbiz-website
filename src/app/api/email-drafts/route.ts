import { NextResponse } from "next/server";
import { requireMissionControlApiAuth } from "@/lib/mission-control-api-auth";
import { getAllLeads, type LeadRow } from "@/lib/google-sheets";
import { excludeQaLeads } from "@/lib/qa-leads";
import { renderClientEmail } from '@/lib/client-emails';
import { buildFreeReportDeliveryContext, selectFreeReportDeliveryTemplate } from '@/lib/email-suite-automation';



// GET /api/email-drafts — list all email drafts for leads
export async function GET(request: Request) {
  const unauthorized = requireMissionControlApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const leads = excludeQaLeads(await getAllLeads());
    const drafts: Array<{
      leadId: string;
      dealershipName: string;
      email: string;
      contactName: string;
      city: string;
      website: string;
      status: string;
      subject: string;
      body: string;
      templateName: string;
    }> = [];

    // Email templates (matching OUTREACH-EMAILS.md patterns)
    for (const lead of leads) {
      if (!lead.email || lead.status === "closed_lost") continue;

      const template = generateEmailTemplate(lead);
      if (template) {
        drafts.push({
          leadId: lead.leadId,
          dealershipName: lead.dealershipName || "Unknown",
          email: lead.email,
          contactName: lead.contactName || "there",
          city: lead.city || "",
          website: lead.website || "",
          status: lead.status,
          subject: template.subject,
          body: template.body,
          templateName: template.name,
        });
      }
    }

    return NextResponse.json({ drafts, total: drafts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateEmailTemplate(lead: LeadRow): { name: string; subject: string; body: string } | null {
  const business = lead.dealershipName || "your business";
  const counts = parseSnapshotCounts(lead.snapshotAppeared, lead.notes);
  if ((lead.status === "email_drafted" || lead.status === "approved") && lead.leadId && counts) {
  const rendered = renderClientEmail(selectFreeReportDeliveryTemplate(lead), buildFreeReportDeliveryContext(lead));
  return { name: rendered.id, subject: rendered.subject, body: rendered.text };
  }

  return null;
}

function parseSnapshotCounts(snapshotAppeared?: string, notes?: string): { appeared: number; total: number } | null {
  const match = (snapshotAppeared || '').match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
  if (match) return { appeared: Number(match[1]), total: Number(match[2]) };
  try {
    const parsed = JSON.parse(notes || '{}');
    const research = parsed?.research || parsed;
    if (Number.isFinite(research?.appearedCount) && Number.isFinite(research?.totalPrompts)) {
      return { appeared: Number(research.appearedCount), total: Number(research.totalPrompts) };
    }
  } catch {}
  return null;
}
