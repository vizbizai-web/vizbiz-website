
export const metadata = {
  title: 'Generative Engine Optimization (GEO) for Car Dealerships: The Complete Guide',
  description: 'The complete guide to GEO for car dealerships — how to optimize for ChatGPT, Gemini, Google AI Overviews, and AI-powered search.',
  openGraph: {
    title: 'Generative Engine Optimization (GEO) for Car Dealerships: The Complete Guide',
    description: 'The complete guide to GEO for car dealerships — how to optimize for ChatGPT, Gemini, Google AI Overviews, and AI-powered search.',
  },
  alternates: {
    canonical: "https://vizbiz.ai/blog/generative-engine-optimization-car-dealerships",
  },
};

export default function GEOGuide() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Generative Engine Optimization (GEO) for Car Dealerships: The Complete Guide',
    description: 'The complete guide to GEO for car dealerships — how to optimize for ChatGPT, Gemini, Google AI Overviews, and AI-powered search.',
    author: { '@type': 'Organization', name: 'VizBiz' },
    publisher: { '@type': 'Organization', name: 'VizBiz', url: 'https://vizbiz.ai' },
    datePublished: '2026-04-20',
    url: 'https://vizbiz.ai/blog/generative-engine-optimization-car-dealerships',
  };

  return (
    <main style={{ backgroundColor: '#02091F', minHeight: '100vh', color: '#e2e8f0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section style={{ padding: '80px 24px 50px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: '#fff' }}>
          Generative Engine Optimization (GEO) for Car Dealerships: The Complete Guide
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 660, margin: '0 auto' }}>
          67% of automotive searches now trigger an AI-generated answer. GEO is how you get your dealership into those answers. Here's the complete playbook.
        </p>
      </section>

      {/* Key Takeaways */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ background: 'rgba(37,209,242,0.08)', border: '1px solid rgba(37,209,242,0.2)', borderRadius: 18, padding: 28 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#25D1F2', marginBottom: 16 }}>Key Takeaways</h2>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>GEO (Generative Engine Optimization) focuses on getting your dealership cited by AI models — not just ranking on search pages.</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Four AI engines matter most for dealerships: ChatGPT, Google Gemini, Google AI Overviews, and Perplexity.</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Traditional SEO fundamentals still matter, but GEO adds new requirements: structured data, entity consistency, multi-platform reviews, and citation diversity.</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Most dealerships haven't started GEO yet — early movers gain a compounding advantage.</li>
          </ul>
        </div>
      </section>

      {/* What is GEO */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          What Is GEO and Why It's Different from SEO
        </h2>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            Traditional SEO optimizes for search engine results pages — blue links, map packs, featured snippets. You rank #1, you get clicks. The model is straightforward: keywords, backlinks, technical health.
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            GEO optimizes for AI-generated answers. Instead of trying to rank a page, you're trying to get your dealership <em>cited</em> when an AI model answers a question. The AI doesn't show ten blue links — it generates a natural language response that names specific businesses. If you're not named, you're not considered.
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, margin: 0 }}>
            The key difference: SEO rewards pages. GEO rewards entities — your dealership as a real-world business with reviews, citations, content, and consistent signals across the web.
          </p>
        </div>
      </section>

      {/* 4 AI Engines */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          The 4 AI Engines That Matter for Dealerships
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {[
            { name: 'ChatGPT', desc: '200M+ weekly users. Pulls from web content, reviews, and business listings. Best for long-tail recommendation queries like "best used car dealer for Honda in Oakville."', signal: 'Reviews, GBP, content depth' },
            { name: 'Google Gemini', desc: 'Integrated into Google Search. Powers AI Overviews for billions of queries. The fastest-growing AI answer engine for local business queries.', signal: 'GBP, schema, E-E-A-T signals' },
            { name: 'Google AI Overviews', desc: 'Appears at the top of Google search results for 67% of automotive queries. Cites 3–5 sources per answer. If you\'re cited, you capture attention before any traditional result.', signal: 'Content quality, authority, freshness' },
            { name: 'Perplexity', desc: 'Fastest-growing AI search engine. Cites sources explicitly — your dealership name appears as a clickable reference. High-intent users who are actively researching.', signal: 'Citations, structured data, web presence' },
          ].map((engine) => (
            <div key={engine.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#25D1F2', marginBottom: 10 }}>{engine.name}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.65, marginBottom: 12, margin: '0 0 12px' }}>{engine.desc}</p>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Key signals: {engine.signal}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GEO vs SEO */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          GEO vs SEO: What Changes, What Stays the Same
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { same: 'Website quality and speed', change: 'Entity consistency replaces keyword density' },
            { same: 'Google Business Profile optimization', change: 'Multi-platform reviews beat backlinks' },
            { same: 'Mobile-first indexing', change: 'Structured data becomes critical (not optional)' },
            { same: 'Local SEO fundamentals (NAP, citations)', change: 'AI-specific content formats (FAQs, comparison pages)' },
            { same: 'Content freshness matters', change: 'Content depth and specificity matter more than volume' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: 4, textTransform: 'uppercase' }}>Still Matters</div>
                <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.93rem' }}>{item.same}</p>
              </div>
              <div style={{ background: 'rgba(37,209,242,0.06)', border: '1px solid rgba(37,209,242,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#25D1F2', marginBottom: 4, textTransform: 'uppercase' }}>New in GEO</div>
                <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.93rem' }}>{item.change}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10 GEO Tactics */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 32, color: '#fff' }}>
          10 Actionable GEO Tactics
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { num: '1', title: 'Add LocalBusiness + AutomotiveDealer schema', body: 'JSON-LD format on every page. Include NAP, hours, makes, services, geocoordinates. This is table stakes — 42% of dealerships don\'t have it.' },
            { num: '2', title: 'Complete every Google Business Profile field', body: 'Every. Single. One. Description, categories, attributes, photos, services, products. 94% of AI recommendations factor in GBP completeness.' },
            { num: '3', title: 'Build make/model landing pages', body: 'One page per brand you carry: "Toyota Dealer in [City]", "Honda Service Center [City]". Include inventory highlights, why-buy-here content, and local context.' },
            { num: '4', title: 'Create a comprehensive FAQ page', body: 'Answer the 20 questions your customers ask most. Financing, trade-ins, warranties, service intervals. Use natural language — write how people actually ask.' },
            { num: '5', title: 'Diversify reviews across 4+ platforms', body: 'Google, Cars.com, DealerRater, Yelp, Facebook. Dealerships on 5+ review platforms are 2.8× more likely to appear in AI answers.' },
            { num: '6', title: 'Publish monthly blog content', body: 'Answer real buyer questions. "Best time to buy a used SUV", "What to check before leasing". 3.7× more AI citations for consistent publishers.' },
            { num: '7', title: 'Ensure NAP consistency everywhere', body: 'Your name, address, and phone number must be identical across your website, GBP, social media, review sites, and directories. Even minor variations hurt.' },
            { num: '8', title: 'Claim profiles on every automotive platform', body: 'Cars.com, Edmunds, DealerRater, manufacturer dealer locators. Each is a citation AI models can reference.' },
            { num: '9', title: 'Add a detailed services page', body: 'List every service: oil changes, brake repair, tire rotation, financing, trade-ins, collision center. AI models need this content to recommend you for specific queries.' },
            { num: '10', title: 'Monitor your AI visibility monthly', body: 'Run AI visibility audits to track which engines are citing you and which aren\'t. Measure against competitors. What gets measured gets improved.' },
          ].map((item) => (
            <div key={item.num} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ minWidth: 36, height: 36, borderRadius: 10, background: 'rgba(37,209,242,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D1F2', fontWeight: 800, fontSize: '1rem' }}>{item.num}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>{item.title}</h3>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.65, margin: 0, paddingLeft: 50 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Measuring AI Visibility */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#fff' }}>
          How to Measure Your AI Visibility
        </h2>
        <div style={{ background: 'rgba(37,209,242,0.06)', border: '1px solid rgba(37,209,242,0.15)', borderRadius: 20, padding: 32 }}>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginBottom: 16 }}>
            VizBiz's AI Visibility Index (AVI) measures your dealership's presence across AI engines using a 0–100 score based on five pillars:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}><strong style={{ color: '#e2e8f0' }}>AI Presence</strong> — Are you cited in AI-generated answers for relevant queries?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}><strong style={{ color: '#e2e8f0' }}>Content Quality</strong> — Is the information AI provides about you accurate and complete?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}><strong style={{ color: '#e2e8f0' }}>Competitive Position</strong> — How do you rank against local competitors?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}><strong style={{ color: '#e2e8f0' }}>Consistency</strong> — Are you cited across all major AI engines?</li>
            <li style={{ color: '#cbd5e1', lineHeight: 1.6 }}><strong style={{ color: '#e2e8f0' }}>Momentum</strong> — Is your visibility growing over time?</li>
          </ul>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, marginTop: 16, marginBottom: 0 }}>
            We recommend monthly audits. The AI landscape changes quickly — a score that was strong in January may be weak by March if competitors are optimizing.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(37,209,242,0.08)', border: '1px solid rgba(37,209,242,0.2)', borderRadius: 20, padding: 48 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            Start With Your AI Visibility Audit
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
            Find out where your dealership stands across ChatGPT, Gemini, Google AI Overviews, and Perplexity — and get a prioritized fix list.
          </p>
          <a href="/" style={{ display: 'inline-block', background: '#25D1F2', color: '#fff', padding: '14px 36px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
            Get Your AI Visibility Audit →
          </a>
        </div>
      </section>
    </main>
  );
}
