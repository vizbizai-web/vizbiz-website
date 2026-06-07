import { assertClientSafeCopy } from "@/lib/client-copy-qa";

export type ReportEmailData = {
  businessName: string;
  contactName?: string;
  city?: string;
  reportUrl: string;
  aviScore?: number | string;
  statusBand?: string;
  appearedCount?: number;
  totalPrompts?: number;
  competitors?: string[];
  nicheLabel?: string;
  isPaid?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteVizBizUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://vizbiz.ai").replace(/\/$/, "");
  return `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

export function assertValidReportEmailCta(url: string): string {
  const absoluteUrl = toAbsoluteVizBizUrl(url);
  if (!absoluteUrl) throw new Error("Report email requires a CTA URL.");

  const parsed = new URL(absoluteUrl);
  const pathname = parsed.pathname.replace(/\/+$/, "");

  if (pathname === "/free-ai-visibility-test") {
    throw new Error("Report email CTA must not point to the stale free AI visibility test page.");
  }

  const allowed =
    /^\/report\/[^/]+(?:\/full)?$/.test(pathname) ||
    pathname === "/pricing" ||
    pathname === "/book-call" ||
    pathname === "/intake";

  if (!allowed) {
    throw new Error(`Report email CTA must point to a report, pricing, booking, or approved intake route. Got: ${absoluteUrl}`);
  }

  return absoluteUrl;
}

function formatCount(appearedCount?: number, totalPrompts?: number): string {
  if (typeof appearedCount === "number" && typeof totalPrompts === "number" && totalPrompts > 0) {
    return `${appearedCount}/${totalPrompts}`;
  }
  return "Ready";
}

function competitorContext(competitors: string[], businessName: string): string {
  const clean = competitors.map((name) => name.trim()).filter(Boolean).slice(0, 2);
  if (clean.length >= 2) {
    return `${businessName} should be positioned clearly against ${clean[0]} and ${clean[1]} so AI systems can understand where it fits, what makes it credible, and when it should be recommended.`;
  }
  if (clean.length === 1) {
    return `${businessName} should be positioned clearly against ${clean[0]} so AI systems can understand where it fits, what makes it credible, and when it should be recommended.`;
  }
  return `${businessName} should be easier for AI systems to understand, verify, and recommend when customers compare options in your market.`;
}

export function buildReportEmailSubject(data: ReportEmailData): string {
  const businessName = data.businessName.trim() || "your business";
  return `${businessName} AI visibility snapshot is ready`;
}

export function buildReportEmailHtml(data: ReportEmailData): string {
  const reportUrl = assertValidReportEmailCta(data.reportUrl);
  const businessName = escapeHtml(data.businessName.trim() || "your business");
  const firstName = escapeHtml((data.contactName || "there").trim().split(/\s+/)[0] || "there");
  const rawCity = (data.city || "").trim();
  const rawNicheLabel = (data.nicheLabel || "").trim();
  const comparisonScope = escapeHtml(
    rawNicheLabel && rawCity
      ? `${rawNicheLabel} options in ${rawCity}`
      : rawNicheLabel
        ? `${rawNicheLabel} options`
        : rawCity
          ? `options in ${rawCity}`
          : "options in their market"
  );
  const score = data.aviScore !== undefined && data.aviScore !== null ? escapeHtml(String(data.aviScore)) : "—";
  const statusBand = escapeHtml((data.statusBand || "Visibility review").trim());
  const count = escapeHtml(formatCount(data.appearedCount, data.totalPrompts));
  const context = escapeHtml(competitorContext(data.competitors || [], data.businessName.trim() || "Your business"));
  const ctaLabel = data.isPaid ? "View the full AI visibility report" : "View the private AI visibility snapshot";
  const preheader = escapeHtml(`A focused look at how clearly AI systems can understand, verify, and recommend ${data.businessName.trim() || "your business"}.`);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>AI Visibility Snapshot — ${businessName}</title>
  </head>
  <body style="margin:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#e5f7fb;-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;color:#020617;opacity:0;line-height:1px;font-size:1px;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617;padding:36px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#07111f;border:1px solid rgba(34,211,238,.22);border-radius:26px;overflow:hidden;">
            <tr>
              <td style="padding:40px 34px 32px;border-bottom:1px solid rgba(255,255,255,.08);">
                <img src="https://vizbiz.ai/logo.jpg" width="118" alt="VizBiz.ai" style="display:block;border-radius:8px;margin-bottom:30px;" />
                <p style="margin:0 0 14px;color:#22d3ee;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;">AI Visibility Snapshot</p>
                <h1 style="margin:0;color:#ffffff;font-size:34px;line-height:1.12;letter-spacing:-.035em;font-weight:750;">${businessName} visibility snapshot</h1>
                <p style="margin:22px 0 0;color:#cbd5e1;font-size:16px;line-height:1.75;">Hi ${firstName}, we reviewed how clearly ${businessName} can be understood and recommended by popular AI assistants when customers compare ${comparisonScope}.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 26px;">
                  <tr>
                    <td width="48%" style="background:#0f172a;border:1px solid rgba(34,211,238,.18);border-radius:18px;padding:20px;text-align:center;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">Visibility score</p>
                      <p style="margin:10px 0 0;color:#ffffff;font-size:38px;font-weight:750;line-height:1;">${score}<span style="font-size:16px;color:#94a3b8;">/100</span></p>
                      <p style="margin:10px 0 0;color:#22d3ee;font-size:13px;font-weight:700;">${statusBand}</p>
                    </td>
                    <td width="4%" style="font-size:0;">&nbsp;</td>
                    <td width="48%" style="background:#0f172a;border:1px solid rgba(34,211,238,.18);border-radius:18px;padding:20px;text-align:center;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">AI appearances</p>
                      <p style="margin:10px 0 0;color:#ffffff;font-size:38px;font-weight:750;line-height:1;">${count}</p>
                      <p style="margin:10px 0 0;color:#94a3b8;font-size:13px;">Visibility checks reviewed</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 24px;color:#e2e8f0;font-size:16px;line-height:1.75;">The short version: ${businessName} needs to be easier for AI systems to explain, verify, and compare. The opportunity is not just “showing up.” It is becoming the business AI can confidently recommend when the question matches what you do.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 26px;">
                  <tr>
                    <td style="background:#0f172a;border:1px solid rgba(34,211,238,.18);border-radius:20px;padding:24px;">
                      <p style="margin:0 0 10px;color:#94a3b8;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">Comparison readiness</p>
                      <p style="margin:0;color:#ffffff;font-size:18px;line-height:1.65;font-weight:650;">${context}</p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 30px;">
                  <tr>
                    <td style="background:#081827;border-left:4px solid #22d3ee;border-radius:18px;padding:22px 24px;">
                      <p style="margin:0 0 12px;color:#ffffff;font-size:15px;font-weight:750;">What the snapshot clarifies</p>
                      <ul style="margin:0;padding-left:20px;color:#cbd5e1;font-size:15px;line-height:1.8;">
                        <li>Whether AI assistants can accurately describe what ${businessName} does.</li>
                        <li>Which trust signals help you look credible beside named alternatives.</li>
                        <li>Where your website, content, and structured authority need clearer proof.</li>
                      </ul>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:34px auto 18px;">
                  <tr>
                    <td align="center" style="background:#22d3ee;border-radius:15px;">
                      <a href="${escapeHtml(reportUrl)}" style="display:inline-block;padding:17px 30px;color:#020617;text-decoration:none;font-size:15px;font-weight:850;">${ctaLabel} &rarr;</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0;text-align:center;color:#94a3b8;font-size:12px;line-height:1.7;">Private report link. No signup required.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 34px;background:#020617;border-top:1px solid rgba(34,211,238,.16);">
                <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7;">— Alex<br /><span style="color:#94a3b8;">VizBiz.ai</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  assertClientSafeCopy(html, "report email HTML");
  return html;
}
