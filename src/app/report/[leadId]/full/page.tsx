/**
 * Full Report Page v3 — Loads research data + AI capture data
 */

import { getLeadByLeadId, isSheetsConfigured } from "@/lib/google-sheets";
import FullReportContent from "./FullReportContent";
import Link from "next/link";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseResearchData(notes: string) {
  const marker = "RESEARCH_DATA:";
  const idx = notes.indexOf(marker);
  if (idx < 0) return null;
  try {
    return JSON.parse(notes.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export default async function FullReportPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  let lead = null;
  if (isSheetsConfigured()) {
    try {
      lead = await getLeadByLeadId(leadId);
    } catch (err) {
      console.error("[full-report] Failed to load lead:", err);
    }
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#02091F] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
          <Link href="/" className="text-[#25D1F2] hover:text-[#06B6D4]">Back to Home</Link>
        </div>
      </div>
    );
  }

  const researchData = parseResearchData(lead.notes || "");

  // Try to load AI capture data — prefer full 84-prompt capture
  let aiCaptureData = null;
  try {
    const slug = (researchData?.businessName || lead.dealershipName || '').toLowerCase().replace(/\s+/g, '-');
    const outputDir = join(process.cwd(), '..', '..', '..', '..', 'output');
    // Try full capture first, fall back to basic capture
    const fullPath = join(outputDir, `${slug}-ai-capture-full.json`);
    const basicPath = join(outputDir, `${slug}-ai-capture.json`);
    const capturePath = existsSync(fullPath) ? fullPath : existsSync(basicPath) ? basicPath : null;
    if (capturePath) {
      aiCaptureData = JSON.parse(readFileSync(capturePath, 'utf-8'));
    }
  } catch {}

  if (!researchData) {
    return (
      <div className="min-h-screen bg-[#02091F] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Report Processing</h1>
          <Link href={`/report/${leadId}`} className="text-[#25D1F2]">View Snapshot</Link>
        </div>
      </div>
    );
  }

  return (
    <FullReportContent
      leadId={leadId}
      leadData={{
        businessName: lead.dealershipName,
        city: lead.city,
        website: lead.website,
        contactName: lead.contactName,
        competitor: lead.competitor,
      }}
      researchData={researchData}
      aiCaptureData={aiCaptureData}
    />
  );
}
