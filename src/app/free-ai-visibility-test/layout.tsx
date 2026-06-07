import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Visibility Snapshot Intake | VizBiz.ai",
  description:
    "Request an AI visibility snapshot to see whether your business is clear, trusted, and recommendation-ready across popular AI search assistants.",
  alternates: {
    canonical: "https://vizbiz.ai/intake/",
  },
};

export default function FreeAiVisibilityTestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
