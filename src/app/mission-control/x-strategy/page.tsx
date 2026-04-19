import { Metadata } from 'next';
import { promises as fs } from 'fs';
import XStrategyClient from './XStrategyClient';

export const metadata: Metadata = {
  title: 'X Strategy | Mission Control',
  description: 'X/Twitter content strategy and posts',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function XStrategyPage() {
  const fileMap: Record<string, string> = {
    'VizBiz Strategy': '/Users/vlad/.openclaw/workspace/vizbiz/X-STRATEGY.md',
    'VizBiz Posts (Final)': '/Users/vlad/.openclaw/workspace/vizbiz/X-FIRST-10-POSTS-FINAL.md',
    'Sage Review': '/Users/vlad/.openclaw/workspace/vizbiz/X-FIRST-10-POSTS-SAGE-REVIEW.md',
    'Multiplied Posts': '/Users/vlad/.openclaw/workspace/vizbiz/X-MULTIPLIED-POSTS.md',
    'Builder Strategy': '/Users/vlad/.openclaw/workspace/vizbiz/X-BUILDER-STRATEGY.md',
    'Builder Posts': '/Users/vlad/.openclaw/workspace/vizbiz/X-BUILDER-FIRST-10-POSTS.md',
    'Sage Approved Drafts': '/Users/vlad/.openclaw/workspace/skills/sage-x-agent/memory/approved-drafts.md',
    'Sage Trend Log': '/Users/vlad/.openclaw/workspace/skills/sage-x-agent/memory/trend-log.md',
    'Sage Performance Log': '/Users/vlad/.openclaw/workspace/skills/sage-x-agent/memory/performance-log.md',
    'Sage Config': '/Users/vlad/.openclaw/workspace/skills/sage-x-agent/config.md',
  };

  const tabs: { label: string; content: string }[] = [];
  for (const [label, filePath] of Object.entries(fileMap)) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      tabs.push({ label, content });
    } catch {
      tabs.push({ label, content: '*(File not found)*' });
    }
  }

  return <XStrategyClient tabs={tabs} />;
}
