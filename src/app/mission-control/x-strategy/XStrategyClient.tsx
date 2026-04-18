'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Tab {
  label: string;
  content: string;
}

export default function XStrategyClient({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.label || '');

  const activeContent = tabs.find(t => t.label === activeTab)?.content || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">X Strategy</h1>
        <p className="text-slate-400 mt-1">Content strategy and drafted posts for X/Twitter accounts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800/50 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.label
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-6">
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-blue-400 prose-code:text-slate-300 prose-pre:bg-slate-900">
          <ReactMarkdown>{activeContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
