import type { PromptTemplate } from "../types";

export async function queryOpenAI(prompt: PromptTemplate): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return `No automated OpenAI result was available for "${prompt.prompt}" because OPENAI_API_KEY is not configured. Record this as an unscored platform fallback, not a guessed recommendation.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "Answer as a neutral local search assistant. Name specific businesses only when supported by common public signals. Keep the answer under 200 words." },
        { role: "user", content: prompt.prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}
