import type { Metadata, Viewport } from "next";
import { Lora, Poppins } from "next/font/google";
import "./globals.css";
import BackToTopButton from "@/components/BackToTopButton";
import SchemaMarkup from "@/components/SchemaMarkup";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vizbiz.ai"),
  title: "VizBiz.ai - Local AI Visibility Reports for Small Businesses",
  description:
    "Run a free local AI visibility report. VizBiz compares your small/local business against two nearby competitors and shows whether AI systems recommend you in your town, city, ZIP code, or postal code.",
  keywords: [
    "AI visibility reports",
    "small business AI visibility",
    "local business AI visibility",
    "generative engine optimization",
    "ChatGPT business recommendations",
    "AI search optimization",
    "AVI score",
    "local SEO",
    "schema markup",
    "llms.txt",
    "competitor benchmarking",
    "AI SEO for local businesses",
    "local AI search optimization",
    "ChatGPT local business recommendations",
    "Google AI Overview local SEO",
    "AI visibility audit",
    "local community domination",
    "service city pages",
    "review syndication",
    "brand search protection",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VizBiz.ai - Local AI Visibility Reports for Small Businesses",
    description: "See whether AI recommends your business or the nearby competitors customers already compare you with.",
    url: "https://vizbiz.ai/",
    siteName: "VizBiz.ai",
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "VizBiz.ai - Local AI Visibility Reports for Small Businesses",
    description: "Free local AI visibility reports for small businesses that want to know if AI recommends them or nearby competitors.",
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
      </head>
      <body className="antialiased">
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
