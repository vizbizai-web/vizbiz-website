import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Visibility Check for Car Dealerships: How to Audit Your Store',
  description: 'Wondering if AI recommends your dealership? Learn how to perform a free AI visibility check, understand your AVI score, and identify why competitors are winning the recommendation game.',
  alternates: {
    canonical: "https://vizbiz.ai/blog/free-ai-visibility-check-for-your-dealership",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#02091F] text-[#e2e8f0] font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Free AI Visibility Check for Your Dealership: How to Audit Your Store
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Most dealerships are flying blind. They track Google rankings and website traffic, but they have no idea if ChatGPT, Gemini, or Perplexity actually recommends them to buyers. Here is how to perform a manual AI visibility check and what the numbers actually mean.
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
              <span><strong className="text-white">AI recommendations</strong> are different from SEO rankings; you can be #1 on Google and still be invisible to an AI agent.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>The <strong className="text-white">AI Visibility Index (AVI)</strong> measures how consistently you appear across different buyer-intent categories.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>The average dealership AVI is currently <strong className="text-white">11/100</strong>, meaning most stores only appear when the user explicitly names them in the prompt.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>A manual check is a great start, but <strong className="text-white">automated prompt batteries</strong> (like VizBiz) are required to find the "blind spots" in your visibility.</span>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <article className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">The "Invisible Dealer" Problem</h2>
            <p className="mb-4 leading-relaxed">
              If you spend thousands of dollars a month on SEO, you likely have a dashboard that tells you exactly which keywords you rank for. You know that for "Used Ford F-150 Toronto," you are in the top three positions. In the old world, that was the win.
            </p>
            <p className="mb-4 leading-relaxed">
              But in 2026, a growing percentage of your buyers aren't clicking those blue links. They are asking an AI: <em className="italic">"I'm looking for a reliable used F-150 in Toronto. Which dealership has the best reputation for honest pricing and a great service department?"</em>
            </p>
            <p className="mb-4 leading-relaxed">
              When the AI answers, it isn't just looking for keywords. It is synthesizing your reviews, your entity data, and your authority signals. If the AI doesn't mention you, you are effectively invisible—regardless of where you rank on the traditional search results page.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">How to Perform a Manual AI Visibility Check</h2>
            <p className="mb-4 leading-relaxed">
              You don't need expensive software to start seeing the gap. You can perform a "baseline" check using a few free AI tools. Here is the exact process to follow.
            </p>
            
            <div className="bg-[#0d111a] p-6 rounded-lg border border-slate-800 mb-8">
              <h3 className="text-xl font-bold mb-4 text-blue-300">The DIY Audit Process</h3>
              <ol className="space-y-4 text-slate-300 list-decimal pl-5">
                <li>
                  <strong className="text-white">The "Direct" Test:</strong> Ask ChatGPT or Perplexity: <em className="italic">"Who are the best car dealerships in [Your City]?"</em> Note if you appear and in what position.
                </li>
                <li>
                  <strong className="text-white">The "Make-Specific" Test:</strong> Ask: <em className="italic">"Where is the most trusted [Your Primary Brand] dealer in [Your City]?"</em> Check if the AI recommends you or a competitor.
                </li>
                <li>
                  <strong className="text-white">The "Service" Test:</strong> Ask: <em className="italic">"I need my [Make] serviced in [Your City]. Who has the best service department?"</em> This is often where dealerships have the biggest visibility gap.
                </li>
                <li>
                  <strong className="text-white">The "Competitor" Test:</strong> Ask the AI: <em className="italic">"Why would I choose [Competitor Name] over [Your Dealership Name]?"</em> The AI's answer will tell you exactly what signals the competitor has that you are missing.
                </li>
              </ol>
            </div>
            
            <p className="mb-4 leading-relaxed">
              As you run these, you'll notice a pattern. If you only show up when you ask <em className="italic">"Tell me about [Your Dealership Name],"</em> your visibility is low. True AI visibility happens when the AI recommends you <strong className="font-bold">without</strong> the user naming you first.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Understanding the AI Visibility Index (AVI)</h2>
            <p className="mb-4 leading-relaxed">
              At VizBiz, we've moved beyond "Yes/No" checks. We use the <strong className="text-white">AI Visibility Index (AVI)</strong>, a weighted score from 0–100 that tells you exactly how "recommendable" your store is.
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse border border-slate-800">
                <thead>
                  <tr className="bg-[#1a1f2b] text-blue-400">
                    <th className="p-4 border border-slate-800">AVI Band</th>
                    <th className="p-4 border border-slate-800">Score</th>
                    <th className="p-4 border border-slate-800">What it Means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">Strong</td>
                    <td className="p-4 border border-slate-800 text-slate-400">80–100</td>
                    <td className="p-4 border border-slate-800 text-white">Consistently recommended across platforms. Dominating the market.</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">Moderate</td>
                    <td className="p-4 border border-slate-800 text-slate-400">55–79</td>
                    <td className="p-4 border border-slate-800 text-white">Present but not dominant. Clear gaps in specific categories (e.g., Service).</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">Weak</td>
                    <td className="p-4 border border-slate-800 text-slate-400">30–54</td>
                    <td className="p-4 border border-slate-800 text-white">Sporadic mentions. High risk of being displaced by competitors.</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">Not Visible</td>
                    <td className="p-4 border border-slate-800 text-slate-400">0–29</td>
                    <td className="p-4 border border-slate-800 text-white">Effectively invisible unless the user explicitly names the dealer.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mb-4 leading-relaxed">
              In our recent audit of 50 Ontario dealerships, we found a startling reality: <strong className="text-white">the average AVI was just 11/100</strong>. Most dealers are sitting in the "Not Visible" band, meaning they are missing out on a massive amount of high-intent buyer traffic.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Why Manual Checks Aren't Enough</h2>
            <p className="mb-4 leading-relaxed">
              Manual checks are a great "wake up call," but they are limited. To actually fix your visibility, you need data at scale. Here is why a professional audit is necessary:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300">
              <li>
                <strong className="text-white">The Prompt Gap:</strong> You might test 4 prompts. VizBiz tests 84 buyer-intent prompts across 3 different AI platforms, generating 252 unique data points.
              </li>
              <li>
                <strong className="text-white">Competitor Displacement:</strong> A manual check tells you that you aren't there. An audit tells you <em className="text-blue-300">who</em> is there instead and exactly why the AI prefers them.
              </li>
              <li>
                <strong className="text-white">Entity Drift:</strong> AI recommendations are often derailed by "entity drift"—small inconsistencies in your address, phone number, or make-affiliation across the web. You can't find these by asking ChatGPT; you find them by auditing your digital footprint.
              </li>
              <li>
                <strong className="text-white">Category Specifics:</strong> You might be visible for "Sales" but completely invisible for "Service." An AVI audit breaks your score into 5 key categories so you know exactly where the revenue leak is.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">From "Invisible" to "Recommended"</h2>
            <p className="mb-4 leading-relaxed">
              The good news is that AI visibility is a solvable problem. Unlike traditional SEO, which can take years of backlink building, AI visibility can often be improved in weeks by focusing on <strong className="text-white">entity clarity</strong> and <strong className="text-white">semantic depth</strong>.
            </p>
            <p className="mb-4 leading-relaxed">
              If your manual check showed that you're invisible, your first move shouldn't be to "write more blog posts." It should be to audit your entity signals. Ensure your dealership name, address, and primary services are identical across every directory, review site, and social profile.
            </p>
            <p className="mb-4 leading-relaxed">
              Once your foundation is clean, you can build "recommendation assets"—pages that answer the specific, complex questions buyers ask AI. When you move from generic content to high-utility answers, the AI starts to see you as the authority in your market.
            </p>
          </section>

          {/* Final CTA */}
          <section className="mt-20 p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Get Your Professional AVI Snapshot</h2>
            <p className="text-xl mb-8 opacity-90">
              Stop guessing. Find out exactly where you stand compared to your local competitors with a professional AI Visibility Audit.
            </p>
            <a 
              href="/ai-visibility-audit-for-car-dealerships" 
              className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors inline-block"
            >
              Get Your Free Snapshot
            </a>
          </section>
        </article>
      </div>
    </div>
  );
}
