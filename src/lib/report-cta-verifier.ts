import { assertClientSafeCopy } from "@/lib/client-copy-qa";
import { assertValidReportEmailCta } from "@/lib/report-email";

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export type VerifiedReportCta = {
  ok: true;
  url: string;
  status: number;
};

const BLOCKED_RENDERED_REPORT_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "report not found page", pattern: /\bReport Not Found\b/i },
  { label: "back home fallback", pattern: /\bBack to Home\b/i },
  { label: "processing fallback", pattern: /\bReport Processing\b/i },
  { label: "pending fallback", pattern: /\breport is being prepared\b/i },
  { label: "internal auto-discovery wording", pattern: /\bauto[-\s]?discovered competitors?\b/i },
  { label: "internal-only wording", pattern: /\binternal only\b/i },
  { label: "operator/manual review wording", pattern: /\b(operator|manual) review\b/i },
];

export function assertRenderedReportPageSafe(html: string, context = "report CTA page"): void {
  const hits = BLOCKED_RENDERED_REPORT_PATTERNS
    .filter(({ pattern }) => pattern.test(html))
    .map(({ label }) => label);

  if (hits.length > 0) {
    throw new Error(`${context} failed verification: ${hits.join(", ")}`);
  }

  assertClientSafeCopy(html, context);
}

export async function verifyReportCta(url: string, options: { fetchImpl?: FetchLike } = {}): Promise<VerifiedReportCta> {
  const absoluteUrl = assertValidReportEmailCta(url);
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(absoluteUrl, {
    method: "GET",
    redirect: "follow",
    headers: { "User-Agent": "VizBiz-Report-CTA-Verifier/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Report CTA verification failed: ${absoluteUrl} returned HTTP ${response.status}`);
  }

  const html = await response.text();
  assertRenderedReportPageSafe(html, `report CTA ${absoluteUrl}`);

  return { ok: true, url: absoluteUrl, status: response.status };
}
