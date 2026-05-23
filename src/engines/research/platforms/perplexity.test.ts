import { afterEach, describe, expect, it, vi } from "vitest";
import { queryPerplexitySonar } from "./perplexity";
import type { PromptTemplate } from "../types";

const prompt: PromptTemplate = {
  id: "sonar-1",
  category: "discovery",
  platform: "perplexity",
  prompt: "best dentist in Oakville",
  weight: 0.3,
};

describe("queryPerplexitySonar", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns an unscored fallback when PERPLEXITY_API_KEY is missing", async () => {
    vi.stubEnv("PERPLEXITY_API_KEY", "");

    const result = await queryPerplexitySonar(prompt);

    expect(result).toContain("No automated Perplexity Sonar result was available");
    expect(result).toContain("best dentist in Oakville");
  });

  it("calls Sonar through the Perplexity chat completions API and includes citations", async () => {
    vi.stubEnv("PERPLEXITY_API_KEY", "pplx_test");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Oakville Dental is often recommended. Lakeshore Dental is another option." } }],
        citations: ["https://example.com/oakville-dental", "https://example.com/lakeshore-dental"],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await queryPerplexitySonar(prompt);

    expect(fetchMock).toHaveBeenCalledWith("https://api.perplexity.ai/chat/completions", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ authorization: "Bearer pplx_test" }),
    }));
    expect(result).toContain("Oakville Dental is often recommended");
    expect(result).toContain("Sources:");
    expect(result).toContain("https://example.com/oakville-dental");
  });
});
