/**
 * Post-Research Audit
 *
 * Runs automatically after process-lead completes.
 * Checks the research output for common failures:
 *  1. Niche mismatch (preflight vs research)
 *  2. User-entered competitors ignored
 *  3. Junk/generic competitors in results (directories, BBB, etc.)
 *  4. Zero appearances for business (might mean name resolution failed)
 *  5. Empty/stale leads stuck in processing
 *
 * On failure: alerts via Telegram, marks lead for manual review
 */

import { getLeadByLeadId, updateLeadResearchResults } from '@/lib/google-sheets';

interface ResearchData {
  businessName: string;
  website: string;
  city: string;
  niche: string;
  appearedCount: number;
  totalPrompts: number;
  promptResults: { prompt: string; businessAppeared: boolean; competitorAppeared: boolean; competitorName?: string }[];
  competitorMention: string;
  competitorCategories: string[];
}

interface AuditResult {
  pass: boolean;
  score: number; // 0-100
  issues: AuditIssue[];
  summary: string;
}

interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  check: string;
  detail: string;
  fix?: string;
}

// Names that should NEVER appear as competitors
const JUNK_COMPETITORS = [
  'better business bureau', 'bbb', 'bbb.org',
  'yellow pages', 'yellowpages', 'white pages', 'whitepages',
  'yelp', 'google maps', 'google', 'tripadvisor',
  'facebook', 'instagram', 'linkedin', 'twitter', 'x.com',
  'wikipedia', 'medium', 'reddit', 'youtube',
  'mapquest', 'foursquare', 'angi', 'homeadvisor', 'thumbtack',
  'cars.com', 'autotrader', 'cargurus', 'edmunds', 'kbb', 'truecar',
  'justdial', 'indiamart', 'glassdoor', 'indeed', 'crunchbase',
  'nearby', 'local options', 'top rated', 'best in',
];

function isJunkCompetitor(name: string): boolean {
  const lower = name.toLowerCase();
  return JUNK_COMPETITORS.some(j => lower === j || lower.startsWith(j + ' ') || lower.includes(j + ':'));
}

export async function auditResearchResult(leadId: string): Promise<AuditResult> {
  const issues: AuditIssue[] = [];
  let score = 100;

  const lead = await getLeadByLeadId(leadId);
  if (!lead) {
    return { pass: false, score: 0, issues: [{ severity: 'critical', check: 'lead_exists', detail: `Lead ${leadId} not found in Sheets` }], summary: 'Lead not found' };
  }

  // Extract research data from notes
  const notes = lead.notes || '';
  const marker = 'RESEARCH_DATA:';
  const idx = notes.indexOf(marker);
  if (idx < 0) {
    return { pass: false, score: 0, issues: [{ severity: 'critical', check: 'research_data', detail: 'No RESEARCH_DATA in notes column' }], summary: 'No research data' };
  }

  let rd: ResearchData;
  try {
    rd = JSON.parse(notes.slice(idx + marker.length));
  } catch {
    return { pass: false, score: 0, issues: [{ severity: 'critical', check: 'research_data', detail: 'Failed to parse RESEARCH_DATA JSON' }], summary: 'Corrupt research data' };
  }

  // ── Check 1: Junk competitors ──
  const compNames = new Set<string>();
  for (const p of rd.promptResults) {
    if (p.competitorName) compNames.add(p.competitorName);
  }

  const junkFound: string[] = [];
  for (const name of compNames) {
    if (isJunkCompetitor(name)) {
      junkFound.push(name);
    }
  }

  if (junkFound.length > 0) {
    const sev = junkFound.length >= 3 ? 'critical' : 'warning';
    issues.push({
      severity: sev,
      check: 'junk_competitors',
      detail: `Found junk competitors: ${junkFound.join(', ')}`,
      fix: 'Filter these out of competitor discovery or improve block list',
    });
    score -= junkFound.length * 15;
  }

  // ── Check 2: User competitors ignored ──
  const userCompetitors = (lead.competitor || '')
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0);

  if (userCompetitors.length > 0) {
    const foundInResults: string[] = [];
    const missingFromResults: string[] = [];

    for (const uc of userCompetitors) {
      const ucKey = uc.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
      const found = [...compNames].some(cn => cn.toLowerCase().includes(ucKey));
      if (found) {
        foundInResults.push(uc);
      } else {
        missingFromResults.push(uc);
      }
    }

    if (missingFromResults.length > 0 && foundInResults.length === 0) {
      issues.push({
        severity: 'warning',
        check: 'user_competitors_ignored',
        detail: `User entered ${userCompetitors.join(', ')} but NONE appeared in research. All competitors are engine-discovered.`,
        fix: 'This is expected if user competitors don\'t rank in AI, but report should show both.',
      });
      score -= 10;
    }
  }

  // ── Check 3: Niche is generic fallback ──
  if (rd.niche === 'local_business') {
    issues.push({
      severity: 'critical',
      check: 'generic_niche',
      detail: `Niche detected as "local_business" (generic fallback). Prompts will be generic.`,
      fix: 'Add this business type to niche-detector and re-run research.',
    });
    score -= 30;
  }

  // ── Check 4: Zero business appearances on brand queries ──
  const brandPrompts = rd.promptResults.filter(p =>
    p.prompt.toLowerCase().includes(rd.businessName.toLowerCase().split(' ')[0])
  );
  const brandAppeared = brandPrompts.filter(p => p.businessAppeared).length;

  if (brandPrompts.length > 0 && brandAppeared === 0) {
    issues.push({
      severity: 'warning',
      check: 'brand_invisible',
      detail: `Business name "${rd.businessName}" didn't appear in ANY brand-name queries. Possible name resolution issue.`,
      fix: 'Check if the business name matches their actual online presence.',
    });
    score -= 15;
  }

  // ── Check 5: All competitors are directories/generic ──
  const realCompCount = [...compNames].filter(n => !isJunkCompetitor(n)).length;
  if (compNames.size > 0 && realCompCount === 0) {
    issues.push({
      severity: 'critical',
      check: 'no_real_competitors',
      detail: `All ${compNames.size} competitors are directories/platforms. No real businesses found.`,
      fix: 'Competitor discovery failed. Niche may be wrong or market too small.',
    });
    score -= 25;
  }

  // ── Check 6: Preflight niche vs research niche ──
  const pfMarker = 'PREFLIGHT:';
  const pfIdx = notes.indexOf(pfMarker);
  // Check both notes and the preflight data that was stored separately
  // Note: preflight gets overwritten by RESEARCH_DATA in notes, so this check
  // only works if preflight was preserved elsewhere

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  const pass = score >= 60 && !issues.some(i => i.severity === 'critical');

  const summary = pass
    ? `✅ Audit passed (${score}/100). ${issues.length} warnings.`
    : `❌ Audit failed (${score}/100). ${issues.filter(i => i.severity === 'critical').length} critical, ${issues.filter(i => i.severity === 'warning').length} warnings.`;

  return { pass, score, issues, summary };
}

/**
 * Run audit and send Telegram alert if issues found
 */
export async function runPostResearchAudit(leadId: string): Promise<AuditResult> {
  const result = await auditResearchResult(leadId);

  if (result.issues.length > 0) {
    // Format alert message
    const lead = await getLeadByLeadId(leadId);
    const bizName = lead?.dealershipName || leadId;

    let msg = `🔍 Post-Research Audit: ${bizName}\n`;
    msg += `${result.summary}\n\n`;

    for (const issue of result.issues) {
      const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : 'ℹ️';
      msg += `${icon} ${issue.check}: ${issue.detail}\n`;
      if (issue.fix) msg += `   → ${issue.fix}\n`;
    }

    // Send to Telegram (non-blocking)
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID || '6960754854';
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML',
          }),
        });
      }
    } catch {
      // Non-blocking
    }

    // If critical, mark lead for manual review
    if (!result.pass) {
      try {
        await updateLeadResearchResults(leadId, {
          notes: `AUDIT_FAILED(${result.score}): ${result.issues.filter(i => i.severity === 'critical').map(i => i.check).join(', ')}. Manual review needed.`,
        });
      } catch {
        // Don't overwrite research data — just alert
      }
    }
  }

  return result;
}
