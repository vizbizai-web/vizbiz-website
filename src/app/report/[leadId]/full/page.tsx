import type { Metadata } from 'next';
/**
 * Full Report Page v3 — Loads research data + AI capture data
 */

import { getLeadByLeadId, isSheetsConfigured } from "@/lib/google-sheets";
import FullReportContent from "./FullReportContent";
import Link from "next/link";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { isJunkCompetitor } from "@/lib/junk-filter";


export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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

  // Load competitor profiles from competition folder
  let competitorProfiles: any[] = [];
  try {
    if (researchData?.promptResults) {
      const compCounts: Record<string, number> = {};
      for (const p of researchData.promptResults) {
        if (p.competitorName && p.competitorAppeared && !isJunkCompetitor(p.competitorName)) {
          compCounts[p.competitorName] = (compCounts[p.competitorName] || 0) + 1;
        }
      }
      const topComps = Object.entries(compCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const competitionDir = join(process.cwd(), '..', '..', '..', '..', 'competition');
      for (const [name] of topComps) {
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const profilePath = join(competitionDir, safeName, 'PROFILE.md');
        const stealPath = join(competitionDir, safeName, 'STEAL-FOR-VIZBIZ.md');
        const profile: any = { name };
        if (existsSync(profilePath)) {
          const content = readFileSync(profilePath, 'utf-8');
          // Extract key sections from markdown
          const strengthsMatch = content.match(/## Strengths\n([\s\S]*?)(?=\n## |$)/);
          const weaknessMatch = content.match(/## Weaknesses[^\n]*\n([\s\S]*?)(?=\n## |$)/);
          const whatTheyDoMatch = content.match(/## What They Do\n([\s\S]*?)(?=\n## |$)/);
          const stealMatch = existsSync(stealPath) ? readFileSync(stealPath, 'utf-8') : '';
          const stealNowMatch = stealMatch.match(/## What to Steal Now\n([\s\S]*?)(?=\n## What to steal later|\n## What not|\n## Bottom|\n## Source|$)/);
          if (strengthsMatch) profile.strengths = strengthsMatch[1].split('\n').filter((l: string) => l.startsWith('- ')).map((l: string) => l.slice(2));
          if (weaknessMatch) profile.weaknesses = weaknessMatch[1].split('\n').filter((l: string) => l.startsWith('- ')).map((l: string) => l.slice(2));
          if (whatTheyDoMatch) profile.whatTheyDo = whatTheyDoMatch[1].trim().slice(0, 300);
          if (stealNowMatch) profile.whatToSteal = stealNowMatch[1].split('\n').filter((l: string) => l.startsWith('- ') || l.startsWith('### ')).map((l: string) => l.replace(/^### /, '').replace(/^- /, '')).filter((l: string) => l.length > 5).slice(0, 5);
        }
        competitorProfiles.push(profile);
      }
    }
  } catch (err) {
    console.warn('[full-report] Failed to load competitor profiles:', err);
  }

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
      competitorProfiles={competitorProfiles}
    />
  );
}
