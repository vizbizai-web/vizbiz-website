export function buildPipelineBaseUrl(requestUrl: string): string {
  const requestOrigin = new URL(requestUrl).origin;

  // In production, prefer the custom-domain request origin. VERCEL_URL points at
  // the deployment hostname and can be preview-protected or alias-stale during
  // cutovers. The public custom domain is the contract we smoke-test.
  if (/^https:\/\/(www\.)?vizbiz\.ai$/i.test(requestOrigin)) return requestOrigin;

  const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (configuredSiteUrl) return configuredSiteUrl;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return requestOrigin || "http://localhost:3000";
}
