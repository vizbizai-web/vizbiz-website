# VizBiz Report Quality Architecture Reset

Date: 2026-06-07
Owner: Alejo / VizBiz operator
Status: Immediate architecture reset plan

## Why this exists

VizBiz sells trust in AI visibility reports. If the reports contain internal notes, wrong ranks, wrong niches, unsupported competitor claims, or generic AI slop, the product fails at the exact thing it sells.

The failures are not isolated typos. They come from an architecture where raw research, fallback data, renderer-side metric invention, and client-facing copy are mixed too late in the pipeline.

## Non-negotiable operating rule

No report or email is client-ready until the exact rendered artifact has passed:

1. Data/provenance QA
2. Niche/prompt QA
3. Client-copy QA
4. Rendered page/email review
5. CTA verification
6. Release Captain approval

Tests/builds prove plumbing. They do not prove client-ready output.

## Immediate freeze rules

Freeze report/email delivery if any of these are true:

- Report renders `Report Not Found`, `Back to Home`, processing, pending, or fallback content.
- Business name, website, city, contact, niche, competitors, or scores are missing, invented, stale, or suspicious.
- Client-only mode contains competitor claims, competitor rank, or auto-discovered competitor names.
- A business with zero appearances is shown as ranked, especially `#1`.
- Provider evidence is missing/fallback but copy says AI recommended, cited, trusted, or sent buyers elsewhere.
- Revenue language says or implies guaranteed lost revenue instead of directional visibility opportunity.
- Rendered output contains internal/operator language: manual review, operator approval, auto-discovered, pipeline, internal only, paid report should, the client named, client-ready deliverable, fake/debug/stub copy.
- Wrong vertical words appear: dealership/inventory/trade-in for non-auto, local/nearby/GBP for ecommerce/product brands unless actually measured, etc.
- Report/email CTA is not fetched and verified on the intended custom-domain route.
- No human/operator has read the exact visible output.

Acceptable states when a freeze triggers:

- `NEEDS_FIX`
- `HOLD`
- `RERUN`
- `DO_NOT_SEND`

Never call it client-ready.

## Target architecture

### 1. One canonical ClientReportPayload

All report and email renderers must consume a typed, client-safe payload generated after research and before rendering.

Renderers may format facts. They must not invent facts.

Forbidden in renderer:

- deriving AVI scores
- deriving rank
- inventing fallback competitors
- generating monthly revenue ranges
- mapping status bands to fake scores
- reading raw notes directly
- displaying internal auto-discovery output

Minimum payload shape:

```ts
type ClientReportPayload = {
  schemaVersion: string;
  leadId: string;
  reportMode: 'free_snapshot' | 'paid_full';
  visibilityMode: 'client_only' | 'client_provided';

  business: {
    name: string;
    website: string;
    location: string;
    contactName?: string;
    niche: string;
    nicheLabel: string;
    confidence: 'high' | 'medium' | 'low';
  };

  evidence: {
    provider: 'sonar' | 'openai' | 'gemini' | 'web_search_fallback' | 'mixed' | 'unavailable';
    providerLabel: string;
    aiAnswerEvidenceAvailable: boolean;
    webSearchFallbackUsed: boolean;
    warnings: string[];
    promptCount: number;
    prompts: Array<{
      prompt: string;
      businessAppeared: boolean;
      evidenceSource: 'ai_answer' | 'web_search_result' | 'unavailable';
      publicClaimAllowed: boolean;
    }>;
  };

  competitors: {
    mode: 'client_only' | 'client_provided';
    clientProvided: Array<{
      name: string;
      source: 'client_submitted';
      validationStatus: 'validated' | 'unvalidated' | 'not_found' | 'unavailable';
      appearances: number;
      publicComparisonAllowed: boolean;
    }>;
    internalSuggestions: Array<{
      name: string;
      source: 'auto_discovered';
      publicDisplayAllowed: false;
    }>;
  };

  metrics: {
    appearedCount: number;
    totalPrompts: number;
    aviScore: number;
    rank: number | null;
    rankLabel: 'Your Rank' | 'AI Presence';
    rankValue: string;
    statusBand: 'Weak' | 'Moderate' | 'Strong';
  };

  revenue: {
    displayAllowed: boolean;
    claimType: 'directional_opportunity' | 'client_provided_economics' | 'hidden';
    low?: number;
    high?: number;
    currency?: string;
    disclaimer: string;
  };

  copySafety: {
    renderedTextReviewed: boolean;
    renderedTextHash: string;
    reviewedAt?: string;
    approvedBy?: string;
  };
};
```

### 2. One canonical NicheResolution

Before prompts or scoring, resolve a single niche/business-model object. Downstream modules must not re-detect the niche.

```ts
type NicheResolution = {
  canonicalNiche: string;
  displayCategory: string;
  businessModel:
    | 'local_service'
    | 'local_retail'
    | 'ecommerce_product'
    | 'national_service'
    | 'b2b_service'
    | 'tourism_experience'
    | 'clinic_appointment'
    | 'education_classes'
    | 'venue_events'
    | 'restaurant_hospitality'
    | 'unknown';
  sourcePriority: 'client_declared' | 'places_verified' | 'site_llm' | 'keyword_fallback';
  confidence: number;
  market: {
    raw: string;
    locality?: string;
    region?: string;
    country?: string;
    isBroadCountry: boolean;
  };
  promptPolicy: {
    allowedIntents: string[];
    forbiddenIntents: string[];
    allowedGeoForms: ('city' | 'region' | 'country' | 'brand_only' | 'near_me')[];
  };
  hardBlocks: {
    forbiddenVerticals: string[];
    forbiddenWords: string[];
  };
};
```

Client-declared category is ground truth unless evidence clearly conflicts, and conflicts go to operator review instead of silent overwrite.

### 3. Deterministic prompt safety gate

Every free and paid prompt set must pass before research runs.

Block if prompts contain:

- wrong vertical terms
- snake_case niche IDs
- placeholder text
- broad-country local prompts such as `best electrical contractor near United Kingdom`
- appointment/booking/walk-in wording for ecommerce unless allowed
- local/near-me wording for national/ecommerce unless allowed
- generic `local business` filler
- competitor leakage in client-only mode

### 4. Evidence/provenance gate

Before public claims:

- Preserve provider fields from research.
- Separate AI-answer evidence from web-search fallback.
- Separate client-provided competitors from internal suggestions.
- Never show auto-discovered competitors client-facing until client-confirmed or operator-approved.
- If evidence is fallback, copy must say visibility snapshot/supporting web evidence, not AI recommendations.

### 5. Final rendered-output gate

Before Alex sees or a client receives anything:

- Render the exact report/email.
- Strip text.
- Run blocked-copy QA.
- Run semantic QA against the payload.
- Fetch CTA and verify intended content.
- Record review status/hash.

## Subagent operating model

Subagents help only if they are narrow judges with pass/fail scorecards. They do not replace final accountability.

Model-routing details live in `docs/launch/subagent-model-strategy.md`. The short version: strong models should handle final research, niche, copy, red-team, and Release Captain work; cheaper configured models may do first-pass linting, banned-phrase scans, and mechanical summaries, but not final client-facing approval.

Every QA subagent must identify the model/provider it used. Unknown model/provider is not acceptable for final launch evidence.

### Release Captain

Owner: parent operator / Alejo.

Cannot delegate final approval.

Approves only after every gate passes and rendered output is personally inspected.

### Research QA Agent

Checks:

- business facts
- website
- location
- contact fallback
- evidence source
- provider/fallback status
- score/count consistency
- competitor provenance

Output: PASS/FAIL with sources and missing facts.

### Niche/Market Agent

Checks:

- niche correctness
- business model
- prompt relevance
- broad-country handling
- wrong vertical leakage

Output: PASS/FAIL plus niche confidence and prompt relevance score.

### Copy QA Agent

Checks:

- internal wording
- overclaims
- awkward AI slop
- free-vs-paid boundary
- client-safe language

Output: PASS/FAIL with replacement copy.

### Mechanical QA Agent

Checks:

- regression tests
- build
- route contracts
- CTA verifier
- blocked-copy tests

Output: commands and pass/fail evidence.

### Rendered Preview Agent

Checks:

- actual report route
- actual email body
- CTA destination
- desktop/mobile when client-critical

Output: routes reviewed, screenshot/proof, pass/fail.

### Red-Team Agent

Tries to block the report by finding embarrassing client-facing problems.

Output: BLOCK/WARN/PASS with top issues.

## Model strategy

Use model specialization for cost and coverage, not as a substitute for judgment.

### Recommended routing

- Release Captain: strongest/current main model. Final approval cannot be mini/local.
- Research QA: strong hosted model; must verify source facts and provider/fallback provenance.
- Niche/Market QA: strong hosted model; must catch wrong vertical, business-model mismatch, broad-country prompts, and stale niche terms.
- Copy QA: mid/high model; mini/local models may run blocked-term scans, but important copy gets strong-model polish and human/operator review.
- Mechanical QA: deterministic commands first; cheapest reliable model may summarize command output.
- Rendered Preview QA: browser/vision-capable stack plus Release Captain visible-output review.
- Red-Team QA: strongest available model; this role protects reputation.

### configured lower-cost model policy

configured lower-cost models are useful for:

- banned phrase scans
- prompt weirdness checks
- duplicate/filler detection
- cheap first-pass copy lint
- mechanical QA summarization

configured lower-cost models must not be the only judge for:

- final report approval
- final paid copy approval
- final niche correctness
- final evidence/provenance claims
- final revenue/opportunity claims

If model routing changes, document the provider/model in `docs/launch/subagent-model-strategy.md` and keep the Release Captain on a high-reasoning current configured model.

## 24-hour rescue plan

### Phase 1: Freeze and triage

- No automatic real-client sends.
- Every pending/approved/paid-ready report gets moved through the QA scorecard.
- Anything uncertain becomes NEEDS_FIX/HOLD/RERUN/DO_NOT_SEND.

### Phase 2: Build hard gates

Implement in order:

1. `ClientReportPayload` builder.
2. `NicheResolution` builder.
3. `assertPromptSetSafe` deterministic gate.
4. `assertClientReportPayloadSafe` data/provenance gate.
5. Final rendered text QA before approve/send.
6. Email/report CTA consistency check against the same payload.
7. Disable/gate legacy full report route until it uses the same payload.

### Phase 3: Regression suite

Must include tests for:

- 0 appearances => Not ranked, never #1.
- Client-only => no public competitors.
- Client-provided competitors only => no auto-discovered names.
- Broad country local-service prompt blocked.
- Ecommerce prompt does not use local-service/GBP/nearby language.
- Local service prompt does not use ecommerce/product-brand language.
- Unknown category blocks paid/full unless mapped.
- Rendered report contains no blocked internal terms.
- Revenue wording is directional opportunity, not guaranteed loss.
- Email metrics match report payload metrics.
- Full report cannot bypass public/report approval gates.

## Definition of client-ready

A report is client-ready only when:

- Data/source integrity: PASS
- Research provenance: PASS
- Niche fit: >= 90/100
- Prompt relevance: >= 90/100
- Copy QA: PASS, no blocked terms
- Rendered report QA: PASS
- Email preview QA: PASS if email involved
- CTA QA: PASS
- Relevant tests/build: PASS
- Red-team: no BLOCK
- Release Captain final review: APPROVED

If any item fails, it is not client-ready.
