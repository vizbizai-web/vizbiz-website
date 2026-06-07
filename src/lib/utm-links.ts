/**
 * UTM Link Builder — single source of truth for all tracked links.
 *
 * Usage:
 *   utmLink('/intake/', 'x', 'post', 'ai-visibility-data')
 *   → "/intake/?utm_source=x&utm_medium=post&utm_campaign=ai-visibility-data"
 *
 *   utmLink('/intake/', 'blog', 'cta-button', 'chatgpt-recommendations')
 *   → "/intake/?utm_source=blog&utm_medium=cta-button&utm_campaign=chatgpt-recommendations"
 */

export function utmLink(
  path: string,
  source: string,
  medium: string,
  campaign: string,
  content?: string,
): string {
  const base = path.startsWith('http') ? path : `https://vizbiz.ai${path}`;
  const url = new URL(base);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  if (content) url.searchParams.set('utm_content', content);

  // Return relative path if it was a relative path
  if (!path.startsWith('http')) {
    return url.pathname + url.search;
  }
  return url.toString();
}

/** Common UTM-tagged links used across the site */
export const links = {
  /** Intake form from X posts */
  intakeFromX: (campaign: string) => utmLink('/intake/', 'x', 'post', campaign),
  /** Intake form from X bio */
  intakeBio: () => utmLink('/intake/', 'x', 'bio', 'profile-link'),
  /** Intake form from blog posts */
  intakeFromBlog: (slug: string) => utmLink('/intake/', 'blog', 'cta-button', slug),
  /** Intake form from outreach emails */
  intakeFromEmail: (leadName: string) => utmLink('/intake/', 'email', 'outreach', leadName),
  /** Legacy free-test aliases now route to the real intake funnel. */
  freeTestFromX: (campaign: string) => utmLink('/intake/', 'x', 'post', campaign, 'legacy-free-test'),
  /** Legacy free-test aliases now route to the real intake funnel. */
  freeTestFromBlog: (slug: string) => utmLink('/intake/', 'blog', 'cta-button', slug, 'legacy-free-test'),
  /** Homepage from X bio */
  homeBio: () => utmLink('/', 'x', 'bio', 'profile-link'),
  /** Book a call from any source */
  bookCall: (source: string, campaign: string) => utmLink('/book-call/', source, 'cta-button', campaign),
};
