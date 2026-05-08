/**
 * Report Token System
 * 
 * Generates and validates time-limited access tokens for lead reports.
 * Reports are only accessible with a valid token — created when the email is sent.
 * 
 * Token format: base64url(timestamp:hmac(leadId+timestamp))
 * Tokens expire after 30 days.
 */

const TOKEN_SECRET = process.env.REPORT_TOKEN_SECRET || "vizbiz-report-token-prod-2026";

function getTokenSecret(): string {
  return TOKEN_SECRET;
}

/**
 * Generate a report access token for a given lead ID.
 * Called when we're ready to email the report to the lead.
 */
export function generateReportToken(leadId: string): string {
  const timestamp = Date.now().toString(36); // Compact base-36 timestamp
  const message = `${leadId}:${timestamp}`;
  
  // Simple HMAC-like token using available crypto
  const crypto = require('crypto');
  const hmac = crypto
    .createHmac('sha256', getTokenSecret())
    .update(message)
    .digest('base64url')
    .slice(0, 24); // Keep it short but secure enough
  
  const token = Buffer.from(`${timestamp}:${hmac}`).toString('base64url');
  return token;
}

/**
 * Validate a report access token.
 * Returns { valid: true, leadId } if the token is valid and not expired.
 * Returns { valid: false, reason: string } if invalid.
 */
export function validateReportToken(leadId: string, token: string): { valid: boolean; reason?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const colonIdx = decoded.indexOf(':');
    if (colonIdx < 0) return { valid: false, reason: 'Invalid token format' };
    
    const timestamp = decoded.slice(0, colonIdx);
    const providedHmac = decoded.slice(colonIdx + 1);
    
    // Verify timestamp is valid
    const ts = parseInt(timestamp, 36);
    if (isNaN(ts)) return { valid: false, reason: 'Invalid timestamp' };
    
    // Check expiry (30 days)
    const age = Date.now() - ts;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (age > thirtyDays) return { valid: false, reason: 'Token expired' };
    
    // Verify HMAC
    const crypto = require('crypto');
    const message = `${leadId}:${timestamp}`;
    const expectedHmac = crypto
      .createHmac('sha256', getTokenSecret())
      .update(message)
      .digest('base64url')
      .slice(0, 24);
    
    if (providedHmac !== expectedHmac) {
      return { valid: false, reason: 'Invalid signature' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Token parse error' };
  }
}

/**
 * Build the full report URL with token for email delivery.
 */
export function buildReportUrl(leadId: string): string {
  const token = generateReportToken(leadId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vizbiz.ai';
  return `${baseUrl}/report/${leadId}?token=${token}`;
}
