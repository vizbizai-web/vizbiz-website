/**
 * Full Paid Report v3 — What the client actually gets
 *
 * Not a dashboard. A deliverable.
 * - Exact AI quotes with source citations
 * - Where AI recommends competitors instead of you (and why)
 * - Specific fixes with copy-paste content
 * - Revenue impact per gap
 */

'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface FullReportProps {
  leadId: string;
  leadData: any;
  researchData: any;
  aiCaptureData?: any;
  competitorProfiles?: any[];
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString();
}

export default function FullReportContent({ leadId, leadData, researchData, aiCaptureData, competitorProfiles = [] }: FullReportProps) {
  const [mounted, setMounted] = useState(false);
  const [expandedQuery, setExpandedQuery] = useState<number | null>(null);
  useEffect(() => { setMounted(true); }, []);

  const businessName = researchData?.businessName || leadData?.businessName || 'Business';
  const location = researchData?.city || leadData?.city || '';
  const website = researchData?.website || leadData?.website || '';
  const niche = researchData?.niche || 'local_business';
  const promptResults = researchData?.promptResults || [];
  const totalPrompts = promptResults.length || 20;
  const appearedCount = promptResults.filter((r: any) => r.businessAppeared).length;
  const aviScore = Math.round((appearedCount / totalPrompts) * 100);

  const competitorMode = researchData?.competitorMode || "client_only";
  const isClientProvided = competitorMode === "client_provided";

  // Competitor data — only show real competitor analysis when client provided competitors
  const competitorFreq: Record<string, number> = {};
  if (isClientProvided) {
    for (const p of promptResults) {
      if (p.competitorName) competitorFreq[p.competitorName] = (competitorFreq[p.competitorName] || 0) + 1;
    }
  }
  const topCompetitor = isClientProvided 
    ? Object.entries(competitorFreq).sort((a, b) => b[1] - a[1])[0]
    : null;

  // AI capture data (real responses) — full 84-prompt if available
  const captureResults = aiCaptureData?.results || [];
  const isFullCapture = captureResults.length > 40; // 84×2 = 168, vs 20×2 = 40
  const totalCapturePrompts = aiCaptureData?.totalPrompts || totalPrompts;
  const captureSearchResults = captureResults.filter((r: any) => r.platform === 'search');
  const captureVisibleCount = captureSearchResults.filter((r: any) => r.businessMentioned).length;
  const fullAviScore = captureSearchResults.length > 0 ? Math.round((captureVisibleCount / captureSearchResults.length) * 100) : aviScore;
  
  const visibleQueries = promptResults.filter((q: any) => q.businessAppeared);
  const invisibleQueries = promptResults.filter((q: any) => !q.businessAppeared);
  // Only count gap queries (where competitor appeared) when client provided competitors
  const gapQueries = isClientProvided 
    ? invisibleQueries.filter((q: any) => q.competitorAppeared)
    : invisibleQueries; // When client_only, all invisible queries are "gaps"

  // Revenue estimates — use research data when available, fallback to niche defaults
  // Revenue estimates — use research data when available, fallback to niche defaults
  const revenueRanges: Record<string, { low: number; high: number }> = {
    car_dealership: { low: 5600, high: 45000 },
    tourism_experience: { low: 2000, high: 12000 },
    auto_transport: { low: 3000, high: 18000 },
    dance_studio: { low: 2300, high: 9900 },
    beauty_salon: { low: 1800, high: 8500 },
    fine_jewelry: { low: 2000, high: 12000 },
    spray_tanning: { low: 300, high: 1200 },
    real_estate: { low: 4000, high: 25000 },
    local_business: { low: 1500, high: 8000 },
  };
  // Use actual revenue loss from research if available
  let range = revenueRanges[niche] || revenueRanges.local_business;
  if (researchData?.revenueLoss && researchData.revenueLoss > 0) {
    range = { low: Math.round(researchData.revenueLoss * 0.3), high: Math.round(researchData.revenueLoss * 1.2) };
  }
  const gapRevenueLow = Math.round((range.low / totalPrompts) * gapQueries.length);
  const gapRevenueHigh = Math.round((range.high / totalPrompts) * gapQueries.length);

  // Find a real AI quote for the hero
  const heroQuote = captureResults.find((r: any) => r.businessMentioned && r.mentionContext);
  const heroGap = captureResults.find((r: any) => !r.businessMentioned && r.competitorMentioned);

  // Per-platform scores from capture
  const geminiResults = captureResults.filter((r: any) => r.platform === 'gemini');
  const searchResults = captureResults.filter((r: any) => r.platform === 'search');
  const geminiScore = geminiResults.length > 0 ? Math.round((geminiResults.filter((r: any) => r.businessMentioned).length / geminiResults.length) * 100) : null;
  const searchScore = searchResults.length > 0 ? Math.round((searchResults.filter((r: any) => r.businessMentioned).length / searchResults.length) * 100) : null;

  // Fixes derived from gaps
  const fixes = [
    ...(gapQueries.length > 0 ? [{
      title: `Create pages targeting your ${gapQueries.length} gap queries`,
      detail: isClientProvided
        ? `These are searches where AI recommends your competitor instead of you. Each one represents real buyers who never find you.`
        : `These are searches where your business doesn't appear in AI recommendations. Each one represents real buyers who never find you.`,
      queries: gapQueries.map((q: any) => q.prompt),
      impact: 'High',
      effort: 'Medium',
      type: 'content' as const,
    }] : []),
    ...(gapQueries.filter((q: any) => q.prompt.toLowerCase().includes('best') || q.prompt.toLowerCase().includes('top')).length > 0 ? [{
      title: 'Build "Best of" comparison content',
      detail: `AI platforms love listicles and comparisons. Create pages like "Best Tours Near ${location}" that naturally include your business alongside others.`,
      queries: gapQueries.filter((q: any) => q.prompt.toLowerCase().includes('best') || q.prompt.toLowerCase().includes('top')).map((q: any) => q.prompt),
      impact: 'High',
      effort: 'Low',
      type: 'content' as const,
    }] : []),
    {
      title: 'Deploy structured data (JSON-LD schema)',
      detail: `Add LocalBusiness + TouristAttraction schema to your homepage. This helps AI understand exactly what you offer, where you are, and your hours.`,
      queries: [],
      impact: 'Medium',
      effort: 'Low',
      type: 'technical' as const,
    },
    {
      title: 'Create llms.txt in your website root',
      detail: `This file speaks directly to AI crawlers. Tell them your services, location, unique selling points, and key pages. Most competitors don\'t have one.`,
      queries: [],
      impact: 'Medium',
      effort: 'Low',
      type: 'technical' as const,
    },
    {
      title: 'Claim and optimize your Google Business Profile',
      detail: `Google Business Profile data feeds directly into AI Overviews and Gemini. Ensure your category, services, hours, and photos are complete and accurate.`,
      queries: [],
      impact: 'High',
      effort: 'Low',
      type: 'listing' as const,
    },
    {
      title: 'Get listed on third-party sites AI trusts',
      detail: `AI platforms cite TripAdvisor, Visit NSW, and local tourism directories. Ensure your listings are complete, accurate, and consistent across all of them.`,
      queries: [],
      impact: 'High',
      effort: 'Medium',
      type: 'listing' as const,
    },
  ];

  if (!leadData && !researchData) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold mb-4">Report Not Available</h1>
          <p className="text-gray-400 mb-6">This report hasn't been generated yet.</p>
          <a href="/intake/" className="inline-block bg-[#22D3EE] text-[#020617] px-6 py-3 rounded-lg font-medium">Get Your Free Snapshot</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* === HEADER === */}
      <header className="bg-[#0F172A] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="VizBiz" width={36} height={36} className="rounded" />
            <div>
              <div className="text-base font-semibold">VizBiz<span className="text-[#22D3EE]">.ai</span></div>
              <div className="text-[10px] text-gray-500 tracking-wider uppercase">AI Visibility Report</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">{businessName}</div>
            <div className="text-xs text-gray-500">{location} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">

        {/* === 1. EXECUTIVE SUMMARY === */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Executive Summary</h2>
          <div className="space-y-4 text-base leading-relaxed text-gray-300">
            <p>
              <span className="text-white font-medium">{businessName}</span> has <span className="text-white font-semibold">{aviScore}% AI visibility</span> across {totalPrompts} buyer-intent searches.
              AI platforms mention you in {appearedCount} out of {totalPrompts} queries tested.
            </p>
            {topCompetitor && isClientProvided ? (
              <p>
                Your top competitor, <span className="text-amber-400 font-medium">{topCompetitor[0]}</span>, appears in {topCompetitor[1]} out of {totalPrompts} queries — 
                {topCompetitor[1] > appearedCount ? ` ${topCompetitor[1] - appearedCount} more than you.` : ' roughly equal to you.'}
              </p>
            ) : !isClientProvided && invisibleQueries.length > 0 ? (
              <p>
                You didn't specify competitors, so we ran a business-only analysis. 
                You appeared in {appearedCount} out of {totalPrompts} queries — 
                <span className="text-red-400 font-medium">{invisibleQueries.length} queries</span> where buyers ask for recommendations but don't find you.
              </p>
            ) : null}
            {gapQueries.length > 0 && isClientProvided ? (
              <p>
                There are <span className="text-red-400 font-medium">{gapQueries.length} queries</span> where AI explicitly recommends your competitor instead of you.
                These gaps represent an estimated <span className="text-red-400 font-medium">{formatCurrency(gapRevenueLow)}–{formatCurrency(gapRevenueHigh)}/month</span> in potential revenue going elsewhere.
              </p>
            ) : gapQueries.length > 0 && !isClientProvided ? (
              <p>
                There are <span className="text-red-400 font-medium">{gapQueries.length} queries</span> where your business doesn't appear in AI recommendations.
                To see who AI recommends instead — and quantify the revenue impact — add 1–2 competitors to your report.
              </p>
            ) : null}
            {heroQuote && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <div className="text-xs text-emerald-400 mb-2">What AI says about you:</div>
                <p className="text-white italic">"{heroQuote.mentionContext}"</p>
                {heroQuote.sourceUrls?.[0] && <p className="text-xs text-gray-500 mt-2">Source: {heroQuote.sourceUrls[0]}</p>}
              </div>
            )}
          </div>
        </section>

        {/* === 2. SCORE OVERVIEW === */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-6">Your AI Visibility Score</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 rounded-2xl p-6 flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)' }}>
              <div className="text-xs text-white/70 mb-1 uppercase tracking-wider">AVI Score</div>
              <div className="text-5xl font-bold text-white">{fullAviScore}</div>
              <div className="text-xs text-white/50">out of 100</div>
              <div className="mt-2 px-3 py-1 rounded-full bg-white/20 text-xs text-white font-medium">
                {fullAviScore >= 60 ? 'Strong' : fullAviScore >= 35 ? 'Moderate' : 'Weak'}
              </div>
              {isFullCapture && <div className="text-[10px] text-white/40 mt-1">Based on {totalCapturePrompts} queries</div>}
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Appeared In</div>
                <div className="text-2xl font-bold mt-1">{appearedCount}<span className="text-sm text-gray-500">/{totalPrompts}</span></div>
                <div className="text-[10px] text-gray-500">buyer-intent queries</div>
              </div>
              <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Gaps</div>
                <div className="text-2xl font-bold mt-1 text-red-400">{gapQueries.length}</div>
                <div className="text-[10px] text-gray-500">queries to competitor</div>
              </div>
              {searchScore !== null && (
                <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Search AI Score</div>
                  <div className="text-2xl font-bold mt-1">{searchScore}%</div>
                  <div className="text-[10px] text-gray-500">AI-generated answers</div>
                </div>
              )}
              {geminiScore !== null && (
                <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Gemini Score</div>
                  <div className="text-2xl font-bold mt-1">{geminiScore}%</div>
                  <div className="text-[10px] text-gray-500">Google Gemini</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* === 3. WHAT AI ACTUALLY SAYS === */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">What AI Actually Says About You</h2>
          <p className="text-xs text-gray-600 mb-6">Real responses from AI platforms when buyers search for businesses like yours.</p>

          <div className="space-y-3">
            {captureResults
              .filter((r: any) => r.platform === 'search' && r.businessMentioned)
              .slice(0, 6)
              .map((r: any, i: number) => (
                <div key={i} className="rounded-xl p-4 bg-white/[0.02] border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="text-emerald-400 text-lg mt-0.5">✓</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-400 mb-1">Query: "{r.prompt}"</div>
                      <p className="text-white text-sm leading-relaxed">"{r.mentionContext}"</p>
                      {r.sourceUrls?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.sourceUrls.slice(0, 3).map((url: string, j: number) => (
                            <span key={j} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded truncate max-w-[200px]">
                              {url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* === 4. WHERE YOU'RE INVISIBLE === */}
        {gapQueries.length > 0 && (
          <section>
            <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Where You're Invisible</h2>
            <p className="text-xs text-gray-600 mb-6">Queries where AI recommends your competitor instead of you. Each one = real buyers finding someone else.</p>

            <div className="space-y-3">
              {gapQueries.map((q: any, i: number) => {
                const captureMatch = captureResults.find((r: any) => r.platform === 'search' && r.prompt === q.prompt);
                return (
                  <div key={i} className="rounded-xl p-4 bg-red-500/5 border border-red-500/15">
                    <div className="flex items-start gap-3">
                      <div className="text-red-400 text-lg mt-0.5">✗</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white mb-1">"{q.prompt}"</div>
                        {q.competitorName && (
                          <div className="text-sm text-amber-400">→ AI recommended: {q.competitorName}</div>
                        )}
                        {captureMatch?.responseSnippet && (
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">{captureMatch.responseSnippet.slice(0, 200)}...</p>
                        )}
                        {captureMatch?.sourceUrls?.length > 0 && (
                          <div className="mt-2 text-[10px] text-gray-500">
                            Sources AI used: {captureMatch.sourceUrls.slice(0, 3).map((u: string) => u.replace(/https?:\/\/(www\.)?/, '').split('/')[0]).join(', ')}
                          </div>
                        )}
                        <div className="mt-2 text-[10px] text-red-400/70">
                          Est. revenue impact: {formatCurrency(Math.round(range.low / totalPrompts))}–{formatCurrency(Math.round(range.high / totalPrompts))}/month
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
          {isFullCapture && aiCaptureData?.categoryBreakdown && (
          <section>
            <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Category Breakdown</h2>
            <p className="text-xs text-gray-600 mb-6">Your visibility across {totalCapturePrompts} queries in 11 categories. Each category tests a different buyer scenario.</p>
            <div className="space-y-3">
              {aiCaptureData.categoryBreakdown.map((cat: any) => (
                <div key={cat.category} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-28 text-xs text-gray-400 font-medium shrink-0">{cat.name}</div>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: mounted ? `${cat.score}%` : '0%' }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-bold ${cat.score >= 80 ? 'text-emerald-400' : cat.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{cat.score}%</span>
                  </div>
                  <div className="w-16 text-right text-xs text-gray-500">{cat.mentioned}/{cat.total}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* === 5. COMPETITOR ANALYSIS === */}
        {topCompetitor && (
          <section>
            <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Competitor Analysis</h2>
            <p className="text-xs text-gray-600 mb-6">How you compare against your top competitors in AI recommendations — and what they're doing differently.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl p-5 bg-[#22D3EE]/5 border border-[#22D3EE]/20">
                <div className="text-sm font-medium mb-2">{businessName} (You)</div>
                <div className="text-3xl font-bold text-[#22D3EE]">{appearedCount}<span className="text-sm text-gray-500">/{totalPrompts}</span></div>
                <div className="text-xs text-gray-500 mt-1">queries where AI mentions you</div>
              </div>
              <div className="rounded-xl p-5 bg-amber-500/5 border border-amber-500/20">
                <div className="text-sm font-medium mb-2">{topCompetitor[0]}</div>
                <div className="text-3xl font-bold text-amber-400">{topCompetitor[1]}<span className="text-sm text-gray-500">/{totalPrompts}</span></div>
                <div className="text-xs text-gray-500 mt-1">queries where AI mentions them</div>
              </div>
            </div>

            {/* Deep competitor teardowns */}
            {Object.entries(competitorFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([compName, compCount], idx) => {
              const profile = competitorProfiles.find((p: any) => p.name === compName);
              const compGapQueries = promptResults.filter((q: any) => !q.businessAppeared && q.competitorName === compName);
              return (
                <div key={idx} className="mb-6 rounded-xl p-5 bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">{compName}</h3>
                    <span className="text-xs text-amber-400">Appears in {String(compCount)}/{totalPrompts} queries</span>
                  </div>
                  
                  {/* Why AI recommends them */}
                  <div className="mb-3">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Why AI recommends them over you</div>
                    {compGapQueries.length > 0 ? (
                      <div className="space-y-1">
                        {compGapQueries.slice(0, 5).map((q: any, qi: number) => {
                          const captureMatch = captureResults.find((r: any) => r.prompt === q.prompt && r.platform === 'search');
                          return (
                            <div key={qi} className="flex items-start gap-2 p-2 rounded bg-red-500/5">
                              <span className="text-red-400 text-xs mt-0.5">✗</span>
                              <div className="flex-1">
                                <div className="text-xs text-gray-300">{q.prompt}</div>
                                {captureMatch?.responseSnippet && (
                                  <p className="text-[10px] text-gray-500 mt-1">AI said: "{captureMatch.responseSnippet.slice(0, 150)}..."</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No specific gap queries — this competitor appears in general queries alongside you.</p>
                    )}
                  </div>

                  {/* Profile insights if available */}
                  {profile && (
                    <>
                      {profile.whatTheyDo && (
                        <div className="mb-2">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">What they're doing right</div>
                          <p className="text-xs text-gray-400">{profile.whatTheyDo}</p>
                        </div>
                      )}
                      {profile.whatToSteal && profile.whatToSteal.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1">What to learn from them</div>
                          <ul className="space-y-1">
                            {profile.whatToSteal.map((s: string, si: number) => (
                              <li key={si} className="text-xs text-gray-400 flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">→</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {/* What to do about it */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-[10px] text-[#22D3EE] uppercase tracking-wider mb-1">What to do</div>
                    <p className="text-xs text-gray-400">
                      {compGapQueries.length > 2
                        ? `Create targeted content for ${compGapQueries.length} queries where ${compName} appears instead of you. Focus on pages that directly answer these buyer questions with specific, local details.`
                        : compGapQueries.length > 0
                        ? `Build a comparison or "best of" page targeting the query where ${compName} appears instead of you.`
                        : `Monitor ${compName}'s AI visibility. They appear alongside you in results — stay competitive by keeping your content fresh.`
                      }
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Specific examples where competitor wins */}
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 mt-8">All queries where competitors appear instead of you</div>
            <div className="space-y-2">
              {promptResults
                .filter((q: any) => !q.businessAppeared && q.competitorAppeared)
                .slice(0, 8)
                .map((q: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-red-400">✗</span>
                    <span className="text-gray-300 flex-1">{q.prompt}</span>
                    <span className="text-amber-400 text-xs">→ {q.competitorName}</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* === 6. VOICE SEARCH === */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Voice Search Readiness</h2>
          <p className="text-xs text-gray-600 mb-6">When someone asks Siri, Alexa, or Google Assistant about businesses like yours.</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5 text-center">
              <div className="text-2xl mb-2">🎙️</div>
              <div className="text-xs text-gray-500">Siri / Apple Intelligence</div>
              <div className={`text-lg font-bold mt-1 ${aviScore >= 60 ? 'text-emerald-400' : aviScore >= 35 ? 'text-amber-400' : 'text-red-400'}`}>
                {aviScore >= 60 ? 'Likely Found' : aviScore >= 35 ? 'Partial' : 'Not Found'}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Uses web search data</div>
            </div>
            <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5 text-center">
              <div className="text-2xl mb-2">🔊</div>
              <div className="text-xs text-gray-500">Google Assistant</div>
              <div className={`text-lg font-bold mt-1 ${aviScore >= 60 ? 'text-emerald-400' : aviScore >= 35 ? 'text-amber-400' : 'text-red-400'}`}>
                {aviScore >= 60 ? 'Likely Found' : aviScore >= 35 ? 'Partial' : 'Not Found'}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Uses Gemini + search</div>
            </div>
            <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5 text-center">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-xs text-gray-500">Alexa</div>
              <div className={`text-lg font-bold mt-1 ${aviScore >= 60 ? 'text-emerald-400' : aviScore >= 35 ? 'text-amber-400' : 'text-red-400'}`}>
                {aviScore >= 60 ? 'Likely Found' : aviScore >= 35 ? 'Partial' : 'Not Found'}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Uses Bing search data</div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Voice search results mirror web-based AI visibility. Improving your AI search presence directly improves voice assistant recommendations.
          </p>
        </section>

        {/* === 7. REVENUE IMPACT === */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Revenue Impact</h2>
          <div className="rounded-2xl p-6 bg-red-500/5 border border-red-500/15">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Estimated monthly revenue lost to AI invisibility</div>
                <div className="text-3xl font-bold text-red-400">{formatCurrency(gapRevenueLow)} – {formatCurrency(gapRevenueHigh)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Annual impact</div>
                <div className="text-3xl font-bold text-red-400">{formatCurrency(gapRevenueLow * 12)} – {formatCurrency(gapRevenueHigh * 12)}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-500/10">
              <div className="text-xs text-gray-500 mb-2">Per-gap breakdown:</div>
              {gapQueries.slice(0, 5).map((q: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1">
                  <span className="text-gray-400 flex-1">{q.prompt}</span>
                  <span className="text-red-400 ml-4">{formatCurrency(Math.round(range.low / totalPrompts))}–{formatCurrency(Math.round(range.high / totalPrompts))}/mo</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-3">
              Estimates based on {niche.replace(/_/g, ' ')} industry benchmarks. Actual figures depend on local market size and conversion rates.
            </p>
          </div>
        </section>

        {/* === 8. FIX PLAN === */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Prioritized Fix Plan</h2>
          <p className="text-xs text-gray-600 mb-6">Ranked by impact. Each fix targets specific gaps found in your data.</p>

          <div className="space-y-4">
            {fixes.map((fix, i) => (
              <div key={i} className="rounded-xl p-5 bg-white/[0.02] border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE] font-bold text-sm shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{fix.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${fix.type === 'content' ? 'bg-purple-500/10 text-purple-400' : fix.type === 'technical' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {fix.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{fix.detail}</p>
                    <div className="flex gap-3 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${fix.impact === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>Impact: {fix.impact}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${fix.effort === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>Effort: {fix.effort}</span>
                    </div>
                    {fix.queries.length > 0 && (
                      <div className="mt-3 space-y-0.5">
                        {fix.queries.slice(0, 3).map((q: string, j: number) => (
                          <div key={j} className="text-[10px] text-gray-500 pl-2">• {q}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === 9. ALL QUERIES DETAIL === */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Full Query Results</h2>
          <p className="text-xs text-gray-600 mb-4">Every query tested, click to see AI response details.</p>

          <div className="space-y-1">
            {promptResults.map((q: any, i: number) => {
              const captureMatch = captureResults.find((r: any) => r.prompt === q.prompt && r.platform === 'search');
              const isExpanded = expandedQuery === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setExpandedQuery(isExpanded ? null : i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${q.businessAppeared ? 'hover:bg-emerald-500/5' : 'hover:bg-red-500/5'}`}
                  >
                    <span className={q.businessAppeared ? 'text-emerald-400' : 'text-red-400'}>
                      {q.businessAppeared ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-gray-300 flex-1">{q.prompt}</span>
                    {q.competitorName && !q.businessAppeared && <span className="text-[10px] text-amber-400">{q.competitorName}</span>}
                    <span className="text-gray-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                  {isExpanded && captureMatch && (
                    <div className="mx-4 mb-2 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-gray-500 mb-2">AI Response:</div>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{captureMatch.responseSnippet}</p>
                      {captureMatch.sourceUrls.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[10px] text-gray-500 mb-1">Sources AI cited:</div>
                          {captureMatch.sourceUrls.slice(0, 5).map((url: string, j: number) => (
                            <div key={j} className="text-[10px] text-[#22D3EE]/60 truncate">{url}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* === FOOTER === */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="VizBiz" width={20} height={20} className="rounded" />
            <span className="text-xs text-gray-500">VizBiz.ai — AI Visibility Intelligence</span>
          </div>
          <div className="text-[10px] text-gray-600">
            Report {leadId} • {new Date().toLocaleDateString()} • Data captured from live AI platform queries
          </div>
        </div>
      </footer>
    </div>
  );
}
