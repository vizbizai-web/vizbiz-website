# VizBiz Friday Production Launch Runbook

Status: safe launch prep document. Use this for a controlled soft launch, not a mass public blast.

## Launch posture

Launch mode: controlled soft launch.

Client-facing promise: VizBiz helps local businesses understand and improve visibility in popular AI recommendations and AI-powered search.

Operational rule: if report evidence is weak, inconsistent, or generic, hold it for operator review. Do not auto-email questionable reports.

Architecture rule: production launch must follow `docs/launch/report-quality-architecture-reset.md`. Report/email renderers should consume a client-safe payload, not raw research notes. The exact rendered output must be read before any test email, Alex preview, or client send.

Subagent/model rule: use `docs/launch/subagent-model-strategy.md` for role/model routing. Subagents are inspectors only. Their output is not approval. Release Captain final visible-output review is mandatory.

## Current known readiness

Green:
- Local tests passed: 101/101.
- Local production build passed.
- Supabase REST/table access verified.
- Reversible Supabase write smoke passed for leads, lead_events, report_jobs.
- Local intake → queue → worker → quality gate → report page smoke passed.
- Stripe payment links reachable.
- Preview deployment created and ready.
- Legal/contact routes exist.
- Mission Control password/salt configured in Preview and Production.

Yellow:
- Production push/deploy still requires explicit founder approval.
- Email DNS is not complete until SPF exists at authoritative DNS.
- Real production smoke must happen after deploy.

Red until fixed:
- SPF TXT missing for vizbiz.ai.
- No MX record for replies at the root domain. Not always fatal for sending, but weak for trust/reply handling.

## Pre-launch DNS checklist

Authoritative nameservers currently appear to be registrar DNS:
- dns1.registrar-servers.com
- dns2.registrar-servers.com

Add this at Namecheap/registrar DNS:

```txt
Type: TXT
Host: @
Value: v=spf1 include:amazonses.com ~all
TTL: Automatic or 30 min
```

Existing/expected:

```txt
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none;
```

DKIM:
- Keep the Resend-provided `resend._domainkey` record exactly as shown in Resend.

Optional but recommended:
- Add MX records for the provider that receives `hello@vizbiz.ai` replies.

Verification commands:

```bash
dig +short NS vizbiz.ai
dig +short TXT vizbiz.ai
dig +short TXT _dmarc.vizbiz.ai
dig +short TXT resend._domainkey.vizbiz.ai
dig +short MX vizbiz.ai
```

Pass condition:
- Root TXT includes `v=spf1 include:amazonses.com ~all`.
- DMARC returns `v=DMARC1; p=none;` or stricter.
- Resend DKIM exists.
- Reply inbox is confirmed or MX plan is known.

## Production deploy sequence

Do not run these until Alex explicitly approves production push.

```bash
cd /Users/vlad/VizBiz/app/vizbiz-website

git status -sb
git log --oneline origin/main..HEAD | head -20
npm test
npm run build

git push origin main
```

Then watch Vercel production deploy from dashboard or CLI:

```bash
vercel ls --format json
```

## Production smoke test

After production is live, test in this order.

### 1. Static routes

```bash
curl -I https://vizbiz.ai/
curl -I https://vizbiz.ai/privacy
curl -I https://vizbiz.ai/terms
curl -I https://vizbiz.ai/contact
curl -I https://vizbiz.ai/sitemap.xml
curl -I https://vizbiz.ai/llms.txt
```

Pass:
- 200/3xx expected responses.
- No 404s for legal/contact routes.

### 2. Homepage visual check

Check desktop and mobile:
- hero readable
- intake card visible
- CTA visible
- no clipped form fields
- footer legal links visible

### 3. Intake queue smoke

Submit one controlled test lead from the production homepage using Alex-owned email.

Use a real-ish business input:
- business name
- website
- city/ZIP/postal code
- primary service
- exactly two competitor fields if known
- UTM/source test param if possible

Pass:
- API returns queued status.
- Supabase lead row exists.
- lead_events includes submitted/report_queued.
- report_jobs row exists with queued status.
- attribution/referrer/landing info persisted in raw_intake.

### 4. Worker smoke

Run a single worker tick against fresh queue.

```bash
cd /Users/vlad/VizBiz/app/vizbiz-website
npm run worker:reports -- --limit=1
```

Pass:
- If evidence is weak, status becomes `needs_operator_review` with specific reasons.
- If evidence is strong, report is generated and saved.
- Report page route renders.
- No questionable report is emailed automatically.

### 5. Report page smoke

Open generated report slug.

Check:
- report is built from the approved `ClientReportPayload`, not raw research notes
- popular AI visibility framing, not Perplexity-only
- human-like AI question examples
- no unsupported competitor claims
- no stale vertical/dealership wording unless the business is a dealership
- no internal/operator wording such as `the client named`, `paid report should`, `manual review`, `operator approval`, `auto-discovered competitors`, `internal only`, or pipeline/debug language
- 0/N AI appearances displays `Not ranked` / `AI Presence`, never a flattering rank
- paid CTA buttons visible
- free report keeps exact fixes/details locked for paid
- exact CTA route opens real intended content on `vizbiz.ai`

### 6. Stripe CTA smoke

From the generated report page, click/check:
- $88 Full Report + Fix CTA
- $188/mo Monthly Growth Plan CTA

Pass:
- Redirects to Stripe Payment Link.
- `client_reference_id` includes report slug/product.
- Email prefill/attribution is included where available.

### 7. Mission Control smoke

Open `/mission-control`.

Pass:
- Login works using launch credential.
- Reports/queue view shows latest job.
- Lead status and blocker reasons visible.
- Paid fulfillment area/task visibility is acceptable for manual launch.

## Rollback plan

If production deploy is bad:
1. Do not keep testing live traffic.
2. In Vercel dashboard, redeploy/promote previous known-good deployment.
3. If the issue is env-only, fix Vercel env and redeploy.
4. If the issue is code, revert locally:

```bash
git revert <bad_commit_sha>
git push origin main
```

5. Re-run production smoke.

## First 48-hour operating rules

- Keep launch quiet.
- Review every generated report before real client email if quality gate has concerns.
- Treat `needs_operator_review` as product safety, not failure.
- Track every lead source: UTM, referrer, landing page, business URL, and whether they came from outreach/friendly test/direct.
- Manually fulfill paid buyers with templates until automation proves itself.

## Friday launch success definition

Minimum viable launch is achieved when:
- production homepage is live
- intake works
- Supabase captures leads and attribution
- report queue works
- weak reports are held
- at least one production report route renders
- Stripe CTAs redirect correctly
- Alex can log into Mission Control
- first friendly prospects can be sent the site confidently
