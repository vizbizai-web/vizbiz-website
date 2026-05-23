# VizBiz Launch and Paid Deliverables Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Launch VizBiz soon with a credible free AI visibility report funnel and paid deliverables that feel worth $88 one-time and $188/month.

**Architecture:** Ship a conservative production launch first: public landing page, fast lead capture, async/report-ready processing, Telegram/Sheets/Supabase tracking, Stripe CTAs, and client-facing paid deliverable previews. Paid output should be implementation-backed, not just a PDF: diagnosis, fix plan, exact assets, tracker, and verification.

**Tech Stack:** Next.js 16, Vercel, Supabase/Postgres, Google Sheets mirror, Telegram alerts, Resend email, Stripe Payment Links/webhooks, local/Mac mini background worker until hosted worker/cron is justified.

---

## Launch Principle

Launch once the site can safely do these five things:

1. Capture a real lead with source attribution.
2. Create or queue a free AI visibility mini report without timing out.
3. Alert Alex/operator in Telegram with the lead and report status.
4. Show a polished free report with clear CTAs.
5. Accept payment and create a fulfillment task without losing buyer attribution.

Do **not** wait for the perfect report engine. Launch with conservative claims, manual/operator review, and paid fulfillment that can be partly manual at first.

---

## Phase 1 — 24-48 Hour Launch Gate

### Task 1: Freeze Launch Scope

**Objective:** Decide what must be live on day one and what can remain manual.

**Day-one live:**
- Landing page at production domain.
- Free mini-report intake.
- Two competitor fields.
- Lead-level attribution: UTM, referrer, landing page.
- Telegram new-lead alert.
- Free report preview page.
- CTA tracking endpoint before Stripe redirect.
- Stripe links for $88 and $188.
- Purchase success page.
- Paid intake/order queue.

**Manual allowed at launch:**
- Operator review before sending client email.
- Manual improvement of report copy for first paying clients.
- Manual implementation of simple fixes when client gives access.
- Manual monthly monitoring summaries for first few clients.

**Do not launch without:**
- Buyer-safety alerts.
- Payment-to-lead attribution.
- A fulfillment task created for paid buyers.
- Clear paid deliverable descriptions.

---

### Task 2: Verify Production Build and Test Baseline

**Objective:** Confirm current code can ship.

**Commands:**
```bash
npm test
npm run build
```

**Current verified status on 2026-05-21:**
- `npm test`: 23/23 test files, 59/59 tests passed.
- `npm run build`: passed.

**Known warning:**
- Next.js warns that `middleware` file convention is deprecated and should move to `proxy` later. This is not launch-blocking.

---

### Task 3: Production Environment Checklist

**Objective:** Ensure Vercel has everything needed before production deploy.

**Required Vercel env vars:**
- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Email:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
- Stripe:
  - `STRIPE_FIX_PACKAGE_URL`
  - `STRIPE_MONTHLY_GROWTH_URL`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Alerts:
  - Telegram bot/chat/topic env vars currently used by the app.
- AI/search providers:
  - Keep free checks cheap/conservative.
  - Paid report can use deeper provider stack after payment.

**Verification:**
- Temporary test lead creates DB row.
- Telegram alert fires.
- Email dry-run or real Resend send is visible.
- CTA click is logged before Stripe redirect.
- Stripe webhook creates or updates fulfillment order.

---

### Task 4: Domain and Vercel Launch

**Objective:** Put the site on the public VizBiz domain.

**Steps:**
1. Confirm production branch.
2. Commit launch changes.
3. Deploy preview first.
4. Verify preview homepage, intake, report page, purchase success.
5. Promote/deploy production.
6. Connect Namecheap DNS to Vercel.
7. Verify canonical domain, HTTPS, `/sitemap.xml`, `/llms.txt`, and report routes.

**Commands:**
```bash
vercel deploy -y --no-wait --scope vizbizai-4875s-projects
vercel inspect <preview-url> --scope vizbizai-4875s-projects
vercel deploy --prod -y --no-wait --scope vizbizai-4875s-projects
```

**Important:** Only production deploy after Alex approves the preview.

---

## Phase 2 — Free Funnel Readiness

### Task 5: Intake UX

**Objective:** Make the form feel easy and trustworthy.

**Fields:**
- Business name
- Website
- Email
- City / ZIP / postal code / country or market
- Top competitor 1
- Top competitor 2
- Optional niche/service hint
- Hidden attribution: UTM source/medium/campaign/content/term, referrer, landing page, first touch timestamp

**Copy:**
- “Run my free AI visibility report”
- “Top 2 competitors recommended”
- “Optional, but strongly recommended — competitor names make the benchmark more accurate.”

**Verification:**
- Mobile form fits without horizontal overflow.
- One competitor per field.
- Blank competitors produce client-only report mode.

---

### Task 6: Free Report Page QA

**Objective:** Ensure the free report sells without giving away the paid fix.

**Free report should show:**
- AVI score and band.
- Popular AI recommendations language, not Perplexity-only language.
- Natural AI recommendation moments, not keyword-stuffed prompts.
- AI Social Proof Score.
- LLM / Agent Readiness.
- 2-3 high-level gaps.
- Named competitor context only when source-safe.
- Paid report CTAs.

**Free report should hide:**
- Raw provider responses.
- Full prompt list.
- Exact technical implementation details.
- Detailed page-by-page fixes.
- Auto-discovered competitors unless client/operator-approved.
- Fake revenue estimates for verticals without validated assumptions.

---

## Phase 3 — Paid Deliverable Model

## $88 One-Time Full Report + Fix

### Positioning

**Promise:**
“One focused AI visibility diagnosis plus an implementation-ready fix pack for the highest-impact gaps.”

**Important:** This must feel more valuable than a PDF. It should include exact fixes/assets the client can use.

### Deliverable Package

1. **Full AI Visibility Report**
   - 100-150 AI recommendation moments; default target: 120.
   - Clustered by buyer journey:
     - Discovery
     - Trust/reputation
     - Service/product-specific intent
     - Competitor comparison
     - Buying-now intent
     - Objection/decision support
     - Adjacent market or product-use cases
   - Platform/source labels with claims-safe wording.
   - “Appeared / missed / weak mention / cited competitor” status.

2. **AI/LLM Readiness Audit**
   - Crawlability
   - robots.txt
   - sitemap.xml
   - llms.txt
   - agents.md
   - agentic sitemap / commerce discovery
   - JSON-LD schema
   - FAQ/answer-ready content
   - product/brand/service proof blocks

3. **Competitor Gap Snapshot**
   - Up to 2 client-supplied competitors.
   - Show only validated findings.
   - Explain where competitors are easier for AI to cite.

4. **Implementation Fix Pack**
   - Schema JSON-LD draft.
   - FAQ block draft.
   - Homepage / service / product copy blocks.
   - Review/trust proof placement recommendations.
   - llms.txt / agents.md suggestions when relevant.
   - Sitemap/indexing/crawl notes.

5. **30-Day Fix Roadmap**
   - 5-10 prioritized tasks.
   - Impact/effort score.
   - Owner: client / VizBiz / developer.
   - Verification method.

6. **One Post-Fix Verification Check**
   - After client implements or grants access.
   - Re-check core readiness and 10-20 key recommendation moments.
   - Short “what improved / what remains” summary.

### Client-Facing Value Stack

- Full report: $88
- AI/LLM readiness audit: included
- Schema/FAQ/copy assets: included
- Competitor gap map: included
- 30-day fix roadmap: included
- One verification check: included

### Fulfillment SLA

- Delivery target: 2-3 business days for first version.
- Faster if manual capacity allows.

---

## $188/month Monthly Full Report Growth Plan

### Positioning

**Promise:**
“Monthly monitoring and improvement so your business keeps becoming easier for AI systems to recommend.”

### Monthly Deliverable Package

1. **Monthly AVI Score Refresh**
   - Same core prompt clusters month over month.
   - Add 10-20 new prompts based on trends, website changes, competitors, and client offers.

2. **Competitor Movement Watch**
   - Track 2 named competitors.
   - What changed this month?
   - Which competitor got cited more often?
   - What proof/content/schema helped them?

3. **Monthly Fix Pack**
   - 3-5 implementation-ready tasks per month.
   - Copy block, FAQ, schema, review prompt, page update, or content brief.

4. **LLM / Agent Readiness Monitoring**
   - Check if schema, llms.txt, sitemap, FAQ, contact, reviews, and proof signals changed.
   - Flag regressions.

5. **Monthly Scorecard**
   - Score trend.
   - Appearances trend.
   - Top wins.
   - Top gaps.
   - Next month’s priorities.

6. **Operator Notes / Support**
   - Concise client-facing summary.
   - Optional implementation help for simple fixes when access is provided.

### Fulfillment SLA

- Monthly report delivered every 30 days.
- Client gets 3-5 prioritized actions, not a giant vague audit.

---

## Phase 4 — Paid Fulfillment System

### Task 7: Paid Order Lifecycle

**Objective:** Never lose a paying client.

**Statuses:**
- `paid_pending_intake`
- `intake_needed`
- `queued`
- `researching`
- `draft_ready`
- `operator_review`
- `delivered`
- `verification_pending`
- `completed`
- `monthly_active`

**Buyer safety rule:**
If Stripe purchase cannot be matched to lead/report, create `unmatched_paid_order` and alert Telegram.

---

### Task 8: Paid Report Template Pages

**Objective:** Make paid reports look visibly more valuable than free reports.

**Create route:**
- `/paid-report/[slug]` or internal Mission Control paid report preview first.

**Sections:**
1. Executive snapshot.
2. Full AI visibility scorecard.
3. Platform/source evidence summary.
4. Recommendation-moment evidence table.
5. Competitor gap map.
6. LLM/agent readiness audit.
7. Machine-readable website findings.
8. Implementation fix pack.
9. 30-day roadmap.
10. Verification checklist.
11. Client handoff summary.

**Design requirement:**
- Must feel premium enough for $88/$188.
- Use VizBiz branding/logo.
- Strong section hierarchy.
- Export-ready layout later for PDF/deck.

---

### Task 9: Internal Fulfillment Checklist

**Objective:** Give Alex/Hermes a repeatable fulfillment workflow.

**Checklist:**
1. Confirm payment and client details.
2. Confirm business/niche and two competitors.
3. Run site intelligence.
4. Run full prompt plan.
5. Inspect raw provider output for nonsense.
6. Validate competitor findings.
7. Generate paid report draft.
8. Generate fix pack assets.
9. Operator review.
10. Deliver to client.
11. Schedule verification or monthly refresh.

---

## Launch Messaging

### Homepage Hero

“When someone asks ChatGPT, Google AI, Gemini, Claude, or Perplexity who to choose, does your business show up — or do your competitors?”

### Free Report CTA

“Run my free AI visibility report”

### Paid CTA

“Get the $88 Full Report + Fix”

### Monthly CTA

“Start the $188 Monthly Growth Plan”

### Claims-Safe Promise

“We improve the website, schema, reviews, content, and trust signals that make your business easier for AI systems to understand, cite, and recommend. We do not guarantee rankings or AI placement.”

---

## Final Launch Checklist

- [ ] Tests pass.
- [ ] Build passes.
- [ ] Production env vars set.
- [ ] Supabase source of truth working.
- [ ] Google Sheets mirror working or deliberately deferred.
- [ ] Telegram lead alert works.
- [ ] Resend email works or dry-run is clearly marked.
- [ ] Stripe CTA tracking works.
- [ ] Stripe webhook works.
- [ ] Purchase success page works.
- [ ] Paid fulfillment task is created.
- [ ] `/sitemap.xml` works.
- [ ] `/llms.txt` works.
- [ ] Homepage mobile QA passes.
- [ ] Free report mobile QA passes.
- [ ] No Perplexity-only client-facing framing.
- [ ] No fake competitor scores.
- [ ] No stale vertical copy.
- [ ] Launch preview approved by Alex.
- [ ] Production deploy completed.

---

## Recommended Launch Sequence

1. Finish buyer-safety/payment/fulfillment verification.
2. Deploy production preview.
3. Review homepage + one mini report on mobile.
4. Connect domain.
5. Launch quietly with manual outreach to existing leads first.
6. Process 3-5 goodwill/free leads manually/operator-reviewed.
7. Use first paid buyer to validate $88 fulfillment package.
8. Only then increase traffic/outreach volume.
