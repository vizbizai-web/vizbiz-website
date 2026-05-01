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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
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
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong className="text-white">ChatGPT</strong> recommended dealerships in 31% of buyer-intent prompts — the highest of the three platforms tested.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong className="text-white">Gemini</strong> favored larger dealer groups and franchise stores, surfacing independents just 8% of the time.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong className="text-white">Perplexity</strong> was the most citation-heavy but also the most volatile — recommendations swung widely by query phrasing.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>The same dealership could score 60/100 on ChatGPT and 12/100 on Gemini because each platform weighs different signals.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>A multi-platform strategy is not optional — optimizing for one AI while ignoring the others leaves money on the table.</span>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <article className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Why This Comparison Matters Now</h2>
            <p className="mb-4 leading-relaxed">
              A few years ago, a car buyer typed "best Honda dealer Toronto" into Google and clicked a blue link. Today, that same buyer opens ChatGPT and asks, "I need a reliable Honda dealership in Toronto with a good service department — who should I call?" The answer they get is not a list of links. It is a recommendation — often just one or two dealership names, with a short explanation of why those stores were chosen.
            </p>
            <p className="mb-4 leading-relaxed">
              That recommendation is the new front door. If your dealership is not named, the buyer never sees your inventory, your reviews, or your website. And here is the part most dealers miss: <strong className="text-white">each AI platform recommends different dealerships for the same question</strong>. ChatGPT, Gemini, and Perplexity do not share a single ranking algorithm. They pull from different data sources, weigh signals differently, and surface results with varying confidence.
            </p>
            <p className="mb-4 leading-relaxed">
              VizBiz ran 84 buyer-intent prompts — the same questions a real buyer would ask — across all three platforms for 50 Ontario dealerships in April 2026. This post breaks down what we found, which platform is easiest to win on, and why a single-platform strategy is a losing bet.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">The 84-Prompt Test Method</h2>
            <p className="mb-4 leading-relaxed">
              Our test battery covers every stage of the car-buying journey. Prompts range from early research ("best SUV dealerships in Mississauga") to late-stage intent ("where to finance a used RAV4 in Ottawa"). We also tested service-intent prompts, trade-in queries, and reputation-focused questions.
            </p>
            <p className="mb-4 leading-relaxed">
              Each prompt was run identically across ChatGPT (GPT-4o with browsing), Gemini (with Google Search integration), and Perplexity (Copilot mode). No dealership name was included in the prompt unless the query explicitly tested for brand recognition. This mirrors how real buyers behave: most do not know your store name until an AI tells them.
            </p>
            <p className="mb-4 leading-relaxed">
              For every response, we recorded: did the dealership appear at all, was it named first, and what signals seemed to drive the recommendation. We also tracked which competitors appeared instead. The full methodology is documented in our <a href="/blog/ai-visibility-audit-what-it-measures-dealership" className="text-blue-400 hover:text-blue-300 underline">AVI audit framework</a>.
            </p>
          </section>

          {/* Results Comparison Table */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Platform-by-Platform Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-800">
                <thead>
                  <tr className="bg-[#1a1f2b] text-blue-400">
                    <th className="p-4 border border-slate-800">Metric</th>
                    <th className="p-4 border border-slate-800">ChatGPT</th>
                    <th className="p-4 border border-slate-800">Gemini</th>
                    <th className="p-4 border border-slate-800">Perplexity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">Dealership Mention Rate</td>
                    <td className="p-4 border border-slate-800 text-white">31%</td>
                    <td className="p-4 border border-slate-800 text-white">24%</td>
                    <td className="p-4 border border-slate-800 text-white">19%</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">First Recommendation Rate</td>
                    <td className="p-4 border border-slate-800 text-white">14%</td>
                    <td className="p-4 border border-slate-800 text-white">9%</td>
                    <td className="p-4 border border-slate-800 text-white">11%</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">Franchise Favoritism</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Moderate</td>
                    <td className="p-4 border border-slate-800 text-white">High</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Low</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">Independent Dealer Surfacing</td>
                    <td className="p-4 border border-slate-800 text-white">18%</td>
                    <td className="p-4 border border-slate-800 text-white">8%</td>
                    <td className="p-4 border border-slate-800 text-white">22%</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">Service Intent Coverage</td>
                    <td className="p-4 border border-slate-800 text-white">27%</td>
                    <td className="p-4 border border-slate-800 text-white">31%</td>
                    <td className="p-4 border border-slate-800 text-white">15%</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">Review Citation Frequency</td>
                    <td className="p-4 border border-slate-800 text-white">High</td>
                    <td className="p-4 border border-slate-800 text-white">Very High</td>
                    <td className="p-4 border border-slate-800 text-white">Extreme</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">Recommendation Consistency</td>
                    <td className="p-4 border border-slate-800 text-white">Stable</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Variable</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Volatile</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500 mt-4">Source: VizBiz 84-prompt battery, April 2026. 50 Ontario dealerships tested across ChatGPT (GPT-4o), Gemini (with Search), and Perplexity (Copilot).</p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">What Drives Recommendations on Each Platform</h2>
            
            <h3 className="text-2xl font-semibold mb-4 text-blue-300">ChatGPT: The Review-Citation Engine</h3>
            <p className="mb-4 leading-relaxed">
              ChatGPT surfaced dealerships most frequently overall, with a 31% mention rate. But the real story is <em className="text-blue-300">how</em> it chooses. ChatGPT heavily weights detailed, recent reviews. When a dealership had 50+ reviews with specific descriptions of the buying experience — mentioning the salesperson by name, describing the test drive, noting the finance process — ChatGPT cited those reviews directly in its recommendation summary.
            </p>
            <p className="mb-4 leading-relaxed">
              Dealerships with thin or generic reviews ("Great experience!" "Would recommend!") rarely appeared, even when their star rating was higher. ChatGPT also showed a preference for dealerships with active, detailed FAQ sections and clear service page content. One dealership in Hamilton jumped from a 0% mention rate to 38% after adding structured FAQ content about their certified pre-owned program.
            </p>
            <div className="bg-[#0d111a] p-6 rounded-lg border border-slate-800 mb-6 italic text-slate-400">
              "ChatGPT doesn't just look at whether you have reviews. It reads them. A dealership with 40 detailed, story-rich reviews consistently outperformed a dealership with 200 generic ones."
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Gemini: The Franchise Favorer</h3>
            <p className="mb-4 leading-relaxed">
              Gemini had the lowest overall mention rate at 24%, but its behavior was the most predictable — and the most biased toward large franchise groups. Gemini's integration with Google Search and Google Business Profile means it leans heavily on Google's own entity graph. Dealerships with robust Google Business Profiles, high local search visibility, and strong Google review counts performed best.
            </p>
            <p className="mb-4 leading-relaxed">
              The catch: independent dealers and smaller stores were largely invisible. Only 8% of independents appeared in Gemini responses, compared to 18% on ChatGPT and 22% on Perplexity. Gemini also favored service-intent queries, surfacing dealerships with dedicated service pages 31% of the time — the highest of any platform for that category.
            </p>
            <p className="mb-4 leading-relaxed">
              For franchise dealers, Gemini is a must-win platform. For independents, it is the hardest to crack. The path forward for smaller stores is building a Google Business Profile that rivals the big groups in detail and review freshness.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Perplexity: The Citation Collector</h3>
            <p className="mb-4 leading-relaxed">
              Perplexity had the lowest mention rate at 19%, but it was also the most democratic. Independent dealerships surfaced 22% of the time — higher than either ChatGPT or Gemini. Perplexity's strength is its real-time web search and source transparency. It shows the user exactly which pages it pulled from, and it prefers sources with clear authority signals.
            </p>
            <p className="mb-4 leading-relaxed">
              The volatility was striking. The same prompt run twice on the same day could produce different recommendations if a new review or news article appeared in the index. One dealership in Ottawa went from unmentioned to first recommendation after a local news outlet published a story about their community fundraiser. The effect lasted about 72 hours.
            </p>
            <p className="mb-4 leading-relaxed">
              Perplexity also cited third-party directories more aggressively than the other platforms. Dealerships listed on DealerRater, Cars.com, and autoTRADER.ca with complete profiles and recent activity got a measurable boost. Perplexity is the platform where directory hygiene and PR visibility matter most.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">The Platform Gap: Same Dealership, Wildly Different Scores</h2>
            <p className="mb-4 leading-relaxed">
              One of the most revealing findings was how widely scores varied across platforms for the same dealership. We tracked a subset of 12 dealerships across all three AIs. The average score spread — the difference between a dealership's highest and lowest platform score — was 34 points.
            </p>
            <p className="mb-4 leading-relaxed">
              A Toyota dealer in London scored 62/100 on ChatGPT, 45/100 on Perplexity, and 19/100 on Gemini. The reason? Their Google Business Profile was incomplete (hurting Gemini), their DealerRater profile was robust (helping Perplexity), and their customer reviews were detailed and recent (helping ChatGPT). Fix the Google profile, and their Gemini score jumps. But without a multi-platform view, they would have no idea where the leak is.
            </p>
            <p className="mb-4 leading-relaxed">
              This is why a single-platform audit is dangerous. A dealership might hire a firm to "optimize for ChatGPT," score well there, and still be invisible to 70% of AI buyers who use Gemini or Perplexity. The <a href="/blog/what-is-ai-visibility-car-dealerships" className="text-blue-400 hover:text-blue-300 underline">AI Visibility Index</a> was built to solve this: it measures performance across all three platforms simultaneously, so you know where you are winning and where you are bleeding.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Platform-Specific Optimization Playbooks</h2>
            <p className="mb-4 leading-relaxed">
              Based on the data, here is what works on each platform:
            </p>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">To Win on ChatGPT</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Prioritize review quality over review count. Encourage customers to mention specifics: vehicle model, salesperson name, service experience.</li>
              <li>Build detailed FAQ content on your website. ChatGPT cites FAQ sections directly in recommendations.</li>
              <li>Maintain a clear, structured service page with specific services, hours, and booking options.</li>
              <li>Keep your website content fresh. ChatGPT's browsing model favors recently updated pages.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">To Win on Gemini</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Complete every field in your Google Business Profile. Photos, services, attributes, Q&A — all of it.</li>
              <li>Separate your Sales and Service entities clearly. Gemini uses Google's entity graph, which gets confused when a single listing tries to be everything.</li>
              <li>Accumulate Google reviews consistently. Gemini weights review recency heavily.</li>
              <li>Post updates to your Google Business Profile regularly. Gemini surfaces active profiles more often.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">To Win on Perplexity</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Claim and complete profiles on DealerRater, Cars.com, and autoTRADER.ca. Perplexity cites these directories more than any other platform.</li>
              <li>Generate periodic press or local media coverage. Perplexity's real-time index rewards fresh mentions.</li>
              <li>Ensure your website has clear author bios and about pages. Perplexity evaluates source authority more rigorously than the other platforms.</li>
              <li>Publish original data or research. Perplexity loves citing primary sources with numbers.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">The Real Cost of Ignoring One Platform</h2>
            <p className="mb-4 leading-relaxed">
              We modeled the revenue impact of being invisible on just one platform. For a dealership selling 80 vehicles per month at an average gross of $2,500, a 10% drop in AI-referred buyers — which is roughly what we see when a dealership is strong on one platform but absent on another — costs about $20,000 per month in lost front-end gross. Over a year, that is a quarter-million dollars left with competitors.
            </p>
            <p className="mb-4 leading-relaxed">
              The math gets worse for service departments. Service-intent AI queries are growing faster than sales-intent queries, and service customers have higher lifetime value. A dealership that wins on ChatGPT but loses on Gemini is missing the platform where service-intent visibility is strongest.
            </p>
            <p className="mb-4 leading-relaxed">
              The bottom line: <strong className="text-white">AI visibility is not a single-platform game</strong>. Buyers use different AIs for different stages of their journey. A serious strategy measures, tracks, and optimizes across all three.
            </p>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">Which AI platform recommends the most car dealerships?</h3>
                <p className="leading-relaxed">ChatGPT had the highest dealership mention rate at 31%, followed by Gemini at 24% and Perplexity at 19%. However, the "best" platform depends on your dealership type. ChatGPT favors detailed reviews, Gemini favors franchise stores with strong Google presence, and Perplexity surfaces independents more often.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">Why does the same dealership score differently on different AIs?</h3>
                <p className="leading-relaxed">Each platform uses different data sources, ranking signals, and confidence models. ChatGPT weights review content and website depth. Gemini relies on Google's entity graph and Business Profile data. Perplexity pulls from real-time web search and evaluates source authority differently. A dealership might excel in one area and lag in another.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">Do I need to optimize for all three platforms?</h3>
                <p className="leading-relaxed">Yes. Our data shows the average score spread across platforms is 34 points for the same dealership. Buyers use different AIs at different stages of their journey. Optimizing for only one leaves revenue on the table. A multi-platform visibility strategy is the only way to capture the full AI buyer funnel.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">Which platform is hardest for independent dealers?</h3>
                <p className="leading-relaxed">Gemini. Only 8% of independent dealerships surfaced in Gemini responses compared to 18% on ChatGPT and 22% on Perplexity. Gemini's tight integration with Google's local search ecosystem heavily favors franchise stores with established Google Business Profiles and high review volumes.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">How often do AI recommendations change?</h3>
                <p className="leading-relaxed">Perplexity changes most frequently — sometimes within hours — due to its real-time search index. ChatGPT is more stable but shifts when its training data or browsing behavior updates. Gemini changes with Google's local algorithm updates, which occur regularly but less predictably. Consistent monitoring is essential.</p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-20 p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl text-center text-white">
            <h2 className="text-3xl font-bold mb-4">See Where Your Dealership Stands on Every AI Platform</h2>
            <p className="text-xl mb-8 opacity-90">
              The VizBiz AI Visibility Audit runs 84 buyer-intent prompts across ChatGPT, Gemini, and Perplexity. You get your scores, your competitor gaps, and a platform-specific action plan.
            </p>
            <a 
              href="/ai-visibility-audit-for-car-dealerships" 
              className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors inline-block"
            >
              Get Your Free AVI Snapshot
            </a>
          </section>
        </article>
      </div>
    </div>
  );
}
