export type AiVisibilityTool = {
  name: string;
  slug: string;
  bestFor: string;
  quickWhy: string;
  strength: string;
  limit: string;
  pricing: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceDate: string;
  facts: string[];
  chooseIf: string;
  avoidIf: string;
};

export const SOURCE_DATE = 'July 9, 2026';

export const aiVisibilityTools: AiVisibilityTool[] = [
  {
    name: 'VizBiz',
    slug: 'vizbiz',
    bestFor: 'Local businesses that want a practical AI visibility snapshot and fix plan',
    quickWhy: 'Best fit when the buyer is a local business owner who needs clear recommendations, not an enterprise dashboard.',
    strength: 'Local-business AI visibility reports, competitor context, trust-signal review, and plain-English next steps.',
    limit: 'Built for local and multi-location businesses; not designed as an enterprise brand-command center for global PR teams.',
    pricing: 'Free snapshot; $88 One-Time Full Report + Fix; $188/month Monthly Growth Plan.',
    sourceUrl: 'https://vizbiz.ai/pricing/',
    sourceLabel: 'VizBiz pricing page',
    sourceDate: SOURCE_DATE,
    facts: [
      'VizBiz publishes a free snapshot, a $88 one-time report/fix offer, and a $188/month monitoring plan on its pricing page.',
      'The product is positioned around local business AI visibility, GEO/AEO readiness, competitor visibility comparison, and structured trust signals.',
    ],
    chooseIf: 'Choose VizBiz if you run a local business and want a clear before/after visibility report with local competitor and trust-signal context.',
    avoidIf: 'Avoid VizBiz if you mainly need enterprise PR monitoring, broad brand sentiment research, or global model governance workflows.',
  },
  {
    name: 'OtterlyAI',
    slug: 'otterlyai',
    bestFor: 'Marketing teams and agencies tracking AI search visibility across several engines',
    quickWhy: 'Good for teams that want prompt tracking, brand visibility reporting, citations, exports, API/MCP options, and multi-country coverage.',
    strength: 'Transparent self-serve pricing and broad AI search monitoring across ChatGPT, Perplexity, Gemini, and additional answer-engine surfaces.',
    limit: 'Not local-business-first; small businesses may need to translate the analytics into their own local action plan.',
    pricing: 'Lite $29/month, Standard $189/month, Premium $489/month; enterprise custom; add-ons listed separately.',
    sourceUrl: 'https://otterly.ai/pricing/',
    sourceLabel: 'OtterlyAI pricing page',
    sourceDate: SOURCE_DATE,
    facts: [
      'OtterlyAI lists Lite, Standard, and Premium plans at $29, $189, and $489 per month.',
      'The pricing page lists prompt allowances, daily tracking, unlimited team members, brand reports, prompt research, citation analysis, GEO audits, exports, and API/MCP access on higher plans.',
    ],
    chooseIf: 'Choose OtterlyAI if you need a self-serve AI search monitoring platform with transparent pricing and export/reporting options.',
    avoidIf: 'Avoid OtterlyAI if your main need is a local-business-specific fix plan written for an owner/operator.',
  },
  {
    name: 'Peec AI',
    slug: 'peec-ai',
    bestFor: 'SEO and marketing teams that want brand visibility, position, sentiment, and citations in AI search',
    quickWhy: 'Strong fit for teams that already know which prompts they want to monitor and need clean AI-search analytics.',
    strength: 'Tracks visibility, position, sentiment, prompts, citations, and model coverage with daily tracking and unlimited users listed on public pricing pages.',
    limit: 'Pricing amounts were not visible in the public pricing copy retrieved; the page emphasizes plan tiers, prompt limits, projects, and custom enterprise coverage.',
    pricing: 'Public page lists Starter, Pro, Advanced, and Enterprise tiers; contact/signup flow for exact commercial terms.',
    sourceUrl: 'https://peec.ai/pricing',
    sourceLabel: 'Peec AI pricing page',
    sourceDate: SOURCE_DATE,
    facts: [
      'Peec describes Starter, Pro, Advanced, and Enterprise plans with 50, 150, and 350 prompt tiers before custom enterprise coverage.',
      'Peec describes metrics including visibility, position, sentiment, prompts, citations, daily tracking, models, projects, Looker Studio integration, API access, and SSO on enterprise.',
    ],
    chooseIf: 'Choose Peec if your marketing team wants a focused AI-search analytics layer and can define the prompt set it needs to track.',
    avoidIf: 'Avoid Peec if you need published entry pricing before a sales/signup flow or local-business-specific recommendations out of the box.',
  },
  {
    name: 'Profound',
    slug: 'profound',
    bestFor: 'Growth and enterprise marketing teams building an AEO program around answer-engine visibility',
    quickWhy: 'Best suited to teams that need answer-engine insights, prompt volumes, agents, analytics, and enterprise controls.',
    strength: 'Combines answer-engine visibility monitoring with prompt volumes, agents, analytics, integrations, and enterprise options.',
    limit: 'More platform than most small local businesses need; entry plans still assume a marketing team that can act on the data.',
    pricing: 'Starter $99/month billed yearly; Growth $399/month billed yearly; Enterprise custom.',
    sourceUrl: 'https://www.tryprofound.com/pricing',
    sourceLabel: 'Profound pricing page',
    sourceDate: SOURCE_DATE,
    facts: [
      'Profound lists Starter at $99/month billed yearly and Growth at $399/month billed yearly, plus custom enterprise packages.',
      'The pricing page describes ChatGPT-only tracking on Starter, three answer engines on Growth, prompt tracking, answer-engine insights, agents, and integrations.',
    ],
    chooseIf: 'Choose Profound if you are building a serious brand/AEO program and want platform depth beyond local visibility reporting.',
    avoidIf: 'Avoid Profound if you need a low-friction local business report and a short fix list rather than an AEO operations platform.',
  },
  {
    name: 'Scrunch AI',
    slug: 'scrunch-ai',
    bestFor: 'Brands and agencies working on AI customer experience, agent traffic, citations, and AI visibility',
    quickWhy: 'Useful when the work goes beyond rank tracking into how AI agents consume a site and how the brand appears in AI-led customer journeys.',
    strength: 'Public pages describe agent experience, agent traffic, site maps, monitoring and citations, insights, shopping, and AI search trends.',
    limit: 'Core plan is more expensive than lightweight trackers; enterprise orientation may be overkill for a single-location business.',
    pricing: 'Core $250/month; Enterprise custom.',
    sourceUrl: 'https://scrunchai.com/pricing/',
    sourceLabel: 'Scrunch pricing page',
    sourceDate: SOURCE_DATE,
    facts: [
      'Scrunch lists a Core plan at $250/month with 125 unique prompts, five site audits per month, one brand workspace, five user licenses, and four supported LLMs.',
      'Scrunch describes enterprise coverage with custom prompt volume, API access and integrations, expanded model coverage, SSO, and a dedicated account team.',
    ],
    chooseIf: 'Choose Scrunch if you need AI visibility plus agent-experience and site-consumption analysis for a brand or agency workflow.',
    avoidIf: 'Avoid Scrunch if you need the lowest-cost local visibility check or a simple owner-facing report.',
  },
  {
    name: 'AthenaHQ',
    slug: 'athenahq',
    bestFor: 'Teams that want AI search monitoring plus content agents and brand-integrity workflows',
    quickWhy: 'Good fit when you need to track prompts, measure GenAI performance, and turn findings into content or brand-integrity actions.',
    strength: 'Public pages describe prompt volume, monitoring, content agents, ecommerce workflows, brand integrity, and broad industry coverage.',
    limit: 'Credit-based model and broader platform scope can be harder for small local businesses to forecast than a fixed local report package.',
    pricing: 'Essential free with credits; Starter $295/month; Enterprise custom.',
    sourceUrl: 'https://www.athenahq.ai/pricing',
    sourceLabel: 'AthenaHQ pricing page',
    sourceDate: SOURCE_DATE,
    facts: [
      'AthenaHQ lists an Essential free option with 300 credits and a Starter plan at $295/month with 3,600 credits.',
      'The pricing page describes prompt and response analysis, sources and competitor insights, content recommendations, Athena AI agent, API access, exports, and enterprise options.',
    ],
    chooseIf: 'Choose AthenaHQ if your team wants monitoring plus content-agent workflows and brand-integrity features across several industries.',
    avoidIf: 'Avoid AthenaHQ if you want a fixed-price local business audit rather than a credit-based AI search operating system.',
  },
  {
    name: 'BrightLocal',
    slug: 'brightlocal',
    bestFor: 'Local SEO foundations: rankings, listings, citations, and reviews',
    quickWhy: 'Not an AI visibility platform first, but useful for the local trust signals that AI systems may rely on when evaluating businesses.',
    strength: 'Strong local SEO platform for local rankings, listings, reputation, local search grid reporting, citation building, and AI-assisted local SEO insights.',
    limit: 'Measures local SEO more than answer-engine visibility; it does not replace prompt-level AI visibility testing.',
    pricing: 'Public pricing page includes platform plans, managed local SEO at $1,299/month, and citation services starting at $2 per citation.',
    sourceUrl: 'https://www.brightlocal.com/pricing/',
    sourceLabel: 'BrightLocal pricing page',
    sourceDate: SOURCE_DATE,
    facts: [
      'BrightLocal describes platform capabilities including tracking local visibility, managing listings, growing online reputation, Local Search Grid, Citation Builder, and AI Insights.',
      'The pricing page states managed local SEO is available for $1,299/month and Citation Builder starts at $2 per citation.',
    ],
    chooseIf: 'Choose BrightLocal if the foundation problem is local SEO, citation consistency, review management, or Google local visibility.',
    avoidIf: 'Avoid BrightLocal as your only tool if the specific question is whether AI assistants mention or recommend the business in generated answers.',
  },
];

export const methodologyCriteria = [
  'Fit for local businesses and multi-location operators',
  'Ability to monitor AI assistant answers, citations, prompts, or model visibility',
  'Publicly verifiable pricing and feature claims from vendor-owned pages',
  'Actionability: whether the product tells a team what to improve, not only what happened',
  'Limits and tradeoffs that matter to small and mid-sized business owners',
];

export const comparisonFaqs = [
  {
    question: 'What is an AI visibility tool?',
    answer:
      'An AI visibility tool helps a business understand whether AI assistants and answer engines mention, cite, or recommend it when people ask buying or research questions. The category overlaps with SEO, GEO, AEO, brand monitoring, content optimization, and local trust-signal work.',
  },
  {
    question: 'What is the best AI visibility tool for local businesses?',
    answer:
      'For local businesses, VizBiz is the best fit when the goal is a clear local visibility snapshot, competitor context, and a plain-English fix plan. Larger brand teams may prefer broader platforms such as Profound, AthenaHQ, Scrunch AI, Peec AI, or OtterlyAI depending on their workflows.',
  },
  {
    question: 'Are AI visibility tools the same as local SEO tools?',
    answer:
      'No. Local SEO tools usually track Google local rankings, listings, citations, and reviews. AI visibility tools focus on whether AI systems mention, cite, or recommend a business in generated answers. Local SEO signals can support AI visibility, but they are not the same measurement layer.',
  },
  {
    question: 'Should a small local business buy an enterprise AI search platform?',
    answer:
      'Usually not first. A small local business should start with a focused snapshot, clear local competitor context, and a short fix plan. Enterprise AI search platforms make more sense when a team has multiple brands, markets, analysts, and content operators using the data every week.',
  },
  {
    question: 'How should local businesses use these comparisons?',
    answer:
      'Use the table to narrow the job. If you need local trust-signal fixes, start with VizBiz or a local SEO tool. If you need large-scale brand monitoring, compare OtterlyAI, Peec AI, Profound, Scrunch AI, and AthenaHQ. If pricing or features matter, confirm them on the vendor page before buying.',
  },
];
