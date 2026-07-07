import { describe, expect, it } from 'vitest';
import { classifyLeadTriage } from './lead-triage';

describe('lead triage classifier', () => {
  it('flags obvious spam as junk candidate', () => {
    const triage = classifyLeadTriage({ dealershipName: 'Best Casino Backlink Deal', website: 'casino.example', email: 'bot@spam.example', city: 'Toronto', contactName: 'Bot', notes: '', status: 'new' });
    expect(triage.label).toBe('junk_candidate');
    expect(triage.reasons.join(' ')).toMatch(/spam keyword/i);
  });

  it('keeps uncertain leads out of bulk junk proposals', () => {
    const triage = classifyLeadTriage({ dealershipName: 'Small Plumbing Co', website: 'smallplumbing.example', email: 'owner@gmail.com', city: '', contactName: 'Owner', notes: '', status: 'new' });
    expect(triage.label).toBe('uncertain');
  });

  it('does not mark QA leads as junk candidates', () => {
    const triage = classifyLeadTriage({ dealershipName: 'QA Battery V2 Plumbing', website: 'https://example.com', email: 'alex+qa@vizbiz.ai', city: 'Toronto', contactName: 'Alex', notes: '', status: 'new' });
    expect(triage.label).toBe('clean');
  });
});
