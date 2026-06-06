import { NextRequest, NextResponse } from 'next/server';
import { buildReportUrl } from '@/lib/report-token';
import { sendVizBizEmail } from '@/lib/resend-mailer';
import { getLeadByLeadId } from '@/lib/google-sheets';

export const runtime = 'nodejs';
export const maxDuration = 30;

async function sendEmail(to: string, subject: string, html: string): Promise<string> {
  return sendVizBizEmail({ to, subject, html });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      to, leadId, businessName, contactName, city,
      aviScore, statusBand, appearedCount, totalPrompts,
      competitorName, competitorScore, niche,
    } = body;

    if (!leadId || !to) {
      return NextResponse.json({ error: 'Missing leadId or recipient email' }, { status: 400 });
    }

    const lead = await getLeadByLeadId(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const isPaidSend = lead.status === 'paid_report_ready_for_review' || lead.status === 'paid_report_delivered';
    const isFreeApprovedSend = lead.status === 'approved' && lead.researchStatus === 'complete';
    if (!isPaidSend && !isFreeApprovedSend) {
      return NextResponse.json(
        { error: 'Report email is blocked until the report is ready and operator-approved.', currentStatus: lead.status, researchStatus: lead.researchStatus },
        { status: 409 }
      );
    }

    if (isPaidSend && !lead.reportUrl) {
      return NextResponse.json({ error: 'Paid report delivery requires a stored reportUrl.' }, { status: 409 });
    }

    const reportUrl = lead.reportUrl || buildReportUrl(leadId);
    const scoreColor = statusBand === 'Strong' ? '#22C55E' : statusBand === 'Moderate' ? '#F59E0B' : '#EF4444';
    const invisibleCount = totalPrompts - appearedCount;

    const nicheLabels: Record<string, string> = {
      spray_tanning: 'spray tanning',
      beauty_salon: 'beauty & salon',
      car_dealership: 'auto dealership',
      venue_wedding: 'wedding venue',
      dance_studio: 'dance studio',
      real_estate: 'real estate',
      restaurant: 'restaurant',
      fine_jewelry: 'fine jewelry',
      fitness: 'fitness',
    };
    const nicheLabel = nicheLabels[niche] || 'local business';

    const firstName = contactName ? contactName.split(' ')[0] : 'there';

    // Dark mode email — ALL styles inline for Gmail compatibility
    // Gmail strips <style> blocks, so every property must be inline
    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>Your AI Visibility Report — ${businessName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: dark light; supported-color-schemes: dark light; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#02091F; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none; font-size:1px; color:#02091F; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    Your AI Visibility Score: ${aviScore}/100 — We tested ${totalPrompts} queries and found ${invisibleCount} where you're invisible.
  </div>

  <!-- Full-width wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#02091F;">
    <tr>
      <td align="center" style="padding:0;">

        <!-- Content container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #02091F 0%, #0A1628 100%); padding:40px 30px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin:0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:24px; color:#FFFFFF; font-weight:500; letter-spacing:-0.5px;">
                      VizBiz<span style="color:#25D1F2;">.ai</span>
                    </p>
                    <p style="margin:16px 0 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:14px; color:#94A3B8;">
                      AI Visibility Report for ${businessName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Score Section -->
          <tr>
            <td align="center" style="background-color:#0A0F1E; padding:30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="width:120px; height:120px; border-radius:50%; border:4px solid ${scoreColor}; vertical-align:middle; text-align:center;">
                    <p style="margin:0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:42px; font-weight:600; color:${scoreColor}; line-height:112px;">
                      ${aviScore}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 8px; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:18px; font-weight:600; color:${scoreColor};">
                ${statusBand} Visibility
              </p>
              <p style="margin:0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:14px; color:#94A3B8;">
                Your AI Visibility Index (AVI) score
              </p>
            </td>
          </tr>

          <!-- Body Section -->
          <tr>
            <td style="background-color:#02091F; padding:0 30px 30px;">

              <!-- Greeting -->
              <p style="margin:20px 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:15px; color:#CBD5E1; line-height:1.6;">
                Hi ${firstName},<br><br>
                We analyzed how often <strong style="color:#FFFFFF;">${businessName}</strong> appears when people in ${city} search for ${nicheLabel} services on ChatGPT, Gemini, and Perplexity.<br><br>
                We ran ${totalPrompts} real buyer-intent queries. Here's what we found:
              </p>

              <!-- Stats Row -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td width="47%" style="background-color:#111827; border:1px solid rgba(37,209,242,0.12); border-radius:12px; padding:16px; text-align:center;">
                    <p style="margin:0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:28px; font-weight:600; color:${scoreColor};">
                      ${appearedCount}/${totalPrompts}
                    </p>
                    <p style="margin:4px 0 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#94A3B8;">
                      Times Recommended
                    </p>
                  </td>
                  <td width="6%" style="font-size:0;">&nbsp;</td>
                  <td width="47%" style="background-color:#111827; border:1px solid rgba(37,209,242,0.12); border-radius:12px; padding:16px; text-align:center;">
                    <p style="margin:0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:28px; font-weight:600; color:#EF4444;">
                      ${invisibleCount}
                    </p>
                    <p style="margin:4px 0 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#94A3B8;">
                      Queries Invisible
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Competitor Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background-color:#111827; border:1px solid rgba(37,209,242,0.12); border-radius:12px; padding:20px;">
                    <p style="margin:0 0 8px; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:13px; color:#94A3B8; text-transform:uppercase; letter-spacing:1px;">
                      Top Competitor Found
                    </p>
                    <p style="margin:0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:18px; font-weight:600; color:#FFFFFF; line-height:1.4;">
                      ${competitorScore > 0 
                      ? `<span style="color:#F97316; font-weight:600;">${competitorName}</span> appeared in <span style="color:#EF4444;">${competitorScore} queries</span> vs your ${appearedCount}.` 
                      : `<span style="color:#F97316; font-weight:600;">${competitorName}</span> didn't appear in these ${totalPrompts} queries either — but they dominate other search terms. Your full report shows exactly where they rank.`}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              ${competitorScore > 0
                ? `<p style="margin:20px 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:15px; color:#CBD5E1; line-height:1.6;">
                That means potential customers are finding ${competitorName} instead of you in AI-powered search results. The good news: this is fixable.
              </p>`
                : `<p style="margin:20px 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:15px; color:#CBD5E1; line-height:1.6;">
                Both ${competitorName} and your business were missing from these specific queries — but they appear more broadly across other searches. The full report shows exactly where you rank and what changes will move the needle.
              </p>`
              }

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${reportUrl}" style="height:52px;v-text-anchor:middle;width:280px;" arcsize="23%" strokecolor="#22D3EE" fillcolor="#22D3EE">
                      <w:anchorlock/>
                      <center style="color:#02091F;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;">See Your Full Report →</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${reportUrl}" style="display:inline-block; background:linear-gradient(to right, #22D3EE, #06B6D4); color:#02091F; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:16px; font-weight:600; padding:16px 40px; border-radius:12px; text-decoration:none;">
                      See Your Full Report &rarr;
                    </a>
                    <!--<![endif]-->
                    <p style="margin:12px 0 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#64748B;">
                      Free &mdash; no signup required
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.06); padding:0; margin:20px 0;"></td>
                </tr>
              </table>

              <!-- Feature List -->
              <p style="margin:20px 0 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:13px; color:#94A3B8; line-height:1.8;">
                <span style="color:#25D1F2;">&#10022;</span> Score breakdown across 5 visibility categories<br>
                <span style="color:#25D1F2;">&#10022;</span> Every query where you're invisible (and who appears instead)<br>
                <span style="color:#25D1F2;">&#10022;</span> Competitor comparison with specific gaps<br>
                <span style="color:#25D1F2;">&#10022;</span> Step-by-step fix plan to close the gap
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#020617; padding:24px 30px; text-align:center;">
              <p style="margin:4px 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#64748B;">
                VizBiz.ai &mdash; AI Visibility Intelligence
              </p>
              <p style="margin:4px 0; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#64748B;">
                <a href="https://vizbiz.ai" style="color:#25D1F2; text-decoration:none;">vizbiz.ai</a> &middot; <a href="https://calendly.com/vizbiz-ai/15min" style="color:#25D1F2; text-decoration:none;">Book a free 15-min call</a>
              </p>
              <p style="margin:12px 0 4px; font-family:-apple-system, 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#64748B;">
                You're receiving this because you requested a free AI visibility audit.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Content container -->

      </td>
    </tr>
  </table>
  <!-- /Full-width wrapper -->

</body>
</html>`;

    const subject = `Your AI Visibility Score: ${aviScore}/100 — ${competitorName} is ahead in ${city}`;

    const messageId = await sendEmail(to, subject, html);
    console.info(`[send-report-email] Sent to ${to}, id=${messageId}`);

    return NextResponse.json({ success: true, emailId: messageId });
  } catch (err) {
    console.error('[send-report-email] Failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to send email' }, { status: 500 });
  }
}
