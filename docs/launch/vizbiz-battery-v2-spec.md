# VizBiz Paid Battery v2 — 60-Prompt Diagnostic Spec

Purpose: raise paid depth from 20 to 60 prompts per engine, structured
so the report diagnoses WHERE a client fails (not just how often), and
mine answer citations so the fixes target the sources AI actually
trusts in their market.

Core principle: prompts must sound like real people talking to a
chatbot — conversational, situational, constraint-laden — and every
prompt is generated from the client's resolved profile (services,
segments, market, competitors, language). No generic templates with a
city swapped in.

---

## 1. The category framework (60 prompts, 8 categories)

Every paid battery guarantees coverage across these categories.
Counts flex ±2 by business type; irrelevant categories are skipped and
their allocation redistributed (e.g., no "inventory" class for a law
firm — that category only exists for retail/dealer types).

### C1 — Discovery / recommendation (12)
How people actually open: a need plus a place plus often a constraint.
- "best {service} in {city}"
- "who should I call for {service} in {neighborhood}"
- "I need a {provider type} in {city} who can {constraint: come today
  / see me this week / handle urgent cases}"
- "recommend a {provider} near {landmark/area} for {service}"

### C2 — Service-specific (12)
One or two prompts per service in the resolved profile, phrased as a
buyer with that exact need:
- "{specific service} in {city}" ("CRA audit representation Kitchener")
- "who does {service} for {segment}" when segments exist
This is the category that punishes thin service pages — and feeds the
Fix Kit's FAQ/content targeting directly.

### C3 — Problem-first / situational (8)
The most realistic chatbot behavior: people describe symptoms, not
services. Generated from the profile's services mapped to the problems
they solve:
- "my basement is flooding, who do I call in {city}"
- "I was rear-ended and the insurance offer seems low — what kind of
  lawyer do I need in {city}"
- "my {thing} is {broken/failing}, is this a {trade} job"
An AI that recommends the client here has truly understood what they
do. Most businesses lose this category first.

### C4 — Comparison / alternatives (6)
- "{client} vs {named competitor}"
- "alternatives to {named competitor} in {city}"
- "is {competitor} the best option for {service} in {city}"
Named competitors from intake are injected HERE and only here (the
resolver's isolation rules still hold everywhere else).

### C5 — Trust / reputation (6)
- "is {client} reputable"
- "reviews of {client} — what do people say"
- "can I trust {provider type} with {high-stakes version of service}"

### C6 — Local intent variants (6)
Neighborhood-level and voice-style phrasing:
- "{service} near me" (location-contextualized)
- "{service} open now in {city}"
- "cheapest / fastest {service} around {area}"

### C7 — Objection / decision (5)
- "how much does {service} cost in {city}"
- "is it worth hiring a {provider} for {situation}"
- "do I need a {provider} or can I do {thing} myself"
Appearing in cost/worth answers = being present at the decision
moment; also seeds pricing-transparency fixes.

### C8 — Branded (5)
- "{client name} {city}"
- "what services does {client} offer"
- "{client} hours / location / contact"
Purpose is different from the rest: not "do we appear" but "does AI
know us, and is what it says CORRECT." Wrong hours, dead addresses,
or stale service lists in branded answers are a distinct finding class
(misinformation) with its own fix priority.

Language: the full battery generates in the site's language (Spanish
sites get Spanish prompts, per existing language handling).

Scoring: appearance is scored per category per platform. The blended
score stays for trends; the CATEGORY SCORECARD becomes the diagnostic
layer.

---

## 2. Citation-source mining (the "why" layer)

Perplexity and Gemini grounded answers return citations; OpenAI
web_search returns sources. We already store them — v2 aggregates them:

Per audit, compute a **source ledger**:
- Every domain cited across all 180 datapoints (60 × 3 engines)
- Which sources fed answers where the CLIENT appeared
- Which sources fed answers where COMPETITORS appeared
- The gap: sources that drive recommendations in this market where the
  client has no presence (their GBP weak, absent from a directory that
  Perplexity leans on in this niche, no coverage on a local news site
  Gemini keeps citing, etc.)

Report rendering: "Where AI gets its answers about {market}" — top
cited sources ranked, client's presence on each marked ✓/✗.

Fix Kit consumption: the source gap becomes fix targets — a new
artifact class or an extension of A6/roadmap: "get listed/strengthened
on {source}" items with instructions. This converts the audit from
"you're invisible" to "you're invisible BECAUSE the three sources AI
trusts in your market don't know you — here's each one."

Validation: source ledger is deterministic aggregation of stored
citation data — no LLM, no invented sources. A domain appears in the
ledger only if it appears in a stored citation.

---

## 3. Category scorecard (report rendering)

Paid report gains a diagnostic block between the headline score and
the prompt table:

Per category row: name (owner-language: "When customers describe a
problem", not "C3"), appearance rate per platform, verdict chip
(Strong / Mixed / Invisible), and a one-line implication tied to the
fix ("Your service pages don't answer problem-first questions — this
month's FAQ block targets exactly these").

Verdict thresholds: Invisible <15%, Mixed 15–50%, Strong >50% within
category (tunable; thresholds live in one config).

The one-pager's "what changed" gains category granularity when
comparable ("Problem-first: 0% → 25% — the new FAQ block is being
picked up").

---

## 4. Migration & comparability

- New paid baselines use v2 (60 prompts, category-tagged plan).
- Existing snapshots/plans are untouched; any active subscriber
  migrates via a deliberate re-baseline (comparability guard renders
  "re-baselined" for that month, as designed).
- Prompt plans store category tags per prompt; the diff engine gains
  per-category movement (gained/lost within category), guarded by the
  same comparability rules.
- Free tier stays at 5 (teaser: one C1, one C2, one C3, one C5, one
  C8 — a miniature of the framework so the free report hints at the
  category story the paid report tells).
- Copy updates: "up to 60 buyer questions per platform" on paid
  surfaces; watchdog patterns updated to match.

## 5. Cost & runtime

180 datapoints/audit ≈ $0.75–0.90 provider cost (verified per-prompt
rates). Runtime: monthly cron runs took ~2–3 min at 60 datapoints;
expect ~6–9 min at 180 — fine for async, verify no route/function
timeout at the new depth (batch per-engine calls if needed).

## 6. Acceptance fixtures

1. Category coverage: plumbing fixture generates all 8 categories at
   quota; law-firm fixture skips inventory-class correctly.
2. Profile grounding: every generated prompt contains evidence-traceable
   profile elements (service/segment/market/competitor) — no orphan
   generic prompts.
3. Problem-first quality: C3 prompts phrase symptoms, not service
   names, for two different verticals (mechanical check: service-name
   absence + symptom-vocabulary presence).
4. Competitor injection isolation: competitor names appear in C4 only.
5. Spanish fixture: full battery in Spanish, categories intact.
6. Source ledger determinism: ledger built twice from same stored
   citations is identical; every ledger domain traces to a stored
   citation.
7. Category scorecard renders; verdict chips match configured
   thresholds; branded-misinformation finding surfaces when C8 answer
   facts conflict with profile facts.
8. Re-baseline path: v1 subscriber migrating to v2 triggers
   comparability guard, renders "re-baselined", resumes trends next
   comparable month.
9. Depth runtime: full 180-datapoint run completes within platform
   timeout on production.
