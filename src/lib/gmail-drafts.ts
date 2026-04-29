/**
 * Gmail integration — create draft emails for lead follow-up
 *
 * Uses Google Service Account with domain-wide delegation
 * to create drafts in vizbiz.ai@gmail.com
 */

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users";

function getServiceAccount(): {
  client_email: string;
  private_key: string;
  token_uri: string;
} {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
  return JSON.parse(raw);
}

async function getAccessTokenWithDelegation(): Promise<string> {
  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = base64urlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64urlEncode(
    JSON.stringify({
      iss: sa.client_email,
      sub: "vizbiz.ai@gmail.com", // delegate to this user
      scope: "https://www.googleapis.com/auth/gmail.compose",
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signInput = `${header}.${payload}`;
  const keyData = pemToBuffer(sa.private_key);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signInput),
  );

  const jwt = `${signInput}.${base64urlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    throw new Error(`Gmail auth failed: ${tokenResponse.status} ${text}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}

function base64urlEncode(input: string | Uint8Array): string {
  const buffer = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToBuffer(pem: string): ArrayBuffer {
  const pemContent = pem
    .replace(/-----BEGIN.*?-----/g, "")
    .replace(/-----END.*?-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(pemContent);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

/**
 * Create a draft email in the VizBiz Gmail account
 */
export async function createDraftEmail(options: {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}): Promise<string> {
  const accessToken = await getAccessTokenWithDelegation();

  // Build the raw RFC 2822 email
  const from = "vizbiz.ai@gmail.com";
  const lines = [
    `From: Alex at VizBiz <${from}>`,
    `To: ${options.to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(options.subject)))}?=`,
    `BCC: ${from}`,
    "Content-Type: multipart/alternative; boundary=vizbiz_boundary",
    "MIME-Version: 1.0",
    "",
    "--vizbiz_boundary",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    options.bodyText,
    "",
  ];

  if (options.bodyHtml) {
    lines.push(
      "--vizbiz_boundary",
      'Content-Type: text/html; charset="UTF-8"',
      "",
      options.bodyHtml,
      "",
    );
  }

  lines.push("--vizbiz_boundary--");

  const rawMessage = lines.join("\r\n");
  const encoded = base64urlEncode(rawMessage);

  const response = await fetch(
    `${GMAIL_API_BASE}/vizbiz.ai@gmail.com/drafts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          raw: encoded,
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gmail draft creation failed: ${response.status} ${text}`);
  }

  const result = (await response.json()) as { id: string };
  console.info("[gmail] draft created", { draftId: result.id, to: options.to });
  return result.id;
}

/**
 * Check if Gmail integration is configured
 */
export function isGmailConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
}
