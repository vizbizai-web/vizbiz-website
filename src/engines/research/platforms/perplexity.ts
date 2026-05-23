import type { PromptTemplate } from "../types";

const DEFAULT_SONAR_MODEL = "sonar";

export async function queryPerplexitySonar(prompt: PromptTemplate): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return fallbackResponse(prompt.prompt);

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL ?? DEFAULT_SONAR_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Answer as a neutral AI-search assistant for local business discovery. Name specific businesses only when supported by public web evidence. Include concise reasoning and prioritize sources/citations when available. Keep the answer under 220 words.",
        },
        { role: "user", content: prompt.prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Perplexity Sonar ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };
  const answer = data.choices?.[0]?.message?.content ?? "";
  const citations = (data.citations ?? []).filter(Boolean);
  if (!citations.length) return answer;
  return `${answer}\n\nSources:\n${citations.map((citation) => `- ${citation}`).join("\n")}`;
}

function fallbackResponse(prompt: string) {
  return `No automated Perplexity Sonar result was available for "${prompt}" because PERPLEXITY_API_KEY is not configured. Record this as an unscored AI-search evidence fallback, not a guessed recommendation.`;
}
