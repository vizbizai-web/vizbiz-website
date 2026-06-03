import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/fix-engine/run deprecated sync route", () => {
  it("does not import or call the old synchronous fix generation pipeline", async () => {
    const source = await readFile(new URL("./route.ts", import.meta.url), "utf8");

    expect(source).not.toContain("generateFixPackage");
    expect(source).not.toContain("@/engines/fix/pipeline");
    expect(source).not.toContain("saveJson(\"fix-packages\"");
  });

  it("returns a clear deprecation response instead of a generated fix package", async () => {
    const response = await POST(new Request("https://vizbiz.ai/api/fix-engine/run", {
      method: "POST",
      body: JSON.stringify({ auditId: "audit_123" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body).toMatchObject({
      status: "deprecated",
      code: "sync_fix_route_deprecated",
      replacement: "paid intake queue + report worker",
    });
    expect(body).not.toHaveProperty("assets");
    expect(body).not.toHaveProperty("implementationChecklist");
  });
});
