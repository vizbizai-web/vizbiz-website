import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Full AI Visibility Report | VizBiz.ai',
  description: 'Complete AI Visibility Intelligence Report with Revenue Impact Analysis',
};

export default function FullReportPage({ params }: { params: { leadId: string } }) {
  // Sample data - will be replaced with dynamic data from leadId
  const businessName = "E&A Dance Studio";
  const location = "Auckland, NZ";
  const aviScore = 28;
  const totalPrompts = 20;
  const promptsAppeared = 4;
  
  // Revenue impact data (sample - will be calculated dynamically)
  const revenueImpact = {
    monthlyLow: 2300,
    monthlyHigh: 9900,
    annualLow: 27600,
    annualHigh: 118800,
    currencySymbol: '$',
    categories: [
      { name: "Brand Discovery", low: 900, high: 3860 },
      { name: "Trust & Reviews", low: 670, high: 2870 },
      { name: "Class & Booking Visibility", low: 550, high: 2370 },
      { name: "Competitive Position", low: 180, high: 800 }
    ],
    priorityMatrix: [
      { 
        fix: "Add LocalBusiness schema to homepage", 
        category: "Brand Discovery",
        priority: "Quick Win",
        recoveryLow: 200, 
        recoveryHigh: 500,
        effort: "Low"
      },
      { 
        fix: "Optimize Google Business Profile with AI-friendly keywords",
        category: "Brand Discovery",
        priority: "Strategic",
        recoveryLow: 300, 
        recoveryHigh: 800,
        effort: "High"
      },
      { 
        fix: "Create location-specific landing pages",
        category: "Brand Discovery",
        priority: "Maintenance",
        recoveryLow: 150, 
        recoveryHigh: 350,
        effort: "Low"
      },
      { 
        fix: "Implement Review schema markup",
        category: "Trust & Reviews",
        priority: "Quick Win",
        recoveryLow: 180, 
        recoveryHigh: 420,
        effort: "Low"
      }
    ],
    assumptions: {
      monthlyInquiries: { low: 80, high: 150 },
      aiReferralShare: { low: 8, high: 15 },
      grossProfitPerCustomer: { low: 1800, high: 4200 },
      closeRate: { low: 12, high: 22 }
    }
  };
  
  // Client input state (would be managed with React state in real implementation)
  const clientInputs = {
    monthlyInquiries: 120,
    grossProfitPerCustomer: 2500,
    closeRate: 18
  };
  
  const categories = [
    {
      name: "Brand Discovery",
      score: 35,
      description: "How often you appear when people search for dance studios",
      icon: "🔍"
    },
    {
      name: "Trust & Reviews",
      score: 40,
      description: "What AI platforms say when asked about you",
      icon: "⭐"
    },
    {
      name: "Class & Booking Visibility",
      score: 15,
      description: "Whether you appear for class-related and booking queries",
      icon: "📅"
    },
    {
      name: "Competitive Position",
      score: 20,
      description: "How you stack up against nearby competitors",
      icon: "🏆"
    }
  ];
  
  const visibleQueries = [
    "dance studio Auckland",
    "ballroom dancing classes",
    "Auckland dance lessons",
    "best dance school"
  ];
  
  const invisibleQueries = [
    "wedding dance lessons Auckland",
    "salsa dancing Auckland",
    "kids dance classes",
    "adult dance classes",
    "hip hop dance studio",
    "contemporary dance Auckland",
    "dance studio near me",
    "private dance lessons",
    "dance classes for beginners",
    "latin dance Auckland",
    "dance studio with parking",
    "evening dance classes",
    "weekend dance workshops"
  ];
  
  const competitors = [
    { name: "E&A Dance Studio", score: 4, color: "bg-red-500" },
    { name: "Neverland Studios", score: 12, color: "bg-amber-500" },
    { name: "Viva Dance", score: 10, color: "bg-amber-500" },
    { name: "Ceroc Dance Studio", score: 8, color: "bg-green-500" },
    { name: "KD Dance", score: 3, color: "bg-red-500" }
  ];
  
  const recommendations = [
    {
      id: 1,
      title: "Claim 'ballroom dancing Auckland'",
      description: "Optimize your content and listings to appear for ballroom dancing searches in Auckland.",
      impact: "High"
    },
    {
      id: 2,
      title: "Own 'wedding dance lessons Auckland'",
      description: "Create targeted content and get listed for wedding dance preparation searches.",
      impact: "High"
    },
    {
      id: 3,
      title: "Get visible on 'dance studio Auckland'",
      description: "Improve your local SEO and AI visibility for general dance studio searches.",
      impact: "Medium"
    }
  ];
  
  const getScoreColor = (score: number) => {
    if (score >= 60) return 'bg-green-500';
    if (score >= 35) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const getScoreText = (score: number) => {
    if (score >= 60) return 'Strong';
    if (score >= 35) return 'Moderate';
    return 'Weak';
  };
  
  const formatCurrency = (value: number) => {
    return revenueImpact.currencySymbol + Math.round(value).toLocaleString();
  };
  
  return (
    <div className="min-h-screen bg-[#02091F] text-white font-['Poppins']">
      {/* Header */}
      <header className="bg-[#0A0F1E] border-b border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="VizBiz.ai Logo" width={40} height={40} className="rounded" />
              <div className="text-xl font-bold">VizBiz<span className="text-[#25D1F2]">.ai</span></div>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold">Full AI Visibility Report</h1>
              <p className="text-sm text-gray-400">{businessName} • {location}</p>
            </div>
            <div>
              <button className="bg-[#25D1F2] text-[#02091F] px-4 py-2 rounded-lg hover:bg-[#06B6D4] transition-colors font-medium">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Score Card */}
      <div className="bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="text-sm opacity-90 mb-2">Your AI Visibility Score</div>
              <div className="flex items-baseline gap-4">
                <div className="text-6xl font-bold">{aviScore}</div>
                <div className="text-2xl opacity-80">/100</div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(aviScore)} text-white mt-4`}>
                {getScoreText(aviScore)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{promptsAppeared}</div>
                <div className="text-xs opacity-80 mt-1">Prompts appeared</div>
                <div className="text-xs opacity-60">/ {totalPrompts}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{competitors.filter(c => c.score > promptsAppeared).length}</div>
                <div className="text-xs opacity-80 mt-1">Competitors beating you</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{recommendations.length}</div>
                <div className="text-xs opacity-80 mt-1">Quick wins available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profit at Risk Section */}
      <div className="bg-[#0A0F1E] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Profit at Risk Analysis</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Based on your current AI visibility score and industry benchmarks, here's the estimated profit you're losing each month to competitors who appear in AI recommendations.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-[#22D3EE]/20 to-[#06B6D4]/20 border border-cyan-500/20 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#25D1F2] mb-2">
                {formatCurrency(revenueImpact.monthlyLow)}–{formatCurrency(revenueImpact.monthlyHigh)}/month
              </div>
              <div className="text-xl text-gray-300 mb-4">
                {formatCurrency(revenueImpact.annualLow)}–{formatCurrency(revenueImpact.annualHigh)}/year
              </div>
              <p className="text-gray-400">Estimated profit at risk from low AI visibility</p>
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Category-Level Profit Breakdown</h3>
            <p className="text-gray-400 mb-4">This profit is distributed across your visibility categories:</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/15">
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Profit at Risk</th>
                    <th className="text-left py-3 px-4 font-medium">Share of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueImpact.categories.map((category, index) => (
                    <tr key={index} className="border-b border-cyan-500/10">
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#25D1F2]">
                          {formatCurrency(category.low)}–{formatCurrency(category.high)}/month
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {Math.round((category.low + category.high) / (revenueImpact.monthlyLow + revenueImpact.monthlyHigh) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Priority Matrix */}
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Priority Fixes Matrix</h3>
            <p className="text-gray-400 mb-4">Ranked by estimated profit recovery potential:</p>
            <div className="space-y-4">
              {revenueImpact.priorityMatrix.map((fix, index) => (
                <div key={index} className="bg-[#0A0F1E] border border-cyan-500/15 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${fix.priority === 'Quick Win' ? 'bg-green-500/20 text-green-400' : fix.priority === 'Strategic' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {fix.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${fix.effort === 'Low' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {fix.effort} Effort
                        </span>
                      </div>
                      <h4 className="font-medium">{fix.fix}</h4>
                      <p className="text-sm text-gray-400">{fix.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[#25D1F2]">
                        {formatCurrency(fix.recoveryLow)}–{formatCurrency(fix.recoveryHigh)}/month
                      </div>
                      <p className="text-xs text-gray-400">Estimated recovery</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Assumptions Table */}
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Assumptions & Transparency</h3>
            <p className="text-gray-400 mb-4">These estimates are based on industry benchmarks:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Monthly Inquiries</h4>
                <p className="text-gray-300">{revenueImpact.assumptions.monthlyInquiries.low}–{revenueImpact.assumptions.monthlyInquiries.high}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">AI Referral Share</h4>
                <p className="text-gray-300">{revenueImpact.assumptions.aiReferralShare.low}–{revenueImpact.assumptions.aiReferralShare.high}%</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Gross Profit Per Customer</h4>
                <p className="text-gray-300">{formatCurrency(revenueImpact.assumptions.grossProfitPerCustomer.low)}–{formatCurrency(revenueImpact.assumptions.grossProfitPerCustomer.high)}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Close Rate</h4>
                <p className="text-gray-300">{revenueImpact.assumptions.closeRate.low}–{revenueImpact.assumptions.closeRate.high}%</p>
              </div>
            </div>
          </div>
          
          {/* Client Input Refinement */}
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Refine Your Estimate</h3>
            <p className="text-gray-400 mb-6">
              These estimates use industry averages. For a more accurate figure, provide your actual numbers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Inquiries</label>
                <input 
                  type="number"
                  defaultValue={clientInputs.monthlyInquiries}
                  className="w-full bg-[#0A0F1E] border border-cyan-500/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gross Profit Per Customer</label>
                <input 
                  type="number"
                  defaultValue={clientInputs.grossProfitPerCustomer}
                  className="w-full bg-[#0A0F1E] border border-cyan-500/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Close Rate (%)</label>
                <input 
                  type="number"
                  defaultValue={clientInputs.closeRate}
                  className="w-full bg-[#0A0F1E] border border-cyan-500/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            <button className="bg-[#25D1F2] text-[#02091F] px-6 py-2 rounded-lg hover:bg-[#06B6D4] transition-colors font-medium">
              Recalculate with My Numbers
            </button>
          </div>
        </div>
      </div>
      
      {/* Methodology & Disclaimer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Methodology</h3>
            <p className="text-gray-400 mb-4">
              Revenue at risk = Lost AI-driven inquiries × Gross profit per customer × Close rate
            </p>
            <p className="text-gray-400 mb-4">
              Full methodology and sources available at:
            </p>
            <a href="https://vizbiz.ai/methodology" className="text-[#25D1F2] hover:text-[#06B6D4] inline-flex items-center gap-2">
              https://vizbiz.ai/methodology →
            </a>
          </div>
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Disclaimer</h3>
            <p className="text-gray-400 text-sm">
              This is an estimate based on industry benchmarks and may not reflect your actual financial performance. Actual results depend on your specific market conditions, pricing, and sales process. This estimate is intended to illustrate the business impact of AI visibility gaps, not as a financial projection or guarantee.
            </p>
          </div>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-[#111118] border border-cyan-500/15 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold">{category.score}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full ${getScoreColor(category.score)}`} 
                  style={{ width: `${category.score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Visibility Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Where you appear */}
          <div className="bg-[#111118] border border-cyan-500/15 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Where you appear
            </h3>
            <ul className="space-y-3">
              {visibleQueries.map((query, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">"{query}"</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Where you're invisible */}
          <div className="bg-[#111118] border border-cyan-500/15 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <span className="text-red-400">✗</span>
              Where you're invisible
            </h3>
            <ul className="space-y-3">
              {invisibleQueries.map((query, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-red-400">✗</span>
                  <span className="text-gray-300">"{query}"</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Competitor Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#111118] border border-cyan-500/15 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Competitor Comparison</h3>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-300">{competitor.name}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${competitor.color}`} 
                      style={{ width: `${(competitor.score / totalPrompts) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-medium">{competitor.score}/{totalPrompts}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Donut Chart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#111118] border border-cyan-500/15 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Visibility Distribution</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="#374151" 
                  strokeWidth="3"
                />
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="3" 
                  strokeDasharray={`${(promptsAppeared / totalPrompts) * 100}, 100`}
                  strokeLinecap="round"
                />
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="#EF4444" 
                  strokeWidth="3" 
                  strokeDasharray={`${((totalPrompts - promptsAppeared) / totalPrompts) * 100}, 100`}
                  strokeLinecap="round"
                  strokeDashoffset={`-${(promptsAppeared / totalPrompts) * 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round((promptsAppeared / totalPrompts) * 100)}%</div>
                  <div className="text-sm text-gray-400">Visible</div>
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-400">Visible ({promptsAppeared} prompts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-400">Invisible ({totalPrompts - promptsAppeared} prompts)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top 3 Recommendations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-xl font-semibold mb-6">Top 3 Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-[#111118] border border-cyan-500/15 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full ${rec.impact === 'High' ? 'bg-red-500' : rec.impact === 'Medium' ? 'bg-amber-500' : 'bg-green-500'} flex items-center justify-center`}>
                  <span className="text-white font-bold">{rec.id}</span>
                </div>
                <h4 className="font-semibold">{rec.title}</h4>
              </div>
              <p className="text-sm text-gray-400 mb-4">{rec.description}</p>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${rec.impact === 'High' ? 'bg-red-500/20 text-red-400' : rec.impact === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                {rec.impact} Impact
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Footer */}
      <div className="bg-[#0A0F1E] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to recover this revenue?</h3>
          <p className="text-gray-400 mb-6">Book your strategy call to start implementing these fixes</p>
          <button className="bg-[#25D1F2] text-[#02091F] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#06B6D4] transition-colors">
            Book your strategy call →
          </button>
        </div>
      </div>
      
      {/* Branded Footer */}
      <footer className="bg-[#02091F] border-t border-cyan-500/15 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image src="/logo.jpg" alt="VizBiz.ai Logo" width={30} height={30} className="rounded" />
            <div className="text-xl font-bold">VizBiz<span className="text-[#25D1F2]">.ai</span></div>
          </div>
          <p className="text-sm text-gray-500">Generated by VizBiz.ai — AI Visibility Intelligence</p>
          <a href="https://vizbiz.ai" className="text-[#25D1F2] hover:text-[#06B6D4] text-sm">https://vizbiz.ai</a>
        </div>
      </footer>
    </div>
  );
}