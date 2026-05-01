import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Mission Control',
  description: 'Active projects and initiatives',
  robots: { index: false, follow: false }
};

interface Project {
  name: string;
  status: 'Active' | 'Planning' | 'Paused' | 'Completed';
  progress: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  agents: { name: string; emoji: string }[];
  recentActivity: string[];
}

const projects: Project[] = [
  {
    name: 'VizBiz Platform',
    status: 'Active',
    progress: 55,
    priority: 'Critical',
    description: 'AI visibility intelligence for car dealerships',
    agents: [
      { name: 'Vlad', emoji: '🎯' },
      { name: 'Reko', emoji: '🔍' },
      { name: 'Forge', emoji: '🔨' },
      { name: 'Pulse', emoji: '📡' },
    ],
    recentActivity: [
      'Deployed schema fixes to production',
      'Scored 22/100 on AVI benchmark',
      'CORE-EEAT audit completed',
    ],
  },
  {
    name: 'VizBiz X Account (@VizBizAI)',
    status: 'Active',
    progress: 30,
    priority: 'High',
    description: 'AI visibility content strategy — "AI Visibility Guy"',
    agents: [
      { name: 'Pulse', emoji: '📡' },
      { name: 'Sage', emoji: '🧙' },
    ],
    recentActivity: [
      'Sage installed and configured',
      '10 posts drafted and finalized',
      'Content strategy document complete',
    ],
  },
  {
    name: 'Builder X Account (@AlexBuildsAI)',
    status: 'Active',
    progress: 25,
    priority: 'High',
    description: 'AI builder journal — one guy, five agents, three projects',
    agents: [
      { name: 'Pulse', emoji: '📡' },
      { name: 'Sage', emoji: '🧙' },
    ],
    recentActivity: [
      'Strategy document complete',
      '10 posts drafted',
      'Sage configured for builder persona',
    ],
  },
  {
    name: 'Gekko Trading Bot',
    status: 'Planning',
    progress: 15,
    priority: 'Medium',
    description: 'Polymarket trading bot for BTC 5-minute markets',
    agents: [
      { name: 'Gekko', emoji: '📈' },
      { name: 'Forge', emoji: '🔨' },
    ],
    recentActivity: [
      'Architecture designed',
      'TypeScript scaffold created',
      'Market data pipeline researched',
    ],
  },
  {
    name: 'AI Visibility for Real Estate',
    status: 'Planning',
    progress: 5,
    priority: 'Low',
    description: 'Future vertical — reuse VizBiz engine for real estate agents',
    agents: [],
    recentActivity: [
      'Identified as future vertical',
      'Engine reuse feasibility confirmed',
      'Pending VizBiz platform maturity',
    ],
  },
  {
    name: 'Tow Company Automation',
    status: 'Planning',
    progress: 3,
    priority: 'Low',
    description: 'Future — operational SaaS/automation for small tow companies',
    agents: [],
    recentActivity: [
      'Market opportunity identified',
      'Waiting for bandwidth',
      'No active development',
    ],
  },
];

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Planning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Paused: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  Completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-slate-400 mt-1">Active initiatives and their status</p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.name} className="bg-[#111118] rounded-xl border border-slate-800/50 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{project.name}</h2>
                <p className="text-sm text-slate-400 mt-1">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                  {project.status}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${priorityColors[project.priority]}`}>
                  {project.priority}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">{project.progress}%</span>
              </div>
              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Agents */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-500">Agents:</span>
              {project.agents.length > 0 ? (
                <>
                  <div className="flex -space-x-2">
                    {project.agents.map((agent, idx) => (
                      <div 
                        key={agent.name}
                        className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm"
                        title={agent.name}
                        style={{ zIndex: project.agents.length - idx }}
                      >
                        {agent.emoji}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 ml-2">
                    {project.agents.map(a => a.name).join(', ')}
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500 italic">Future allocation</span>
              )}
            </div>

            {/* Recent Activity */}
            <div className="border-t border-slate-800/50 pt-4">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Recent Activity</h3>
              <ul className="space-y-1.5">
                {project.recentActivity.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span className="text-slate-400">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
