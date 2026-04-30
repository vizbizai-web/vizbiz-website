import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Visibility Report | VizBiz.ai',
  description: 'Comprehensive AI Visibility Intelligence Report',
};

export default function ReportPage() {
  // Sample data for E&A Dance Studio
  const businessName = "E&A Dance Studio";
  const location = "Auckland, NZ";
  const dateGenerated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const aviScore = 28;
  const totalPrompts = 20;
  const promptsAppeared = 4;
  const competitorsBeating = 4;
  const quickWins = 3;
  
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">VizBiz.ai</div>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">AI Visibility Report</h1>
              <p className="text-sm text-gray-600">{businessName} • {location}</p>
            </div>
            <div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
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
      
      {/* Category Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-gray-900">{category.score}</span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full ${getScoreColor(category.score)}`} 
                  style={{ width: `${category.score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Visibility Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Where you appear */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Where you appear
            </h3>
            <ul className="space-y-3">
              {visibleQueries.map((query, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">"{query}"</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Where you're invisible */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-red-500">✗</span>
              Where you're invisible
            </h3>
            <ul className="space-y-3">
              {invisibleQueries.map((query, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-red-500">✗</span>
                  <span className="text-gray-700">"{query}"</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Competitor Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Competitor Comparison</h3>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700">{competitor.name}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
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
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Visibility Distribution</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="#E5E7EB" 
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
                  <div className="text-2xl font-bold text-gray-900">{Math.round((promptsAppeared / totalPrompts) * 100)}%</div>
                  <div className="text-sm text-gray-600">Visible</div>
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Visible ({promptsAppeared} prompts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Invisible ({totalPrompts - promptsAppeared} prompts)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top 3 Recommendations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Top 3 Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full ${rec.impact === 'High' ? 'bg-red-500' : rec.impact === 'Medium' ? 'bg-amber-500' : 'bg-green-500'} flex items-center justify-center`}>
                  <span className="text-white font-bold">{rec.id}</span>
                </div>
                <h4 className="font-semibold text-gray-900">{rec.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${rec.impact === 'High' ? 'bg-red-100 text-red-800' : rec.impact === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                {rec.impact} Impact
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Footer */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to improve your AI visibility?</h3>
          <p className="text-gray-600 mb-6">Get the full prompt-by-prompt breakdown and action plan</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
            Book your free 15-minute review call
          </button>
        </div>
      </div>
      
      {/* Branded Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold mb-2">VizBiz.ai</div>
          <p className="text-sm opacity-80">Generated by VizBiz.ai — AI Visibility Intelligence</p>
          <a href="https://vizbiz.ai" className="text-blue-400 hover:text-blue-300 text-sm">https://vizbiz.ai</a>
        </div>
      </footer>
    </div>
  );
}