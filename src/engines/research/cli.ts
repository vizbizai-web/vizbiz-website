#!/usr/bin/env tsx
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runAudit } from "./runner";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.name || !args.city) {
    console.error('Usage: npm run audit -- --name "Business" --city "City" --website "https://example.com" --type "auto_dealer" --make "Toyota"');
    process.exit(1);
  }

  const audit = await runAudit({
    name: args.name,
    city: args.city,
    websiteUrl: args.website,
    businessType: args.type ?? "auto_dealer",
    primaryMake: args.make,
    vehicle: args.vehicle,
    competitors: parseCompetitors(args.competitors),
    revenueAssumptions: parseRevenueAssumptions(args),
  });

  const outDir = args.outputDir ?? "./output/audits";
  await mkdir(outDir, { recursive: true });
  const filePath = path.join(outDir, `${audit.client.slug}-${audit.id}.json`);
  await writeFile(filePath, JSON.stringify(audit, null, 2));

  console.log(JSON.stringify({
    auditId: audit.id,
    client: audit.client.name,
    aviScore: audit.aviScore,
    band: audit.band,
    promptsAppeared: audit.promptsAppeared,
    promptsTotal: audit.promptsTotal,
    revenueOpportunity: audit.revenueOpportunity ? {
      monthlyGapVsTopTwoAverage: audit.revenueOpportunity.monthlyGapVsTopTwoAverage,
      annualGapVsTopTwoAverage: audit.revenueOpportunity.annualGapVsTopTwoAverage,
    } : null,
    output: filePath,
  }, null, 2));
}

function parseCompetitors(value?: string) {
  if (!value) return undefined;
  return value.split(",").map((item) => {
    const [name, score, ...websiteParts] = item.split(":");
    return { name: name?.trim(), aviScore: Number(score), websiteUrl: websiteParts.join(":").trim() || undefined };
  }).filter((competitor) => competitor.name && Number.isFinite(competitor.aviScore));
}

function parseRevenueAssumptions(args: Record<string, string>) {
  const monthlyUnitsSold = numberArg(args.monthlyUnits);
  const averageGrossPerVehicle = numberArg(args.avgGross);
  const aiInfluencedBuyerShare = numberArg(args.aiShare);
  const gamma = numberArg(args.gamma);
  if (!monthlyUnitsSold && !averageGrossPerVehicle && !aiInfluencedBuyerShare && !gamma) return undefined;
  return { monthlyUnitsSold, averageGrossPerVehicle, aiInfluencedBuyerShare, gamma };
}

function numberArg(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
