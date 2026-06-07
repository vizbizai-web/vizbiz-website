# VizBiz Agent Operating Rules

## Mission Control / pipeline integrity rule

Never claim a VizBiz dashboard, Mission Control route, audit/report pipeline, email pipeline, or lead action flow is “working” until the backing source has been verified as real and non-stubbed.

Before marking this kind of work complete, agents must prove all of the following:

1. **Real data source:** The route/API reads from an approved VizBiz source of truth such as Supabase, Google Sheets adapter, production lead/report API, or another explicitly approved durable source.
2. **No silent stubs:** The implementation must not return placeholder arrays, canned demo records, empty success payloads, TODO CRM responses, or fake `ok: true` responses for unfinished actions.
3. **Honest unavailable state:** If a source is missing or misconfigured, the UI/API must show a clear unavailable/error state with the missing dependency. It must not look empty-but-working.
4. **Single route contract:** Related Mission Control screens must use the same verified endpoint family. Do not mix `/api/...` and `/mission-control/api/...` unless the Mission Control route is an intentional wrapper over the production route.
5. **Legacy contamination check:** Search for stale project names, old operator labels, demo agents, SQLite mission schemas, and fake seed data before shipping. For VizBiz MC this specifically includes OpenClaw, generic agent rosters, demo mission boards, and old workspace memory paths.
6. **Regression test required:** Add or update a test that fails when stubs/demo data/legacy labels return.
7. **Build and browser proof:** Run the relevant test, production build, and browser verification for the exact changed MC subroutes. Provide the exact route and screenshot when reporting to Alex.
8. **Operator verification before presentation:** Before presenting any work to Alex, personally review and confirm it. Do not forward raw subagent claims, generated output, screenshots, reports, or summaries as complete until you have inspected the actual work and verified it meets VizBiz production standards.
9. **Subagent review required:** If subagents are used, their work is not accepted by default. Treat subagent output as a draft or lead, then independently inspect the changed files, routes, APIs, screenshots, tests, and claims before presenting anything to Alex.
10. **“Check” means production-level QA:** When Alex says “check,” “make sure,” “verify,” or similar, that means detailed production-level testing, not a glance. Confirm real data, correct copy, responsive behavior, auth, error states, route accuracy, visual quality, and regression coverage where relevant.

## Report/email visible-output QA rule

Every VizBiz report, email, paid intake, client preview, sales artifact, and Alex-only QA draft must be treated as client-facing unless explicitly marked private.

Before presenting or sending any such output, agents must prove all of the following:

1. **Rendered text reviewed:** Inspect the actual visible subject/body/page/CTA the recipient will see, not just source code, test payloads, or a provider message ID.
2. **No internal language:** Block internal notes, model thoughts, operator rationale, fulfillment mechanics, and phrases such as `the client named`, `paid report should`, `manual review`, `operator approval`, `human correction`, `auto-discovered competitors`, `internal only`, `client-ready deliverable`, fake slugs, and pipeline/debug wording.
3. **Client-safe competitor framing:** User-supplied competitors may be named only in polished value language. Example: `LexHive should be positioned clearly against BridgeLegal and Broughton Partners so AI systems can understand where it fits, what makes it credible, and when it should be recommended.`
4. **Fact provenance:** Do not invent contact names, cities, niches, scores, competitors, or market details from QA/test convenience payloads. Missing facts must use neutral fallback copy or block the send.
5. **CTA verification:** Report CTAs must open real intended report content on the custom domain. Dead routes, fake slugs, `Report Not Found`, `Back to Home`, or processing pages block sending.
6. **Regression required after leaks:** If internal/client-unsafe copy leaks, add or tighten a code-level or test-level gate before calling the issue fixed.

If any item above is not verified, say it is not complete. Do not perfume the corpse. Fix the actual pipeline.
