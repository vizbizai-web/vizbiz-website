import { describe, expect, it, beforeEach } from 'vitest';
import { assessIntakeSpam, resetIntakeSpamBucketsForTest } from './intake-spam-defense';

function req(ip = '1.2.3.4') {
  return new Request('https://vizbiz.ai/api/pipeline/intake', { headers: { 'x-forwarded-for': ip } });
}

describe('intake spam defense', () => {
  beforeEach(() => resetIntakeSpamBucketsForTest());

  it('blocks honeypot-filled submissions before CRM write', () => {
    const decision = assessIntakeSpam({ website: 'spam.example' }, req());
    expect(decision).toMatchObject({ ok: false, reason: 'honeypot_filled' });
  });

  it('blocks browser submissions that arrive too fast but allows missing timer for API/QA callers', () => {
    expect(assessIntakeSpam({ formStartedAt: '1000' }, req(), 2000)).toMatchObject({ ok: false, reason: 'submitted_too_fast' });
    expect(assessIntakeSpam({}, req(), 2000)).toMatchObject({ ok: true });
  });

  it('rate-limits repeated submissions per client IP', () => {
    for (let i = 0; i < 8; i++) expect(assessIntakeSpam({}, req('9.9.9.9'), 1000 + i).ok).toBe(true);
    expect(assessIntakeSpam({}, req('9.9.9.9'), 2000)).toMatchObject({ ok: false, reason: 'rate_limited' });
  });
});
