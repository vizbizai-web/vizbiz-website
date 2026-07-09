import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { authorizeCronRequest, formatCronAge } from './cron-heartbeats';

function read(path: string) { return readFileSync(path, 'utf8'); }

describe('cron durable heartbeat ledger', () => {
  it('registers one slash-terminated daily master cron to avoid trailingSlash 308s', () => {
    const vercel = JSON.parse(read('vercel.json')) as { crons: Array<{ path: string; schedule: string }> };
    expect(vercel.crons).toEqual([{ path: '/api/cron/daily/', schedule: '0 10 * * *' }]);
    for (const cron of vercel.crons) {
      expect(cron.path.endsWith('/')).toBe(true);
      expect(cron.path).not.toMatch(/process-reruns|email-suite|client-zero/);
    }
  });

  it('records cron_invoked as the first authorized action on every cron route', () => {
    for (const route of ['daily', 'process-reruns', 'email-suite', 'client-zero']) {
      const source = read(`src/app/api/cron/${route}/route.ts`);
      const authIndex = source.indexOf('authorizeCronRequest(request');
      const heartbeatIndex = source.indexOf('recordCronHeartbeat(request');
      expect(authIndex).toBeGreaterThan(-1);
      expect(heartbeatIndex).toBeGreaterThan(authIndex);
      expect(source).toContain('cron-heartbeats');
    }
  });

  it('classifies auth without leaking credentials and alarms when last tick is older than 26h', () => {
    const previous = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test-secret';
    expect(authorizeCronRequest(new Request('https://vizbiz.ai/api/cron/daily/', { headers: { authorization: 'Bearer test-secret' } }))).toMatchObject({ authorized: true, authMethod: 'bearer' });
    expect(authorizeCronRequest(new Request('https://vizbiz.ai/api/cron/daily/', { headers: { 'x-cron-secret': 'test-secret' } }))).toMatchObject({ authorized: true, authMethod: 'x-cron-secret' });
    expect(authorizeCronRequest(new Request('https://vizbiz.ai/api/cron/daily/', { headers: { authorization: 'Bearer wrong' } }))).toMatchObject({ authorized: false });
    if (previous == null) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = previous;

    expect(formatCronAge('2026-07-08T00:00:00.000Z', new Date('2026-07-09T03:00:00.000Z'))).toMatchObject({ alarm: true });
    expect(formatCronAge('2026-07-09T02:30:00.000Z', new Date('2026-07-09T03:00:00.000Z'))).toMatchObject({ alarm: false, label: '30m ago' });
  });

  it('surfaces last cron tick in the Mission Control health strip', () => {
    expect(read('src/app/mission-control/api/pipeline-status/route.ts')).toContain('getLatestCronHeartbeat');
    expect(read('src/app/mission-control/page.tsx')).toContain('Last cron tick');
    expect(read('src/app/mission-control/page.tsx')).toContain('health.cron?.alarm');
  });
});
