import type { PromptTemplate } from "../types";

export async function queryTavily(prompt: PromptTemplate): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return fallbackResponse(prompt.prompt);

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query: prompt.prompt, search_depth: "basic", max_results: 5 }),
  });
  if (!response.ok) throw new Error(`Tavily ${response.status}: ${await response.text()}`);
  const data = await response.json() as { answer?: string; results?: Array<{ title?: string; content?: string }> };
  return data.answer || (data.results ?? []).map((item) => `${item.title ?? ""}: ${item.content ?? ""}`).join("\n");
}

function fallbackResponse(prompt: string) {
  return `No automated Tavily result was available for "${prompt}" because TAVILY_API_KEY is not configured. Record this as an unscored platform fallback, not a guessed recommendation.`;
}
