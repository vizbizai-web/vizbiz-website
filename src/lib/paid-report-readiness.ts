import { parseResearchDataFromNotes } from './report-data';

export type PaidReportReadinessInput = {
  status?: string | null;
  researchStatus?: string | null;
  notes?: string | null;
};

export function assertPaidReportResearchComplete(lead: PaidReportReadinessInput): { ok: true } | { ok: false; error: string } {
  if (lead.researchStatus !== 'complete') {
    return { ok: false, error: 'Paid report prep requires completed research before operator review.' };
  }

  const researchData = parseResearchDataFromNotes(lead.notes || '');
  if (!researchData) {
    return { ok: false, error: 'Paid report prep requires parsed research data before operator review.' };
  }

  if (!Array.isArray(researchData.promptResults) || researchData.promptResults.length === 0) {
    return { ok: false, error: 'Paid report prep requires prompt-level research evidence before operator review.' };
  }

  if (!Number.isFinite(researchData.totalPrompts) || researchData.totalPrompts <= 0) {
    return { ok: false, error: 'Paid report prep requires a positive researched prompt count.' };
  }

  return { ok: true };
}
