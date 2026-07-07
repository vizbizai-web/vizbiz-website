import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
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
assertExcludes(missingFactText, "Hi there", "missing-fact report email");
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

function walkSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      out.push(...walkSourceFiles(path));
    } else if (/\.(ts|tsx|mdx?)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

const allSourceFiles = walkSourceFiles(join(process.cwd(), 'src'));
const blogRoot = join('src', 'app', 'blog');
const claimSource = allSourceFiles
  .map((path) => ({ path, text: readFileSync(path, 'utf8') }))
  .filter(({ path }) => !path.includes(blogRoot));

const studiesRegistryPath = join(process.cwd(), 'src', 'content', 'studies', 'registry.json');
const studiesRegistry = JSON.parse(readFileSync(studiesRegistryPath, 'utf8')) as Array<{ id: string; sourcePaths?: string[]; allowedClaimPatterns?: string[] }>;

function isMappedToRealStudy(path: string, snippet: string) {
  return studiesRegistry.some((study) => {
    const pathAllowed = (study.sourcePaths || []).some((sourcePath) => path.endsWith(sourcePath));
    const claimAllowed = (study.allowedClaimPatterns || []).some((pattern) => new RegExp(pattern, 'i').test(snippet));
    return pathAllowed && claimAllowed;
  });
}

const blogStudyClaimPatterns: Array<[string, RegExp]> = [
  ['we_ran_or_tested', /\bwe\s+(ran|tested|analy[sz]ed|reviewed|checked|asked)\b/i],
  ['tested_count', /\btested\s+\d{1,4}\b/i],
  ['dealership_count', /\b\d{1,4}\s+(?:Ontario\s+)?(?:car\s+)?dealerships?\b/i],
  ['prompt_count', /\b\d{1,4}\s+(?:buyer-intent\s+)?prompts?\b/i],
  ['data_point_count', /\b\d{1,5}\s+data\s+points?\b/i],
  ['engine_comparison_result', /\b(?:same\s+)?\d{1,4}\s+prompts?\s+(?:across|x|×)\s+(?:ChatGPT|Gemini|Perplexity|three|3)\b/i],
  ['specific_result_percentage', /\b\d{1,3}(?:\.\d+)?%\b/i],
  ['exact_same_battery', /we\s+ran\s+the\s+exact\s+same|same prompts, same dealerships|the results:/i],
];

for (const path of allSourceFiles.filter((sourcePath) => sourcePath.includes(blogRoot))) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split(/\r?\n/);
  for (const [lineIndex, line] of lines.entries()) {
    for (const [label, pattern] of blogStudyClaimPatterns) {
      if (pattern.test(line) && !isMappedToRealStudy(path, line)) {
        throw new Error(`${path}:${lineIndex + 1} blocked fabricated/unregistered study claim (${label}): ${line.trim().slice(0, 220)}`);
      }
    }
  }
}

for (const { path, text } of claimSource) {
  for (const forbidden of [
    '5 AI platforms tested',
    'Claude',
    'Copilot',
    'Google AI Overviews',
    'across all AI platforms',
    '84-prompt',
    ['84', ' prompts'].join(''),
    'up to 20 prompts',
    'Up to 20 prompts',
    '20 prompt coverage',
    '20 prompt analysis',
  ]) {
    assertExcludes(text, forbidden, path);
  }
}

const combinedClaimSource = claimSource.map(({ text }) => text).join('\n');
assertIncludes(combinedClaimSource, 'ChatGPT, Gemini, and Perplexity', 'three-platform source copy');
assertIncludes(combinedClaimSource, '3 AI platforms tested', 'hero/social proof source copy');
assertIncludes(combinedClaimSource, 'across the AI platforms we test', 'honest platform scope source copy');

console.log("✅ VizBiz client-copy watchdog passed: rendered report emails are client-safe, three-platform claims are locked to ChatGPT/Gemini/Perplexity, inflated platform/prompt claims are blocked, competitor copy is polished, missing facts fall back safely, and internal slop fixtures are blocked.");
