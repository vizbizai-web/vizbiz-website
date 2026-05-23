import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const staleSeedTerms = [
  "Client Portal v1.0",
  "Auto Transport Brokerage MVP",
  "2026-02",
  "Feb 28",
  "Content Engine Automation",
];

describe("Mission Control seed content", () => {
  it("does not preserve stale February/demo operating data in source seeds", () => {
    const dbSource = readFileSync("src/app/mission-control/lib/db.ts", "utf8");
    const initSql = readFileSync("src/app/mission-control/data/init.sql", "utf8");
    const combined = `${dbSource}\n${initSql}`;

    for (const term of staleSeedTerms) {
      expect(combined).not.toContain(term);
    }
  });
});
