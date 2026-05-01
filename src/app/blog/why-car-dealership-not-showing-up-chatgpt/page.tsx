export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Why Your Car Dealership Isn\'t Showing Up in ChatGPT (And How to Fix It)',
  description: 'Car dealership not showing up in ChatGPT? Learn the 5 most common reasons and get a step-by-step fix to improve your AI visibility and start getting recommended.',
  openGraph: {
    title: 'Why Your Car Dealership Isn\'t Showing Up in ChatGPT (And How to Fix It)',
    description: 'Learn the 5 most common reasons your dealership isn\'t appearing in ChatGPT and get a step-by-step fix.',
  },
  alternates: {
    canonical: "https://vizbiz.ai/blog/why-car-dealership-not-showing-up-chatgpt",
  },
};

export default function ChatGPTVisibilityGuide() {
  return (
    <main style={{ backgroundColor: '#07090f', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: '#fff' }}>
          Why Your Car Dealership Isn't Showing Up in ChatGPT (And How to Fix It)
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 660, margin: '0 auto' }}>
          38% of car buyers have asked an AI assistant for dealership recommendations. If ChatGPT doesn't mention you, you're invisible to nearly 4 in 10 potential customers. Here's why — and exactly what to do about it.
        </p>
      </section>

      {/* Why It Matters */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Why This Matters Right Now
        </h2>
        <div style={{ background: 'rgba(37,209,242,0.06)', border: '1px solid rgba(37,209,242,0.15)', borderRadius: 20, padding: 32 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            ChatGPT has over 200 million weekly users. When someone types "best car dealership near me" or "where should I buy a used Honda Civic in [city]," ChatGPT gives them an answer — and that answer names specific dealerships.
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            If your dealership isn't in that answer, you've lost that buyer before they even open Google. And unlike traditional SEO, where you can gradually climb rankings, AI visibility is binary — you're either recommended or you're not.
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, margin: 0 }}>
            The good news: most dealerships haven't optimized for this yet. The ones that move now will lock in a massive advantage.
          </p>
        </div>
      </section>

      {/* 5 Common Reasons */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 32, color: '#fff' }}>
          5 Reasons Your Dealership Isn't Appearing in ChatGPT
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            {
              num: '1',
              title: 'Weak or Incomplete Google Business Profile',
              body: 'ChatGPT pulls heavily from Google Business Profile data. Missing hours, outdated address, no photos, sparse description — all of these signal to AI models that your listing isn\'t authoritative. 94% of AI-generated local recommendations factor in GBP completeness. If yours is half-done, you\'re already behind.',
              fix: 'Complete every field in your Google Business Profile. Add high-quality photos. Write a detailed business description using natural language that includes your makes, services, and location. Update it monthly.',
            },
            {
              num: '2',
              title: 'Not Enough Reviews (or Only on One Platform)',
              body: 'AI models cite review data more than any other signal. If you have 15 Google reviews and your competitor has 200, the AI will recommend them — not you. Even worse, if all your reviews are on Google and none on Cars.com, DealerRater, or Yelp, the AI has fewer sources to triangulate your reputation.',
              fix: 'Target 100+ reviews on Google as a baseline. Then build presence on at least 2 additional platforms. Implement a systematic review collection process — email follow-ups, in-store QR codes, SMS requests. Respond to every review.',
            },
            {
              num: '3',
              title: 'Your Website Doesn\'t Have AI-Friendly Content',
              body: 'ChatGPT processes your website content to understand what you offer. If your site is just a generic homepage and an inventory feed, there\'s very little for the AI to cite. Dealerships with dedicated make/model pages, FAQ sections, and blog content are 5.4× more likely to appear in AI answers.',
              fix: 'Create individual pages for each brand you carry ("Toyota dealer in [city]", "Honda service center [city]"). Build a comprehensive FAQ page. Start publishing monthly blog content answering real buyer questions.',
            },
            {
              num: '4',
              title: 'Missing or Broken Structured Data',
              body: 'Schema markup (structured data) helps AI crawlers parse your website. 42% of dealerships lack proper schema markup entirely. Without it, AI models have to guess at your business details — and they may guess wrong, or skip you entirely.',
              fix: 'Add LocalBusiness schema markup to your homepage. Include AutomotiveDealer schema. Make sure your NAP data (name, address, phone) is consistent everywhere — your website, GBP, social profiles, and directory listings.',
            },
            {
              num: '5',
              title: 'No Presence on Third-Party Platforms AI Cites',
              body: '82% of automotive AI answers reference at least one third-party review site. If you\'re not active on Cars.com, DealerRater, Edmunds, and Yelp, you\'re missing a major citation signal. AI models trust multiple independent sources — not just your own website.',
              fix: 'Claim and optimize your profiles on Cars.com, DealerRater, Yelp, Facebook, and Edmunds. Ensure consistent information across all of them. Encourage reviews on each platform.',
            },
          ].map((item) => (
            <div key={item.num} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 32 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ minWidth: 40, height: 40, borderRadius: 12, background: 'rgba(37,209,242,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D1F2', fontWeight: 800, fontSize: '1.1rem' }}>{item.num}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: 0 }}>{item.title}</h3>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>{item.body}</p>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>The Fix</div>
                <p style={{ color: '#cbd5e1', lineHeight: 1.65, margin: 0, fontSize: '0.93rem' }}>{item.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-Step Fix */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 32, color: '#fff' }}>
          Your Step-by-Step Fix Plan
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { week: 'Week 1', tasks: ['Complete every field in your Google Business Profile', 'Audit your NAP data across all listings for consistency', 'Add LocalBusiness schema markup to your website'] },
            { week: 'Week 2', tasks: ['Claim/optimize profiles on Cars.com, DealerRater, and Yelp', 'Launch a review collection campaign (email + in-store)', 'Respond to all existing reviews across all platforms'] },
            { week: 'Week 3', tasks: ['Build dedicated make/model pages on your website', 'Create a comprehensive FAQ page', 'Start a blog — publish your first buyer-guide post'] },
            { week: 'Week 4', tasks: ['Run an AI visibility audit to measure your baseline', 'Compare against your top 3 local competitors', 'Set up weekly monitoring to track improvements'] },
          ].map((item) => (
            <div key={item.week} style={{ background: 'rgba(37,209,242,0.05)', border: '1px solid rgba(37,209,242,0.12)', borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#25D1F2', marginBottom: 12 }}>{item.week}</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {item.tasks.map((t, i) => (
                  <li key={i} style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.93rem' }}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tools That Help */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          Tools That Can Help
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { name: 'VizBiz', desc: 'AI visibility audits and ongoing monitoring specifically for car dealerships' },
            { name: 'Google Business Profile', desc: 'The foundation — complete and optimize everything here first' },
            { name: 'Schema.org Markup', desc: 'Add structured data so AI crawlers can parse your site correctly' },
            { name: 'BrightLocal', desc: 'Manage citations and monitor reviews across multiple platforms' },
          ].map((tool) => (
            <div key={tool.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 22 }}>
              <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>{tool.name}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px 80px', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>
          Find Out If ChatGPT Is Recommending You
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: 32 }}>
          Run a free AI visibility audit and see exactly where your dealership appears — and where it doesn't.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#25D1F2', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
          Run Your Free AI Visibility Audit →
        </a>
      </section>
    </main>
  );
}
