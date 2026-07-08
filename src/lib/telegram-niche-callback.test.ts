import { describe, expect, it } from 'vitest';
import { buildNicheCallbackResolution } from './telegram-niche-callback';

const messageText = [
  '⚠️ Niche resolution blocked — Glow Table',
  '',
  'Lead ID: lead_123',
  'Submitted: med spa',
  'Website evidence: restaurant',
  'Status: CONFLICT',
  'Why: Declared service and website describe different businesses.',
  '',
  'Choose a resolution before research continues.',
].join('\n');

describe('telegram niche callback resolution', () => {
  it('turns Use declared callbacks into a ClientBusinessCategory override and rerun reason', () => {
    expect(buildNicheCallbackResolution('niche_use_submitted_lead_123', messageText)).toEqual({
      leadId: 'lead_123',
      action: 'use_submitted',
      selectedNiche: 'med spa',
      noteLine: expect.stringContaining('ClientBusinessCategory: med spa'),
      rerunReason: 'Telegram niche resolution: use declared service "med spa"',
    });
  });

  it('turns Use website callbacks into a website-evidence category override', () => {
    const resolution = buildNicheCallbackResolution('niche_use_website_lead_123', messageText);
    expect(resolution.leadId).toBe('lead_123');
    expect(resolution.action).toBe('use_website');
    expect(resolution.selectedNiche).toBe('restaurant');
    expect(resolution.noteLine).toContain('ClientBusinessCategory: restaurant');
  });

  it('does not invent a custom category from callback buttons', () => {
    const resolution = buildNicheCallbackResolution('niche_custom_lead_123', messageText);
    expect(resolution.action).toBe('custom');
    expect(resolution.selectedNiche).toBe('');
    expect(resolution.noteLine).toContain('CUSTOM_NICHE_REQUIRED');
  });

  it('has a stale-button already-resolved guard in the Telegram webhook', () => {
    const source = require('node:fs').readFileSync('src/app/api/telegram/webhook/route.ts', 'utf8');
    expect(source).toContain('Already resolved — no rerun started.');
    expect(source).toContain('niche_resolution_already_resolved');
    expect(source).toContain('action: "already_resolved"');
    expect(source).toContain('harmless: true');
  });
});
