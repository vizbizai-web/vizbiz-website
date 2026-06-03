import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/audit/run deprecated sync route", () => {
  it("does not import or call the old synchronous runAudit pipeline", async () => {
    const source = await readFile(new URL("./route.ts", import.meta.url), "utf8");

    expect(source).not.toContain("runAudit");
    expect(source).not.toContain("@/engines/research/runner");
    expect(source).not.toContain("saveJson(\"audits\"");
  });

  it("returns a clear deprecation response instead of a completed audit report", async () => {
    const response = await POST(new Request("https://vizbiz.ai/api/audit/run", {
      method: "POST",
      body: JSON.stringify({ name: "Lakeshore Dental", city: "Oakville" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body).toMatchObject({
      status: "deprecated",
      code: "sync_audit_route_deprecated",
      replacement: "/api/mini-audit/run",
    });
    expect(body).not.toHaveProperty("aviScore");
    expect(body).not.toHaveProperty("promptsAppeared");
  });
});
