'use client';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'idle' | 'offline';
  avatar: string;
  color: string;
  description: string;
  currentTask: string;
  skills: string[];
  lastActive: string;
}

interface AgentRosterProps {
  agents: Agent[];
}

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-yellow-500',
  offline: 'bg-slate-500'
};

const statusLabels = {
  online: 'Online',
  idle: 'Idle',
  offline: 'Offline'
};

export function AgentRoster({ agents }: AgentRosterProps) {
  const onlineCount = agents.filter(a => a.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center gap-6 bg-[#111118] border border-slate-800/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {agents.slice(0, 3).map((agent, i) => (
              <div
                key={agent.id}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-white text-xs font-bold border-2 border-[#111118]`}
                style={{ zIndex: 3 - i }}
              >
                {agent.avatar}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white font-medium">{agents.length} Total Agents</p>
            <p className="text-slate-500 text-sm">{onlineCount} online now</p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-800" />
        <div className="flex items-center gap-4">
          <StatusIndicator label="Online" count={agents.filter(a => a.status === 'online').length} color="emerald" />
          <StatusIndicator label="Idle" count={agents.filter(a => a.status === 'idle').length} color="yellow" />
          <StatusIndicator label="Offline" count={agents.filter(a => a.status === 'offline').length} color="slate" />
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function StatusIndicator({ label, count, color }: { label: string; count: number; color: string }) {
  const dotColors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    slate: 'bg-slate-500'
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white font-medium">{count}</span>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white text-xl font-bold`}>
            {agent.avatar}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{agent.name}</h3>
            <p className="text-slate-400 text-sm">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
          <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
          <span className="text-slate-300 text-sm">{statusLabels[agent.status]}</span>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{agent.description}</p>

      <div className="mb-4">
        <p className="text-slate-500 text-xs mb-2">CURRENT TASK</p>
        <p className="text-slate-300 text-sm">{agent.currentTask}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {agent.skills.map(skill => (
            <span key={skill} className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded">
              {skill}
            </span>
          ))}
        </div>
        <span className="text-slate-500 text-xs">{agent.lastActive}</span>
      </div>
    </div>
  );
}
