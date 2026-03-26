export type SnapshotEmailData = {
  dealershipName: string;
  contactName: string;
  city: string;
  snapshotDate: string;
  appearedIn: string;
  overallVisibility: string;
  serviceDeptVisibility: string;
  competitorInsight: string;
  bookingUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildSnapshotEmailHtml(data: SnapshotEmailData): string {
  const dealershipName = escapeHtml(data.dealershipName);
  const contactName = escapeHtml(data.contactName);
  const city = escapeHtml(data.city);
  const snapshotDate = escapeHtml(data.snapshotDate);
  const appearedIn = escapeHtml(data.appearedIn);
  const overallVisibility = escapeHtml(data.overallVisibility);
  const serviceDeptVisibility = escapeHtml(data.serviceDeptVisibility);
  const competitorInsight = escapeHtml(data.competitorInsight);
  const bookingUrl = escapeHtml(data.bookingUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Visibility Snapshot — ${dealershipName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background-color:#111111;border:1px solid #1f1f1f;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background-color:#050505;border-bottom:1px solid #1f1f1f;">
              <span style="font-size:24px;font-weight:700;letter-spacing:-0.03em;color:#ffffff;">VizBiz<span style="color:#00f0ff;">.ai</span></span>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 28px 10px 28px;">
              <p style="margin:0 0 10px 0;font-size:15px;line-height:1.7;color:#d4d4d4;">Hi ${contactName},</p>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#d4d4d4;">Thanks for requesting your AI Visibility Mini Snapshot for <span style="color:#ffffff;font-weight:700;">${dealershipName}</span>.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 0 28px;">
              <p style="margin:0;font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-0.04em;color:#ffffff;">AI Visibility Snapshot — ${dealershipName}</p>
              <p style="margin:10px 0 0 0;font-size:13px;line-height:1.6;color:#8a8a8a;">${city} &bull; ${snapshotDate}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 28px 0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;border:1px solid #232323;border-radius:18px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0;font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.12em;color:#00f0ff;font-weight:700;">Appeared in</p>
                          <p style="margin:8px 0 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">${appearedIn}</p>
                          <p style="margin:6px 0 0 0;font-size:13px;line-height:1.6;color:#8a8a8a;">Across 7 buyer-intent prompts</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;border:1px solid #232323;border-radius:18px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0;font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.12em;color:#00f0ff;font-weight:700;">Overall AI Visibility</p>
                          <p style="margin:8px 0 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">${overallVisibility}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;border:1px solid #232323;border-radius:18px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0;font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.12em;color:#00f0ff;font-weight:700;">Service Department Visibility</p>
                          <p style="margin:8px 0 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">${serviceDeptVisibility}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px 0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.2);border-radius:18px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#d4d4d4;">${competitorInsight}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 0 28px;">
              <p style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:#ffffff;">What&apos;s in your full review</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${[
                  'Prompt-by-prompt AI answer breakdown',
                  'Competitor visibility gaps',
                  'Recommended fixes prioritized by impact',
                ]
                  .map(
                    (item) => `<tr>
                  <td style="padding:0 0 10px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;border:1px solid #202020;border-radius:16px;">
                      <tr>
                        <td style="padding:14px 16px;font-size:14px;line-height:1.6;color:#7f7f7f;filter:blur(2px);">${item}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                  )
                  .join("")}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 28px 30px 28px;" align="center">
              <a href="${bookingUrl}" target="_blank" style="display:inline-block;background-color:#00f0ff;color:#031316;text-decoration:none;font-size:15px;font-weight:700;line-height:1;padding:16px 26px;border-radius:999px;">Book Your Free 15-Minute Review</a>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 24px 28px;border-top:1px solid #1f1f1f;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6f6f6f;">VizBiz.ai | vizbiz.ai@gmail.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
