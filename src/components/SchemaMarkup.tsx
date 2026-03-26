import Script from 'next/script';

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VizBiz.ai",
    "alternateName": "VizBiz AI Visibility Solutions",
    "url": "https://vizbiz.ai",
    "logo": "https://vizbiz.ai/logo.png",
    "description": "AI Visibility Intelligence for car dealerships. We help dealers optimize for ChatGPT, Google AI Overviews, and generative search platforms.",
    "foundingDate": "2025",
    "founders": [
      {
        "@type": "Person",
        "name": "Alex Vizireanu"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Oakville",
      "addressRegion": "ON",
      "addressCountry": "CA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Sales",
      "email": "hello@vizbiz.ai",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/vizbizai",
      "https://twitter.com/vizbizai"
    ],
    "knowsAbout": [
      "AI Visibility",
      "Generative Engine Optimization",
      "ChatGPT Optimization",
      "Google AI Overviews",
      "Car Dealership Marketing",
      "Local SEO",
      "Schema Markup"
    ],
    "serviceType": "AI Visibility Audit and Optimization",
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "VizBiz.ai",
    "description": "AI Visibility Intelligence solutions for car dealerships",
    "url": "https://vizbiz.ai",
    "telephone": "+1-XXX-XXX-XXXX",
    "email": "hello@vizbiz.ai",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Oakville",
      "addressRegion": "ON",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "43.4675",
      "longitude": "-79.6877"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "$$",
    "foundingDate": "2025",
    "sameAs": [
      "https://www.linkedin.com/company/vizbizai",
      "https://twitter.com/vizbizai"
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "AI Visibility Intelligence",
    "provider": {
      "@type": "Organization",
      "name": "VizBiz.ai",
      "url": "https://vizbiz.ai"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Visibility Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AVI Score Audit",
            "description": "Comprehensive AI visibility assessment measuring your Presence, Authority, Sentiment, Content, and Technical factors across ChatGPT, Google AI, and Perplexity."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Visibility Optimization",
            "description": "Monthly optimization service to improve your AVI Score through schema implementation, content creation, review management, and authority building."
          }
        }
      ]
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is an AI visibility audit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An AI visibility audit is a comprehensive analysis of how visible your dealership is across AI platforms like ChatGPT, Google AI Overviews, and Perplexity. It measures your presence, authority, sentiment, content, and technical factors that influence AI recommendations."
        }
      },
      {
        "@type": "Question",
        "name": "What is the AVI Score?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The AVI Score (AI Visibility Index) is a 0-100 metric that measures your dealership's AI visibility. It evaluates five pillars: Presence (20 points), Authority (25 points), Sentiment (20 points), Content (20 points), and Technical (15 points)."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to improve AI visibility?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With focused effort, you can see initial improvements in 30 days. Significant results typically take 60-90 days. AI visibility is cumulative—the work you do today compounds over time."
        }
      },
      {
        "@type": "Question",
        "name": "Is AI visibility different from SEO?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Traditional SEO focuses on ranking web pages in search results. AI visibility focuses on being mentioned in AI-generated responses. While there's overlap, AI visibility requires additional strategies like entity optimization, schema markup, and conversational content."
        }
      }
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VizBiz.ai",
    "url": "https://vizbiz.ai",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vizbiz.ai/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="schema-localbusiness"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Script
        id="schema-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
