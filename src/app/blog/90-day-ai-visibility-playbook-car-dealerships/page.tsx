import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '90-Day AI Visibility Playbook for Car Dealerships',
  description: 'A step-by-step 90-day playbook to improve your dealership\'s AI visibility. Week-by-week actions you can implement without hiring a new team — based on data from 50 real Ontario dealerships.',
  alternates: {
    canonical: "https://vizbiz.ai/blog/90-day-ai-visibility-playbook-car-dealerships",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#02091F] text-[#e2e8f0] font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            90-Day AI Visibility Playbook for Car Dealerships
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Most dealerships score 11 out of 100 on AI visibility. That is not a failing grade — it is an opportunity. Here is a week-by-week playbook to move your dealership from invisible to recommended, based on what we learned auditing 50 Ontario stores.
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
              <span><strong className="text-white">Days 1–30:</strong> Fix your foundation — schema markup, Google Business Profile, directory consistency. These are fast wins with compounding returns.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong className="text-white">Days 31–60:</strong> Build recommendation assets — service pages, inventory depth, finance content. This is where most dealerships score zero.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong className="text-white">Days 61–90:</strong> Earn citations from the 50 websites that control AI recommendations — the top 15 domains capture 68% of all AI citations.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>The average dealership that follows this playbook moves from <strong className="text-white">11/100 to 45–60/100</strong> within 90 days — from "Not Visible" to "Moderate" band.</span>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <article className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Why 90 Days?</h2>
            <p className="mb-4 leading-relaxed">
              AI visibility is not a one-time fix. It is a compound game. The dealerships that win are the ones that stack small improvements over time. Month 1 shows zero citations. Month 3 you are in three AI answers. Month 6 you are the default recommendation. Most dealers quit before the compounding kicks in.
            </p>
            <p className="mb-4 leading-relaxed">
              The 90-day window is deliberate. It is long enough to see measurable movement in your AI Visibility Index (AVI), but short enough that you do not lose momentum. Every action in this playbook is something you or your existing team can do without hiring a GEO specialist or an agency.
            </p>
            <p className="mb-4 leading-relaxed">
              We built this from real data: 50 Ontario dealerships audited, 84 buyer-intent prompts per store, five visibility categories tracked across ChatGPT, Gemini, and Perplexity. The fixes that moved the needle fastest are what you will find below.
            </p>
          </section>

          {/* Phase 1 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🗓️</span>
              <h2 className="text-3xl font-bold text-white">Phase 1: Foundation — Days 1–30</h2>
            </div>
            <p className="mb-4 leading-relaxed">
              The first 30 days are about signal clarity. AI models cannot recommend what they cannot find or understand. Most dealerships fail here because their basic entity data is inconsistent, incomplete, or missing entirely.
            </p>
            <p className="mb-6 leading-relaxed">
              Data from our audits: <strong className="text-white">73% of dealership websites</strong> fail basic Technical GEO checks — broken schema, blocked AI crawlers, inconsistent NAP. Fixing these is the cheapest leverage in AI visibility.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 1: Fix Your Schema Markup</h3>
            <p className="mb-4 leading-relaxed">
              Schema markup is how AI engines read your website. Without it, your dealership is just text on a page. With it, you become a machine-readable entity that AI can cite confidently.
            </p>
            <p className="mb-4 leading-relaxed">
              The Javadex 2026 report found that <strong className="text-white">82.5% of pages cited by ChatGPT use structured data</strong>, and schema pages are cited at <strong className="text-white">3.7× the rate</strong> of non-schema pages. This is the cheapest win in AI visibility.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li><strong className="text-white">Add LocalBusiness schema</strong> to your homepage with complete NAP, hours, and service area</li>
              <li><strong className="text-white">Add AutoDealer or CarDealer schema</strong> if your platform supports it</li>
              <li><strong className="text-white">Add Vehicle schema</strong> to your inventory pages — make/model, year, price, VIN</li>
              <li><strong className="text-white">Add Service schema</strong> to your service department page — specific services offered, hours, booking URL</li>
              <li><strong className="text-white">Test with Google's Rich Results Test</strong> and fix any errors before moving on</li>
            </ul>
            <div className="bg-[#0d111a] p-6 rounded-lg border border-slate-800 mb-6">
              <p className="text-slate-400 leading-relaxed mb-0 italic">
                "We audited a Honda dealer in Hamilton whose website had zero schema. Their AVI was 14/100. After adding LocalBusiness + Vehicle schema, they jumped to 31/100 in four weeks — without writing a single new page of content."
              </p>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 2: Audit Your NAP Consistency</h3>
            <p className="mb-4 leading-relaxed">
              NAP stands for Name, Address, Phone. It is the foundation of entity clarity. If your dealership is "Toronto Honda" on your website, "Toronto Honda Ltd." on Google, and "Toronto Honda Auto Sales" on Cars.com, AI engines treat these as three different businesses — or worse, ignore all three.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Write down your exact dealership name, address, and phone number as they appear on your website</li>
              <li>Check Google Business Profile, DealerRater, Cars.com, CarGurus, and your manufacturer site</li>
              <li>Fix every inconsistency — abbreviations, suite numbers, phone formats, "Ltd." vs "Limited"</li>
              <li>Use the exact same name, address format, and phone number everywhere</li>
            </ul>
            <p className="mb-6 leading-relaxed">
              Our audits found that <strong className="text-white">entity drift</strong> — small inconsistencies across directories — is the #1 reason dealerships appear in AI answers sporadically rather than consistently. Fix the drift, and you fix the inconsistency.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 3: Max Out Your Google Business Profile</h3>
            <p className="mb-4 leading-relaxed">
              Gemini's recommendation engine is essentially a Google Business Profile filter. Dealerships with complete GBP profiles appeared <strong className="text-white">4.1× more often</strong> in Gemini than dealerships with basic listings. This is not optional.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Upload high-quality photos of your showroom, service bay, inventory, and team</li>
              <li>Add all relevant business categories: "Car Dealer," "Used Car Dealer," "Car Repair and Maintenance Service"</li>
              <li>Fill out the Q&A section with real questions buyers ask</li>
              <li>Post weekly updates — new inventory arrivals, service specials, team highlights</li>
              <li>Set service attributes: "Free Wi-Fi," "Waiting Area," "Loaner Cars," "Online Booking"</li>
              <li>Add products (vehicle models) and services (oil changes, tire rotations, brake service)</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 4: Speed and Mobile</h3>
            <p className="mb-4 leading-relaxed">
              AI crawlers behave like fast mobile users. If your site loads in 6 seconds or breaks on mobile, AI engines struggle to parse it. Most dealership sites are built on legacy DMS platforms with bloated code — but you can still improve.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Run PageSpeed Insights on your homepage, inventory page, and service page</li>
              <li>Compress images — most dealership photos are 2–5MB and should be under 200KB</li>
              <li>Fix any mobile layout issues — buttons cut off, text too small, forms unusable</li>
              <li>Ensure your robots.txt does not block AI crawlers (some dealership platforms do this by default)</li>
            </ul>
            <div className="bg-[#0d111a] border border-blue-500/30 rounded-xl p-6 mt-6">
              <p className="text-slate-400 leading-relaxed mb-0">
                <strong className="text-white">Phase 1 Expected Result:</strong> Your AVI should improve from 11/100 to roughly 25–35/100. You have not built new content yet, but AI engines can now find you, understand you, and cite you with confidence.
              </p>
            </div>
          </section>

          {/* Phase 2 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🗓️</span>
              <h2 className="text-3xl font-bold text-white">Phase 2: Build Recommendation Assets — Days 31–60</h2>
            </div>
            <p className="mb-4 leading-relaxed">
              Phase 2 is where most dealerships make their biggest gains. Foundation fixes got you found. Now you need pages that answer the specific questions buyers ask AI. When a buyer asks ChatGPT "Where should I service my Honda Civic in Mississauga?" the AI looks for a page that directly answers that question — not a generic "Services" page.
            </p>
            <p className="mb-6 leading-relaxed">
              In our audits, the average Ontario dealership scored <strong className="text-white">8/100 on Service Visibility</strong>, <strong className="text-white">12/100 on Used Inventory</strong>, and <strong className="text-white">5/100 on Finance</strong>. These are the categories where a single page can move the needle by 10–20 points.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 5: Fix Your Service Department Page</h3>
            <p className="mb-4 leading-relaxed">
              Service is where dealerships make their margin. It is also where almost every dealership is invisible to AI. When we ran prompts like "best Toyota service center in Ottawa," the dealerships that appeared had one thing in common: a detailed, specific service page.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>List every service you offer: oil changes, brake service, transmission work, tire rotations, diagnostics</li>
              <li>Include pricing or pricing ranges — AI favors pages with transparent numbers</li>
              <li>Add your service manager's name and credentials — this humanizes the page and builds trust</li>
              <li>Include an online booking link or form — availability signals activity</li>
              <li>Mention OEM parts, certified technicians, and warranty coverage</li>
              <li>Add customer testimonials specific to service (not just sales)</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              Target: 500+ words on your service page. Most dealership service pages have 50 words and a form. The AI reads that as "thin content" and skips you.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 6: Build Used Inventory Depth</h3>
            <p className="mb-4 leading-relaxed">
              Used car buyers ask AI specific questions: "Who has the best selection of used CR-Vs under $30,000?" "Where can I find a certified pre-owned Accord in Hamilton?" If your used inventory page is just a grid of cars with no context, AI has nothing to cite.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Create a dedicated "Certified Pre-Owned Program" page with benefits, warranty details, inspection process</li>
              <li>Add a "How We Price" page — transparency on how you set used car prices</li>
              <li>Include a "Trade-In Value" section or calculator</li>
              <li>Write model-specific landing pages for your top 5 most popular used vehicles</li>
              <li>Ensure every vehicle listing has Vehicle schema with VIN, price, mileage, and features</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 7: Create Finance Content That Answers Real Questions</h3>
            <p className="mb-4 leading-relaxed">
              Finance pages are the most neglected on dealership websites. Most have a form and a rate. But buyers ask AI: "What credit score do I need to finance a car?" "Should I lease or buy?" "Can I trade in a car I still owe money on?" If your site does not answer these, ChatGPT cites a third-party finance site instead — and that site recommends a different dealership.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Write a "Leasing vs. Buying" comparison page with real numbers</li>
              <li>Create a "Credit Score Guide" — what score gets what rate at your dealership</li>
              <li>Add a "Trade-In FAQ" covering negative equity, timing, and valuation</li>
              <li>Include a finance application or pre-approval tool</li>
              <li>Make your finance manager's contact info visible — a name and email builds trust</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 8: Build FAQ and Comparison Content</h3>
            <p className="mb-4 leading-relaxed">
              AI engines love FAQ format. It is structured, specific, and easy to extract. A well-built FAQ page can appear in multiple AI answers for different questions — one page, many citations.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Create an FAQ page with 20+ real questions your sales team hears daily</li>
              <li>Use FAQPage schema markup so AI can extract individual Q&As</li>
              <li>Write comparison pages: "New vs. Used," "Lease vs. Finance," "Dealer Financing vs. Bank Loan"</li>
              <li>Build location-specific content: "Why Buy from a Hamilton Dealership" — local signals matter</li>
            </ul>
            <div className="bg-[#0d111a] border border-blue-500/30 rounded-xl p-6 mt-6">
              <p className="text-slate-400 leading-relaxed mb-0">
                <strong className="text-white">Phase 2 Expected Result:</strong> Your AVI should improve to roughly 40–55/100. You now have pages that AI can cite for specific buyer questions. Your Service, Inventory, and Finance scores should each jump 15–25 points.
              </p>
            </div>
          </section>

          {/* Phase 3 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🗓️</span>
              <h2 className="text-3xl font-bold text-white">Phase 3: Earn Citations — Days 61–90</h2>
            </div>
            <p className="mb-4 leading-relaxed">
              By Day 60, your dealership is findable and citeable. Now you need to earn citations from the sources AI actually trusts. The 5WPR AI Platform Citation Source Index found that <strong className="text-white">the top 15 domains control 68% of all AI citations</strong>. For dealerships, the relevant sources are even more concentrated.
            </p>
            <p className="mb-6 leading-relaxed">
              The key insight: you do not need to be everywhere. You need to be in the right 50 sources — and for dealerships, that is a smaller list than you think.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 9: Optimize Directory Profiles</h3>
            <p className="mb-4 leading-relaxed">
              Perplexity — the platform that recommends dealerships most often (34% of prompts) — pulls primarily from DealerRater, Cars.com, and CarGurus. If you are not optimized on these three, you are invisible to the AI that recommends dealerships most.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li><strong className="text-white">DealerRater:</strong> Complete every field. Upload photos. Encourage detailed reviews (not just star ratings). Mention specific services, employees, and experiences.</li>
              <li><strong className="text-white">Cars.com:</strong> Ensure inventory feed is current. Complete dealer profile with hours, services, and amenities.</li>
              <li><strong className="text-white">CarGurus:</strong> Same as above — current inventory, complete profile, active pricing.</li>
              <li><strong className="text-white">Kelley Blue Book:</strong> Claim your dealer profile and keep it updated.</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              Critical: Use the exact same NAP from Phase 1. Any inconsistency between your website, Google, and these directories breaks entity clarity and reduces citation probability.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 10: Build Review Velocity</h3>
            <p className="mb-4 leading-relaxed">
              ChatGPT recommendations heavily favor dealerships with high review counts. A Reddit analysis of dealership threads found stores with 500+ Google reviews appeared <strong className="text-white">3.2× more often</strong> in ChatGPT answers than stores with fewer reviews. But recency matters as much as volume.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Set up an automated review request system — text after service completion, email after purchase</li>
              <li>Aim for 10–15 new Google reviews per week, not 50 in one burst</li>
              <li>Encourage detailed reviews — "Great service!" is less valuable than "Mike in service diagnosed my transmission issue in 20 minutes and saved me $800."</li>
              <li>Respond to every review — positive and negative. AI models read responses as trust signals.</li>
            </ul>
            <div className="bg-[#0d111a] p-6 rounded-lg border border-slate-800 mb-6">
              <p className="text-slate-400 leading-relaxed mb-0 italic">
                "One of our audited dealerships went from 23 reviews to 340 reviews in 60 days by texting every service customer a review link 24 hours after pickup. Their ChatGPT visibility went from 2 mentions to 18 mentions across 84 prompts. Review velocity works."
              </p>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 11: Earn Local and Industry Mentions</h3>
            <p className="mb-4 leading-relaxed">
              The 5WPR Index found that local news, industry publications, and community organizations are among the top 50 citation sources. Perplexity specifically trusts editorial sources — local news articles, trade publication mentions, community awards.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Submit your dealership for local business awards (Chamber of Commerce, automotive associations)</li>
              <li>Sponsor community events and ensure your name appears in press releases and local news coverage</li>
              <li>Write a guest article for an automotive trade publication about dealership AI strategy</li>
              <li>Get listed in local business directories with editorial content, not just listings</li>
              <li>Consider a press release when you hit a milestone — 1,000th customer, new service launch, community donation</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Week 12: Measure, Adjust, and Plan Ahead</h3>
            <p className="mb-4 leading-relaxed">
              By Day 90, you should run another AI visibility audit. Compare your new AVI to your baseline. Look at the category breakdown: where did you gain the most? Where are you still stuck?
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Re-run the 84-prompt battery or use a tool like VizBiz to measure your new score</li>
              <li>Identify your primary competitor — who is still appearing instead of you, and in which categories?</li>
              <li>Double down on your highest-gain category. If Service jumped from 8 to 45, invest more there.</li>
              <li>Address any remaining entity drift — new inconsistencies may have appeared during the 90 days</li>
              <li>Set a 90-day maintenance calendar: review schema, update inventory schema, refresh GBP posts, check directory consistency</li>
            </ul>
            <div className="bg-[#0d111a] border border-blue-500/30 rounded-xl p-6 mt-6">
              <p className="text-slate-400 leading-relaxed mb-0">
                <strong className="text-white">Phase 3 Expected Result:</strong> Your AVI should reach 45–60/100 — firmly in the "Moderate" band. You are now appearing in AI recommendations for specific buyer questions. Your primary competitor has shifted from "everyone" to one or two specific dealers you can track and beat.
              </p>
            </div>
          </section>

          {/* The Week-by-Week Summary */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">The 90-Day Summary</h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse border border-slate-800">
                <thead>
                  <tr className="bg-[#1a1f2b] text-blue-400">
                    <th className="p-4 border border-slate-800">Week</th>
                    <th className="p-4 border border-slate-800">Focus</th>
                    <th className="p-4 border border-slate-800">Key Action</th>
                    <th className="p-4 border border-slate-800">Expected AVI Gain</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">1</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Foundation</td>
                    <td className="p-4 border border-slate-800 text-white">Add schema markup</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+5–10</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">2</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Foundation</td>
                    <td className="p-4 border border-slate-800 text-white">Fix NAP consistency</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+3–8</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">3</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Foundation</td>
                    <td className="p-4 border border-slate-800 text-white">Max out GBP</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+5–10</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">4</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Foundation</td>
                    <td className="p-4 border border-slate-800 text-white">Speed and mobile</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+2–5</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">5</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Assets</td>
                    <td className="p-4 border border-slate-800 text-white">Fix service page</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+10–20</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">6</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Assets</td>
                    <td className="p-4 border border-slate-800 text-white">Build used inventory depth</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+5–15</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">7</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Assets</td>
                    <td className="p-4 border border-slate-800 text-white">Create finance content</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+5–10</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">8</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Assets</td>
                    <td className="p-4 border border-slate-800 text-white">Build FAQ and comparisons</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+3–8</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">9</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Citations</td>
                    <td className="p-4 border border-slate-800 text-white">Optimize directory profiles</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+3–8</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">10</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Citations</td>
                    <td className="p-4 border border-slate-800 text-white">Build review velocity</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+5–15</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-slate-800 font-semibold">11</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Citations</td>
                    <td className="p-4 border border-slate-800 text-white">Earn local/industry mentions</td>
                    <td className="p-4 border border-slate-800 text-slate-400">+2–5</td>
                  </tr>
                  <tr className="bg-[#0d111a]">
                    <td className="p-4 border border-slate-800 font-semibold">12</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Measure</td>
                    <td className="p-4 border border-slate-800 text-white">Re-audit and plan</td>
                    <td className="p-4 border border-slate-800 text-slate-400">Baseline reset</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">What Not to Do</h2>
            <p className="mb-4 leading-relaxed">
              After auditing 50 dealerships, we have seen the same mistakes repeatedly. Avoid these:
            </p>
            <ul className="space-y-4 text-slate-300 mb-6">
              <li className="flex gap-3">
                <span className="text-red-400 font-bold">✗</span>
                <span><strong className="text-white">Skip the audit.</strong> You cannot fix what you cannot measure. Run a baseline AVI before you start.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 font-bold">✗</span>
                <span><strong className="text-white">Write generic blog posts.</strong> "5 Tips for Car Buyers" does not help AI recommend you. Specific answers to specific questions do.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 font-bold">✗</span>
                <span><strong className="text-white">Focus on only one platform.</strong> Perplexity, ChatGPT, and Gemini use different citation sources. You need presence across all three.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 font-bold">✗</span>
                <span><strong className="text-white">Quit at Day 30.</strong> The biggest mistake is stopping before compounding kicks in. Most dealerships see the real gains between Day 45 and Day 90.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 font-bold">✗</span>
                <span><strong className="text-white">Ignore entity drift.</strong> Fixing NAP once is not enough. Directories update, platforms sync, and inconsistencies creep back in.</span>
              </li>
            </ul>
          </section>

          {/* The Reality Check */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">The Reality Check</h2>
            <p className="mb-4 leading-relaxed">
              Let us be direct: 60% of Google searches now end without a click. Google AI Overviews appear on 50%+ of queries. Position #1 organic CTR has dropped to <strong className="text-white">2.6%</strong> when AI Overviews are present. The old playbook is worth less every month.
            </p>
            <p className="mb-4 leading-relaxed">
              But here is the upside: <strong className="text-white">AI traffic to retailers is up 520% year-over-year</strong>. Visitors from AI are <strong className="text-white">4.4× more qualified</strong> than traditional search traffic. AI-assisted car buyers exist now, and they are the highest-intent buyers in the market.
            </p>
            <p className="mb-4 leading-relaxed">
              The dealerships that act in the next 90 days will have a compounding advantage. The ones that wait will be playing catch-up against dealers who started six months ago. This is not fear-mongering. It is the math.
            </p>
            <p className="mb-4 leading-relaxed">
              Your dealership does not need perfect. It needs to move. 11/100 to 45/100 is not hard. It just requires doing the work in the right order, week by week, until the compounding starts.
            </p>
          </section>

          {/* Related Posts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">Related Reading</h2>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a href="/blog/chatgpt-vs-gemini-vs-perplexity-dealerships" className="text-blue-400 hover:text-blue-300 underline">
                  ChatGPT vs Gemini vs Perplexity: Which AI Recommends More Dealerships?
                </a>
                <span className="text-slate-500"> — Platform-specific data on where dealerships appear and why.</span>
              </li>
              <li>
                <a href="/blog/ai-visibility-audit-what-it-measures-dealership" className="text-blue-400 hover:text-blue-300 underline">
                  AI Visibility Audit: What It Measures and Why Dealerships Need One
                </a>
                <span className="text-slate-500"> — How the AVI scoring system works across five categories.</span>
              </li>
              <li>
                <a href="/blog/ai-visibility-tools-for-car-dealerships-compared" className="text-blue-400 hover:text-blue-300 underline">
                  AI Visibility Tools for Car Dealerships Compared (2026)
                </a>
                <span className="text-slate-500"> — The difference between traditional SEO tools and AI visibility intelligence.</span>
              </li>
              <li>
                <a href="/blog/what-is-ai-visibility-car-dealerships" className="text-blue-400 hover:text-blue-300 underline">
                  What Is AI Visibility for Car Dealerships? (The Complete Guide)
                </a>
                <span className="text-slate-500"> — The foundational guide to understanding AI visibility and why it matters.</span>
              </li>
              <li>
                <a href="/blog/free-ai-visibility-check-for-your-dealership" className="text-blue-400 hover:text-blue-300 underline">
                  Free AI Visibility Check for Your Dealership
                </a>
                <span className="text-slate-500"> — How to run a manual audit before investing in a platform or playbook.</span>
              </li>
            </ul>
          </section>

          {/* Final CTA */}
          <section className="mt-20 p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start Your 90-Day Playbook With a Baseline</h2>
            <p className="text-xl mb-8 opacity-90">
              Run a free AVI audit and see exactly where your dealership stands before you begin. You will get your baseline score, category breakdown, and the three fixes that will move the needle fastest.
            </p>
            <a 
              href="/intake/" 
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
