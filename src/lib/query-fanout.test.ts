import { describe, expect, it } from 'vitest';
import { extractFanoutQueries, isClientSafeFanoutQuery } from './query-fanout';

describe('query fan-out relevance gates', () => {
  it('blocks broad-country search-title garbage from client-facing fan-out rows', () => {
    const business = 'Thronmoor Services';
    const city = 'United Kingdom';
    const niche = 'electrical_contractor';

    const noisyTitles = [
      'Ask the United Kingdom',
      'Question Time - UK Parliament',
      'Questions patients are asked in the online form - NHS England Digital',
      'Laundry questions - United Kingdom Forum - Tripadvisor',
      'Questions by customs - United Kingdom Message Board - Tripadvisor',
    ];

    for (const title of noisyTitles) {
      expect(isClientSafeFanoutQuery(title, business, city, niche)).toBe(false);
    }
  });

  it('keeps electrical-contractor fan-out brand/niche anchored and removes snake_case niche labels', async () => {
    const fanout = await extractFanoutQueries('Thronmoor Services', 'United Kingdom', 'electrical_contractor');
    const joined = fanout.fanoutQueries.join('\n');

    expect(fanout.fanoutQueries.length).toBeGreaterThanOrEqual(5);
    expect(joined).toContain('Thronmoor Services');
    expect(joined).toContain('electrical contractor');
    expect(joined).not.toContain('electrical_contractor');
    expect(joined).not.toMatch(/Ask the United Kingdom|Question Time|NHS England|Laundry questions|customs/i);
    expect(joined).not.toMatch(/best electrical contractor near United Kingdom/i);
    expect(joined).not.toMatch(/top electrical contractor businesses in United Kingdom/i);
  });
});
