import type { LeadRow } from "@/lib/google-sheets";
import { isOperatorMetricExcludedSource } from "@/lib/client-zero";

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
  return isOperatorMetricExcludedSource(lead.source) || isOperatorMetricExcludedSource(rawValue(lead, 'source'));
}

export function excludeQaLeads<T extends LeadRow>(leads: T[]): T[] {
  return leads.filter((lead) => !isQaLead(lead));
}
