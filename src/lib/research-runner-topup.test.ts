import { describe, expect, it } from 'vitest';
import { __researchRunnerTestables } from './research-runner';
import type { BatteryPrompt } from './battery-v2';

const prompt = (id: string, text: string): BatteryPrompt => ({
  id,
  text,
  categoryId: 'C1',
  categoryName: 'Discovery',
  ownerLabel: 'client',
  trace: [],
});

describe('research runner prompt plan top-up', () => {
  it('tops up an under-cap reused prompt plan to the tier cap without duplicates', () => {
    const existing = [prompt('1', 'best plumber toronto'), prompt('2', 'emergency plumber toronto')];
    const source = [
      prompt('1', 'best plumber toronto'),
      prompt('3', 'licensed plumber toronto'),
      prompt('4', 'plumber reviews toronto'),
      prompt('5', 'plumber near me toronto'),
    ];
    const result = __researchRunnerTestables.topUpPromptPlanToCap(existing.map((p) => p.text), existing, source, 4);
    expect(result.prompts).toHaveLength(4);
    expect(new Set(result.prompts.map((p) => p.toLowerCase())).size).toBe(4);
    expect(result.prompts).toEqual(['best plumber toronto', 'emergency plumber toronto', 'licensed plumber toronto', 'plumber reviews toronto']);
  });
});
