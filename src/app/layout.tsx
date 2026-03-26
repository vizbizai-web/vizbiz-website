import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SchemaMarkup from "@/components/SchemaMarkup";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  verification: {
    google: "UsciMz9QyGJczouaUP3mPrVVWUlGnTLQkU9EOQiMDF8",
  },
  title: "VizBiz | AI Visibility Intelligence for Automotive Retailers",
  description:
    "VizBiz helps dealerships understand how they show up in AI-driven search, compare local visibility, and identify the next moves to improve discovery.",
  keywords:
    "AI visibility, automotive retailers, dealerships, AI-driven search, dealership marketing, ChatGPT, Gemini, Perplexity, competitor visibility",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "VizBiz | AI Visibility Intelligence for Automotive Retailers",
    description:
      "VizBiz helps dealerships understand how they show up in AI-driven search and what to improve next.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <SchemaMarkup />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
