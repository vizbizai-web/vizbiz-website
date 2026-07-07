export type NicheResolutionAction = 'use_submitted' | 'use_website' | 'custom';

export function buildMissionControlNicheResolution(input: {
  leadId: string;
  action: NicheResolutionAction;
  submittedNiche?: string | null;
  websiteNiche?: string | null;
  customNiche?: string | null;
}) {
  const selectedNiche = String(
    input.action === 'use_submitted'
      ? input.submittedNiche || ''
      : input.action === 'use_website'
        ? input.websiteNiche || ''
        : input.customNiche || '',
  ).trim();

  if (!selectedNiche) {
    throw new Error(
      input.action === 'custom'
        ? 'Custom niche is required'
        : `No ${input.action === 'use_submitted' ? 'submitted' : 'website'} niche available for this lead`,
    );
  }

  const stampedAt = new Date().toISOString();
  const source = input.action === 'use_submitted'
    ? 'mission_control_use_submitted'
    : input.action === 'use_website'
      ? 'mission_control_use_website'
      : 'mission_control_custom';
  const reason = input.action === 'use_submitted'
    ? `Mission Control niche resolution: use declared service "${selectedNiche}"`
    : input.action === 'use_website'
      ? `Mission Control niche resolution: use website evidence "${selectedNiche}"`
      : `Mission Control niche resolution: custom category "${selectedNiche}"`;

  return {
    leadId: input.leadId,
    action: input.action,
    selectedNiche,
    noteLine: `[NICHE_RESOLUTION ${stampedAt}] ClientBusinessCategory: ${selectedNiche} | Source: ${source}`,
    rerunReason: reason,
  };
}
