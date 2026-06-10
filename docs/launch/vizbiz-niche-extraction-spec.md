# VizBiz Niche Extraction Spec — Evidence Pack + Two-Pass Prompts

Implementation target: replaces the current title/meta/taxonomy inference inside
preflight. One module, one exported function:


resolveNiche(input: NicheInput): Promise<NicheResult>


The function signature is the enforcement mechanism. It does not accept
competitor data, search results, or taxonomy IDs. If a future dev tries to
pass them, the types refuse.

---

## 1. Evidence-Pack Builder

### Input


interface NicheInput {
  leadId: string;
  businessName: string;
  websiteDomain: string;               // for quote verification + Places match
  submittedPrimaryService: string | null;  // verbatim from the form
  crawl: {
    pages: CrawledPage[];              // see page selection below
    crawlMethod: "fetch" | "firecrawl";
    crawlQuality: "full" | "thin" | "failed";
  };
  places: {                            // supporting evidence ONLY
    matched: boolean;
    matchMethod: "website_domain" | "name_only" | "none";
    types: string[];
  } | null;
}


### Page selection (Firecrawl)

1. map the domain. From the URL list, select by priority:
   - homepage
   - first match of: /about, /about-us, /who-we-are
   - first match of: /services, /what-we-do, /solutions, /products
   - max 3 pages total (free-tier cost cap)
2. scrape each with markdown output + extract JSON-LD blocks.
3. Per page keep: url, title, metaDescription, h1s[], jsonLdTypes[],
   first 3,000 chars of body markdown (strip nav/footer boilerplate —
   Readability or Firecrawl's main-content mode).
4. Total body budget across pages: 8,000 chars. Homepage gets priority.

### Pack assembly rules (hard rules — code, not prompt)

- R1 Competitor content is not an input. (Enforced by the type.)
- R2 Places types included only if matchMethod === "website_domain",
  and always under the label SUPPORTING EVIDENCE.
- R3 Search-result titles never enter the pack.
- R4 businessName is included for context but tagged so the prompts can
  forbid using it as category evidence.
- R5 Log to Supabase before the LLM call: packCharCount,
  pagesIncluded[], submittedServicePresent: boolean, crawlQuality.
  This is the diagnostic trail — never skip it.

### Degraded modes

- crawlQuality === "failed" or pack body < 500 chars:
  - If submittedPrimaryService exists → skip both passes. Result is the
    submitted value verbatim, confidence: 0.6, method: "submitted_only",
    needsReview: true. Never run the LLM on an empty pack (that is where
    confabulation comes from).
  - If no submitted service → status: "blocked_insufficient_evidence",
    Telegram alert. Nothing downstream runs.

---

## 2. Pass 1 — Verbatim Quote Extraction

Model: claude-haiku-4-5 is sufficient. Temperature 0. Structured output
via tool use (force the tool, schema below).

### System prompt


You are an evidence extractor. You will receive text scraped from one
business's website. Your only job is to find and return VERBATIM sentences
that state facts about this business. You do not interpret, classify,
summarize, or infer. You copy exact sentences.

Rules:
- Every quote must be copied character-for-character from the provided text.
- Never compose, paraphrase, or merge sentences.
- Maximum 25 words per quote; if a sentence is longer, copy a contiguous
  fragment of it.
- If you find nothing for a category, return an empty array for it. An empty
  array is a correct and acceptable answer. Do not fill gaps with guesses.
- The business's NAME is not evidence of what it does. A business called
  "Mulligan's" is not necessarily golf-related; "The Foundry" is not
  necessarily a metalworks. Only what the text SAYS the business does counts.


### User message template

`
BUSINESS NAME (context only — never evidence of category): {businessName}
WEBSITE TEXT (scraped from {websiteDomain}):
---
[PAGE: {url}]
TITLE: {title}
META: {metaDescription}
H1: {h1s}
JSON-LD TYPES: {jsonLdTypes}
BODY:
{bodyText}
---
[repeat per page]

Extract verbatim quotes into these categories:

1. WHAT_THEY_DO — sentences stating the services, products, or work this
   business itself performs or sells.
2. WHO_THEY_SERVE — sentences naming customer types, client industries, or
   audiences (patterns like "we serve / we supply / we work with /
   trusted by / our clients include").
3. WHERE_THEY_OPERATE — sentences naming cities, regions, or service areas.
4. SELF_DESCRIPTION — sentences where the business names its own profession
   or category ("we are a …", "as a leading …", "your local …").


### Output schema (tool use)

```json
{
  "whatTheyDo":      [{ "quote": "string", "sourceUrl": "string" }],
  "whoTheyServe":    [{ "quote": "string", "sourceUrl": "string" }],
  "whereTheyOperate":[{ "quote": "string", "sourceUrl": "string" }],
  "selfDescription": [{ "quote": "string", "sourceUrl": "string" }]
}
```


### Mechanical verification (code, after the call)


function verifyQuotes(quotes, packText) {
  // normalize: lowercase, collapse whitespace, strip smart quotes
  // a quote PASSES only if normalized quote is a substring of normalized pack text
  // FAILED quotes are dropped and counted
}


- Persist quotesExtracted, quotesVerified, quotesDropped per category.
- If >30% of quotes fail verification → the model is confabulating
  (usually means the pack was thin/garbled) → treat as degraded mode,
  fall back to submitted-only path with needsReview: true.
- Pass 2 receives verified quotes only.

---

## 3. Pass 2 — Niche Decision

Model: claude-sonnet-4-6 (decision quality matters more here; it's one
short call per lead). Temperature 0. Structured output via tool use.

### System prompt


You determine a local business's niche from evidence. You will receive:
(a) what the business owner declared on an intake form, and
(b) verified verbatim quotes from the business's own website.

Decision rules, in order:

1. The owner's declared primary service is STRONG evidence. The website
   quotes are STRONG evidence. Google Places types are SUPPORTING evidence
   only — they may reinforce a niche already present in (a) or (b) but may
   never introduce a niche on their own.

2. Express the niche in the business's OWN vocabulary, as specific as the
   evidence allows. "Tax resolution specialist" must stay "tax resolution
   specialist" — never broaden it to "accountant" or "financial services".
   You are NOT mapping to a category list. There is no list.

3. WHO_THEY_SERVE quotes describe customers, never the business itself.
   A supplier whose site mentions restaurants is not a restaurant. Customer
   segments go in customerSegments and must not influence businessNiche.

4. The business name is not evidence of category.

5. If the declared service and the website quotes describe genuinely
   different businesses (not just different wording for the same thing),
   output status CONFLICT with both candidates. Do not choose. Synonyms,
   subsets, and rephrasings are NOT conflicts: "med spa" vs "medical
   aesthetics clinic" agree; "med spa" vs "restaurant" conflict.

6. If evidence is too thin to name a specific niche, output status
   INSUFFICIENT. Never output a generic answer like "local business" or
   "small business" — generic answers are failures, not fallbacks.

7. State your confidence honestly. High confidence requires the declared
   service and at least one verified quote to agree.


### User message template


OWNER-DECLARED PRIMARY SERVICE (from intake form): "{submittedPrimaryService}"
  [if null: "The owner did not declare a primary service."]

VERIFIED WEBSITE QUOTES:
WHAT_THEY_DO: {quotes}
SELF_DESCRIPTION: {quotes}
WHO_THEY_SERVE: {quotes}
WHERE_THEY_OPERATE: {quotes}

SUPPORTING EVIDENCE (may reinforce, may not introduce):
GOOGLE PLACES TYPES: {types or "none / unmatched"}

SITE LANGUAGE: {detectedLanguage}

Determine the niche.
### Output schema (tool use)


{
  "status": "OK | CONFLICT | INSUFFICIENT",
  "businessNiche": {
    "value": "string — business's own vocabulary, specific",
    "confidence": "number 0-1",
    "primaryEvidence": ["the 1-3 quotes or 'declared service' that decided it"]
  },
  "services": ["string"],
  "customerSegments": ["string"],
  "serviceArea": ["string"],
  "language": "string",
  "conflict": {
    "declaredCandidate": "string|null",
    "websiteCandidate": "string|null",
    "explanation": "one sentence"
  }
}


### Post-call validation (code)

- status OK requires confidence >= 0.6 AND businessNiche.value not in
  the generic denylist (`local business`, small business, company,
  services, `business`) — violation downgrades to INSUFFICIENT.
- Every entry in primaryEvidence must be either the literal string
  "declared service" or one of the verified quotes — anything else fails
  validation and the call is retried once, then degraded mode.
- customerSegments ∩ businessNiche check: if the niche value matches a
  segment but no WHAT_THEY_DO/SELF_DESCRIPTION quote supports it →
  force CONFLICT (segment-as-category trap caught mechanically).

### Routing

- OK → persist profile, compute profileHash, continue to prompt plan.
- CONFLICT → Telegram alert with both candidates + buttons
  (`Use declared` / Use website / `Custom…`), pipeline waits.
- INSUFFICIENT → if declared service exists, submitted-only path with
  needsReview: true; else block + alert.

---

## 4. Cost & latency budget

Per lead: 1 Haiku call (~4-6k input tokens) + 1 Sonnet call (~1k input
tokens) ≈ under 2 cents, ~3-5 s combined. Negligible against
Firecrawl + Perplexity spend.

---

## 5. Acceptance tests (must pass before swap-in)

Run against the T1–T10 fixtures from the review doc. Specifically:

- T6 (audio supplier): site body dominated by churches/venues →
  businessNiche = pro audio supplier, segments hold churches/venues.
  The segment-trap validation must be what catches a wrong answer, not luck.
- T7 (Spanish ingredient supplier): quotes extracted in Spanish,
  language: "es", niche ≠ restaurant.
- T9 (declared med spa, restaurant website): status CONFLICT, both
  candidates populated, nothing proceeds.
- Brand-name fixture: business "Mulligan's Plumbing" with a thin site →
  niche = plumbing or INSUFFICIENT; never golf.
- Empty-crawl fixture: zero body text + declared "functional
  nutritionist" → no LLM call made, submitted-only result, needsReview true.
- Re-run each fixture 5×: identical status and stable businessNiche.value
  every run (temperature-0 determinism check).
`