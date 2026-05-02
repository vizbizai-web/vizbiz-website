export type SnapshotEmailData = {
  dealershipName: string;
  contactName: string;
  city: string;
  snapshotDate: string;
  appearedIn: string;
  overallVisibility: string;
  serviceDeptVisibility: string;
  competitorName: string;
  competitorCategories: string;
  bookingUrl: string;
  profitAtRiskLow?: number;
  profitAtRiskHigh?: number;
  currency?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Very Poor";
}

export function buildSnapshotEmailHtml(data: SnapshotEmailData): string {
  const dealershipName = escapeHtml(data.dealershipName);
  const contactName = escapeHtml(data.contactName);
  const city = escapeHtml(data.city);
  const snapshotDate = escapeHtml(data.snapshotDate);
  const appearedIn = escapeHtml(data.appearedIn);
  const overallVisibility = escapeHtml(data.overallVisibility);
  const serviceDeptVisibility = escapeHtml(data.serviceDeptVisibility);
  const competitorName = escapeHtml(data.competitorName);
  const competitorCategories = escapeHtml(data.competitorCategories);
  const bookingUrl = escapeHtml(data.bookingUrl);
  
  const profitAtRiskLow = data.profitAtRiskLow !== undefined ? Math.round(data.profitAtRiskLow) : null;
  const profitAtRiskHigh = data.profitAtRiskHigh !== undefined ? Math.round(data.profitAtRiskHigh) : null;
  const currencySymbol = data.currency || '$';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Visibility Snapshot — ${dealershipName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid #e0e0e0;background-color:#02091F;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:16px;">
                    <img src="https://vizbiz.ai/logo.jpg" alt="VizBiz.ai" width="140" style="display:block;height:auto;" />
                  </td>
                </tr>
              </table>
              <p style="color:#94A3B8;font-size:13px;margin:8px 0 0 0;">AI Visibility Report</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;">

              <p style="font-size:16px;color:#333333;margin:0 0 16px 0;">Hi ${contactName},</p>
              <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px 0;">
                Here's your AI Visibility Snapshot for <span style="color:#02091F;font-weight:700;">${dealershipName}</span> in ${city}.
              </p>

              <!-- Score Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#02091F 0%,#06B6D4 100%);border-radius:12px;margin:0 0 28px 0;">
                <tr>
                  <td align="center" style="padding:32px 20px;">
                    <p style="color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0;">Your AI Visibility Score</p>
                    <h2 style="font-size:56px;color:#ffffff;margin:0;font-weight:bold;">${overallVisibility}<span style="font-size:24px;color:#94A3B8;">/100</span></h2>
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:12px auto 0 auto;">
                      <tr>
                        <td style="background-color:#10B981;color:#ffffff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:bold;text-align:center;">${getScoreLabel(parseInt(overallVisibility))}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Profit at Risk Section -->
              ${profitAtRiskLow !== null && profitAtRiskHigh !== null ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FEF3C7;border-radius:12px;margin:0 0 28px 0;padding:20px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#7C2D12;font-weight:700;">Estimated Profit at Risk</p>
                    <p style="margin:8px 0 0 0;font-size:28px;line-height:1.3;font-weight:700;color:#7C2D12;">${currencySymbol}${profitAtRiskLow}–${currencySymbol}${profitAtRiskHigh}/month</p>
                    <p style="margin:8px 0 0 0;font-size:14px;line-height:1.6;color:#7C2D12;">
                      Based on your visibility gap and industry benchmarks, this profit is going to competitors who appear in AI recommendations.
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 0 0;">
                      <tr>
                        <td align="center">
                          <a href="${bookingUrl}" style="background:linear-gradient(90deg,#22D3EE 0%,#06B6D4 100%);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:bold;display:inline-block;">
                            See Where the Money Is Leaking → Get Your Full Report
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Competitor Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.2);border-radius:18px;margin:0 0 28px 0;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#d4d4d4;">${competitorName} may be appearing more often in AI-driven search for ${city}. Likely signals: ${competitorCategories}.</p>
                  </td>
                </tr>
              </table>

              <!-- What happens next -->
              <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#02091F;">What happens next</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e0e0e0;">
                    <p style="margin:0;font-size:14px;color:#475569;">✓ Review call — walk through the full snapshot together</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e0e0e0;">
                    <p style="margin:0;font-size:14px;color:#475569;">✓ Competitor breakdown — see exactly where gaps are</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <p style="margin:0;font-size:14px;color:#475569;">✓ Priority fixes — the 2-3 highest-impact improvements</p>
                  </td>
                </tr>
              </table>

              <!-- Main CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${bookingUrl}" style="background:linear-gradient(90deg,#22D3EE 0%,#06B6D4 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">Book Your Free 15-Minute Review</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;color:#94A3B8;text-align:center;margin:0 0 0 0;">See the full breakdown and get your questions answered</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;text-align:center;border-top:1px solid #e0e0e0;">
              <p style="margin:0;font-size:14px;color:#333333;">— Alex, Founder</p>
              <p style="margin:4px 0 0 0;">
                <a href="https://vizbiz.ai" style="color:#25D1F2;text-decoration:none;font-size:14px;">vizbiz.ai</a>
              </p>
              <p style="margin:12px 0 0 0;font-size:11px;color:#999999;">
                <a href="#" style="color:#999999;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
