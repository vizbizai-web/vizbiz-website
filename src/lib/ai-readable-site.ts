const siteUrl = "https://vizbiz.ai";

const industries = ["dentists", "roofers", "med spas", "lawyers", "HVAC companies", "plumbers", "clinics", "other local service businesses"];

export const aiReadableSite = {
  siteUrl,
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VizBiz.ai",
    alternateName: "VizBiz AI Visibility Intelligence",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description:
      "VizBiz.ai creates local AI visibility reports for small and local businesses. The platform shows whether popular AI systems such as ChatGPT, Gemini, Claude, Google AI, and AI-powered search are more likely to recommend a business or its nearby competitors in a town, city, ZIP code, or postal code.",
    foundingDate: "2025",
    founder: { "@type": "Person", name: "Alex Vizireanu" },
    email: "hello@vizbiz.ai",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Oakville",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    areaServed: [{ "@type": "Place", name: "Worldwide" }],
    knowsAbout: [
      "AI visibility for local businesses",
      "AI visibility for small businesses",
      "Generative engine optimization",
      "AI search optimization",
      "Local SEO",
      "Schema markup",
      "llms.txt",
      "Competitor benchmarking",
      "Google Business Profile optimization",
      "Review signal analysis",
      "Local Community Domination for town and city markets",
      "Service/city pages",
      "Review syndication",
      "Brand-search protection",
    ],
  },
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "VizBiz.ai",
    url: siteUrl,
    email: "hello@vizbiz.ai",
    telephone: "+1-416-890-2469",
    priceRange: "$$$",
    description:
      "AI visibility audits, mini reports, fix packages, and monthly nearby competitor monitoring for small and local businesses worldwide.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Oakville",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: "43.4675", longitude: "-79.6877" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
  },
  service: {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Local AI Visibility Intelligence reports for small businesses",
    serviceType: "AI visibility audit and optimization",
    provider: { "@type": "Organization", name: "VizBiz.ai", url: siteUrl },
    areaServed: [{ "@type": "Place", name: "Worldwide" }],
    audience: {
      "@type": "BusinessAudience",
      audienceType: industries.join(", "),
    },
    description:
      "VizBiz benchmarks a small/local business against two nearby competitors, checks buyer-intent AI prompts, detects website and schema gaps, and turns the findings into a report, Local Community Domination Plan, service/city page roadmap, review syndication plan, brand-search protection checks, and local visibility fix plan.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "VizBiz AI visibility offers",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Free local AI visibility mini report",
            description:
              "A website-first mini report that detects the business niche, checks local AI recommendation visibility, benchmarks two nearby competitors, and shows the strongest visibility gaps.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "One-Time Full Report + Fix — $88 USD",
            description:
              "A deeper AI visibility report with AI-answer evidence, competitor breakdowns, schema and content recommendations, and deployable fixes for $88 USD one-time.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Monthly Full Report Growth Plan — $188 USD/month",
            description:
              "Ongoing monitoring of AI recommendations, nearby competitor movement, website readiness, local entity signals, and monthly action planning for $188 USD per month.",
          },
        },
      ],
    },
  },
  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an AI visibility report?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An AI visibility report shows whether AI systems and AI-assisted search tools are likely to recommend your business when local buyers ask who to trust, where to go, or which provider to choose in their town, city, ZIP code, or postal code.",
        },
      },
      {
        "@type": "Question",
        name: "Who is VizBiz.ai for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `VizBiz.ai is built for small and local businesses such as ${industries.slice(0, 7).join(", ")}.`,
        },
      },
      {
        "@type": "Question",
        name: "Why does VizBiz ask for two competitors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Two nearby competitors make the benchmark more accurate. VizBiz compares your website, local entity signals, content, schema, and AI prompt visibility against the businesses local customers already compare you with.",
        },
      },
      {
        "@type": "Question",
        name: "How is AI visibility different from SEO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SEO focuses on ranking pages. AI visibility focuses on whether AI systems can identify, trust, and recommend the business as an answer. The two overlap, but AI visibility also depends on entity clarity, third-party evidence, schema, reviews, and answer-ready service content.",
        },
      },
    ],
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VizBiz.ai",
    url: siteUrl,
    description: "Free local AI visibility mini reports and paid AI visibility fix packages for small and local businesses.",
    inLanguage: "en-CA",
  },
  llmsTxt: `# VizBiz.ai

VizBiz.ai provides local AI visibility reports for small and local businesses.

## What VizBiz does
VizBiz checks whether popular AI systems such as ChatGPT, Gemini, Claude, Google AI, and AI-powered search are likely to recommend a business or its nearby local competitors.

## Primary audience
Small and local service businesses worldwide, including dentists, med spas, clinics, lawyers, HVAC companies, plumbers, roofers, and other owner-led local businesses that want to become more visible in their town, city, ZIP code, or postal code.

## Main offer
Free local AI visibility mini report: a website-first AI visibility preview for AI SEO, local AI search optimization, ChatGPT local business recommendations, and Google AI Overview local SEO. The user enters a business website, town/city/ZIP/postal code, email, optional service or niche, and two nearby competitors. VizBiz detects the niche, builds buyer-intent prompt clusters, benchmarks the business against competitors, and shows the strongest local visibility gaps.

## Paid offers
- One-Time Full Report + Fix: $88 USD
- Monthly Full Report Growth Plan: $188 USD/month

## Signals VizBiz analyzes
Website copy, service pages, service/city pages, schema markup, local entity clarity, reviews, review syndication opportunities, Google Business Profile signals, third-party mentions, brand-search protection prompts, buyer-intent prompts, and competitor visibility.

## Contact
Website: https://vizbiz.ai
Email: hello@vizbiz.ai
Phone: +1-416-890-2469
Location: Oakville, Ontario, Canada
`,
  sitemapUrls: [`${siteUrl}/`, `${siteUrl}/llms.txt`, `${siteUrl}/sitemap.xml`],
};

export type AiReadableSite = typeof aiReadableSite;
