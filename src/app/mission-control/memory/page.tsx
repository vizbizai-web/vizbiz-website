
import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MemoryClient from './MemoryClient';

export const metadata: Metadata = {
  title: 'Memory | Mission Control',
  description: 'Daily logs and long-term memory',
  robots: { index: false, follow: false }
};

interface MemoryFile {
  date: string;
  filename: string;
  content: string;
}

async function loadMemoryFiles(): Promise<{ files: MemoryFile[]; longTerm: string }> {
  const memoryDir = '/Users/vlad/.openclaw/workspace/memory';
  const longTermPath = '/Users/vlad/.openclaw/workspace/MEMORY.md';
  
  let files: MemoryFile[] = [];
  let longTerm = '';

  // Load long-term memory
  try {
    longTerm = await fs.readFile(longTermPath, 'utf-8');
  } catch {
    longTerm = '# Long-Term Memory\n\nNo long-term memory found.';
  }

  // Load daily memory files
  try {
    const entries = await fs.readdir(memoryDir);
    const mdFiles = entries.filter(f => f.endsWith('.md') && /^\d{4}-\d{2}-\d{2}/.test(f));
    
    for (const filename of mdFiles) {
      const filePath = path.join(memoryDir, filename);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : filename;
        files.push({ date, filename, content });
      } catch {
        // Skip unreadable files
      }
    }
    
    // Sort newest first
    files.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    // Directory doesn't exist or is unreadable
  }

  return { files, longTerm };
}

export default async function MemoryPage() {
  const { files, longTerm } = await loadMemoryFiles();

  return <MemoryClient files={files} longTerm={longTerm} />;
}
