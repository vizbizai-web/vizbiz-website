# VizBiz DNS + Email Readiness Pack

Generated: 2026-06-03 11:53 EDT
Domain: `vizbiz.ai`
Authoritative DNS observed: Namecheap / registrar nameservers

## Executive call

The website DNS is basically pointed at Vercel, but email is **not fully launch-ready** yet.

Current risk: branded report email delivery can look untrusted or land in spam because the domain has no MX and no visible SPF record. DKIM appears partly present for Resend, and DMARC exists in monitor mode, but SPF/MX need attention before we call client-facing email “ready.”

Priority order:

1. Verify the domain in Resend and confirm the exact DNS records Resend wants.
2. Add or merge SPF at Namecheap.
3. Add MX only if we want real inbound mailboxes on `@vizbiz.ai` now.
4. Confirm Vercel production env vars for branded sender/reply-to and canonical URL.
5. Send test emails to Gmail, Outlook, and iCloud before sending client reports.

## Current DNS snapshot

### Nameservers

```txt
dns1.registrar-servers.com.
dns2.registrar-servers.com.
```

Interpretation: Namecheap/registrar DNS is authoritative. Add email DNS records in Namecheap, not Vercel, unless nameservers are changed later.

### Apex website record

```txt
A vizbiz.ai -> 216.198.79.1
```

Interpretation: apex is on Vercel.

### WWW website record

```txt
CNAME www.vizbiz.ai -> 09cc51eae5b47e4d.vercel-dns-017.com.
A www.vizbiz.ai -> 216.198.79.1, 64.29.17.1
```

Interpretation: www resolves through Vercel DNS. Looks acceptable for the current launch, but public-domain smoke tests still matter after deployment/alias changes.

### MX

```txt
No MX records observed.
```

Interpretation: `@vizbiz.ai` likely cannot receive normal inbound email yet. This matters for `Reply-To` trust and client replies.

### Root TXT

```txt
google-site-verification=g2druQYxyom8b6RCfpKn-DFQo-t1zJkbCtZXuEfrauk
```

No root SPF record was observed.

### DMARC

```txt
_dmarc.vizbiz.ai TXT "v=DMARC1; p=none;"
```

Interpretation: DMARC exists in monitor mode. This is fine for launch, but add reporting later.

### Resend DKIM

Observed:

```txt
resend._domainkey.vizbiz.ai TXT "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD4mwBO..."
```

Not observed:

```txt
rs2024a._domainkey.vizbiz.ai
rs2024b._domainkey.vizbiz.ai
rs2024c._domainkey.vizbiz.ai
```

Interpretation: one Resend-style DKIM selector exists. Resend may be using an older selector or may require additional current selectors. The Resend dashboard is the source of truth.

## Namecheap DNS instructions

Go to:

```txt
Namecheap → Domain List → vizbiz.ai → Manage → Advanced DNS
```

Before editing, screenshot/export the current DNS records.

### Website records — do not casually change

Keep the existing Vercel website records unless Vercel specifically shows a domain error.

Expected Vercel-style setup is usually:

```txt
Type: A Record
Host: @
Value: 216.198.79.1
TTL: Automatic
```

```txt
Type: CNAME Record
Host: www
Value: 09cc51eae5b47e4d.vercel-dns-017.com
TTL: Automatic
```

Do **not** delete the Google Search Console verification TXT record.

## Resend sender DNS checklist

In Resend:

```txt
Resend Dashboard → Domains → Add/Verify vizbiz.ai
```

Copy the exact records Resend provides. Do not guess selectors if the dashboard shows different ones.

### SPF

If Namecheap currently has no SPF record, add one TXT record:

```txt
Type: TXT Record
Host: @
Value: v=spf1 include:amazonses.com ~all
TTL: Automatic
```

If Namecheap already has an SPF record later, **merge** into the single existing SPF record instead of creating a second SPF record.

Bad:

```txt
v=spf1 include:amazonses.com ~all
v=spf1 include:_spf.google.com ~all
```

Good merged shape:

```txt
v=spf1 include:amazonses.com include:_spf.google.com ~all
```

Multiple SPF TXT records at root can break SPF. Small detail, large clown shoes.

### DKIM

Use exactly what Resend provides. Current DNS already shows one selector:

```txt
Host: resend._domainkey
Type: TXT
Value: [existing public key]
```

If Resend asks for new selectors such as `rs2024a._domainkey`, `rs2024b._domainkey`, or `rs2024c._domainkey`, add those too exactly as shown in Resend.

### DMARC

Current DMARC is:

```txt
v=DMARC1; p=none;
```

This is acceptable for launch monitoring. Better version when ready:

```txt
Type: TXT Record
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@vizbiz.ai
TTL: Automatic
```

Only add `rua` if `dmarc@vizbiz.ai` exists or is aliased somewhere real.

## Inbound email / MX decision

Current state: no MX records observed.

This means `hello@vizbiz.ai`, `reports@vizbiz.ai`, and `dmarc@vizbiz.ai` probably cannot receive replies unless inbound is configured elsewhere.

Recommended low-cost launch setup:

- Use a simple mailbox or forwarding provider for:
  - `hello@vizbiz.ai`
  - `reports@vizbiz.ai`
  - optionally `dmarc@vizbiz.ai`
- Then set Resend sender/reply-to as:
  - From: `VizBiz Reports <reports@vizbiz.ai>`
  - Reply-To: `Alex at VizBiz <hello@vizbiz.ai>`

Possible providers:

- Namecheap Private Email
- Google Workspace
- Zoho Mail
- Cloudflare Email Routing if DNS moves to Cloudflare later
- ImprovMX / Forward Email if we only need forwarding

Do not add random MX records until Alex chooses the inbox provider. MX records are provider-specific.

## Required Vercel production env vars

Before production launch, confirm these in Vercel project `vizbiz-website`:

```txt
NEXT_PUBLIC_SITE_URL=https://vizbiz.ai
RESEND_API_KEY=[secret]
RESEND_FROM_EMAIL=VizBiz Reports <reports@vizbiz.ai>
RESEND_REPLY_TO_EMAIL=Alex at VizBiz <hello@vizbiz.ai>
NEXT_PUBLIC_SUPABASE_URL=[public Supabase URL]
SUPABASE_SERVICE_ROLE_KEY=[secret]
STRIPE_FIX_PACKAGE_URL=[live $88 payment link]
STRIPE_MONTHLY_GROWTH_URL=[live $188/mo payment link]
STRIPE_WEBHOOK_SECRET=[secret]
GOOGLE_PLACES_API_KEY=[secret]
OPENAI_API_KEY=[secret, if used]
PERPLEXITY_API_KEY=[secret, if used]
TAVILY_API_KEY=[secret, if used]
MISSION_CONTROL_PASSWORD=[secret]
MISSION_CONTROL_SECRET_SALT=[secret]
```

Do not expose actual secret values in docs, commits, screenshots, or Telegram messages.

## Verification commands after DNS edits

Run these after waiting 5–30 minutes, then again after full propagation if needed:

```bash
dig +short NS vizbiz.ai
dig +short A vizbiz.ai
dig +short CNAME www.vizbiz.ai
dig +short MX vizbiz.ai
dig +short TXT vizbiz.ai
dig +short TXT _dmarc.vizbiz.ai
dig +short TXT resend._domainkey.vizbiz.ai
dig +short TXT rs2024a._domainkey.vizbiz.ai
dig +short TXT rs2024b._domainkey.vizbiz.ai
dig +short TXT rs2024c._domainkey.vizbiz.ai
curl -I -L https://vizbiz.ai
curl -I -L https://www.vizbiz.ai
```

Expected before client email launch:

- Root TXT includes exactly one SPF record.
- Resend dashboard shows domain verified/green.
- DKIM is verified in Resend.
- DMARC exists.
- A real reply-to inbox or forwarding route works.
- `https://vizbiz.ai` loads production.
- `https://www.vizbiz.ai` loads or redirects correctly.

## Manual email warm-up test

Send one branded test report email to each:

- Gmail
- Outlook/Hotmail
- iCloud

For each inbox, check:

- lands in Inbox or Promotions, not Spam
- From name displays as expected
- Reply-To works
- report link uses `https://vizbiz.ai`, not a Vercel preview URL
- CTA links go to live Stripe products
- no broken images/logo
- subject line is not spammy

Recommended first subject:

```txt
Your VizBiz AI visibility snapshot is ready
```

Avoid early cold-domain spam language:

```txt
URGENT!!! You are INVISIBLE and losing MONEY!!!
```

That subject has the emotional stability of a raccoon in a vending machine. We do not use it.

## Launch readiness status

Current status: **not fully email-ready**.

Blockers before client-facing automated email:

- No SPF observed at root.
- No MX observed for inbound replies.
- Need Resend dashboard confirmation for DKIM/domain verification.
- Need Vercel production env confirmation for branded sender and canonical URL.

Website DNS status: **appears Vercel-pointed**, pending post-deploy public smoke tests.

## Recommended next action

1. Alex chooses the inbound email provider or confirms “sending-only for now.”
2. Add/verify Resend DNS records in Namecheap.
3. Add SPF.
4. Configure `RESEND_FROM_EMAIL` and `RESEND_REPLY_TO_EMAIL` in Vercel production.
5. Send controlled tests before any client report automation goes live.
