import { loadEnvConfig } from '@next/env';

async function main() {
  loadEnvConfig(process.cwd());

  const leadId = process.argv[2] || '1733dfa2-626b-4b7f-911d-31d65abd40fa';
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env missing');

  async function supabaseFetch(path: string, init: RequestInit = {}) {
    const response = await fetch(`${supabaseUrl}/rest/v1${path}`, {
      ...init,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    if (!response.ok) throw new Error(`Supabase ${path} failed: ${response.status} ${await response.text()}`);
    return response.json();
  }

  const rows = await supabaseFetch(`/leads?select=*&id=eq.${encodeURIComponent(leadId)}&limit=1`);
  if (!rows?.[0]) throw new Error(`Lead not found: ${leadId}`);
  const lead = rows[0];
  const competitors = [lead.competitor_1_name, lead.competitor_2_name].filter(Boolean);
  const submittedPrimaryService = lead.submitted_niche && lead.submitted_niche !== 'local_business' ? lead.submitted_niche : null;

  const diagnostics: any[] = [];
  const resolvedLogs: any[] = [];
  const originalInfo = console.info.bind(console);
  console.info = (...args: any[]) => {
    const line = args.map((a) => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    if (line.includes('[niche-classifier-input-diagnostic]')) {
      const json = line.slice(line.indexOf('{'));
      diagnostics.push(JSON.parse(json));
    }
    if (line.includes('[niche-resolution-diagnostic]')) {
      const json = line.slice(line.indexOf('{'));
      const parsed = JSON.parse(json);
      if (parsed.stage === 'resolved' || parsed.stage === 'degraded_mode') resolvedLogs.push(parsed);
    }
    originalInfo(...args);
  };

  const { preflightScan } = await import('../src/lib/preflight-engine');
  let profile: any = null;
  let error: any = null;
  try {
    profile = await preflightScan(lead.website_url, lead.submitted_location || undefined, lead.business_name || undefined, {
      leadId: lead.id,
      submittedPrimaryService,
      competitors,
      onNicheBlocked: (resolved) => {
        console.info('[gate2-on-niche-blocked]', JSON.stringify(resolved));
      },
    });
  } catch (err) {
    error = err instanceof Error ? { message: err.message } : { message: String(err) };
  }

  const diagnostic = diagnostics[diagnostics.length - 1] || null;
  const resolved = resolvedLogs[resolvedLogs.length - 1] || null;
  const out = {
    lead: {
      id: lead.id,
      businessName: lead.business_name,
      websiteUrl: lead.website_url,
      submittedLocation: lead.submitted_location,
      storedSubmittedNiche: lead.submitted_niche,
      statusBefore: lead.status,
      competitors,
    },
    oldInputDiagnostic: diagnostic ? {
      classifierInputCharCount: diagnostic.classifierInputCharCount,
      submittedPrimaryService: diagnostic.submittedPrimaryService,
      submittedPrimaryServicePresent: diagnostic.submittedPrimaryServicePresent,
      competitorTextInContext: diagnostic.competitorTextInContext,
      competitorMatches: diagnostic.competitorMatches,
    } : null,
    newResolveNicheResult: resolved,
    newPreflightProfile: profile ? {
      niche: profile.niche,
      nicheLabel: profile.nicheLabel,
      businessType: profile.businessType,
      targetAudience: profile.targetAudience,
      services: profile.services,
      customerSegments: profile.customerSegments,
      nicheConfidence: profile.nicheConfidence,
      confidenceReason: profile.confidenceReason,
      renderMethod: profile.renderMethod,
    } : null,
    error,
  };
  console.log('\nGATE2_RESULT_JSON_START');
  console.log(JSON.stringify(out, null, 2));
  console.log('GATE2_RESULT_JSON_END');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
