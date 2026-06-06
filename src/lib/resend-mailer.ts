import { Resend } from "resend";

export type VizBizEmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY || "";
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return key;
}

export function getVizBizSender(): string {
  return process.env.RESEND_FROM_EMAIL || "VizBiz <reports@vizbiz.ai>";
}

export function getVizBizReplyTo(): string | undefined {
  return process.env.RESEND_REPLY_TO_EMAIL || "alex@vizbiz.ai";
}

export async function sendVizBizEmail(payload: VizBizEmailPayload): Promise<string> {
  const resend = new Resend(getResendApiKey());
  const result = await resend.emails.send({
    from: getVizBizSender(),
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo || getVizBizReplyTo(),
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.name}: ${result.error.message}`);
  }

  if (!result.data?.id) {
    throw new Error("Resend send failed: no message id returned");
  }

  return result.data.id;
}
