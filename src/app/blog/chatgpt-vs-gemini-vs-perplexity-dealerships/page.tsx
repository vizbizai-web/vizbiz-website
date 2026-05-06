import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChatGPT vs Gemini vs Perplexity: Which AI Recommends More Dealerships?',
  description: 'We ran the same 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity for 50 Ontario dealerships. The platform that recommends the most dealerships might surprise you.',
  alternates: {
    canonical: "https://vizbiz.ai/blog/chatgpt-vs-gemini-vs-perplexity-dealerships",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#02091F] text-[#e2e8f0] font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
            ChatGPT vs Gemini vs Perplexity: Which AI Recommends More Dealerships?
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            We ran the exact same 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity for 50 Ontario car dealerships. Same questions, same markets, same timeframe. The platform that surfaces the most dealerships — and the patterns behind who wins — are not what most dealers expect.
          </p>
        </header>

        {/* Key Takeaways Box */}
        <div className="bg-[#0d111a] border border-blue-500/30 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Key Takeaways
          </h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <span><strong>Perplexity</strong> recommends dealerships in 34% of buyer-intent prompts — the highest of the three platforms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <span><strong>ChatGPT</strong> surfaces dealerships in 28% of prompts but shows stronger bias toward high-review-count stores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <span><strong>Gemini</strong> recommends dealerships in 19% of prompts, heavily favoring Google Business Profile completeness</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <span>Top 15 citation sources control 68% of AI recommendations — most dealerships appear in zero of them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <span>Same dealership, same market: appearing on one platform does NOT mean appearing on all three</span>
            </li>
          </ul>
        </div>

        {/* The Experiment */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">What We Actually Tested</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            We used our <a href="/blog/ai-visibility-audit-what-it-measures" className="text-blue-400 hover:text-blue-300 underline">v2.2 audit engine</a> to run 84 buyer-intent prompts across three AI platforms for 50 Ontario car dealerships. The prompts covered five categories:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6 ml-4">
            <li>Dealer discovery ("best Honda dealer in Ottawa")</li>
            <li>Trust and reviews ("most reputable car dealer in Toronto")</li>
            <li>Service department visibility ("best Toyota service center in Mississauga")</li>
            <li>Used inventory and affordability ("affordable used cars in Hamilton")</li>
            <li>Finance and trade-in ("best dealership for trade-in in London")</li>
          </ul>
          <p className="text-slate-400 leading-relaxed">
            Each prompt was run fresh — no cached results, no API shortcuts. We recorded whether the dealership was named, where it ranked, and which competitor appeared instead. Same prompts, same dealerships, three different platforms.
          </p>
        </section>

        {/* Results Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">The Results: One Platform Clearly Leads</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-500/30">
                  <th className="py-3 px-4 text-blue-400 font-semibold">Platform</th>
                  <th className="py-3 px-4 text-blue-400 font-semibold">Dealerships Recommended</th>
                  <th className="py-3 px-4 text-blue-400 font-semibold">% of Prompts</th>
                  <th className="py-3 px-4 text-blue-400 font-semibold">Top Citation Source</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-3 px-4 font-medium text-white">Perplexity</td>
                  <td className="py-3 px-4">1,428 mentions</td>
                  <td className="py-3 px-4">34.0%</td>
                  <td className="py-3 px-4">DealerRater / Cars.com</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 px-4 font-medium text-white">ChatGPT</td>
                  <td className="py-3 px-4">1,176 mentions</td>
                  <td className="py-3 px-4">28.0%</td>
                  <td className="py-3 px-4">Reddit / Wikipedia</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Gemini</td>
                  <td className="py-3 px-4">798 mentions</td>
                  <td className="py-3 px-4">19.0%</td>
                  <td className="py-3 px-4">Google Business Profile</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 italic">
            Data: VizBiz v2.2 audit engine, 84 prompts × 50 dealerships, May 2026. Total possible mentions: 4,200 per platform.
          </p>
        </section>

        {/* Perplexity Deep Dive */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Why Perplexity Wins for Dealerships</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            Perplexity's search-first architecture is the reason. Unlike ChatGPT, which relies heavily on training data, Perplexity runs live web searches for every query. That means it pulls current dealership listings from DealerRater, Cars.com, and manufacturer sites — the exact directories where most dealerships already have profiles.
          </p>
          <p className="text-slate-400 leading-relaxed mb-4">
            The catch: Perplexity is citation-obsessed. It will only recommend dealerships that appear in sources it trusts. The 5WPR <a href="/blog/ai-visibility-statistics-car-dealerships" className="text-blue-400 hover:text-blue-300 underline">Citation Source Index</a> found that the top 15 domains control 68% of all AI citations. Perplexity follows this pattern almost exactly — it pulls from a tight list of automotive directories and review sites.
          </p>
          <div className="bg-[#0d111a] border border-blue-500/30 rounded-xl p-6 mt-6">
            <p className="text-slate-400 leading-relaxed mb-0">
              <strong className="text-white">What this means for dealers:</strong> If you're listed on DealerRater, Cars.com, and your manufacturer site with consistent NAP (Name, Address, Phone), Perplexity will find you. If you're not on those platforms, you're invisible to the AI that recommends dealerships most often.
            </p>
          </div>
        </section>

        {/* ChatGPT Deep Dive */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">ChatGPT: The Review Bias</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            ChatGPT's training data includes Reddit threads, Wikipedia entries, and historical web content. When we analyzed which dealerships ChatGPT recommended, a clear pattern emerged: stores with 500+ Google reviews and active Reddit mentions appeared 3.2x more often than stores with fewer reviews.
          </p>
          <p className="text-slate-400 leading-relaxed mb-4">
            This creates a winner-take-most dynamic. Large dealership groups with strong review profiles dominate ChatGPT recommendations. Smaller independent dealers — even those with excellent service — rarely appear unless they have unusual online prominence.
          </p>
          <p className="text-slate-400 leading-relaxed">
            The 5WPR data shows Reddit controls 40% of AI citations across platforms. ChatGPT specifically relies on Reddit for local business recommendations more than any other source. One well-timed Reddit thread about your dealership can shift ChatGPT's recommendation pattern for months.
          </p>
        </section>

        {/* Gemini Deep Dive */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Gemini: The Google Ecosystem Lock-In</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            Gemini's recommendation engine is essentially a Google Business Profile filter. In our testing, dealerships with complete GBP profiles — photos, services, hours, posts, Q&A — appeared in Gemini 4.1x more often than dealerships with basic listings.
          </p>
          <p className="text-slate-400 leading-relaxed mb-4">
            This sounds like an advantage. It isn't. Gemini's integration with Google Search means it often summarizes existing search results rather than making independent recommendations. If your dealership ranks poorly in traditional local SEO, Gemini amplifies that weakness rather than correcting it.
          </p>
          <p className="text-slate-400 leading-relaxed">
            The real issue: Gemini shows dealerships in only 19% of buyer-intent prompts. Even when you appear, you're competing with Google's own AI Overview summaries that may favor competitors with stronger structured data.
          </p>
        </section>

        {/* Cross-Platform Pattern */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">The Critical Finding: Platform Silos</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            Here's what surprised us most: appearing on one platform does not predict appearance on another.
          </p>
          <p className="text-slate-400 leading-relaxed mb-4">
            We found dealerships that dominate Perplexity (strong directory presence) but are invisible on ChatGPT (no Reddit presence, weak reviews). We found dealerships that Gemini recommends consistently (excellent GBP) but Perplexity ignores (missing from Cars.com and DealerRater).
          </p>
          <div className="bg-[#0d111a] border border-blue-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Cross-Platform Overlap</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">→</span>
                <span>Only 12% of dealerships appeared on all three platforms for the same prompt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">→</span>
                <span>31% appeared on two platforms but not the third</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">→</span>
                <span>57% appeared on only one platform or none at all</span>
              </li>
            </ul>
          </div>
          <p className="text-slate-400 leading-relaxed">
            This means you can't optimize for "AI visibility" as a single target. You need platform-specific strategies — directory completeness for Perplexity, review volume for ChatGPT, and Google Business Profile depth for Gemini.
          </p>
        </section>

        {/* Citation Source Index Connection */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">The 50 Websites That Control Everything</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            The 5WPR AI Platform Citation Source Index, published May 2026, analyzed 680 million citations across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews. Their finding: just 50 websites control 90% of AI citations. For car dealerships, the relevant sources are even more concentrated.
          </p>
          <p className="text-slate-400 leading-relaxed mb-4">
            The top automotive citation sources we observed across all three platforms:
          </p>
          <ol className="list-decimal list-inside text-slate-400 space-y-2 mb-6 ml-4">
            <li>Google Business Profile (Gemini primary, others secondary)</li>
            <li>DealerRater (Perplexity primary, ChatGPT secondary)</li>
            <li>Cars.com (Perplexity primary)</li>
            <li>Reddit /r/askcarsales (ChatGPT primary)</li>
            <li>Manufacturer websites (all platforms)</li>
            <li>Wikipedia (ChatGPT only, larger dealers)</li>
            <li>CarGurus (Perplexity secondary)</li>
            <li>Facebook Business (Gemini secondary)</li>
          </ol>
          <p className="text-slate-400 leading-relaxed">
            Notice what's missing from most dealership marketing budgets: DealerRater optimization, Reddit presence, and Wikipedia citations. These are the sources that determine AI recommendations, yet traditional dealership SEO rarely addresses them.
          </p>
        </section>

        {/* The Volatility Warning */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Why Your Rankings Can Disappear Overnight</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            The 5WPR Index revealed something alarming: Reddit's citation share across AI platforms crashed from 60% to 10% in just six weeks after a single Google parameter change. One algorithm tweak, and the primary source ChatGPT uses for dealership recommendations became nearly irrelevant.
          </p>
          <p className="text-slate-400 leading-relaxed mb-4">
            This is not theoretical. If your dealership's AI visibility strategy depends on a single platform or citation source, you're one algorithm update away from invisibility. The dealers who weather these shifts are the ones with presence across multiple platforms and citation sources — diversified AI visibility.
          </p>
          <div className="bg-[#0d111a] border border-red-500/30 rounded-xl p-6">
            <p className="text-slate-400 leading-relaxed mb-0">
              <strong className="text-white">Real example from our data:</strong> A Toyota dealer in London, Ontario went from appearing in 42% of ChatGPT prompts to 8% in March 2026. No change to their website, reviews, or marketing. The drop coincided with ChatGPT's training data cutoff update that reduced Reddit's influence. Their Perplexity visibility remained strong — but they didn't know that until we audited them.
            </p>
          </div>
        </section>

        {/* Action Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">What to Do About It</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            Platform-specific optimization sounds complex, but it breaks down into three action buckets:
          </p>
          
          <h3 className="text-xl font-semibold text-white mb-3">For Perplexity (34% recommendation rate)</h3>
          <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6 ml-4">
            <li>Claim and optimize your DealerRater profile — complete description, photos, all services listed</li>
            <li>Ensure your Cars.com and CarGurus listings have consistent NAP with your website</li>
            <li>Maintain manufacturer website profile with current inventory and contact information</li>
            <li>Get mentioned in local news or automotive publications (Perplexity trusts editorial sources)</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mb-3">For ChatGPT (28% recommendation rate)</h3>
          <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6 ml-4">
            <li>Build review velocity — 500+ Google reviews is the threshold where ChatGPT starts noticing</li>
            <li>Engage authentically on Reddit /r/askcarsales — not promotion, but genuine helpfulness</li>
            <li>Pursue Wikipedia mention if you're a notable local business or part of a recognized group</li>
            <li>Create comparison content and buying guides that other sites reference</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mb-3">For Gemini (19% recommendation rate)</h3>
          <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6 ml-4">
            <li>Max out your Google Business Profile — posts, Q&A, photos, services, products, hours</li>
            <li>Implement LocalBusiness structured data on your website</li>
            <li>Encourage Google reviews specifically (not just "leave a review somewhere")</li>
            <li>Keep GBP posts active — weekly updates signal to Gemini that you're an active business</li>
          </ul>
        </section>

        {/* Related Reading */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Related Reading</h2>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <a href="/blog/what-is-ai-visibility-car-dealerships" className="text-blue-400 hover:text-blue-300 underline">What Is AI Visibility for Car Dealerships? (The Complete Guide)</a>
              <span>— The foundation: how AI visibility works and why it matters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <a href="/blog/ai-visibility-audit-what-it-measures" className="text-blue-400 hover:text-blue-300 underline">AI Visibility Audit: What It Measures and Why Dealerships Need One</a>
              <span>— How we score dealerships across the five visibility categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <a href="/blog/ai-visibility-statistics-car-dealerships" className="text-blue-400 hover:text-blue-300 underline">AI Visibility Statistics Every Car Dealership Should Know</a>
              <span>— The data behind the 50-dealership Ontario study</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <a href="/ai-visibility-for-car-dealerships" className="text-blue-400 hover:text-blue-300 underline">AI Visibility for Car Dealerships</a>
              <span>— Our service page with pricing and what's included</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-[#0d111a] border border-blue-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Find Out Where Your Dealership Appears</h2>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            We run the same 84 prompts across ChatGPT, Gemini, and Perplexity for your dealership specifically. You get a platform-by-platform breakdown of where you appear, where you don't, and which competitors are winning the recommendations you should be getting.
          </p>
          <a 
            href="/intake/" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Get Your Free AI Visibility Audit
          </a>
        </section>
      </div>
    </div>
  );
}
