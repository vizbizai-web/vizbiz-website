#!/usr/bin/env tsx
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateFixPackage } from "./pipeline";
import type { AuditReport } from "@/engines/research/types";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.audit) {
    console.error("Usage: npm run fix -- --audit path/to/audit.json --output-dir ./output/fixes");
    process.exit(1);
  }

  const audit = JSON.parse(await readFile(args.audit, "utf8")) as AuditReport;
  const fixPackage = generateFixPackage(audit);
  const outDir = args.outputDir ?? `./output/fixes/${audit.client.slug}`;
  await mkdir(outDir, { recursive: true });

  for (const [fileName, content] of Object.entries(fixPackage.assets)) {
    await writeFile(path.join(outDir, fileName), content);
  }
  await writeFile(path.join(outDir, "fix-package.json"), JSON.stringify(fixPackage, null, 2));

  console.log(JSON.stringify({ fixPackageId: fixPackage.id, files: Object.keys(fixPackage.assets), outputDir: outDir }, null, 2));
}

function parseArgs(argv: string[]) {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2).replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    parsed[key] = argv[index + 1];
    index += 1;
  }
  return parsed;
}
