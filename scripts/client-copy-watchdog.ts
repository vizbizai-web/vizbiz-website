import { buildReportEmailHtml, buildReportEmailSubject } from "../src/lib/report-email";
import { assertClientSafeCopy, stripHtmlForClientCopyQA } from "../src/lib/client-copy-qa";

function assertIncludes(haystack: string, needle: string, context: string) {
  if (!haystack.includes(needle)) {
    throw new Error(`${context} missing expected copy: ${needle}`);
  }
}

function assertExcludes(haystack: string, needle: string, context: string) {
  if (haystack.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`${context} leaked blocked/internal copy: ${needle}`);
  }
}

const renderedCompetitorEmail = buildReportEmailHtml({
  businessName: "LexHive",
  contactName: "Jordan Patel",
  city: "Toronto",
  reportUrl: "https://vizbiz.ai/report/lexhive-smoke/full",
  aviScore: 62,
  statusBand: "Opportunity gap",
  appearedCount: 3,
  totalPrompts: 10,
  competitors: ["BridgeLegal", "Broughton Partners"],
  nicheLabel: "legal service",
});

const competitorText = stripHtmlForClientCopyQA(renderedCompetitorEmail);
assertClientSafeCopy(renderedCompetitorEmail, "rendered competitor report email");
assertIncludes(
  competitorText,
  "LexHive should be positioned clearly against BridgeLegal and Broughton Partners so AI systems can understand where it fits, what makes it credible, and when it should be recommended.",
  "competitor report email",
);
for (const blocked of [
  "the client named",
  "paid report should",
  "manual review",
  "operator approval",
  "human correction",
  "auto-discovered competitors",
  "internal only",
  "client-ready deliverable",
]) {
  assertExcludes(competitorText, blocked, "competitor report email");
}

const renderedMissingFactEmail = buildReportEmailHtml({
  businessName: "Proofless Test Business",
  reportUrl: "https://vizbiz.ai/report/missing-facts-smoke/full",
});
const missingFactText = stripHtmlForClientCopyQA(renderedMissingFactEmail);
assertClientSafeCopy(renderedMissingFactEmail, "rendered missing-fact report email");
assertIncludes(missingFactText, "Hi there", "missing-fact report email");
assertIncludes(missingFactText, "options in their market", "missing-fact report email");

const subject = buildReportEmailSubject({
  businessName: "LexHive",
  reportUrl: "https://vizbiz.ai/report/lexhive-smoke/full",
});
assertClientSafeCopy(subject, "report email subject");

for (const badCopy of [
  "Comparison readiness: The client named BridgeLegal and Broughton Partners.",
  "The paid report should compare LexHive against those exact two.",
  "Manual review and operator approval will fix this later.",
]) {
  let blocked = false;
  try {
    assertClientSafeCopy(badCopy, "intentional bad-copy fixture");
  } catch {
    blocked = true;
  }
  if (!blocked) {
    throw new Error(`Client-copy QA failed to block fixture: ${badCopy}`);
  }
}

console.log("✅ VizBiz client-copy watchdog passed: rendered report emails are client-safe, competitor copy is polished, missing facts fall back safely, and internal slop fixtures are blocked.");
