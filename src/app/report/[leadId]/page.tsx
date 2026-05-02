import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'AI Visibility Report | VizBiz.ai',
  description: 'Comprehensive AI Visibility Intelligence Report',
};

export default function ReportPage({ params }: { params: { leadId: string } }) {
  // Lead data lookup
  const LEADS: Record<string, any> = {
    'test': {
      businessName: 'Test Business',
      contactName: 'Test Contact',
      location: 'Test Location',
      website: 'test.com',
      aviScore: 50,
      totalPrompts: 10,
      promptsAppeared: 5,
      currencySymbol: '$',
      currencyCode: 'USD',
      profitAtRisk: { low: 100, high: 500 },
      categories: [
        { name: 'Test Category', score: 50, description: 'Test description', icon: '🔍' },
      ],
      visibleQueries: ['test query'],
      invisibleQueries: ['invisible test'],
      competitors: [
        { name: 'Test Business (You)', score: 5, color: 'bg-amber-500' },
      ],
      recommendations: [
        { id: 1, title: 'Test recommendation', description: 'Test description', impact: 'Medium' },
      ]
    },
    'VZB-MOJSCVQM': {
      businessName: 'The Venue Experts',
      contactName: 'Stacey',
      location: 'Melton Mowbray, UK',
      website: 'thevenueexperts.co.uk',
      aviScore: 42,
      totalPrompts: 20,
      promptsAppeared: 8,
      currencySymbol: '£',
      currencyCode: 'GBP',
      profitAtRisk: { low: 300, high: 900 },
      categories: [
        { name: 'Brand Discovery', score: 65, description: 'How often you appear when venue owners search for consultancy services' },
        { name: 'Trust & Reviews', score: 50, description: 'What AI platforms say about your reputation' },
        { name: 'Consultancy Visibility', score: 35, description: 'Whether you appear for venue consultancy queries' },
        { name: 'Competitive Position', score: 40, description: 'How you compare to Kelly Chandler and Kelly Mortimer' },
        { name: 'Content & Authority', score: 30, description: 'Whether AI tools see you as an authority in venue consulting' },
      ],
      visibleQueries: ['venue consultant UK', 'wedding venue consultant', 'venue consultancy services'],
      invisibleQueries: ['wedding venue sales training', 'how to increase wedding bookings', 'venue profitability consulting', 'venue marketing strategies', 'hotel wedding sales consultant', 'rural venue diversification', 'venue customer experience training', 'wedding venue business coach', 'luxury venue consultant UK', 'venue sales director'],
      competitors: [
        { name: 'The Venue Experts (You)', score: 8, isYou: true },
        { name: 'Kelly Chandler Consulting', score: 13 },
        { name: 'Kelly Mortimer', score: 15 },
      ],
      recommendations: [
        { id: 1, title: 'Strengthen venue consultancy content', description: 'Create detailed guides and case studies about venue consultancy services to improve visibility for consultancy-related queries.', impact: 'High' },
        { id: 2, title: 'Build trust signals', description: 'Encourage more client testimonials and case studies to improve trust and review scores.', impact: 'Medium' },
        { id: 3, title: 'Expand competitive positioning', description: 'Highlight what makes The Venue Experts unique compared to Kelly Chandler and Kelly Mortimer.', impact: 'Medium' }
      ]
    },
    'VZB-MOKMWAAI': {
      businessName: 'E&A Dance Studio',
      contactName: 'Enrique & Amy',
      location: 'Auckland, NZ',
      website: 'eadancestudiosnz.com',
      aviScore: 28,
      totalPrompts: 20,
      promptsAppeared: 4,
      currencySymbol: 'NZ$',
      currencyCode: 'NZD',
      profitAtRisk: { low: 400, high: 1200 },
      categories: [
        { name: 'Brand Discovery', score: 35, description: 'How often you appear in dance studio searches' },
        { name: 'Trust & Reviews', score: 40, description: 'What AI platforms say about your reputation' },
        { name: 'Class & Booking Visibility', score: 15, description: 'Whether you appear for class-related queries' },
        { name: 'Competitive Position', score: 20, description: 'How you compare to Neverland Studios and Ceroc' },
      ],
      visibleQueries: ['dance studio Auckland', 'ballroom dancing classes', 'Auckland dance lessons', 'best dance school'],
      invisibleQueries: ['wedding dance lessons Auckland', 'salsa dancing Auckland', 'kids dance classes', 'adult dance classes', 'hip hop dance studio', 'contemporary dance Auckland', 'dance studio near me', 'private dance lessons', 'dance classes for beginners', 'latin dance Auckland'],
      competitors: [
        { name: 'E&A Dance Studio (You)', score: 4, isYou: true },
        { name: 'Neverland Studios', score: 12 },
        { name: 'Ceroc French Jive', score: 11 },
        { name: 'Viva Dance', score: 9 },
      ],
      recommendations: [
        { id: 1, title: 'Improve class booking visibility', description: 'Create specific content about dance classes, booking options, and schedules to appear for class-related queries.', impact: 'High' },
        { id: 2, title: 'Expand style-specific content', description: 'Add detailed information about different dance styles offered (ballroom, latin, contemporary) to capture more specific searches.', impact: 'High' },
        { id: 3, title: 'Build local reputation signals', description: 'Encourage more reviews and testimonials from Auckland-based students to improve local trust scores.', impact: 'Medium' }
      ]
    },
    'VZB-MOLHDGJK': {
      businessName: 'ARTWOW',
      contactName: 'Liz',
      location: 'London/Essex, UK',
      website: 'artwow.co',
      aviScore: 89,
      totalPrompts: 19,
      promptsAppeared: 17,
      currencySymbol: '£',
      currencyCode: 'GBP',
      profitAtRisk: { low: 400, high: 1250 },
      categories: [
        { name: 'Portfolio & Inquiry Visibility', score: 92, description: 'How often your products appear in art print searches' },
        { name: 'Brand Discovery', score: 88, description: 'Whether AI tools recognize your brand' },
        { name: 'Trust & Reviews', score: 85, description: 'What AI platforms say about your quality' },
        { name: 'Content & Authority', score: 82, description: 'Whether AI tools see you as an authority' },
        { name: 'Competitive Position', score: 95, description: 'How you compare to Redbubble and Eleanor Bowmer' },
      ],
      visibleQueries: ['art prints UK', 'unique wall art', 'independent artist prints', 'art gifts UK', 'homeware art prints', 'buy art prints online UK', 'modern art prints', 'affordable art UK'],
      invisibleQueries: ['unique wedding gifts UK', 'personalized housewarming presents', 'art prints for living room', 'best art print marketplace UK'],
      competitors: [
        { name: 'Redbubble', score: 18, isYou: false },
        { name: 'ARTWOW (You)', score: 17, isYou: true },
        { name: 'Eleanor Bowmer', score: 10 },
      ],
      recommendations: [
        { id: 1, title: 'Maintain strong portfolio visibility', description: 'Continue showcasing your unique art prints and maintain the strong portfolio presence that is working well.', impact: 'Low' },
        { id: 2, title: 'Expand into gift markets', description: 'Create content targeting gift-related searches like wedding gifts and housewarming presents to capture additional market share.', impact: 'Medium' },
        { id: 3, title: 'Leverage competitive advantage', description: 'Highlight what makes ARTWOW unique compared to larger marketplaces like Redbubble to maintain your strong competitive position.', impact: 'Medium' }
      ]
    },
    'VZB-MOO1ESDC': {
      businessName: 'GoalCraft',
      contactName: 'Akchhat',
      location: 'Kapurthala, India',
      website: 'goalcraft.in',
      aviScore: 35,
      totalPrompts: 18,
      promptsAppeared: 6,
      currencySymbol: '₹',
      currencyCode: 'INR',
      profitAtRisk: { low: 5600, high: 45000 },
      categories: [
        { name: 'Brand Discovery', score: 30, description: 'How often you appear in restaurant consulting searches' },
        { name: 'Trust & Authority', score: 25, description: 'What AI platforms say about your expertise' },
        { name: 'Service Offering Visibility', score: 40, description: 'Whether you appear for Zomato/Swiggy consulting queries' },
        { name: 'Competitive Position', score: 35, description: 'How you compare to Restrosol' },
        { name: 'Content & Authority', score: 20, description: 'Whether AI tools see you as an authority' },
      ],
      visibleQueries: ['restaurant consultant India', 'Zomato optimization', 'online food delivery consulting'],
      invisibleQueries: ['how to increase Zomato orders', 'Swiggy listing optimization', 'restaurant menu engineering India', 'cloud kitchen consultant', 'restaurant growth consulting', 'food delivery app optimization', 'restaurant online order consultant'],
      competitors: [
        { name: 'GoalCraft (You)', score: 6, isYou: true },
        { name: 'Restrosol', score: 9 },
      ],
      recommendations: [
        { id: 1, title: 'Improve brand discovery', description: 'Create more content about your restaurant consulting services and expertise to appear in more searches.', impact: 'High' },
        { id: 2, title: 'Build trust and authority signals', description: 'Showcase client testimonials, case studies, and credentials to improve trust scores.', impact: 'High' },
        { id: 3, title: 'Expand service offering visibility', description: 'Create specific content about Zomato and Swiggy optimization services to capture platform-specific searches.', impact: 'High' }
      ]
    },
    'VZB-MOO57ZGT': {
      businessName: 'Old Touch Spices',
      contactName: 'Chaitanya',
      location: 'Delhi, India',
      website: 'oldtouchspices.com',
      aviScore: 32,
      totalPrompts: 22,
      promptsAppeared: 7,
      currencySymbol: '₹',
      currencyCode: 'INR',
      profitAtRisk: { low: 1400, high: 8600 },
      categories: [
        { name: 'Brand Discovery', score: 28, description: 'How often you appear in spice brand searches' },
        { name: 'Trust & Reviews', score: 35, description: 'What AI platforms say about your quality' },
        { name: 'Product Visibility', score: 30, description: 'Whether your products appear in spice searches' },
        { name: 'Competitive Position', score: 25, description: 'How you compare to Zoff, Catch, and MDH' },
        { name: 'Content & Authority', score: 20, description: 'Whether AI tools see you as an authority' },
      ],
      visibleQueries: ['premium spices online India', 'quality masala brand', 'buy spices online Delhi'],
      invisibleQueries: ['best masala brand India', 'premium garam masala', 'organic spices India', 'best spice for biryani', 'whole spices online', 'spice gift set India', 'authentic Indian spices online', 'certified spice brand India', 'BRCGS certified spices'],
      competitors: [
        { name: 'MDH Masala', score: 20, isYou: false },
        { name: 'Catch', score: 17, isYou: false },
        { name: 'Zoff', score: 14, isYou: false },
        { name: 'Old Touch Spices (You)', score: 7, isYou: true },
      ],
      recommendations: [
        { id: 1, title: 'Improve brand recognition', description: 'Create more content about your spice brand, quality standards, and unique offerings to appear in more brand searches.', impact: 'High' },
        { id: 2, title: 'Expand product visibility', description: 'Add detailed product information, usage guides, and recipes to capture more specific spice-related searches.', impact: 'High' },
        { id: 3, title: 'Build competitive differentiation', description: 'Highlight what makes Old Touch Spices unique compared to established brands like MDH, Catch, and Zoff.', impact: 'Medium' }
      ]
    }
  };  const leadData = LEADS[params.leadId];
  
  if (!leadData) {
    return (
      <div className="min-h-screen bg-[#02091F] text-white font-['Poppins'] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Report not found</h1>
          <p className="text-gray-400 mb-8">The report you're looking for doesn't exist or has been moved.</p>
          <a href="https://vizbiz.ai" className="bg-[#25D1F2] text-[#02091F] px-6 py-3 rounded-lg hover:bg-[#06B6D4] transition-colors font-medium">
            Return to VizBiz.ai
          </a>
        </div>
      </div>
    );
  }

  const { businessName, location, aviScore, totalPrompts, promptsAppeared, currencySymbol, profitAtRisk, categories, visibleQueries, invisibleQueries, competitors, recommendations } = leadData;
  
  const dateGenerated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const competitorsBeating = competitors.filter((c: any) => c.score > promptsAppeared).length;
  const quickWins = recommendations.length;
  
  const revenueImpact = {
    monthlyLow: profitAtRisk.low,
    monthlyHigh: profitAtRisk.high,
    currencySymbol: currencySymbol
  };
  
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
              <h1 className="text-lg font-semibold">AI Visibility Report</h1>
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
                <div className="text-2xl font-bold">{competitorsBeating}</div>
                <div className="text-xs opacity-80 mt-1">Competitors beating you</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">{quickWins}</div>
                <div className="text-xs opacity-80 mt-1">Quick wins available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profit at Risk Section */}
      <div className="bg-[#0A0F1E] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Profit at Risk</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Based on your current AI visibility, you're losing an estimated
            amount of profit each month to competitors who appear in AI recommendations.
          </p>
          <div className="bg-gradient-to-r from-[#22D3EE]/20 to-[#06B6D4]/20 border border-cyan-500/20 rounded-2xl p-8 mb-8">
            <div className="text-4xl font-bold text-[#25D1F2] mb-2">
              {formatCurrency(revenueImpact.monthlyLow)}–{formatCurrency(revenueImpact.monthlyHigh)}/month
            </div>
            <p className="text-gray-400">Estimated profit at risk from low AI visibility</p>
          </div>
          <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Your full report shows exactly where this money is leaking.
            </p>
            <button className="bg-[#25D1F2] text-[#02091F] px-6 py-3 rounded-lg hover:bg-[#06B6D4] transition-colors font-medium">
              Get the complete breakdown →
            </button>
          </div>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category: any, index: number) => (
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
              {visibleQueries.map((query: string, index: number) => (
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
              {invisibleQueries.map((query: string, index: number) => (
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
            {competitors.map((competitor: any, index: number) => (
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
          {recommendations.map((rec: any, index: number) => (
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
      
      {/* Pricing Section */}
      <div className="bg-[#0A0F1E] py-16 border-t border-cyan-500/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-3">We found 3 specific gaps costing you visibility.</h3>
            <p className="text-gray-400">Here's how we fix them.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Fix Tier */}
            <div className="bg-[#111118] border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/40 transition-colors">
              <div className="text-sm text-cyan-400 font-medium mb-2 uppercase tracking-wider">Fix</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$299</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Full AI visibility audit (80+ queries)
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  We implement every fix for you
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Monthly re-audit included
                </li>
              </ul>
              <a href="mailto:alex@vizbiz.ai" className="block w-full text-center bg-[#25D1F2] text-[#02091F] px-6 py-3 rounded-lg font-medium hover:bg-[#06B6D4] transition-colors">
                Get Started →
              </a>
            </div>
            
            {/* Fix + Monitor Tier */}
            <div className="bg-[#111118] border-2 border-cyan-500/40 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#25D1F2] text-[#02091F] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="text-sm text-cyan-400 font-medium mb-2 uppercase tracking-wider">Fix + Monitor</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Everything in Fix
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Competitor tracking
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Ongoing optimization as AI tools change
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Priority support
                </li>
              </ul>
              <a href="mailto:alex@vizbiz.ai" className="block w-full text-center bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                Get Started →
              </a>
            </div>
          </div>
          
          <p className="text-center text-gray-500 text-sm mt-8">
            Both plans include the full audit report. Cancel anytime. No setup fee.
          </p>
        </div>
      </div>
      
      {/* Final CTA */}
      <div className="bg-[#02091F] py-12 border-t border-cyan-500/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold mb-3">Prefer to talk first?</h3>
          <p className="text-gray-400 mb-6">Book a free 15-minute audit review call. No pressure, no obligation.</p>
          <a href="mailto:alex@vizbiz.ai" className="inline-block bg-transparent border-2 border-[#25D1F2] text-[#25D1F2] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#25D1F2] hover:text-[#02091F] transition-all">
            Book a Free Call →
          </a>
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