# VizBiz.ai

AI visibility, GEO/AEO, SEO, and recommendation-readiness infrastructure for local businesses.

VizBiz helps businesses become easier for AI assistants, search engines, maps, and digital discovery systems to understand, verify, trust, and recommend.

## Current operating standard

This repository is not allowed to treat tests/builds as proof that client-facing output is safe. VizBiz reports and emails are the product. If they contain internal notes, wrong niches, false ranks, unverified competitors, unsupported AI claims, or generic AI slop, the product fails.

Required project docs:

- `AGENTS.md` — repository-level operating rules for agents and QA.
- `docs/launch/vizbiz-pipeline-source-of-truth.md` — source-of-truth for the intake → preflight → Business Intelligence Profile → research → review pipeline.
- `docs/launch/report-quality-architecture-reset.md` — canonical report/email architecture, freeze rules, payload/niche/provenance gates, and Release Captain approval model.
- `docs/launch/subagent-model-strategy.md` — dedicated QA role/model routing, including configured lower-cost model policy.
- `docs/launch/launch-copy-qa-notes.md` — launch-safe copy standards and visible-output checklist.
- `docs/launch/friday-production-launch-runbook.md` — production smoke/deploy sequence.
- `docs/launch/paid-fulfillment-templates.md` — paid report/fix fulfillment structure.

## Report quality architecture

All client-facing report and email renderers should consume an approved `ClientReportPayload` produced after research and before rendering.

Renderers may format facts. They must not invent:

- scores
- ranks
- competitors
- revenue ranges
- provider claims
- niche labels
- internal workflow explanations

All prompts and report copy should use one approved `NicheResolution`. Client-declared category/niche takes priority unless evidence clearly conflicts; conflicts go to operator review instead of silent overwrite.

The current pipeline is Business Intelligence Profile first: intake, website crawl, metadata/schema, Google Places, services, language, market, paid-intake questions, and supplied competitors are resolved before any taxonomy fallback. The taxonomy may support compatibility, but it must not silently decide what a business is when the evidence is clear.

Client-facing competitors may include only client-supplied or operator-approved competitors. Auto-discovered/search-suggested competitors are internal-only until confirmed.

Zero AI appearances means `Not ranked` / `AI Presence`, never `#1`.

## Subagent model strategy

Subagents are QA inspectors, not final approvers.

Use dedicated QA roles:

1. Research/Data Provenance QA
2. Niche/Market QA
3. Client Copy QA
4. Mechanical QA
5. Rendered Preview QA
6. Red-Team QA
7. Release Captain final review

Strong models should handle final research, niche, copy, red-team, and Release Captain work. smaller configured models may help with cheap first-pass linting and mechanical summaries, but they must not be the only judge for client-facing approval.

## Local development

```bash
npm install
npm run dev
```

## Build and verification

```bash
npm test
npm run qa:client-copy
npm run build
```

For report/email changes, also inspect the exact rendered output and verify CTA routes on the intended domain before sending or showing anything to Alex/client.

## Deployment

This app is deployed through Vercel for the current VizBiz production workflow. Do not push, promote production, alter DNS, or send real client emails unless Alex has approved the production action and the relevant launch runbook checks pass.
