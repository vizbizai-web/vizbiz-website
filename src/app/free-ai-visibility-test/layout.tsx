import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Visibility Test | VizBiz.ai",
  description:
    "Run a free AI visibility test to see whether your business is clear, trusted, and recommendation-ready across popular AI search assistants.",
  alternates: {
    canonical: "https://vizbiz.ai/free-ai-visibility-test/",
  },
};

export default function FreeAiVisibilityTestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
