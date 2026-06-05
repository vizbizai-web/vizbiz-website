/**
 * VizBiz Rerun Worker — Background Execution
 * 
 * Production-grade background worker that processes queued reruns.
 * Runs on the Mac mini via cron or manual invocation.
 * 
 * Usage:
 *   npx ts-node scripts/rerun-worker.ts [--once] [--leadId=<id>]
 * 
 * Options:
 *   --once      Process one lead and exit (cron mode)
 *   --leadId    Process specific lead only
 *   --continuous Run forever, processing every 5 minutes (daemon mode)
 */

import { getLeadsByStatus, updateLeadResearchResults, getLeadByLeadId } from "../src/lib/google-sheets";
import { preflightScan } from "../src/lib/preflight-engine";
import { runResearch } from "../src/lib/research-runner";

const args = process.argv.slice(2);
const runOnce = args.includes("--once");
const leadIdArg = args.find(a => a.startsWith("--leadId="))?.split("=")[1];
const continuous = args.includes("--continuous");

async function processOneLead(lead: any): Promise<{ success: boolean; duration: number; error?: string }> {
  const startTime = Date.now();
  console.log(`\n[${new Date().toISOString()}] Processing: ${lead.leadId} (${lead.dealershipName})`);
  
  try {
    // Mark as processing
    await updateLeadResearchResults(lead.leadId, {
      status: "rerun_processing",
      notes: `Rerun started at ${new Date().toISOString()}`,
    });

    // Step 1: Preflight
    console.log(`  → Step 1: Preflight scan (${lead.website}, ${lead.city})`);
    const preflight = await preflightScan(lead.website, lead.city);
    console.log(`    ✓ Niche: ${preflight.niche}, Confidence: ${preflight.nicheConfidence}/100`);

    // Step 2: Research
    console.log(`  → Step 2: AI visibility research`);
    const result = await runResearch(
      lead.dealershipName,
      lead.website,
      lead.city,
      lead.competitor ? lead.competitor.split(",").map((c: string) => c.trim()).filter(Boolean) : [],
      preflight,
      { tier: "free", competitorMode: "client_only" }
    );

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`    ✓ Appeared: ${result.appearedCount}/${result.totalPrompts}, Band: ${result.statusBand}`);

    // Save results
    const researchJson = JSON.stringify({
      ...result,
      processedAt: new Date().toISOString(),
      durationSeconds: duration,
      isRerun: true,
    });

    await updateLeadResearchResults(lead.leadId, {
      status: "rerun_completed",
      researchStatus: "complete",
      snapshotAppeared: `${result.appearedCount} of ${result.totalPrompts} prompts`,
      visibilityBand: result.statusBand,
      serviceVisibility: result.serviceVisibility,
      notes: `RESEARCH_DATA:${researchJson}`,
    });

    console.log(`  ✅ Completed in ${duration}s`);
    return { success: true, duration };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.error(`  ❌ Failed after ${duration}s: ${errorMsg}`);
    
    await updateLeadResearchResults(lead.leadId, {
      status: "rerun_failed",
      notes: `Rerun failed at ${new Date().toISOString()}. Error: ${errorMsg}. Duration: ${duration}s`,
    });

    return { success: false, duration, error: errorMsg };
  }
}

async function main() {
  console.log("=== VizBiz Rerun Worker ===");
  console.log(`Mode: ${runOnce ? "--once (single run)" : continuous ? "--continuous (daemon)" : "batch (all queued)"}`);
  
  if (leadIdArg) {
    // Process specific lead
    console.log(`Target: ${leadIdArg}`);
    const lead = await getLeadByLeadId(leadIdArg);
    if (!lead) {
      console.error(`Lead ${leadIdArg} not found`);
      process.exit(1);
    }
    const result = await processOneLead(lead);
    process.exit(result.success ? 0 : 1);
  }

  // Process queued leads
  const queuedLeads = await getLeadsByStatus("rerun_queued");
  console.log(`Found ${queuedLeads.length} leads queued for rerun`);

  if (queuedLeads.length === 0) {
    console.log("Nothing to do. Exiting.");
    process.exit(0);
  }

  // Process one or all depending on mode
  const leadsToProcess = runOnce ? queuedLeads.slice(0, 1) : queuedLeads;
  const results = [];

  for (const lead of leadsToProcess) {
    const result = await processOneLead(lead);
    results.push({ leadId: lead.leadId, ...result });
    
    if (runOnce) break; // Safety
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Processed: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  results.forEach(r => {
    const icon = r.success ? "✅" : "❌";
    console.log(`  ${icon} ${r.leadId}: ${r.duration}s${r.error ? ` (Error: ${r.error})` : ""}`);
  });

  const remaining = queuedLeads.length - leadsToProcess.length;
  if (remaining > 0) {
    console.log(`\n${remaining} leads still queued. Run again to process.`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
