import { assertClientSafeCopy } from './client-copy-qa';

export function buildFixKitReadyEmail(input: { businessName: string; contactName?: string; fixKitUrl: string; zipUrl: string }) {
  const greeting = input.contactName?.trim() ? `Hi ${input.contactName.trim()},` : 'Hi there,';
  const subject = `${input.businessName}: your AI visibility Fix Kit is ready`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${greeting}</p><p>Your VizBiz AI visibility Fix Kit is ready. It includes the practical website/profile assets your business can apply first: structured website data, llms.txt, crawler access notes, page title/meta/H1 rewrites, FAQ content, Google Business Profile improvements, and a simple implementation roadmap.</p><p><a href="${input.fixKitUrl}" style="background:#06b6d4;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Open your Fix Kit</a></p><p>Download everything here: <a href="${input.zipUrl}">Fix Kit ZIP</a></p><p>You can forward the technical files to your web person. After the fixes are applied, VizBiz will check the updated website again in about 30 days so you can compare before and after.</p><p>— VizBiz</p></div>`;
  assertClientSafeCopy(subject, 'fix kit email subject');
  assertClientSafeCopy(html, 'fix kit email body');
  return { subject, html };
}
