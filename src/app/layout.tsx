import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import "./globals.css";
import SchemaMarkup from "@/components/SchemaMarkup";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const poppins = Poppins({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const lora = Lora({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  verification: {
    google: "UsciMz9QyGJczouaUP3mPrVVWUlGnTLQkU9EOQiMDF8",
  },
  title: "VizBiz — AI Visibility Intelligence for Local Businesses",
  description:
    "VizBiz helps local businesses measure and improve how often they appear in AI-powered search results like ChatGPT, Google AI Overviews, Gemini, and Perplexity. Get your free AI visibility mini report.",
  keywords:
    "AI visibility for local businesses, AI search visibility, ChatGPT visibility, Google AI Overviews, Gemini, Perplexity, AI visibility report, local SEO, schema markup, llms.txt, competitor benchmarking",
  alternates: {
    canonical: "https://vizbiz.ai",
  },
  openGraph: {
    title: "VizBiz — AI Visibility Intelligence for Local Businesses",
    description:
      "See whether AI recommends your business or your two closest competitors. Free AI visibility mini report.",
    type: "website",
    url: "https://vizbiz.ai",
    siteName: "VizBiz.ai",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${lora.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <SchemaMarkup />
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', {
              send_page_view: true
            });
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
