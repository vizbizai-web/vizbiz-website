import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/google-sheets";
import { excludeQaLeads } from "@/lib/qa-leads";
import { readFileSync, existsSync } from "fs";
import { join } from "path";



// GET /api/email-drafts — list all email drafts for leads
export async function GET() {
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

function generateEmailTemplate(lead: {
  dealershipName?: string;
  contactName?: string;
  email?: string;
  city?: string;
  website?: string;
  competitor?: string;
  visibilityBand?: string;
  snapshotAppeared?: string;
  status: string;
  notes?: string;
}): { name: string; subject: string; body: string } | null {
  const name = lead.contactName || "there";
  const business = lead.dealershipName || "your business";

  // Extract AVI data from preflight notes
  let aviScore = "";
  let gapQuery = "";
  if (lead.notes?.includes("PREFLIGHT:")) {
    try {
      const match = lead.notes.match(/PREFLIGHT:\s*(\{[\s\S]*?\})/);
      if (match) {
        const pf = JSON.parse(match[1]);
        if (pf.aviScore) aviScore = pf.aviScore;
        if (pf.gapQueries?.[0]) gapQuery = pf.gapQueries[0];
      }
    } catch {}
  }

  if (lead.status === "email_drafted" || lead.status === "approved") {
    return {
      name: "Free Snapshot Follow-up",
      subject: `Your free AI visibility snapshot for ${business}`,
      body: `Hi ${name},

I ran an AI visibility check on ${business} and put together a free snapshot report for you.

${aviScore ? `Your AI Visibility Index (AVI) score came in at ${aviScore}/100 — there's real room for improvement, especially compared to competitors who are showing up consistently in ChatGPT and Google AI recommendations.` : "The results show some clear gaps in how your business appears in AI-driven search results like ChatGPT and Google AI Overviews."}

${gapQuery ? `For example, when someone asks "${gapQuery}" — your competitors are getting recommended, and ${business} isn't showing up.` : ""}

The full snapshot is ready for you here:
https://vizbiz.ai/report/${lead.website?.replace(/https?:\/\//, "").replace(/\/.*/, "") || "your-site"}

No strings attached. If you want to dig deeper into what's causing the gaps and how to fix them, I'm happy to walk through it.

Best,
Alex
VizBiz.ai`,
    };
  }

  if (lead.status === "new" || lead.status === "researching" || lead.status === "pending_review") {
    return {
      name: "Initial Outreach",
      subject: `Is ${business} showing up in AI search?`,
      body: `Hi ${name},

Quick question — have you checked whether ${business} shows up when people ask ChatGPT or Google AI for recommendations in ${lead.city || "your area"}?

I run AI visibility checks for local businesses and I'd be happy to run a free snapshot for ${business}. Takes about 5 minutes, and you'll see exactly where you stand compared to your top competitors.

Would that be useful?

Best,
Alex
VizBiz.ai`,
    };
  }

  return null;
}
