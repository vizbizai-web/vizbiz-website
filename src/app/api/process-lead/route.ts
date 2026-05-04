/**
 * Lead Processing API Route
 * 
 * This endpoint processes new leads automatically:
 * 1. Finds leads with status "new"
 * 2. Updates status to "researching"
 * 3. Auto-detects business niche
 * 4. Auto-discovers competitors if none provided
 * 5. Runs AI visibility research (20-prompt Snapshot)
 * 6. Updates Google Sheet with real scores
 * 7. Marks status as "email_drafted" and research as "complete"
 * 8. On failure: resets to "new" + "failed" so cron retries next cycle
 *
 * Status flow: new → researching → email_drafted
 * On error: new → researching → new (retry) + researchStatus: failed
 * 
 * Can be called via cron or webhook to process pending leads.
 */

import { NextResponse } from "next/server";
import { getLeadsByStatus, getLeadByLeadId, updateLeadResearchResults } from "@/lib/google-sheets";
import { detectNiche } from "@/lib/niche-detector";
import { discoverCompetitors } from "@/lib/competitor-discovery";
import { runResearch } from "@/lib/research-runner";

export async function POST(request: Request) {
  try {
    console.info("[process-lead] Starting lead processing");
    
    // Check if a specific leadId was provided in the request body
    let targetLeadId: string | null = null;
    try {
      const body = await request.clone().json().catch(() => ({}));
      targetLeadId = body?.leadId || null;
    } catch { /* not JSON, that's fine */ }
    
    let newLeads;
    if (targetLeadId) {
      // Process a specific lead by ID
      const lead = await getLeadByLeadId(targetLeadId);
      if (!lead) {
        return NextResponse.json({ success: false, message: `Lead ${targetLeadId} not found` }, { status: 404 });
      }
      newLeads = [lead];
      console.info(`[process-lead] Processing specific lead: ${targetLeadId}`);
    } else {
      // Get all leads with status "new"
      newLeads = await getLeadsByStatus("new");
    }
    
    if (newLeads.length === 0) {
      console.info("[process-lead] No new leads to process");
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No new leads found"
      });
    }
    
    console.info(`[process-lead] Found ${newLeads.length} new leads to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    // Process each lead
    for (const lead of newLeads) {
      try {
        console.info(`[process-lead] Processing lead ${lead.leadId}: ${lead.dealershipName}`);
        
        // Update status to "processing"
        await updateLeadResearchResults(lead.leadId, {
          status: "researching",
          researchStatus: "running"
        });
        
        // Auto-detect niche
        console.info(`[process-lead] Detecting niche for ${lead.dealershipName}`);
        const nicheConfig = detectNiche(lead.dealershipName, lead.website);
        console.info(`[process-lead] Detected niche: ${nicheConfig.niche}`);
        
        // Auto-discover competitors if none provided
        let competitors: string[] = [];
        if (lead.competitor && lead.competitor.trim() !== "") {
          competitors = [lead.competitor.trim()];
        } else {
          console.info(`[process-lead] Discovering competitors for ${lead.dealershipName}`);
          competitors = await discoverCompetitors(
            lead.dealershipName,
            lead.website,
            lead.city,
            lead.competitor
          );
          console.info(`[process-lead] Found competitors: ${competitors.join(", ")}`);
        }
        
        // Run research
        console.info(`[process-lead] Running research for ${lead.dealershipName}`);
        const researchResult = await runResearch(
          lead.dealershipName,
          lead.website,
          lead.city,
          competitors
        );
        
        console.info(`[process-lead] Research completed for ${lead.dealershipName}:`,
          `${researchResult.appearedCount}/${researchResult.totalPrompts} appearances`);
        
        // Update Google Sheet with results
        await updateLeadResearchResults(lead.leadId, {
          status: "email_drafted",
          researchStatus: "complete",
          snapshotAppeared: `${researchResult.appearedCount} of ${researchResult.totalPrompts} prompts`,
          visibilityBand: researchResult.statusBand,
          serviceVisibility: researchResult.serviceVisibility
        });
        
        console.info(`[process-lead] Lead ${lead.leadId} processed successfully — status: email_drafted`);
        processedCount++;
        
      } catch (error) {
        console.error(`[process-lead] Error processing lead ${lead.leadId}:`, error);
        
        // Update status to reflect failure — set back to "new" so cron retries next cycle
        try {
          await updateLeadResearchResults(lead.leadId, {
            status: "new",
            researchStatus: "failed",
            notes: `Auto-processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
          });
        } catch (updateError) {
          console.error(`[process-lead] Failed to update failed status for lead ${lead.leadId}:`, updateError);
        }
        
        errorCount++;
      }
    }
    
    console.info(`[process-lead] Processing complete: ${processedCount} success, ${errorCount} failed`);
    
    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      totalLeads: newLeads.length,
      message: `Processed ${processedCount} leads successfully, ${errorCount} failed`
    });
    
  } catch (error) {
    console.error("[process-lead] Fatal error in lead processing:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Lead processing failed"
    }, { status: 500 });
  }
}

// Also support GET for testing/cron purposes
export async function GET() {
  return POST(new Request("http://localhost/api/process-lead", { method: "POST" }));
}