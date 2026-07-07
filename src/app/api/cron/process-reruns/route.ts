/**
 * Cron Job: Process Queued Reruns
 * 
 * This endpoint is called by Vercel Cron.
 * It processes ONE lead at a time to avoid timeouts.
 * 
 * GET /api/cron/process-reruns
 * Returns: { success: true, processed: number, remaining: number }
 */

import { NextResponse } from "next/server";
import { getLeadsByStatus, updateLeadStatus, updateLeadResearchResults, getLeadByLeadId } from "@/lib/google-sheets";
import { preflightScan } from "@/lib/preflight-engine";
import { runResearch } from "@/lib/research-runner";
import { sendLeadAlertTelegram } from "@/lib/telegram-alerts";
import { dueFixKitRescans, markFixKitRescanQueued, markFixKitRescanCompleted, saveFixKit } from "@/lib/fix-kit-store";
import { buildFixKitInputFromLead } from "@/lib/fix-kit-input";
import { generateFixKit } from "@/lib/fix-kit-generator";
import { appendResearchSnapshot, getLatestAuditSnapshot, getLatestCompletedAuditSnapshot, hashProfile, hashPromptPlan, stableProfileForMonthlyHash, uniquePromptPlan } from "@/lib/audit-snapshots";
import { diffSnapshots, renderMovementCopy } from "@/lib/snapshot-diff";
import { listDueSubscriptions, markSubscriptionAfterMonthlyRun, markSubscriptionLoopFailure, nextRunAfter } from "@/lib/subscription-loop";
import { buildCompetitorMovementAlert, sendCompetitorMovementApprovalTelegram } from "@/lib/competitor-movement-alerts";
import { createE11GatedCard } from "@/lib/email-suite-automation";

// Wrapper for the cron endpoint
async function sendTelegramAlert({ message, topic }: { message: string; topic?: string }) {
  try {
    await sendLeadAlertTelegram({
      message,
      topic: topic || "system",
    } as any);
  } catch {
    // Non-blocking
  }
}

async function processDueMonthlySubscription() {
  const dueSubscriptions = await listDueSubscriptions(new Date(), 1).catch((error) => {
    console.warn('[cron/process-reruns] subscription lookup unavailable', error);
    return [];
  });
  const subscription = dueSubscriptions[0];
  if (!subscription) return null;

  const lead = await getLeadByLeadId(subscription.lead_id);
  if (!lead) {
    await markSubscriptionLoopFailure(subscription.stripe_subscription_id, `Lead ${subscription.lead_id} not found`);
    return { success: false, processed: 0, monthly: true, error: 'Lead not found', leadId: subscription.lead_id };
  }

  const startTime = Date.now();
  try {
    const previousSnapshot = await getLatestCompletedAuditSnapshot(lead.leadId);
    const preflight = await preflightScan(lead.website, lead.city, lead.dealershipName);
    const currentProfileHash = hashProfile(stableProfileForMonthlyHash(preflight));
    if (previousSnapshot?.profileHash && previousSnapshot.runType !== 'manual' && previousSnapshot.profileHash !== currentProfileHash) {
      const message = `⚠️ Monthly loop blocked for operator review\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nReason: niche/profile hash changed. Monthly prompts were not run against stale profile data.`;
      await markSubscriptionLoopFailure(subscription.stripe_subscription_id, 'profile_hash_changed');
      await sendTelegramAlert({ message, topic: 'system' });
      return { success: false, processed: 0, monthly: true, blocked: true, leadId: lead.leadId, error: 'profile_hash_changed' };
    }

    const previousPromptPlan = uniquePromptPlan(previousSnapshot?.promptPlan?.prompts || []);
    const previousPromptPlanHash = previousSnapshot?.promptPlan?.hash || (previousPromptPlan.length ? hashPromptPlan(previousPromptPlan) : null);
    if (previousSnapshot && (!previousPromptPlan.length || previousPromptPlanHash !== hashPromptPlan(previousPromptPlan))) {
      const message = `⚠️ Monthly loop blocked for operator review\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nReason: previous snapshot prompt plan hash is missing or invalid. Monthly prompts were not run.`;
      await markSubscriptionLoopFailure(subscription.stripe_subscription_id, 'prompt_plan_hash_invalid');
      await sendTelegramAlert({ message, topic: 'system' });
      return { success: false, processed: 0, monthly: true, blocked: true, leadId: lead.leadId, error: 'prompt_plan_hash_invalid' };
    }

    const competitors = lead.competitor ? lead.competitor.split(',').map(c => c.trim()).filter(Boolean) : [];
    const result = await runResearch(lead.dealershipName, lead.website, lead.city, competitors, preflight, {
      tier: 'paid',
      competitorMode: competitors.length >= 2 ? 'client_provided' : 'client_only',
      maxPrompts: previousPromptPlan.length || 60,
      promptPlan: previousPromptPlan.length ? { prompts: previousPromptPlan, hash: previousPromptPlanHash || undefined } : undefined,
    });
    const snapshot = await appendResearchSnapshot({
      leadId: lead.leadId,
      tier: 'paid',
      researchResult: result,
      preflightProfile: preflight,
      runType: previousSnapshot ? 'monthly' : 'baseline',
      source: 'cron_monthly_loop',
    });
    if (!snapshot?.id) throw new Error('monthly snapshot insert failed');

    const nextRunAt = nextRunAfter(new Date());
    await markSubscriptionAfterMonthlyRun(subscription.stripe_subscription_id, snapshot.id, nextRunAt);
    await updateLeadResearchResults(lead.leadId, {
      status: 'rerun_completed',
      researchStatus: 'complete',
      snapshotAppeared: `${result.appearedCount} of ${result.totalPrompts} prompts`,
      visibilityBand: result.statusBand,
      serviceVisibility: result.serviceVisibility,
      notes: `${lead.notes || ''}\n[MONTHLY_LOOP_SNAPSHOT ${new Date().toISOString()} snapshotId=${snapshot.id} sequence=${snapshot.sequence}]`,
    });

    const diff = previousSnapshot ? diffSnapshots(snapshot, previousSnapshot) : null;
    let fixDropSummary = 'No monthly Fix Drop generated for baseline snapshot.';
    if (diff) {
      const movementAlert = buildCompetitorMovementAlert({ leadId: lead.leadId, businessName: lead.dealershipName, clientEmail: lead.email, diff });
      if (movementAlert) await sendCompetitorMovementApprovalTelegram(movementAlert).catch((error) => console.warn('[cron/process-reruns] competitor movement approval alert failed', error));
      try {
        const refreshedLead = await getLeadByLeadId(lead.leadId);
        if (refreshedLead) {
          const input = buildFixKitInputFromLead(refreshedLead);
          input.mode = 'drop';
          input.research.promptResults = snapshot.promptResults.map((r) => ({ prompt: r.prompt, businessAppeared: r.businessAppeared, provider: r.provider }));
          const fixDrop = await generateFixKit(input);
          const savedFixDrop = await saveFixKit(fixDrop);
          fixDropSummary = `Monthly Fix Drop ready: ${savedFixDrop.artifacts.map((a) => a.title).join(', ')}`;
        }
      } catch (error) {
        fixDropSummary = `Monthly Fix Drop generation failed: ${error instanceof Error ? error.message : String(error)}`;
        await sendTelegramAlert({ message: `⚠️ Monthly Fix Drop generation failed\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nError: ${fixDropSummary}`, topic: 'system' });
      }
    }
    const duration = Math.round((Date.now() - startTime) / 1000);
    await sendTelegramAlert({
      message: `✅ Monthly loop run completed\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nSnapshot: #${snapshot.sequence}\nAppeared: ${result.appearedCount}/${result.totalPrompts}\nBand: ${result.statusBand}\nNext run: ${nextRunAt}\nFix Drop: ${fixDropSummary}\n${diff ? `\nMovement:\n${renderMovementCopy(diff).join('\n')}` : '\nBaseline snapshot recorded; first trend comparison arrives next month.'}`,
      topic: 'system',
    });

    return {
      success: true,
      processed: 1,
      monthly: true,
      leadId: lead.leadId,
      snapshotId: snapshot.id,
      snapshotSequence: snapshot.sequence,
      nextRunAt,
      duration: `${duration}s`,
      diffComputed: Boolean(diff),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown monthly loop error';
    await markSubscriptionLoopFailure(subscription.stripe_subscription_id, errorMsg).catch((markError) => console.warn('[cron/process-reruns] monthly failure mark failed', markError));
    await sendTelegramAlert({
      message: `❌ Monthly loop run failed\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nError: ${errorMsg}\nWill retry on the next daily tick once, then hold.`,
      topic: 'system',
    });
    return { success: false, processed: 0, monthly: true, leadId: lead.leadId, error: errorMsg };
  }
}

// Allow up to 5 minutes for processing
export const maxDuration = 300;

export async function GET(request: Request) {
  // Simple auth check — verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const xCronSecret = request.headers.get("x-cron-secret");
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret;
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  console.info("[cron/process-reruns] Starting cron job");

  try {
    // Queue any due Fix Kit post-delivery re-scans first. This reuses the
    // existing rerun status cron path while preserving the original Fix Kit
    // before/after marker on the fix_kits row.
    const dueRescans = await dueFixKitRescans().catch((error) => {
      console.warn('[cron/process-reruns] Fix Kit rescan lookup unavailable', error);
      return [];
    });
    for (const kit of dueRescans) {
      const lead = await getLeadByLeadId(kit.leadId);
      if (!lead || ['rerun_queued', 'rerun_processing'].includes(lead.status)) continue;
      await updateLeadResearchResults(kit.leadId, {
        status: 'rerun_queued',
        notes: `${lead.notes || ''}\n[FIX_KIT_RESCAN_QUEUED ${new Date().toISOString()} rescan_after_fix=true fixKitId=${kit.id}]`,
      });
      await markFixKitRescanQueued(String(kit.id), {
        reason: 'rescan_after_fix',
        queuedAt: new Date().toISOString(),
        before: {
          snapshotAppeared: lead.snapshotAppeared,
          visibilityBand: lead.visibilityBand,
          researchCompletedAt: lead.researchCompletedAt,
        },
      });
    }

    // Daily subscription loop: process one due active monthly subscriber before
    // generic reruns. This preserves the existing serial cron behavior while
    // adding subscription-aware scheduling.
    const monthlyResult = await processDueMonthlySubscription();
    if (monthlyResult) {
      return NextResponse.json(monthlyResult, { status: monthlyResult.success ? 200 : 500 });
    }

    // Find leads queued for rerun
    const queuedLeads = await getLeadsByStatus("rerun_queued");
    
    if (queuedLeads.length === 0) {
      console.info("[cron/process-reruns] No queued reruns found");
      return NextResponse.json({
        success: true,
        processed: 0,
        remaining: 0,
        message: "No leads queued for rerun",
      });
    }

    // Process only ONE lead per cron run to avoid timeouts
    const lead = queuedLeads[0];
    console.info(`[cron/process-reruns] Processing lead: ${lead.leadId} (${lead.dealershipName})`);

    // Mark as processing (with lock)
    await updateLeadResearchResults(lead.leadId, {
      status: "rerun_processing",
      notes: `Rerun started at ${new Date().toISOString()}`,
    });

    const startTime = Date.now();
    let result;

    try {
      // Step 1: Preflight
      console.info(`[cron/process-reruns] [${lead.leadId}] Step 1: Preflight scan`);
      const preflight = await preflightScan(lead.website, lead.city, lead.dealershipName);
      
      // Step 2: Research
      console.info(`[cron/process-reruns] [${lead.leadId}] Step 2: AI visibility research`);
      result = await runResearch(
        lead.dealershipName,
        lead.website,
        lead.city,
        lead.competitor ? lead.competitor.split(',').map(c => c.trim()).filter(Boolean) : [],
        preflight,
        { tier: "free", competitorMode: "client_only" }
      );

      const duration = Math.round((Date.now() - startTime) / 1000);

      // Save results
      const researchJson = JSON.stringify({
        ...result,
        processedAt: new Date().toISOString(),
        durationSeconds: duration,
        isRerun: true,
      });

      const fixKitIdMatch = (lead.notes || '').match(/fixKitId=([0-9a-f-]+)/i);
      const rerunSnapshot = await appendResearchSnapshot({
        leadId: lead.leadId,
        tier: 'free',
        researchResult: result,
        preflightProfile: preflight,
        runType: fixKitIdMatch?.[1] ? 'rescan_after_fix' : 'manual',
        source: fixKitIdMatch?.[1] ? 'cron_fix_kit_rescan' : 'cron_rerun',
      });

      await updateLeadResearchResults(lead.leadId, {
        status: "rerun_completed",
        researchStatus: "complete",
        snapshotAppeared: `${result.appearedCount} of ${result.totalPrompts} prompts`,
        visibilityBand: result.statusBand,
        serviceVisibility: result.serviceVisibility,
        notes: `RESEARCH_DATA:${researchJson}\n[AUDIT_SNAPSHOT snapshotId=${rerunSnapshot?.id || ''} sequence=${rerunSnapshot?.sequence || ''}]`,
      });

      if (fixKitIdMatch?.[1]) {
        await markFixKitRescanCompleted(fixKitIdMatch[1], {
          reason: 'rescan_after_fix',
          before: {
            snapshotAppeared: lead.snapshotAppeared,
            visibilityBand: lead.visibilityBand,
            researchCompletedAt: lead.researchCompletedAt,
          },
          after: {
            snapshotAppeared: `${result.appearedCount} of ${result.totalPrompts} prompts`,
            visibilityBand: result.statusBand,
            researchCompletedAt: new Date().toISOString(),
          },
        }).catch((error) => console.warn('[cron/process-reruns] Fix Kit before/after update failed', error));
        await createE11GatedCard({
          ...lead,
          snapshotAppeared: `${result.appearedCount} of ${result.totalPrompts} prompts`,
          visibilityBand: result.statusBand,
          status: 'rerun_completed' as any,
        }, {
          beforeX: Number((lead.snapshotAppeared || '').match(/(\d+)/)?.[1] || 0),
          afterX: result.appearedCount,
          totalN: result.totalPrompts,
          monthBefore: 'Before',
          trigger: 'rescan_after_fix',
        }).catch((error) => console.warn('[cron/process-reruns] E11 gated card creation failed', error));
      }

      // Success alert
      await sendTelegramAlert({
        message: `✅ Rerun completed\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nAppeared: ${result.appearedCount}/${result.totalPrompts}\nBand: ${result.statusBand}\nDuration: ${duration}s\n\n🔗 Report: https://vizbiz.ai/report/${lead.leadId}`,
        topic: "system",
      });

      console.info(`[cron/process-reruns] [${lead.leadId}] Completed in ${duration}s`);

      return NextResponse.json({
        success: true,
        processed: 1,
        remaining: queuedLeads.length - 1,
        leadId: lead.leadId,
        duration: `${duration}s`,
        appearedCount: result.appearedCount,
        statusBand: result.statusBand,
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const duration = Math.round((Date.now() - startTime) / 1000);

      console.error(`[cron/process-reruns] [${lead.leadId}] Failed: ${errorMsg}`);

      await updateLeadResearchResults(lead.leadId, {
        status: "rerun_failed",
        notes: `Rerun failed at ${new Date().toISOString()}. Error: ${errorMsg}. Duration: ${duration}s`,
      });

      // Failure alert
      await sendTelegramAlert({
        message: `❌ Rerun failed\n\nID: ${lead.leadId}\nName: ${lead.dealershipName}\nError: ${errorMsg}\nDuration: ${duration}s\n\nWill retry in next cycle.`,
        topic: "system",
      });

      return NextResponse.json({
        success: false,
        processed: 0,
        remaining: queuedLeads.length - 1,
        leadId: lead.leadId,
        error: errorMsg,
        duration: `${duration}s`,
      }, { status: 500 });
    }

  } catch (error) {
    console.error("[cron/process-reruns] Fatal error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}
