import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team | Mission Control',
  description: 'Agent roster and roles',
  robots: { index: false, follow: false }
};

interface Agent {
  name: string;
  role: string;
  avatar: string;
  description: string;
  tags: string[];
  model: string;
}

const cos: Agent = {
  name: 'Vlad',
  role: 'Chief of Staff',
  avatar: '🎯',
  description: 'Coordinates, delegates, keeps the ship tight. First point of contact between Alex and the machine.',
  tags: ['Orchestration', 'Clarity', 'Delegation'],
  model: 'anthropic/claude-sonnet-4-6',
};

const agents: Agent[] = [
  {
    name: 'Reko',
    role: 'Research & Intelligence',
    avatar: '🔍',
    description: 'Web search, Brave API, competitor discovery, prompt expansion, first-pass synthesis.',
    tags: ['Search', 'Discovery', 'Synthesis'],
    model: 'moonshot/kimi-k2.5',
  },
  {
    name: 'Forge',
    role: 'Builder & Coder',
    avatar: '🔨',
    description: 'Builds pages, components, scrapers, cron jobs, automations. Default: GPT-5 mini. Escalation: Codex GPT-5.4.',
    tags: ['Code', 'Build', 'Automate'],
    model: 'openai/gpt-5-mini → openai-codex/gpt-5.4',
  },
  {
    name: 'Pulse',
    role: 'Marketing & Content',
    avatar: '📡',
    description: 'Repurposes outputs into distribution-ready content. Channel adaptation, social packaging, campaign copy.',
    tags: ['Content', 'Distribution', 'Reach'],
    model: 'moonshot/kimi-k2.5 + openai/gpt-5-mini',
  },
  {
    name: 'Gekko',
    role: 'Trading Bot',
    avatar: '📈',
    description: 'Polymarket trading bot. Separate project, secondary priority.',
    tags: ['Trading', 'Analysis', 'Execution'],
    model: 'openai-codex/gpt-5.4',
  },
  {
    name: 'Opus',
    role: 'Strategic Escalation',
    avatar: '🧠',
    description: 'High-stakes strategic review only. Called explicitly.',
    tags: ['Strategy', 'Escalation', 'Validation'],
    model: 'anthropic/claude-opus-4-6',
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-slate-400 mt-1">Agent roster and operational roles</p>
      </div>

      {/* Mission Statement Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <p className="text-lg text-slate-200 italic leading-relaxed">
          "Building an autonomous AI operation that delivers real visibility intelligence for automotive retailers — 24/7, without being told what to do."
        </p>
      </div>

      {/* COS Card */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Chief of Staff</h2>
        <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl flex-shrink-0">
              {cos.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{cos.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {cos.role}
                </span>
              </div>
              <p className="text-slate-400 mb-4">{cos.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {cos.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/50 text-slate-300 border border-slate-700/50">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono bg-slate-800/50 px-2 py-1 rounded">{cos.model}</span>
              </div>
            </div>
            <a 
              href="#" 
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ROLE CARD <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub-Agents Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Sub-Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.name} className="bg-[#111118] rounded-xl border border-slate-800/50 p-5 hover:border-slate-700/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center text-3xl flex-shrink-0">
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{agent.name}</h3>
                  </div>
                  <p className="text-sm text-blue-400 mb-2">{agent.role}</p>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">{agent.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800/50 text-slate-400 border border-slate-700/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 bg-slate-800/30 px-2 py-1 rounded truncate max-w-[150px]">
                      {agent.model}
                    </span>
                    <a 
                      href="#" 
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      ROLE CARD <span>→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
