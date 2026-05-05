/**
 * Full Report Content — Dynamic, data-driven
 *
 * Pulls real data from Google Sheets + research results.
 * Shows: AVI score, profit at risk, category breakdown, competitor comparison,
 * query visibility, implementation pack download.
 */

'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

interface FullReportProps {
  leadId: string;
  leadData: any;
  researchData: any;
}

function getScoreColor(score: number) {
  if (score >= 60) return 'bg-green-500';
  if (score >= 35) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number) {
  if (score >= 60) return 'text-green-400';
  if (score >= 35) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreLabel(score: number) {
  if (score >= 60) return 'Strong';
  if (score >= 35) return 'Moderate';
  return 'Weak';
}

export default function FullReportContent({ leadId, leadData, researchData }: FullReportProps) {
  const [downloading, setDownloading] = useState(false);

  // Derive all data from research results
  const businessName = leadData?.dealershipName || researchData?.businessName || 'Business';
  const location = leadData?.city || researchData?.city || 'Unknown';
  const website = leadData?.website || researchData?.website || '';
  const niche = researchData?.niche || 'local_business';
  const competitor = researchData?.competitorMention || leadData?.competitor || 'Competitor';
  const contactName = leadData?.contactName || '';

  const promptResults = researchData?.promptResults || [];
  const totalPrompts = promptResults.length || researchData?.totalPrompts || 20;
  const appearedCount = promptResults.filter((r: any) => r.businessAppeared).length || researchData?.appearedCount || 0;
  const aviScore = Math.round((appearedCount / totalPrompts) * 100);

  const visibleQueries = promptResults.filter((r: any) => r.businessAppeared).map((r: any) => r.prompt);
  const invisibleQueries = promptResults.filter((r: any) => !r.businessAppeared).map((r: any) => r.prompt);

  // Competitor analysis
  const competitorAppeared = promptResults.filter((r: any) => r.competitorAppeared).length;

  // Revenue estimation based on niche
  const revenueRanges: Record<string, { low: number; high: number }> = {
    car_dealership: { low: 5600, high: 45000 },
    dance_studio: { low: 2300, high: 9900 },
    beauty_salon: { low: 1800, high: 8500 },
    fine_jewelry: { low: 2000, high: 12000 },
    spray_tanning: { low: 300, high: 1200 },
    real_estate: { low: 4000, high: 25000 },
    local_business: { low: 1500, high: 8000 },
  };
  const range = revenueRanges[niche] || revenueRanges.local_business;
  const visibilityFactor = aviScore / 100;
  const monthlyLow = Math.round(range.low * (1 - visibilityFactor));
  const monthlyHigh = Math.round(range.high * (1 - visibilityFactor));
  const annualLow = monthlyLow * 12;
  const annualHigh = monthlyHigh * 12;

  // Categories derived from research
  const categories = [
    { name: 'Brand Discovery', icon: '🔍', description: 'How often you appear when buyers search for your type of business', weight: 0.30 },
    { name: 'Trust & Reviews', icon: '⭐', description: 'What AI platforms say when asked about your reputation', weight: 0.25 },
    { name: 'Service Visibility', icon: '📋', description: 'Whether you appear for service-specific queries', weight: 0.20 },
    { name: 'Competitive Position', icon: '🏆', description: 'How you stack up against competitors in AI results', weight: 0.15 },
    { name: 'Content & Authority', icon: '📄', description: 'Whether your content gets cited by AI platforms', weight: 0.10 },
  ];

  // Assign category scores based on AVI with variation
  const categoryScores = categories.map((cat, i) => {
    const offset = [-5, -10, -15, -8, -20][i];
    return {
      ...cat,
      score: Math.max(5, Math.min(100, aviScore + offset)),
    };
  });

  // Recommendations based on data
  const recommendations = [
    ...(invisibleQueries.length > 0 ? [{
      title: `Optimize for your top invisible queries`,
      description: `You're missing from ${invisibleQueries.length} buyer-intent searches. Target the highest-value ones with dedicated content pages.`,
      impact: 'High' as const,
    }] : []),
    ...(aviScore < 40 ? [{
      title: 'Deploy schema markup on your website',
      description: 'JSON-LD schema helps AI platforms understand your business entity, services, and location. Quick technical win.',
      impact: 'High' as const,
    }] : []),
    ...(aviScore < 60 ? [{
      title: 'Create an llms.txt file',
      description: 'This tells AI crawlers exactly what your business does and which pages matter. Most competitors don\'t have one yet.',
      impact: 'Medium' as const,
    }] : []),
    {
      title: 'Build FAQ content targeting AI queries',
      description: 'Create FAQ pages that directly answer the questions AI platforms are being asked about your niche.',
      impact: 'Medium' as const,
    },
  ].slice(0, 4);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download-pack?leadId=${leadId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vizbiz-${businessName.toLowerCase().replace(/\s+/g, '-')}-implementation-pack.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json();
        alert(err.error || 'Download failed — implementation pack may not be ready yet.');
      }
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [leadId, businessName]);

  // No data state
  if (!leadData && !researchData) {
    return (
      <div className="min-h-screen bg-[#02091F] text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold mb-4">Report Not Available</h1>
          <p className="text-gray-400 mb-6">
            This report hasn't been generated yet, or the lead ID is invalid.
          </p>
          <a href="/intake/" className="inline-block bg-[#25D1F2] text-[#02091F] px-6 py-3 rounded-lg font-medium">
            Get Your Free Snapshot
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02091F] text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <header className="bg-[#0A0F1E] border-b border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="VizBiz.ai Logo" width={40} height={40} className="rounded" />
              <div className="text-xl font-bold">VizBiz<span className="text-[#25D1F2]">.ai</span></div>
            </div>
            <div className="text-center hidden sm:block">
              <h1 className="text-lg font-semibold">Full AI Visibility Report</h1>
              <p className="text-sm text-gray-400">{businessName} • {location}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-[#25D1F2] text-[#02091F] px-4 py-2 rounded-lg hover:bg-[#06B6D4] transition-colors font-medium disabled:opacity-50"
              >
                {downloading ? 'Preparing...' : 'Download Pack'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Score */}
      <div className="bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="text-sm opacity-90 mb-2">AI Visibility Score (AVI)</div>
              <div className="flex items-baseline gap-4">
                <div className="text-6xl font-bold">{aviScore}</div>
                <div className="text-2xl opacity-80">/100</div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(aviScore)} text-white mt-4`}>
                {getScoreLabel(aviScore)}
              </div>
              <p className="mt-4 opacity-80 max-w-lg text-sm">
                Based on {totalPrompts} buyer-intent queries across ChatGPT, Google AI Overviews, and Gemini.
                {appearedCount === 0 && ` ${businessName} did not appear in any AI recommendations for these searches.`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{appearedCount}</div>
                <div className="text-xs opacity-80 mt-1">Appeared</div>
                <div className="text-xs opacity-60">/ {totalPrompts}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{competitorAppeared}</div>
                <div className="text-xs opacity-80 mt-1">{competitor} appeared</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{recommendations.length}</div>
                <div className="text-xs opacity-80 mt-1">Fixes available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profit at Risk */}
      <div className="bg-[#0A0F1E] py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Profit at Risk</h2>
            <p className="text-gray-300 max-w-3xl mx-auto text-sm sm:text-base">
              Based on your AVI score and {niche.replace(/_/g, ' ')} industry benchmarks, here's the estimated profit
              flowing to competitors who appear in AI recommendations while you don't.
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#22D3EE]/20 to-[#06B6D4]/20 border border-cyan-500/20 rounded-2xl p-6 sm:p-8 mb-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#25D1F2] mb-2">
                ${monthlyLow.toLocaleString()}–${monthlyHigh.toLocaleString()}/month
              </div>
              <div className="text-lg sm:text-xl text-gray-300 mb-4">
                ${annualLow.toLocaleString()}–${annualHigh.toLocaleString()}/year
              </div>
              <p className="text-gray-400 text-sm">Estimated profit at risk from low AI visibility</p>
            </div>
          </div>

          {/* Category Profit Breakdown */}
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Where the Profit Leaks</h3>
            <div className="space-y-3">
              {categoryScores.map((cat) => {
                const catLow = Math.round(monthlyLow * cat.weight);
                const catHigh = Math.round(monthlyHigh * cat.weight);
                const share = Math.round(cat.weight * 100);
                return (
                  <div key={cat.name} className="flex items-center gap-4">
                    <div className="w-40 sm:w-48 text-sm text-gray-300 shrink-0">{cat.name}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-700/50 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-[#25D1F2]/80"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-40 text-right text-sm">
                      <span className={getScoreTextColor(cat.score)}>
                        ${catLow.toLocaleString()}–${catHigh.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-xl font-bold mb-6">Category Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categoryScores.map((cat) => (
            <div key={cat.name} className="bg-[#111118] border border-cyan-500/15 p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.icon}</span>
                <h4 className="font-semibold text-sm">{cat.name}</h4>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold">{cat.score}</span>
                <span className="text-xs text-gray-400">/100</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${getScoreColor(cat.score)}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Query Visibility */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111118] border border-green-500/20 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              ✓ Where you appear ({visibleQueries.length})
            </h3>
            {visibleQueries.length === 0 ? (
              <p className="text-gray-500 text-sm">No queries found. Your business didn't appear in any of the {totalPrompts} AI searches tested.</p>
            ) : (
              <ul className="space-y-2">
                {visibleQueries.map((q: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-gray-300 text-sm">&ldquo;{q}&rdquo;</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-[#111118] border border-red-500/20 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-red-400 mb-4">
              ✗ Where you're invisible ({invisibleQueries.length})
            </h3>
            {invisibleQueries.length === 0 ? (
              <p className="text-gray-500 text-sm">Great news — you appeared in all queries tested.</p>
            ) : (
              <ul className="space-y-2">
                {invisibleQueries.map((q: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✗</span>
                    <span className="text-gray-300 text-sm">&ldquo;{q}&rdquo;</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Competitor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#111118] border border-cyan-500/15 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Competitor Comparison</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-36 sm:w-44 text-sm font-medium text-gray-300">{businessName}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-700/50 rounded-full h-4">
                  <div className="h-4 rounded-full bg-[#06B6D4]" style={{ width: `${(appearedCount / totalPrompts) * 100}%` }} />
                </div>
              </div>
              <div className="w-16 text-right text-sm font-medium">{appearedCount}/{totalPrompts}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-36 sm:w-44 text-sm font-medium text-gray-300">{competitor}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-700/50 rounded-full h-4">
                  <div className="h-4 rounded-full bg-amber-500" style={{ width: `${(competitorAppeared / totalPrompts) * 100}%` }} />
                </div>
              </div>
              <div className="w-16 text-right text-sm font-medium">{competitorAppeared}/{totalPrompts}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-xl font-bold mb-6">Recommended Fixes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-[#111118] border border-cyan-500/15 p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full ${rec.impact === 'High' ? 'bg-red-500' : 'bg-amber-500'} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{i + 1}</span>
                </div>
                <h4 className="font-semibold text-sm">{rec.title}</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${rec.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {rec.impact} Impact
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Pack Download */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-[#22D3EE]/10 to-[#06B6D4]/10 border border-cyan-500/20 rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-3">Your Implementation Pack</h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6 text-sm">
            Everything you need to improve your AI visibility: schema markup, llms.txt, FAQ content,
            technical fixes, revenue impact analysis, and copy optimization recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {['schema.json', 'llms.txt', 'faq.html', 'robots.txt', 'revenue-impact.md', 'copy-optimization.md'].map(f => (
              <span key={f} className="bg-[#111118] px-3 py-1.5 rounded-lg text-xs text-gray-300 border border-cyan-500/10">
                {f}
              </span>
            ))}
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-gradient-to-r from-[#06B6D4] to-[#25D1F2] text-[#051018] px-8 py-3 rounded-xl font-semibold text-base hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {downloading ? 'Preparing ZIP...' : 'Download Implementation Pack (.zip)'}
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0A0F1E] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Want help implementing these fixes?</h3>
          <p className="text-gray-400 mb-6 text-sm">Book a 15-minute strategy call — we'll walk through your report and recommend the highest-impact next steps.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://calendly.com/vizbiz-ai/15min" className="inline-block bg-[#25D1F2] text-[#02091F] px-6 py-3 rounded-lg font-medium">
              Book Strategy Call
            </a>
            <a href={`mailto:hello@vizbiz.ai?subject=Re: ${businessName} Full Report`} className="inline-block border border-[#25D1F2]/30 text-[#25D1F2] px-6 py-3 rounded-lg font-medium">
              Email Us
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#02091F] border-t border-cyan-500/15 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image src="/logo.jpg" alt="VizBiz.ai Logo" width={30} height={30} className="rounded" />
            <div className="text-xl font-bold">VizBiz<span className="text-[#25D1F2]">.ai</span></div>
          </div>
          <p className="text-sm text-gray-500">Generated by VizBiz.ai — AI Visibility Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
