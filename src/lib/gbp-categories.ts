export const OFFICIAL_GBP_CATEGORIES = [
  'Auto dealer',
  'Used car dealer',
  'Car repair and maintenance service',
  'Plumber',
  'Electrician',
  'HVAC contractor',
  'Roofing contractor',
  'Cleaning service',
  'Commercial cleaning service',
  'Legal services',
  'Tax preparation service',
  'Accountant',
  'Medical spa',
  'Skin care clinic',
  'Nutritionist',
  'Audio visual consultant',
  'Electronics store',
  'Local business',
] as const;

export function chooseGbpCategories(input: { businessType?: string; nicheLabel?: string; services?: string[] }) {
  const haystack = `${input.businessType || ''} ${input.nicheLabel || ''} ${(input.services || []).join(' ')}`.toLowerCase();
  const pick = (primary: string, secondary: string[] = []) => ({ primary, secondary, reason: `Selected from official GBP category options based on the resolved business profile: ${input.businessType || input.nicheLabel || 'local business'}.` });
  if (/dealer|dealership|auto sales|used car/.test(haystack)) return pick('Auto dealer', ['Used car dealer', 'Car repair and maintenance service']);
  if (/plumb|drain/.test(haystack)) return pick('Plumber');
  if (/electric/.test(haystack)) return pick('Electrician');
  if (/hvac|heating|cooling/.test(haystack)) return pick('HVAC contractor');
  if (/roof/.test(haystack)) return pick('Roofing contractor');
  if (/commercial cleaning|janitorial|sanitize|office cleaning/.test(haystack)) return pick('Commercial cleaning service', ['Cleaning service']);
  if (/clean/.test(haystack)) return pick('Cleaning service');
  if (/law|legal|attorney|lawyer/.test(haystack)) return pick('Legal services');
  if (/tax|account/.test(haystack)) return pick('Tax preparation service', ['Accountant']);
  if (/med spa|medical spa|skin|aesthetic/.test(haystack)) return pick('Medical spa', ['Skin care clinic']);
  if (/nutrition/.test(haystack)) return pick('Nutritionist');
  if (/audio|av integration|sound system|electronics/.test(haystack)) return pick('Audio visual consultant', ['Electronics store']);
  return pick('Local business');
}
