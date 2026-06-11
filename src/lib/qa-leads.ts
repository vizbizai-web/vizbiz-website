import type { LeadRow } from "@/lib/google-sheets";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function rawValue(lead: LeadRow, key: string): string {
  const raw = (lead as unknown as { raw_intake?: Record<string, unknown>; rawIntake?: Record<string, unknown> }).raw_intake
    || (lead as unknown as { rawIntake?: Record<string, unknown> }).rawIntake
    || {};
  return text(raw[key]);
}

export function isQaLead(lead: LeadRow): boolean {
  const haystack = [
    lead.source,
    lead.dealershipName,
    lead.email,
    lead.notes,
    rawValue(lead, "source"),
    rawValue(lead, "originalCta"),
    rawValue(lead, "notes"),
  ].join("\n").toLowerCase();

  return /(?:^|\n)qa[_-]/.test(haystack)
    || /\b(?:qa|test|sentinel|telegram button conflict|gate conflict|blank category|polluted sentinel|deliverability test)\b/.test(haystack)
    || /\balex\+(?:qa|test|gate|sentinel|telegram|blank|polluted|clean)[^\s@]*@/.test(haystack)
    || /\bqa\+[^\s@]*@/.test(haystack);
}

export function excludeQaLeads<T extends LeadRow>(leads: T[]): T[] {
  return leads.filter((lead) => !isQaLead(lead));
}
