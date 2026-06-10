export type NicheCallbackAction = 'use_submitted' | 'use_website' | 'custom';

export interface NicheCallbackResolution {
  leadId: string;
  action: NicheCallbackAction;
  selectedNiche: string;
  noteLine: string;
  rerunReason: string;
}

function extractAfterLabel(text: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^${escaped}:\\s*(.+)$`, 'im'));
  const value = match?.[1]?.trim() || '';
  return value === 'none' || value === 'insufficient evidence' ? '' : value;
}

export function parseNicheCallbackData(callbackData: string): { action: NicheCallbackAction; leadId: string } | null {
  const match = callbackData.match(/^niche_(use_submitted|use_website|custom)_(.+)$/);
  if (!match) return null;
  return { action: match[1] as NicheCallbackAction, leadId: match[2] };
}

export function buildNicheCallbackResolution(callbackData: string, messageText: string): NicheCallbackResolution {
  const parsed = parseNicheCallbackData(callbackData);
  if (!parsed) throw new Error('Unsupported niche callback');

  const submitted = extractAfterLabel(messageText, 'Submitted');
  const website = extractAfterLabel(messageText, 'Website evidence');
  const selectedNiche = parsed.action === 'use_submitted' ? submitted : parsed.action === 'use_website' ? website : '';
  const stampedAt = new Date().toISOString();

  if (parsed.action === 'custom') {
    return {
      ...parsed,
      selectedNiche: '',
      noteLine: `[NICHE_RESOLUTION ${stampedAt}] CUSTOM_NICHE_REQUIRED via Telegram. Open Mission Control and add ClientBusinessCategory manually.`,
      rerunReason: 'Telegram niche resolution: custom category requested',
    };
  }

  if (!selectedNiche) throw new Error(`No ${parsed.action === 'use_submitted' ? 'submitted' : 'website'} niche found in Telegram message`);

  return {
    ...parsed,
    selectedNiche,
    noteLine: `[NICHE_RESOLUTION ${stampedAt}] ClientBusinessCategory: ${selectedNiche} | Source: telegram_${parsed.action}`,
    rerunReason: `Telegram niche resolution: ${parsed.action === 'use_submitted' ? 'use declared service' : 'use website evidence'} "${selectedNiche}"`,
  };
}
