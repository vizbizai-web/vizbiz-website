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
}

const projects: Project[] = [
  {
    name: 'VizBiz',
    status: 'Active',
    progress: 45,
    priority: 'Critical',
    description: 'AI visibility for automotive retailers',
    agents: [
      { name: 'Vlad', emoji: '🎯' },
      { name: 'Reko', emoji: '🔍' },
      { name: 'Forge', emoji: '🔨' },
      { name: 'Pulse', emoji: '📡' },
    ],
  },
  {
    name: 'Gekko Trading Bot',
    status: 'Planning',
    progress: 10,
    priority: 'High',
    description: 'Polymarket trading bot',
    agents: [
      { name: 'Vlad', emoji: '🎯' },
      { name: 'Gekko', emoji: '📈' },
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
  High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
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
            <div className="mb-6">
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Agents:</span>
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
            </div>
          </div>
        ))}
      </div>

      {/* Empty State / Add Project Hint */}
      <div className="bg-[#111118]/50 rounded-xl border border-dashed border-slate-800/50 p-8 text-center">
        <span className="text-3xl mb-3 block">➕</span>
        <p className="text-slate-400">More projects can be added here</p>
      </div>
    </div>
  );
}
