# VizBiz Subagent and Model Strategy

Date: 2026-06-07
Status: operating standard for report-quality rescue work

## Bottom line

Use dedicated subagents for report QA, but do not trust any subagent as final authority. Subagents are inspectors. The Release Captain is accountable.

The current safest default is:

- **Release Captain / architecture/code changes:** best available main model (`openai-codex / gpt-5.5` in the current Hermes profile).
- **Research QA:** strong model required; can use main model or another high-reasoning hosted model.
- **Niche / market fit QA:** strong model required; do not use a small local model as sole judge.
- **Client copy QA:** strong or mid-tier model acceptable, but final visible output still needs Release Captain review.
- **Mechanical QA:** model quality matters least; deterministic tests/builds matter most.
- **Rendered Preview QA:** model must be vision/browser-capable if screenshots are involved; otherwise use browser text + Release Captain inspection.
- **Red-team QA:** use the strongest available model, because this role is supposed to catch embarrassing semantic failures.

Small configured models are useful for cheap first-pass linting and checklist scans. They are not enough for final approval of client-facing VizBiz reports.

## Current Hermes delegation behavior

In the current Hermes config, `delegation.model` and `delegation.provider` are empty. That means `delegate_task` subagents inherit the main session model/provider unless explicitly configured by Hermes or overridden at call time where supported.

Current observed main model:

```txt
provider: openai-codex
model: gpt-5.5
```

So the recent subagents used the same model class as the parent, just in isolated contexts.

## Can we assign different models per subagent?

There are two levels:

### 1. Built-in `delegate_task`

Use this for fast parallel inspection. It currently supports isolated tasks and toolsets. In this profile, it inherits the main model because no delegation override is configured.

This is good for:

- Research QA
- Niche QA
- Copy QA
- Code/file audit
- Mechanical QA review

But for a dedicated model per role, use one of the patterns below.

### 2. Spawned Hermes profiles or one-shot model calls

For true role/model specialization, run separate Hermes instances or scripts with explicit provider/model settings.

Examples:

```bash
hermes chat --provider openai-codex --model gpt-5.5 -q "Research QA task..."
hermes chat -q "Cheap copy lint task using the current configured model..."
```

Or create named Hermes profiles later:

```txt
vizbiz-research-qa
vizbiz-niche-qa
vizbiz-copy-qa
vizbiz-redteam
vizbiz-mechanical-qa
```

Each profile can pin a provider/model/toolset. This is better for durable operations than trying to make one parent chat remember role-specific model choices.

## Recommended model routing

### Release Captain

Use: strongest/current main model.

Why: final accountability, architecture judgment, synthesis, and visible-output review require best reasoning.

Do not use mini/local model for final approval.

### Research QA Agent

Use: strong hosted model.

Tasks:

- verify source facts
- inspect report payload
- compare metrics to evidence
- detect web-search fallback vs AI-answer evidence
- catch invented competitor/city/contact/niche data

Model guidance:

- Preferred: current main model or another high-reasoning hosted model.
- Avoid using small configured model as final judge.

### Niche / Market Agent

Use: strong hosted model.

Tasks:

- determine whether the business model and prompt set make sense
- catch wrong vertical leakage
- handle local vs ecommerce vs national vs B2B distinction
- judge human-like prompt relevance

Model guidance:

- Preferred: current main model/high-reasoning model.
- Local model may be used for first-pass forbidden-word scans only.

### Copy QA Agent

Use: mid/high model.

Tasks:

- client-safe wording
- remove internal notes
- reduce overclaims
- improve premium tone
- translate workflow notes into buyer-safe value language

Model guidance:

- A mini model can flag banned phrases cheaply.
- A stronger model should polish important paid/client copy.

### Mechanical QA Agent

Use: cheapest reliable model or no model.

Tasks:

- run tests
- inspect route contracts
- compare source strings
- verify build
- report command output

Model guidance:

- Deterministic commands matter more than model quality.
- configured lower-cost model is acceptable for summarizing command results.

### Rendered Preview Agent

Use: browser/vision-capable stack.

Tasks:

- open exact report URL
- inspect visible text
- check desktop/mobile
- verify CTA destination

Model guidance:

- Use browser tools plus Release Captain review.
- If screenshot interpretation is required, use a vision-capable hosted model.

### Red-Team Agent

Use: strongest available model.

Tasks:

- find embarrassing report defects
- identify client trust-killers
- spot generic AI slop
- challenge unsupported claims

Model guidance:

- Do not cheap out here. The red-team agent is supposed to save reputation.

## Configured model usage recommendation

Use lower-cost configured models as a cost-control layer only when they are available through the current configured provider, not as final client-facing authority.

Good lower-cost model uses:

- banned phrase scans
- first-pass copy lint
- prompt weirdness detection
- duplicate prompt detection
- mechanical QA summarization
- cheap red-team pre-pass before strong-model red-team

Bad lower-cost model uses:

- final report approval
- final paid copy approval
- final niche correctness for unfamiliar businesses
- final provenance judgment
- final revenue/opportunity claim judgment

## Required subagent scorecard

Every QA subagent must output this shape:

```txt
Role:
Model/provider used:
Artifact reviewed:
Routes/files reviewed:
PASS / FAIL / HOLD:
Severity:
Facts verified:
Claims blocked:
Missing evidence:
Required fixes:
Can this be shown to Alex/client? yes/no:
```

No vague “looks good.” Vague summaries are treated as FAIL.

## Release Captain final rule

Even if every subagent passes, the Release Captain must personally inspect the exact rendered output before saying anything is ready.

Client-ready requires:

```txt
Research QA: PASS
Niche QA: PASS
Copy QA: PASS
Mechanical QA: PASS
Rendered Preview QA: PASS
Red-Team: no BLOCK
Release Captain rendered review: APPROVED
```

Anything else is:

- `NEEDS_FIX`
- `HOLD`
- `RERUN`
- `DO_NOT_SEND`

## Hermes config notes

To set a global default model:

```bash
hermes model
# or
hermes config set model.provider <provider>
hermes config set model.default <model>
```

To set the default model for `delegate_task` children:

```bash
hermes config set delegation.provider <provider>
hermes config set delegation.model <model>
```

Important: changing Hermes config generally requires a fresh session or gateway restart to reliably take effect.

Do not change the active model config in a live production-critical rescue without recording what changed and why.
