import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const bannedProvider = 'olla' + 'ma';
const bannedModelA = 'kimi' + '-k2.6';
const bannedModelB = 'gemma' + '3:4b';
const bannedTokens = [bannedProvider, bannedModelA, bannedModelB];

const ignoredDirs = new Set([
  '.git',
  '.next',
  'node_modules',
  'coverage',
  'dist',
  '.vercel',
]);

const allowedExtensions = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mjs', '.cjs', '.yml', '.yaml', '.txt',
]);

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry);
    const relative = path.relative(repoRoot, absolute);
    if (ignoredDirs.has(entry) || relative.startsWith('.hermes')) continue;
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      files.push(...walk(absolute));
      continue;
    }
    if (!allowedExtensions.has(path.extname(entry))) continue;
    files.push(absolute);
  }
  return files;
}

describe('provider decontamination', () => {
  it('has no banned deprecated model-provider references in source or markdown', () => {
    const matches: string[] = [];
    for (const file of walk(repoRoot)) {
      const relative = path.relative(repoRoot, file);
      const content = readFileSync(file, 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        const lower = line.toLowerCase();
        if (bannedTokens.some((token) => lower.includes(token.toLowerCase()))) {
          matches.push(`${relative}:${index + 1}: ${line.trim()}`);
        }
      });
    }
    expect(matches).toEqual([]);
  });

  it('stores the pipeline logic source of truth as an inspectable markdown file', () => {
    const sourceOfTruth = path.join(repoRoot, 'docs/launch/vizbiz-pipeline-source-of-truth.md');
    expect(existsSync(sourceOfTruth)).toBe(true);
    const doc = readFileSync(sourceOfTruth, 'utf8');
    expect(doc).toContain('Business Intelligence Profile');
    expect(doc).toContain('taxonomy is optional');
    expect(doc).toContain('current configured model');
    expect(doc.toLowerCase()).not.toContain(bannedProvider);
  });
});
