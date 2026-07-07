# VizBiz Client Zero — Automated Self-Audit & Public Proof Spec

Purpose: VizBiz becomes its own permanent subscriber. The pipeline
audits vizbiz.ai on a schedule, charts the results in Mission Control,
implements its own fixes, and publishes an honest public trend page.
Zero new measurement machinery — this reuses the subscriber loop,
snapshots, diff engine, and Fix Drop that already exist. The build is
mostly wiring + two views.

Design rules:
- Client Zero runs through the SAME pipeline as paying clients. No
  special code paths for ourselves — if the pipeline has a bug, we
  want to hit it first.
- Self-data is excluded from client metrics (like qa_ rows) but NOT
  hidden: it gets its own dashboard.
- The public page shows real numbers including bad months. The
  honesty is the marketing.

---

## 1. The Client Zero lead

- One permanent lead: business "VizBiz", website vizbiz.ai, market
  "Ontario, Canada" (national intent included in prompts), source
  `client_zero` (excluded from inbound metrics, badge in MC).
- Niche: declared as "AI visibility service for local businesses" —
  and note: the segment-trap check false-positived on our own copy
  once before. If it CONFLICTs again, resolve via the MC panel; if
  the head-noun tuning ticket is needed to make Client Zero resolve
  cleanly, that ticket gets pulled forward into this build.
- Competitors: pick 2 real named competitors from the category (e.g.
  Otterly, Peec — the self-serve tools a searching buyer would
  compare us to). Same client_provided rules as any lead.

## 2. The self-battery

Full v2 battery generated from OUR profile — the 8 categories apply
naturally:
- C1: "best AI visibility tracking service", "who can check how my
  business shows up in ChatGPT"
- C2: per our services — "service that fixes AI search visibility for
  local businesses", "AI visibility report for law firms Ontario"
- C3 problem-first: "customers say they found my competitor through
  ChatGPT — how do I fix that", "my business doesn't show up when
  people ask AI for recommendations"
- C4: "{competitor} alternatives", "VizBiz vs {competitor}"
- C5: "is VizBiz legit", "VizBiz reviews"
- C8: "what does VizBiz.ai do", "VizBiz pricing"
Paid depth (60 × 3 engines), monthly cadence via the existing
subscriber scheduler — Client Zero is registered in
subscriptions_local with a synthetic/internal subscription id and a
flag exempting it from Stripe lifecycle pausing.

WEEKLY light pulse (optional intensity, config flag): the free-mini
5-prompt set runs weekly between monthly fulls, stored as snapshots
run_type "pulse", tier "free". Pulses feed the MC chart's fine grain
but are EXCLUDED from month-over-month diffs (comparability guard
already enforces this since totals differ). Weekly cost: pennies.

## 3. Self Fix Drop → implementation loop

Monthly run produces a Fix Drop like any subscriber. Difference:
implementation is ours.
- Fix Drop artifacts for Client Zero surface in Needs-You as
  "Client Zero fix ready" items.
- Implementing = Forge applies the artifact to the vizbiz.ai codebase
  (schema, llms.txt updates, FAQ/content additions, meta rewrites)
  as a normal committed change, watchdog-checked.
- Fix verification (the existing manifest check) then confirms our
  own installs on the next run — the same accountability clients get.

## 4. Mission Control: Dogfood dashboard

New MC page (secondary nav, alongside/replacing Visibility Engine
project card): "Client Zero".

Charts (all from audit_snapshots, no new data model):
- Blended score trend line, monthly points, pulse points as lighter
  dots on the same axis (tier-labeled per the existing ticket — this
  build implements that ticket for this chart)
- Per-engine trend lines (ChatGPT / Gemini / Perplexity)
- Category scorecard current-month view + per-category sparkline
  (C1–C8 over time)
- Competitor overlay: our named competitors' appearance rates vs ours
- Source ledger table: top cited domains in OUR market, our
  presence ✓/✗, delta since last month — this is the placement
  roadmap view ("get present on these")
- Fix implementation status: artifacts delivered vs verified-live

Chart implementation: server-rendered or lightweight client charts —
consistent with existing MC stack; no heavy chart dependency if the
existing report trend rendering can be reused.

## 5. Public trend page

Route: vizbiz.ai/our-own-score (or /proof — Alex picks the slug).

Content, brand-voice throughout:
- Headline: "We run VizBiz through VizBiz. Here's our own score."
- The blended trend chart (monthly points only — public page shows
  the clean monthly line, not pulses)
- Per-engine current rates
- One-line honest commentary per month, operator-approved: what
  moved, what we changed ("Added FAQ content targeting problem-first
  questions; C3 went 8% → 21%"). When flat: flat, and why we think so.
- Methodology block: prompt count, engines, cadence, link to the
  studies-registry explanation. Every number traces to a snapshot.
- CTA at the bottom only: "Want this chart for your business?"

Gating: the page updates ONLY via operator approval — the monthly
Client Zero one-pager approval in Needs-You doubles as the publish
gate (approve = MC dashboard AND public page update together).
qa:client-copy runs on the commentary. No auto-published numbers.

## 6. Automation summary (what runs without Alex)

- Weekly pulse run (cron, existing scheduler pattern) → snapshot →
  MC chart updates automatically (internal only)
- Monthly full run → snapshot → diff → Fix Drop generated → one-pager
  drafted → Needs-You card
- Alex's only touches: approve the monthly card (which publishes the
  public update), and approve Fix Drop implementations
- Telegram: monthly Client Zero card pings like any subscriber alert

## 7. Metrics hygiene

- source=client_zero excluded from: inbound lead counts, conversion
  metrics, revenue funnels, spam/triage stats
- Included in: provider status dots and spend estimate (it's real
  spend), with a labeled line item
- Snapshots tagged so client-facing aggregate studies never
  accidentally include our own data

## 8. Acceptance fixtures

1. Client Zero lead resolves cleanly (or documents the head-noun
   tuning fix if needed) and completes a full v2 run end-to-end.
2. Weekly pulse writes a tier=free run_type=pulse snapshot; monthly
   diff ignores pulses (comparability guard proof).
3. MC dashboard renders all chart blocks from real snapshots; tier
   labels visible on mixed-depth chart.
4. Fix Drop for Client Zero surfaces in Needs-You; a sample artifact
   implemented in-repo passes watchdog; next run's fix verification
   marks it live.
5. Public page: renders monthly line + commentary ONLY after
   one-pager approval; unapproved month absent; watchdog clean; no
   internal vocabulary.
6. Metrics exclusion: client_zero absent from inbound/lead/revenue
   counts, present in spend line.
7. Full run twice, stable executed totals (the v2 stability standard
   applies to ourselves too).
