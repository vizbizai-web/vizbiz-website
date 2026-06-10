// @ts-nocheck
// =============================================================================
// VizBiz Intake Pipeline — Inngest Function Skeleton
// Spec for Forge. Step boundaries, event names, and payload contracts.
//
// CORE RULE (this fixes the wrong-niche bug):
//   The client classification step NEVER sees competitor content.
//   Competitor crawls run in a separate step, stored separately, and only
//   enter the pipeline at prompt-plan time as context — never as identity.
//
//   The classifier input is EXACTLY:
//     1. submittedPrimaryService  (verbatim, labeled as client-declared)
//     2. client site crawl text   (with char-count logged)
//     3. client schema/title/meta
//   Nothing else. No Places types, no competitor text, no search titles.
//   Places arrives AFTER as supporting evidence in resolve-niche.
// =============================================================================

import { inngest } from "./client";
import { NonRetriableError } from "inngest";
// ---------------------------------------------------------------------------
// EVENTS
// ---------------------------------------------------------------------------
// "vizbiz/lead.created"          { leadId }                — fired by intake route
// "vizbiz/lead.niche.override"   { leadId, resolvedNiche } — fired by Telegram webhook (operator fixes a conflict)
// "vizbiz/lead.approved"         { leadId }                — fired by Telegram approve button
// "vizbiz/lead.rejected"         { leadId, reason }        — fired by Telegram reject button

// ---------------------------------------------------------------------------
// INTAKE ROUTE (api/pipeline/intake/route.ts) — gets DUMB
// ---------------------------------------------------------------------------
// 1. Zod-validate payload (reject loudly, no coercion)
// 2. Insert Supabase lead row:
//      submitted_primary_service  TEXT      (dedicated column, immutable)
//      competitors                JSONB     (structured array, never comma-joined)
//      utm / referrer             JSONB
// 3. await inngest.send({ name: "vizbiz/lead.created", data: { leadId } })
// 4. Return 200. NO after(), NO chained fetches. Everything else is Inngest.

// ---------------------------------------------------------------------------
// MAIN PIPELINE FUNCTION
// ---------------------------------------------------------------------------
export const processLead = inngest.createFunction(
  {
    id: "vizbiz-process-lead",
    retries: 3, // per-step automatic retries
    concurrency: { limit: 5 },
  },
  { event: "vizbiz/lead.created" },
  async ({ event, step }) => {
    const { leadId } = event.data;

    // -- STEP 1: load lead ---------------------------------------------------
    const lead = await step.run("load-lead", async () => {
      // SELECT from Supabase. Throw NonRetriableError if not found.
      // Returns: { businessName, website, location, submittedPrimaryService,
      //            competitors: [{name, website?}], email, utm }
    });

    // -- STEP 2: crawl client site (cheap-first) ------------------------------
    const clientCrawl = await step.run("crawl-client-site", async () => {
      // 1. Check crawl cache by domain (30-day TTL) → return cached if hit
      // 2. Plain fetch + Readability extraction
      // 3. If textChars < 800 OR text/html ratio < threshold → escalate to Firecrawl
      // 4. ALWAYS return: { text, title, meta, schemaJsonLd, language,
      //                     textChars, crawlMethod: "fetch"|"firecrawl",
      //                     crawlQuality: "full"|"thin"|"failed" }
      //
      // DIAGNOSTIC REQUIREMENT: log textChars and crawlMethod to the lead record.
      // If textChars is tiny, that's the wrong-niche bug — make it visible.
    });

    // -- STEP 3: classify client (ISOLATED — the fix) -------------------------
    const clientProfile = await step.run("extract-client-profile", async () => {
      // ONE Claude Haiku call, structured output (tool use / JSON schema).
      // INPUT (and nothing more):
      //   - submittedPrimaryService, labeled: "The business owner declared
      //     their primary service as: '<X>'. This is strong evidence."
      //   - clientCrawl.text (client site ONLY)
      //   - title / meta / schema
      //
      // OUTPUT SCHEMA:
      //   inferredBusinessType: { value, confidence: 0-1, evidenceQuote }
      //   services:         [{ value, evidenceQuote }]
      //   customerSegments: [{ value, evidenceQuote }]   // "we serve X" → here
      //   language: "en" | "es" | ...
      //
      // VALIDATION (mechanical, after the LLM call):
      //   - every evidenceQuote must string-match within clientCrawl.text;
      //     drop any field whose quote doesn't verify
      //   - if crawlQuality === "failed"|"thin" AND submittedPrimaryService exists:
      //     inferredBusinessType = submitted value verbatim, confidence 0.6,
      //     method: "submitted_only". NEVER "local business".
    });
// -- STEP 4: Places enrichment (supporting evidence only) ------------------
    const places = await step.run("enrich-places", async () => {
      // Places API (New), Text Search with field masks.
      // Domain-match rule: result website domain must match lead.website domain,
      //   else placesMatch: "name_only" → types are IGNORED for niche.
      // Returns: { matched, matchMethod, rating, reviewCount, address, types }
    });

    // -- STEP 5: crawl competitors (PARALLEL, QUARANTINED) ---------------------
    const competitorCrawls = await Promise.all(
      lead.competitors.map((c, i) =>
        step.run(`crawl-competitor-${i}`, async () => {
          // Same cheap-first crawl. Stored under competitors[i].crawl.
          // NEVER merged into clientProfile. Used only for:
          //   - prompt-plan context ("vs <name>" phrasing)
          //   - market/geo confirmation
          //   - paid-tier competitor intelligence later
        })
      )
    );

    // -- STEP 6: resolve niche (deterministic, blocks on conflict) -------------
    const resolved = await step.run("resolve-niche", async () => {
      // Priority order (Section C of the review):
      //   submitted (1.0) > schema (0.9) > title/meta (0.8) > body services (0.7)
      //   > Places types (0.4, support-only) > competitors (0) > search titles (0)
      //
      // Compute: finalNiche, confidence, conflictsWithSubmitted
      // Persist profile to Supabase + compute profileHash = sha256(profile)
    });

    // -- STEP 6b: conflict gate (G1) -------------------------------------------
    if (resolved.conflictsWithSubmitted || resolved.confidence < 0.6) {
      await step.run("alert-niche-conflict", async () => {
        // Telegram: "⚠️ Niche conflict on <businessName>: submitted '<X>',
        //  site evidence says '<Y>'. Reply with buttons: [Use X] [Use Y] [Custom]"
      });
      const override = await step.waitForEvent("wait-niche-resolution", {
        event: "vizbiz/lead.niche.override",
        match: "data.leadId",
        timeout: "3d",
      });
      if (!override) {
        // timed out — mark lead stalled, end run. NEVER guess and proceed.
        throw new NonRetriableError("Niche conflict unresolved");
      }
      // apply override, re-persist profile, recompute profileHash
    }

    // -- STEP 7: build prompt plan (hash-locked) -------------------------------
    const promptPlan = await step.run("build-prompt-plan", async () => {
      // Inputs: finalNiche + services + location + language ONLY.
      //   (Function signature must not accept competitor or search data —
      //    enforce isolation by type, not convention.)
      // Competitor names may be injected as comparison phrasing AFTER core
      //   prompts are generated.
      // Output: { prompts: [...], language, builtFromProfileHash }
      // GATE G2 here too: scan generated prompts against wrong-vertical
      //   blocklists before returning. Fail the step on a hit.
    });

    // -- STEP 8: visibility fan-out (PARALLEL) ---------------------------------
    const [sonar, openai, gemini] = await Promise.all([
      step.run("check-perplexity-sonar", async () => {
        // For each prompt: did the business appear? citations?
        // Tag every datapoint: { provider: "perplexity", kind: "ai_answer" }
      }),
      step.run("check-openai-websearch", async () => {
        // OpenAI Responses API + web_search tool.
        // Tag: { provider: "openai", kind: "ai_answer" }
      }),
      step.run("check-gemini-grounded", async () => {
        // Gemini API with Google Search grounding (AI Overview proxy).
        // Tag: { provider: "gemini", kind: "ai_answer" }
      }),
      // Tavily/Brave: ONLY if needed for competitor/source discovery.
      // Tag: { kind: "web_search" } — never counted in AI visibility score.
    ]);
// -- STEP 9: score + build client-safe payload -----------------------------
    const payload = await step.run("build-client-payload", async () => {
      // appearedCount / totalPrompts across kind === "ai_answer" ONLY.
      // Bands: Strong ≥70%, Moderate ≥40%, Weak <40%.
      // Payload schema-validated; unknown keys throw.
      // Competitors filtered: clientFacing === true only.
      // No provider names, no "fallback", no internal status strings.
    });

    // -- STEP 10: gates (fail closed) ------------------------------------------
    await step.run("run-gates", async () => {
      // G2 wrong-vertical terms (final payload text)
      // G3 "local business" ban when submittedPrimaryService exists
      // G4 competitor leakage
      // G5 web_search datapoints labeled as AI evidence
      // G6 impossible metrics
      // G7 promptPlan.builtFromProfileHash === current profileHash
      // G8 language match
      // G9 internal vocabulary denylist
      // Any failure → mark lead blocked + Telegram alert + NonRetriableError
    });

    // -- STEP 11: operator review ----------------------------------------------
    await step.run("notify-review-ready", async () => {
      // Telegram: report preview link + [Approve] [Reject] inline buttons
    });

    const approval = await step.waitForEvent("wait-approval", {
      event: "vizbiz/lead.approved",
      match: "data.leadId",
      timeout: "7d",
    });
    if (!approval) return { status: "expired" };

    // -- STEP 12: deliver --------------------------------------------------------
    await step.run("send-report-email", async () => {
      // Resend. Report page flips to ready/approved state.
    });

    return { status: "delivered", leadId };
  }
);

// ---------------------------------------------------------------------------
// TELEGRAM WEBHOOK (api/telegram/webhook/route.ts)
// ---------------------------------------------------------------------------
// Button callbacks → inngest.send():
//   approve_<leadId>        → "vizbiz/lead.approved"
//   reject_<leadId>         → "vizbiz/lead.rejected"
//   niche_use_submitted_<leadId> / niche_use_inferred_<leadId>
//                           → "vizbiz/lead.niche.override"

// ---------------------------------------------------------------------------
// BUDGET GUARD (wrap steps 2–8)
// ---------------------------------------------------------------------------
// Accumulate estimated spend on the lead record per step.
// If projected total > $0.40 before fan-out → skip lowest-value provider
// or block with "budget_exceeded" for operator review.

// ---------------------------------------------------------------------------
// CONTRACT TEST HOOK
// ---------------------------------------------------------------------------
// A test-mode flag on lead.created lets the sentinel contract tests (T1–T10)
// run the real function with mocked provider steps via Inngest's testing
// utilities — asserting submittedPrimaryService survives into clientProfile,
// resolve-niche output, promptPlan input, and final payload.