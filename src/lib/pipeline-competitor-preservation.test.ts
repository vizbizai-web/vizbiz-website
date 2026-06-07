import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('pipeline competitor preservation', () => {
  it('keeps submitted competitor names in client_provided mode during forced preflight reruns', () => {
    const source = readFileSync('src/lib/pipeline-controller.ts', 'utf8');
    expect(source).toContain('competitors.length > 0 ? "client_provided" : "client_only"');
    expect(source).toContain('Force reruns may replace');
  });
});
