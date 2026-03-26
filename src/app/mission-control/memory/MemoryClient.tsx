'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MemoryFile {
  date: string;
  filename: string;
  content: string;
}

interface MemoryClientProps {
  files: MemoryFile[];
  longTerm: string;
}

export default function MemoryClient({ files, longTerm }: MemoryClientProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showLongTerm, setShowLongTerm] = useState(true);

  const selectedContent = selectedFile 
    ? files.find(f => f.filename === selectedFile)?.content 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Memory</h1>
        <div className="text-sm text-slate-400">
          {files.length} daily logs
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Date List */}
        <div className="w-64 flex-shrink-0 bg-[#111118] rounded-xl border border-slate-800/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800/50">
            <button
              onClick={() => { setShowLongTerm(true); setSelectedFile(null); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${showLongTerm 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <span>📌</span>
              Long-Term Memory
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.map(file => (
              <button
                key={file.filename}
                onClick={() => { setSelectedFile(file.filename); setShowLongTerm(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                  ${selectedFile === file.filename 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }
                `}
              >
                <span>📝</span>
                <span className="font-mono text-xs">{file.date}</span>
              </button>
            ))}
            {files.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                No memory files found
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 bg-[#111118] rounded-xl border border-slate-800/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800/50 flex items-center gap-3">
            <span className="text-lg">{showLongTerm ? '📌' : '📝'}</span>
            <h2 className="font-semibold text-white">
              {showLongTerm ? 'Long-Term Memory' : selectedFile}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-invert prose-slate max-w-none">
              <ReactMarkdown>
                {showLongTerm ? longTerm : (selectedContent || 'Select a file to view')}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
