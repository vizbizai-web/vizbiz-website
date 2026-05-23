import type { EmailDeliveryStatus } from "./lead-pipeline";

export interface MiniReportEmailContent {
  subject: string;
  previewText: string;
  openingLine: string;
  bullets: string[];
  ctaLabel: string;
}

export interface EmailSendResult {
  status: EmailDeliveryStatus;
  provider: "resend" | "dry_run";
  messageId?: string;
  error?: string;
}

export function buildMiniReportEmailHtml(input: { email: MiniReportEmailContent; reportUrl: string }) {
  const bulletHtml = input.email.bullets
    .map((bullet) => `<li style="margin:0 0 10px 0;">${escapeHtml(bullet)}</li>`)
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#020617;color:#0f172a;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(input.email.previewText)}</div>
    <main style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <section style="background:linear-gradient(135deg,#E0F7FA,#CFFAFE);border-radius:24px;padding:28px;">
        <p style="margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.16em;font-size:12px;color:#0f766e;font-weight:700;">VizBiz.ai mini report</p>
        <h1 style="margin:0 0 16px 0;font-size:30px;line-height:1.1;color:#020617;">${escapeHtml(input.email.subject)}</h1>
        <p style="font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(input.email.openingLine)}</p>
        <ul style="padding-left:20px;color:#0f172a;font-size:15px;line-height:1.6;">${bulletHtml}</ul>
        <a href="${escapeAttribute(input.reportUrl)}" style="display:inline-block;margin-top:18px;background:#020617;color:#ffffff;text-decoration:none;border-radius:14px;padding:14px 20px;font-weight:700;">${escapeHtml(input.email.ctaLabel)}</a>
        <p style="margin-top:18px;font-size:12px;line-height:1.5;color:#475569;">Directional estimates are not revenue guarantees. The full report unlocks AI-answer evidence, competitor gaps, and the fix plan.</p>
      </section>
    </main>
  </body>
</html>`;
}

export async function sendMiniReportEmail(input: {
  to: string;
  email: MiniReportEmailContent;
  reportUrl: string;
  apiKey?: string;
  from?: string;
}): Promise<EmailSendResult> {
  if (!input.apiKey) {
    return { status: "dry_run", provider: "dry_run" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: input.from ?? "VizBiz.ai <reports@vizbiz.ai>",
        to: input.to,
        subject: input.email.subject,
        html: buildMiniReportEmailHtml({ email: input.email, reportUrl: input.reportUrl }),
      }),
    });

    const payload = await response.json().catch(() => ({} as { id?: string; message?: string }));
    if (!response.ok) {
      return { status: "failed", provider: "resend", error: payload.message ?? `Resend HTTP ${response.status}` };
    }
    return { status: "sent", provider: "resend", messageId: payload.id };
  } catch (error) {
    return { status: "failed", provider: "resend", error: error instanceof Error ? error.message : "Unknown email send error" };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
