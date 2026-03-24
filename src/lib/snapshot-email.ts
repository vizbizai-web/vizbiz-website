// Subject: "Your AI Visibility Mini Snapshot — {dealershipName}"

export type SnapshotEmailData = {
  dealershipName: string;
  contactName: string;
  appearedIn: string;
  overallVisibility: string;
  serviceDeptVisibility: string;
  competitorInsight: string;
  whyItMatters: string;
  bookingUrl: string;
};

export function buildSnapshotEmailHtml(data: SnapshotEmailData): string {
  const {
    dealershipName,
    contactName,
    appearedIn,
    overallVisibility,
    serviceDeptVisibility,
    competitorInsight,
    whyItMatters,
    bookingUrl,
  } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your AI Visibility Mini Snapshot — ${dealershipName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #1a1a1a;">
              <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">VizBiz<span style="color:#00f0ff;">.ai</span></span>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <p style="margin:0;font-size:16px;color:#ffffff;">Hi ${contactName},</p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:16px 40px 0 40px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#a0a0a0;">
                Here&rsquo;s your free AI Visibility Mini Snapshot for <strong style="color:#ffffff;">${dealershipName}</strong>.
              </p>
            </td>
          </tr>

          <!-- Metrics box -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #1a1a1a;">
                    <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#666666;">Appeared in prompts</span>
                    <p style="margin:6px 0 0 0;font-size:20px;font-weight:700;color:#ffffff;">${appearedIn}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #1a1a1a;">
                    <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#666666;">Overall AI Visibility</span>
                    <p style="margin:6px 0 0 0;font-size:20px;font-weight:700;color:#ffffff;">${overallVisibility}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#666666;">Service Department Visibility</span>
                    <p style="margin:6px 0 0 0;font-size:20px;font-weight:700;color:#ffffff;">${serviceDeptVisibility}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Competitor insight -->
          <tr>
            <td style="padding:0 40px 20px 40px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#ffffff;font-weight:700;">${competitorInsight}</p>
            </td>
          </tr>

          <!-- Why it matters -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#a0a0a0;">${whyItMatters}</p>
            </td>
          </tr>

          <!-- What's in the full review -->
          <tr>
            <td style="padding:0 40px 24px 40px;border-top:1px solid #1a1a1a;">
              <p style="margin:24px 0 12px 0;font-size:14px;font-weight:600;color:#ffffff;">What&rsquo;s in the full review:</p>
              <ul style="margin:0;padding-left:20px;color:#a0a0a0;font-size:14px;line-height:1.8;">
                <li>Prompt-by-prompt AI answer breakdown</li>
                <li>Additional competitor mentions and visibility gaps</li>
                <li>Recommended fixes prioritized by impact</li>
              </ul>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding:0 40px 40px 40px;" align="center">
              <a href="${bookingUrl}" target="_blank" style="display:inline-block;background-color:#00f0ff;color:#000000;font-size:15px;font-weight:700;text-decoration:none;padding:16px 32px;border-radius:10px;letter-spacing:-0.01em;">
                Book Your Free 15-Minute Review
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1a1a1a;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#555555;font-weight:600;">VizBiz.ai &mdash; AI Visibility Intelligence for Automotive Retailers</p>
              <p style="margin:0;font-size:12px;color:#444444;">You&rsquo;re receiving this because you requested a free AI Visibility snapshot.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
