import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | VizBiz.ai',
  description: 'Simple, transparent pricing for AI visibility reports, fixes, and local business recommendation readiness.',
  alternates: {
    canonical: 'https://vizbiz.ai/pricing/',
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#02091F] text-white font-['Poppins']">
      {/* Header */}
      <header className="bg-[#0A0F1E] border-b border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold">VizBiz<span className="text-[#25D1F2]">.ai</span></div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              <a href="/pricing" className="text-[#25D1F2] font-medium">Pricing</a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#22D3EE]/10 to-[#06B6D4]/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple pricing. Real results.</h1>
          <p className="text-xl text-gray-300 mb-8">
            No hidden fees. No long-term contracts. Just clear, effective AI visibility improvement.
          </p>
        </div>
      </div>
      
      {/* Pricing Cards */}
      <div className="bg-[#0A0F1E] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Fix Tier */}
            <div className="bg-[#111118] border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/40 transition-colors">
              <div className="text-sm text-cyan-400 font-medium mb-2 uppercase tracking-wider">Fix</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$88</span>
                <span className="text-gray-400">one-time</span>
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
              <a href="https://buy.stripe.com/eVqbJ2gzd3g275ifzy24002" className="block w-full text-center bg-[#25D1F2] text-[#02091F] px-6 py-3 rounded-lg font-medium hover:bg-[#06B6D4] transition-colors">
                Get the Fix — $88 →
              </a>
            </div>
            
            {/* Fix + Monitor Tier */}
            <div className="bg-[#111118] border-2 border-cyan-500/40 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#25D1F2] text-[#02091F] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="text-sm text-cyan-400 font-medium mb-2 uppercase tracking-wider">Fix + Monitor</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$188</span>
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
              <a href="https://buy.stripe.com/5kQ7sMdn103Q2P22MM24003" className="block w-full text-center bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                Fix + Monitor — $188/mo →
              </a>
            </div>
          </div>
          
          <p className="text-center text-gray-500 text-sm mt-8">
            Both plans include the full audit report. Cancel anytime. No setup fee.
          </p>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-[#02091F] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
              <h3 className="font-semibold mb-3">What's included in the full audit?</h3>
              <p className="text-gray-300">
                Our comprehensive audit tests your visibility across 80+ AI-driven queries relevant to your business. You'll receive a detailed report showing exactly where you appear, where you're invisible, and specific recommendations to improve your AI visibility score.
              </p>
            </div>
            
            <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
              <h3 className="font-semibold mb-3">How long until I see results?</h3>
              <p className="text-gray-300">
                Most clients see initial improvements within 2-4 weeks as we implement the fixes. Full optimization typically takes 6-8 weeks, with ongoing monitoring to maintain and improve your visibility over time.
              </p>
            </div>
            
            <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Can I cancel anytime?</h3>
              <p className="text-gray-300">
                Yes, absolutely. There are no long-term contracts or cancellation fees. You can pause or cancel your subscription at any time with 30 days notice.
              </p>
            </div>
            
            <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Do you work with businesses outside car dealerships?</h3>
              <p className="text-gray-300">
                Yes! While we specialize in car dealerships, our AI visibility intelligence platform works for any local business that wants to improve their visibility in AI-driven search results and recommendations.
              </p>
            </div>
            
            <div className="bg-[#111118] border border-cyan-500/15 rounded-xl p-6">
              <h3 className="font-semibold mb-3">What if my score is already high?</h3>
              <p className="text-gray-300">
                Great question! Even businesses with strong visibility can benefit from our monitoring and optimization services. AI platforms change constantly, and we help you stay ahead of algorithm updates and competitor moves.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Final CTA */}
      <div className="bg-[#0A0F1E] py-16 border-t border-cyan-500/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get visible?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Stop losing customers to competitors who appear in AI recommendations.
          </p>
          <a href="https://vizbiz.ai" className="inline-block bg-[#25D1F2] text-[#02091F] px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#06B6D4] transition-colors">
            Get Your Free Report →
          </a>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#02091F] border-t border-cyan-500/15 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xl font-bold mb-2">VizBiz<span className="text-[#25D1F2]">.ai</span></div>
          <p className="text-sm text-gray-500">AI Visibility Intelligence for Local Businesses</p>
          <a href="https://vizbiz.ai" className="text-[#25D1F2] hover:text-[#06B6D4] text-sm">https://vizbiz.ai</a>
        </div>
      </footer>
    </div>
  );
}