# OpenClaw Lessons to Port into the New VizBiz Vessel

**Status:** Source-of-truth planning note for consolidating lessons from the first OpenClaw/VizBiz iteration into the new Vercel/Supabase VizBiz app.

**Decision:** The new VizBiz app is the primary vessel. The old OpenClaw setup is reference material only unless a specific module is intentionally ported. Do not keep two active intake systems, two CRMs, two pricing models, or two report engines long-term.

**Current primary app:** `/Users/vlad/VizBiz/app/vizbiz-website`

---

## Guiding Architecture

```text
New polished VizBiz intake
→ Supabase lead + attribution
→ site intelligence / preflight
→ local AI visibility scoring
→ mini report teaser
→ Mission Control review/actions
→ paid fulfillment via Stripe
→ email + Telegram + Google Sheets mirror
```

The old OpenClaw project should influence the new app, not remain a separate production dependency.

---

## What to Preserve from OpenClaw

### 1. Preflight before scoring

OpenClaw’s strongest design decision was running a preflight stage before research/scoring.

Port into new app:

- Crawl/scrape client site.
- Infer niche and business type from website content.
- Extract services, city/market, target audience, search language, trust signals, and visible pricing.
- Check AI-readiness signals: schema, title/meta clarity, local NAP, service pages, reviews/social proof, FAQ/buyer questions, and llms.txt/sitemap readiness.
- Save raw preflight JSON to Supabase so expensive work is not repeated unnecessarily.

New-app status: partially present. Needs deeper extraction and durable Supabase schema.

---

### 2. Async processing

OpenClaw correctly separated intake from longer research.

Target behavior in new app:

```text
Client submits intake
→ lead saved immediately
→ client gets fast response/report-start state
→ background preflight/research runs
→ Alex gets Telegram alert when ready
→ Mission Control shows review queue
```

Avoid making the user wait 2–5 minutes on the intake request.

---

### 3. Review-before-delivery workflow

OpenClaw had useful operator actions:

```text
/approve
/hold
/rerun
/fix
```

Port as Mission Control actions:

- Approve report
- Hold report
- Rerun research
- Edit/fix report data
- Strip junk competitor
- Send report email
- Draft outreach email

Reports should not automatically send detailed paid/client-facing content until approved unless explicitly enabled later.

---

### 4. Competitor validation and junk filtering

Port the OpenClaw pattern:

- Prefer the two user-supplied competitors from intake.
- If missing, auto-discover exactly two local competitors.
- Filter junk: directories, social platforms, broad marketplaces, unrelated corporate results, listicles, generic result pages.
- Verify competitor URL relevance and niche match.
- Store why each competitor was accepted/rejected.

This should live in one shared module, not duplicated across scoring/report code.

---

### 5. Query fan-out scoring

OpenClaw already used Edward Sturm-style query fan-out.

Port into scoring:

- Start from buyer prompts like “best [service] near me/in [city]”.
- Generate likely grounding/follow-up searches AI would run.
- Check whether the client has pages/proof for those searches.
- Score coverage gaps across service/city pages, FAQ pages, reviews, social proof, and brand trust queries.

Client-safe framing:

```text
AI does not just know who to recommend. It looks for repeated proof across the web. The sooner your local proof is online, the harder it is for nearby competitors to catch up.
```

---

### 6. Social, review, and YouTube signals

OpenClaw checked social/review/YouTube signals. Keep the concept, but implement in the new app with conservative claims.

Signals to evaluate:

- Google Business Profile presence and reviews if available.
- Website testimonials/review proof.
- Instagram/Facebook/YouTube presence if discoverable.
- Whether reviews can be syndicated into AI-readable website/social proof.
- Whether brand searches like `brand + reviews`, `brand + legit`, `brand + city`, and `brand + service` are protected.

Do not overpromise rankings. Score proof clarity and local recommendation readiness.

---

### 7. Telegram operator alerts

OpenClaw’s notification protocol is valuable. Port into new app with attribution included.

New lead alert should include:

- Business name
- Website
- City/market
- Email
- Competitor 1 and 2
- Source / medium / campaign
- Referrer
- Landing page
- Report URL
- Current status

Research done alert should include:

- AVI/local visibility score
- niche confidence
- top 3 gaps
- strongest competitor threat
- recommended next action
- Mission Control link

---

### 8. Google Sheets as mirror only

OpenClaw used Sheets as CRM. In the new app:

- Supabase is source of truth.
- Google Sheets is a convenience mirror.
- Never make Sheets the only store for lead status, attribution, paid state, or report data.

Useful Sheets columns:

```text
created_at
business_name
email
website_url
city
competitor_1
competitor_2
utm_source
utm_medium
utm_campaign
utm_content
utm_term
referrer
landing_page
report_url
status
cta_clicked
paid_status
last_event
```

---

## What to Avoid from OpenClaw

- Do not keep old high-ticket pricing in public new-app copy by default.
- Do not keep the old intake as an active competing source of truth.
- Do not duplicate revenue calculations across modules.
- Do not duplicate Tavily/search clients across modules.
- Do not let AI-generated detailed reports auto-send without review.
- Do not mix old dealership/vertical-specific copy into generalized client reports.
- Do not index manual/sample report pages unless intentionally converted into public demos.

---

## New App Porting Priority

### Phase 1 — Rapid transition essentials

1. Custom domain/subdomain connected.
2. GA4 installed and conversion events wired.
3. GSC verified and sitemap submitted.
4. Attribution visible per lead in Supabase/Mission Control/Telegram.
5. Resend email delivery working.
6. Telegram lead alerts working.
7. Manual/sample reports stay noindex.

### Phase 2 — OpenClaw intelligence ports

1. Stronger preflight/site-intelligence extraction.
2. Competitor junk filter + URL verification.
3. Mission Control approve/hold/rerun/fix actions.
4. Query fan-out scoring.
5. Social/review/YouTube signal scoring.
6. Google Sheets CRM mirror.
7. Async background research queue.

### Phase 3 — Monetization workflow

1. Confirm Stripe CTA and purchase webhooks with a real/test transaction.
2. Paid order creates fulfillment task.
3. Paid report/fix package queue appears in Mission Control.
4. Monthly plan creates recurring monitoring schedule.
5. Report email sequence and operator follow-up templates.

---

## Default Pricing in the New Vessel

Use current low-friction VizBiz pricing unless explicitly changed:

```text
One-Time Full Report + Fix: $88 USD
Monthly Full Report Growth Plan: $188 USD/month
```

Old OpenClaw prices were useful agency-positioning history but should not leak into the current public funnel by default.

---

## Definition of Done for Consolidation

The new VizBiz vessel has absorbed the lessons when:

- A lead can submit one public intake.
- Supabase stores lead, attribution, report slug, status, and events.
- Alex gets attribution-aware Telegram alerts.
- The app performs site intelligence before scoring.
- Competitors are validated or rejected with reasons.
- The mini report includes local domination, service/city, review proof, brand-search, and FAQ gaps.
- Mission Control supports review actions.
- Paid CTAs and Stripe webhooks update Supabase.
- Email delivery sends approved reports.
- GA4/GSC provide traffic/search visibility.
- Google Sheets mirrors only the useful CRM view.
- The old OpenClaw app can be archived as reference.
