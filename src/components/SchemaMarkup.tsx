import Script from 'next/script';

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VizBiz.ai",
    "alternateName": "VizBiz AI Visibility Solutions",
    "url": "https://vizbiz.ai",
    "logo": "https://vizbiz.ai/logo.png",
    "description": "VizBiz is an AI visibility intelligence company for car dealerships. We help dealers understand, improve, and track how they appear in ChatGPT, Google AI Overviews, Gemini, Perplexity, and other AI-driven search experiences.",
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
    "serviceType": "AI Visibility Intelligence for Car Dealerships",
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "VizBiz.ai",
    "description": "AI visibility intelligence for car dealerships, including audit, measurement, and optimization work.",
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
    "serviceType": "AI Visibility Intelligence for Car Dealerships",
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
            "name": "AI Visibility Audit for Car Dealerships",
            "description": "A dealership-focused AI visibility assessment showing how your business appears across ChatGPT, Google AI Overviews, Gemini, and Perplexity, where competitors are winning, and what to improve next."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Visibility Optimization for Car Dealerships",
            "description": "Ongoing improvement work to strengthen the entity, content, trust, and technical signals that influence how AI systems recommend dealerships."
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
          "text": "The AVI Score (AI Visibility Index) is VizBiz's scoring framework for measuring how visible a dealership is across AI-driven search. It is designed to show where a dealership appears, where it does not, and which visibility factors need work next."
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
