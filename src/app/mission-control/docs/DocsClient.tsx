'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface DocFile {
  filename: string;
  category: string;
  content: string;
  path: string;
}

interface DocsClientProps {
  files: DocFile[];
}

export default function DocsClient({ files }: DocsClientProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(files.map(f => f.category));
    return Array.from(cats).sort();
  }, [files]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach(f => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    return files.filter(f => 
      f.filename.toLowerCase().includes(query) ||
      f.content.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

  const filesByCategory = useMemo(() => {
    const grouped: Record<string, DocFile[]> = {};
    filteredFiles.forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f);
    });
    return grouped;
  }, [filteredFiles]);

  const selectedContent = selectedFile 
    ? files.find(f => f.filename === selectedFile)?.content 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Docs</h1>
        <div className="text-sm text-slate-400">
          {files.length} documents
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#111118] border border-slate-800/50 rounded-xl px-4 py-3 pl-11 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
      </div>

      <div className="flex gap-6 h-[calc(100vh-280px)]">
        {/* Left Panel - Categories */}
        <div className="w-64 flex-shrink-0 bg-[#111118] rounded-xl border border-slate-800/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800/50">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Categories</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {categories.map(category => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {category}
                  <span className="ml-2 text-slate-600">({categoryCounts[category] || 0})</span>
                </div>
                {filesByCategory[category]?.map(file => (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFile(file.filename)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left
                      ${selectedFile === file.filename 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <span className="text-xs">📄</span>
                    <span className="truncate">{file.filename}</span>
                  </button>
                ))}
              </div>
            ))}
            {files.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                No documents found
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 bg-[#111118] rounded-xl border border-slate-800/50 overflow-hidden flex flex-col">
          {selectedFile ? (
            <>
              <div className="p-4 border-b border-slate-800/50 flex items-center gap-3">
                <span className="text-lg">📄</span>
                <h2 className="font-semibold text-white">{selectedFile}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-invert prose-slate max-w-none">
                  <ReactMarkdown>{selectedContent || ''}</ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <span className="text-4xl mb-4 block">📄</span>
                <p>Select a document to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
