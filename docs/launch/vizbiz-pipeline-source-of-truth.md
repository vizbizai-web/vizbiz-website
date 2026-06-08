# VizBiz Pipeline Source of Truth

Last updated: 2026-06-07
Owner: VizBiz Mission Control / pipeline code
Primary code paths:
- `src/lib/preflight-engine.ts`
- `src/lib/pipeline-controller.ts`
- `src/lib/research-runner.ts`
- `src/lib/full-prompts.ts`
- `src/lib/report-quality-gates.ts`
- `src/app/mission-control/**`

## 2026-06-07 baked-in fixes

These are the current source-of-truth fixes from the ESS Audio / wrong-niche / needs-revision failure class:

1. Removed the hidden hardcoded deprecated provider/model extraction path from `preflight-engine.ts`.
2. Replaced finite-taxonomy-first extraction with deterministic evidence-first Business Intelligence Profile derivation.
3. Made website copy, metadata, schema, Google Places types, services, language, market, and intake city feed `businessType`, `services`, `market`, `searchLanguage`, and query generation before taxonomy fallback.
4. Kept taxonomy `niche` as a secondary compatibility key, not the brain of the pipeline.
5. Regenerated customer and competitor queries when client-declared category overrides automated classification.
6. Preserved paid-intake payloads in preflight notes and passed `customerQuestions` into research prompt seeds.
7. Made paid/full prompt generation seed from Business Intelligence Profile fields before legacy niche defaults.
8. Removed fake `Competitor 1` / `Competitor 2` prompt leakage when no approved competitors exist; category-level comparison prompts are used instead.
9. Added deterministic prompt contamination gates to rebuild stale car/dealer/jewelry/dance-style prompt sets when scraped profile evidence says otherwise.
10. Added provider-decontamination and Business-Profile-first regression tests so the old engine cannot quietly re-enter.

## Non-negotiable rule

VizBiz is evidence-first.

The pipeline must build a **Business Intelligence Profile** before it uses any niche taxonomy. The taxonomy is optional and secondary. It can support economics, broad display labels, or legacy report compatibility, but it must not decide what the business is when the website, Google Places, schema, intake fields, or supplied competitors clearly say otherwise.

## Model policy

- Use the **current configured model/provider** only.
- Do not wire a separate hardcoded provider or model into the app pipeline.
- Subagents may be used in parallel for audits, code review, QA, and implementation support, but client-facing pipeline logic must remain deterministic, inspectable, and gated.
- Any model-assisted extraction must be advisory. Evidence, deterministic guardrails, and QA gates remain authoritative.

## Pipeline logic steps

### 1. Intake

Source: intake routes and lead fields.

Collect:
- business name
- website
- city / market
- contact email
- lead source and referrer / UTM where available
- client-declared business category when provided
- exactly two client-provided competitors for paid intake where available

Rules:
- Client-declared category outranks automated niche guesses.
- Client-provided competitors are preserved as client-provided mode.
- Auto-discovered competitors are internal only until confirmed.

### 2. Preflight evidence collection

Source: `src/lib/preflight-engine.ts`.

Collect evidence from:
- website scrape text
- title and meta description
- Open Graph tags
- schema.org types and name
- contact details
- Google Business Profile enrichment
- city / market from intake
- `llms.txt`, schema, sitemap, blog/review signals

Output:
- `businessType`
- `targetAudience`
- `services`
- `siteLanguage`
- `searchLanguage`
- `market`
- `suggestedSearchQueries`
- `competitorSearchQueries`
- `nicheConfidence`
- `confidenceReason`
- legacy `niche` only as a secondary taxonomy key

### 3. Business Intelligence Profile first

The Business Intelligence Profile is the operating source of truth for prompts and report language.

Priority order:
1. Client-declared category.
2. Clear website / schema / Google Places evidence.
3. Deterministic guardrails for known false matches.
4. Keyword taxonomy fallback only if profile evidence is weak.
5. `local_business` if there is no reliable taxonomy fit.

Important:
- `businessType` and `services` drive customer prompts.
- `niche` does not override strong profile evidence.
- A generic internal niche is acceptable when the human business type is specific.

### 4. Query generation

Source: `buildEvidenceFirstQueries()` in `src/lib/preflight-engine.ts`.

Build customer and competitor queries from:
- `businessType`
- `services`
- `market` / intake city
- search language

Replace stale or weak query sets when:
- niche is `local_business` or unknown
- confidence is weak
- fewer than five usable customer queries exist
- stale vertical language appears that does not match profile evidence
- client-declared category overrides automated classification

### 5. Research prompt generation

Source: `src/lib/research-runner.ts` and `src/lib/full-prompts.ts`.

Priority order:
1. Business-profile customer queries from preflight.
2. Paid/full prompt expansion seeded with `businessType`, `services`, `market`, and approved competitors.
3. Taxonomy prompt fallback only when profile-first prompts are unavailable.

Rules:
- Paid reports must not bypass the Business Intelligence Profile.
- Generic local-business prompts are replaced when specific profile evidence exists.
- Fake competitor placeholders must not appear in generated prompts.
- If no approved competitors exist, use category-level comparison prompts instead of invented names.

### 6. Deterministic prompt QA

Source: `rebuildPromptsFromScrapedProfileIfContaminated()` and deterministic prompt quality checks in `src/lib/research-runner.ts`.

Block or rebuild prompts when:
- car/dealer/inventory language leaks into a non-auto business
- jewelry / silversmith language leaks into a non-jewelry business
- known stale vertical terms conflict with scraped profile evidence
- generic prompts omit a specific business type

### 7. Research execution

Research checks broad popular-AI visibility and web-search fallback evidence according to the current provider setup.

Outputs:
- appeared-in count
- prompt-level visibility
- competitor comparison evidence where client-provided competitors exist
- internal competitor suggestions only for operator review

### 8. Review and report gates

Source: Mission Control and report-quality gates.

Before a report/email can be treated as client-safe:
- visible output must be inspected
- internal workflow language must be absent
- client CTA must open the intended report on the custom domain
- impossible metrics must be blocked
- stale niche / stale competitor / fake prompt language must be blocked
- paid report delivery requires Mission Control approval

## Why this exists

The old failure mode was backwards:

```txt
taxonomy guess → prompt templates → business assumptions
```

The correct VizBiz flow is:

```txt
evidence → Business Intelligence Profile → profile-first prompts → research → gated report
```

This keeps VizBiz useful, positive, and credible. No more forcing a professional audio company, therapy clinic, or supplier into whatever stale template happens to be nearby. That was the pipeline equivalent of using a chainsaw to trim a bonsai tree. Effective, technically, but deeply unwell.
