export type IntakeNoteInput = {
  source?: string;
  originalCta?: string;
  originalPage?: string;
  businessCategory?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  timezone?: string;
  utcOffset?: string;
  locale?: string;
  competitorMode?: string;
};

const METADATA_SEGMENT_PATTERN = /\s*(?:[.|]\s*)?(?:TZ|Locale|UTM|Referrer|CompetitorMode)\s*:\s*.*$/i;
const INLINE_METADATA_START_PATTERN = /\s+(?=(?:tz|utc|locale|utm)[_:\s-])/i;

export const MACHINE_METADATA_PATTERN = /(?:\btz[_:\s-]|\butc[_:\s-]|\blocale[_:\s-]|\butm[_:\s-]|https?:\/\/|www\.|[a-z0-9]+_[a-z0-9]+_[a-z0-9]+)/i;

export function cleanIntakeText(value?: string | null): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

export function cleanIntakeBusinessCategory(value?: string | null): string {
  return cleanIntakeText(value)
    .replace(METADATA_SEGMENT_PATTERN, '')
    .split(INLINE_METADATA_START_PATTERN)[0]
    .trim();
}

export function hasMachineMetadata(value?: string | null): boolean {
  return MACHINE_METADATA_PATTERN.test(value || '');
}

function formatUtcOffset(offset?: string): string {
  if (!offset) return '';
  const parsed = parseInt(offset, 10);
  if (Number.isNaN(parsed)) return '';
  const sign = parsed > 0 ? '-' : '+';
  const hours = String(Math.floor(Math.abs(parsed) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(parsed) % 60).padStart(2, '0');
  return ` (UTC${sign}${hours}:${minutes})`;
}

export function buildIntakeNotes(input: IntakeNoteInput): string {
  const source = cleanIntakeText(input.source) || 'snapshot funnel';
  const originalCta = cleanIntakeText(input.originalCta) || 'direct';
  const originalPage = cleanIntakeText(input.originalPage) || '/intake';
  const businessCategory = cleanIntakeBusinessCategory(input.businessCategory);
  const segments = [
    `Source: ${source}`,
    `CTA: ${originalCta}`,
    `Page: ${originalPage}`,
  ];

  if (businessCategory) segments.push(`ClientBusinessCategory: ${businessCategory}`);
  if (input.utmSource) {
    segments.push(`UTM: ${cleanIntakeText(input.utmSource)}/${cleanIntakeText(input.utmMedium) || 'none'}/${cleanIntakeText(input.utmCampaign) || 'none'}`);
  }
  if (input.referrer) segments.push(`Referrer: ${cleanIntakeText(input.referrer)}`);
  if (input.timezone) segments.push(`TZ: ${cleanIntakeText(input.timezone)}${formatUtcOffset(input.utcOffset)}`);
  if (input.locale) segments.push(`Locale: ${cleanIntakeText(input.locale)}`);
  segments.push(`CompetitorMode: ${cleanIntakeText(input.competitorMode) || 'client_only'}`);

  return `${segments.join(' | ')}.`;
}
