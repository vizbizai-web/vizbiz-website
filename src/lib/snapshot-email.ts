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
  
  const scoreNum = parseInt(overallVisibility);
  const scoreColor = scoreNum >= 60 ? '#22C55E' : scoreNum >= 35 ? '#F59E0B' : '#EF4444';
  const scoreBarWidth = Math.min(scoreNum, 100);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Visibility Snapshot — ${dealershipName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#F2EDE4;font-family:'Poppins',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F2EDE4;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header — Dark Navy -->
          <tr>
            <td style="padding:28px 32px;background-color:#020617;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <img src="https://vizbiz.ai/logo.jpg" alt="VizBiz.ai" width="120" style="display:block;height:auto;border-radius:6px;" />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <p style="color:#94A3B8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">AI Visibility Report</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Warm Linen Body -->
          <tr>
            <td style="padding:0;">

              <!-- Greeting -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF7F2;">
                <tr>
                  <td style="padding:28px 32px 0 32px;">
                    <p style="font-size:16px;color:#0F172A;margin:0 0 16px 0;">Hi ${contactName},</p>
                    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px 0;">
                      Here's your AI Visibility Snapshot for <strong style="color:#020617;">${dealershipName}</strong> in ${city}.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Score Card — Editorial Style -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#020617;">
                <tr>
                  <td align="center" style="padding:36px 32px;">
                    <p style="color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px 0;">Your AI Visibility Score</p>
                    
                    <!-- Large editorial score -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td align="center">
                          <p style="font-size:64px;color:#FFFFFF;margin:0;font-weight:200;line-height:1;font-family:'Poppins',sans-serif;">${overallVisibility}<span style="font-size:24px;color:#94A3B8;">/100</span></p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Thin progress bar -->
                    <table cellpadding="0" cellspacing="0" border="0" width="200" style="margin:16px auto 0 auto;">
                      <tr>
                        <td style="background-color:rgba(255,255,255,0.1);border-radius:4px;height:4px;padding:0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="background-color:${scoreColor};border-radius:4px;height:4px;width:${scoreBarWidth * 2}px;"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Score label badge -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:14px auto 0 auto;">
                      <tr>
                        <td style="background-color:${scoreColor}20;color:${scoreColor};padding:6px 20px;border-radius:20px;font-size:13px;font-weight:600;text-align:center;border:1px solid ${scoreColor}40;">${getScoreLabel(scoreNum)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Profit at Risk — Warm Linen -->
              ${profitAtRiskLow !== null && profitAtRiskHigh !== null ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF7F2;">
                <tr>
                  <td style="padding:28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FEF3C7;border-radius:12px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="margin:0;font-size:13px;line-height:1.7;color:#7C2D12;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Estimated Profit at Risk</p>
                          <p style="margin:8px 0 0 0;font-size:28px;line-height:1.3;font-weight:700;color:#7C2D12;">${currencySymbol}${profitAtRiskLow.toLocaleString()}–${currencySymbol}${profitAtRiskHigh.toLocaleString()}/month</p>
                          <p style="margin:8px 0 0 0;font-size:14px;line-height:1.6;color:#7C2D12;">
                            Based on your visibility gap and industry benchmarks, this profit is going to competitors who appear in AI recommendations.
                          </p>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0 0;">
                            <tr>
                              <td align="center" style="background:linear-gradient(90deg,#22D3EE 0%,#06B6D4 100%);border-radius:8px;">
                                <a href="${bookingUrl}" style="color:#020617;text-decoration:none;padding:12px 28px;font-size:14px;font-weight:700;display:inline-block;">See Where the Money Is Leaking → Get Your Full Report</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Competitor Alert -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF7F2;">
                <tr>
                  <td style="padding:0 32px 28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E0F7FA;border:1px solid rgba(34,211,238,0.25);border-radius:12px;border-left:4px solid #22D3EE;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0;font-size:14px;line-height:1.7;color:#0F172A;"><strong>${competitorName}</strong> may be appearing more often in AI-driven search for ${city}. Likely signals: ${competitorCategories}.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What happens next -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 14px 0;font-size:14px;font-weight:700;color:#0F172A;">What happens next</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                          <p style="margin:0;font-size:14px;color:#475569;"><span style="color:#22D3EE;">✓</span> Review call — walk through the full snapshot together</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                          <p style="margin:0;font-size:14px;color:#475569;"><span style="color:#22D3EE;">✓</span> Competitor breakdown — see exactly where gaps are</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <p style="margin:0;font-size:14px;color:#475569;"><span style="color:#22D3EE;">✓</span> Priority fixes — the 2-3 highest-impact improvements</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Main CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;">
                <tr>
                  <td style="padding:8px 32px 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
                      <tr>
                        <td align="center" style="background:linear-gradient(90deg,#22D3EE 0%,#06B6D4 100%);border-radius:10px;">
                          <a href="${bookingUrl}" style="color:#020617;text-decoration:none;padding:14px 36px;font-size:16px;font-weight:700;display:inline-block;">Book Your Free 15-Minute Review</a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size:13px;color:#94A3B8;text-align:center;margin:0 0 28px 0;">See the full breakdown and get your questions answered</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;border-top:2px solid #22D3EE;background-color:#020617;">
              <img src="https://vizbiz.ai/logo.jpg" alt="VizBiz.ai" width="32" style="display:inline-block;height:auto;border-radius:4px;margin-bottom:8px;" />
              <p style="margin:0;font-size:14px;color:#FFFFFF;">— Alex, Founder</p>
              <p style="margin:6px 0 0 0;">
                <a href="https://vizbiz.ai" style="color:#22D3EE;text-decoration:none;font-size:14px;font-weight:600;">vizbiz.ai</a>
              </p>
              <p style="margin:12px 0 0 0;font-size:11px;color:#5D6680;">
                <a href="#" style="color:#5D6680;text-decoration:none;">Unsubscribe</a>
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
