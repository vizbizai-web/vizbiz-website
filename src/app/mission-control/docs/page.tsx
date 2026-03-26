export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import DocsClient from './DocsClient';

export const metadata: Metadata = {
  title: 'Docs | Mission Control',
  description: 'Documentation and reference materials',
  robots: { index: false, follow: false }
};

interface DocFile {
  filename: string;
  category: string;
  content: string;
  path: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Strategy: ['HOMEPAGE', 'WEBSITE', 'MVP', 'OPERATING', 'LAUNCH', 'PLAN', 'STRUCTURE'],
  Client: ['CLIENT', 'DEMO', 'MONTHLY', 'RECURRING', 'SELLABLE'],
  Research: ['COMPETITIVE', 'QUERY', 'VISIBILITY', 'INTEL', 'DOGFOOD'],
  Build: ['LEAD', 'MINIMUM', 'REPORT', 'CHECKLIST'],
  System: ['MEMORY', 'AGENTS', 'SOUL', 'USER', 'HEARTBEAT', 'IDENTITY', 'TOOLS'],
};

function categorizeFile(filename: string): string {
  const upper = filename.toUpperCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => upper.includes(kw))) {
      return category;
    }
  }
  return 'Other';
}

async function loadDocs(): Promise<DocFile[]> {
  const files: DocFile[] = [];
  const dirs = [
    '/Users/vlad/.openclaw/workspace/vizbiz',
    '/Users/vlad/.openclaw/workspace'
  ];

  for (const dir of dirs) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const mdFiles = entries.filter(e => e.isFile() && e.name.endsWith('.md'));
      
      for (const entry of mdFiles) {
        // Skip memory directory files and non-doc files
        if (entry.name.match(/^\d{4}-\d{2}-\d{2}/)) continue;
        
        const filePath = path.join(dir, entry.name);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          files.push({
            filename: entry.name,
            category: categorizeFile(entry.name),
            content,
            path: filePath,
          });
        } catch {
          // Skip unreadable files
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  return files.sort((a, b) => a.filename.localeCompare(b.filename));
}

export default async function DocsPage() {
  const files = await loadDocs();

  return <DocsClient files={files} />;
}
