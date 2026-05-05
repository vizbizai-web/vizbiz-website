export const dynamic = 'force-dynamic';

import { AgentRoster } from './components/AgentRoster';

// Static agent definitions - in production these would come from a config or database
const agents = [
  {
    id: 'vlad',
    name: 'Vlad',
    role: 'Chief of Staff',
    status: 'online' as const,
    avatar: 'V',
    color: 'from-emerald-500 to-teal-600',
    description: 'Strategic coordinator. Proactive monitoring, execution, business operations.',
    currentTask: 'Monitoring mission control',
    skills: ['Strategy', 'Coordination', 'Business Ops'],
    lastActive: 'Now'
  },
  {
    id: 'architect',
    name: 'ARCHITECT',
    role: 'Search-Strategic Craftsman',
    status: 'online' as const,
    avatar: 'A',
    color: 'from-blue-500 to-indigo-600',
    description: 'Builds systems, structures, and foundations. Mission Control builder.',
    currentTask: 'Built Mission Control Phase 1',
    skills: ['System Design', 'Full-Stack', 'Architecture'],
    lastActive: '1h ago'
  },
  {
    id: 'copywriter',
    name: 'Copywriter',
    role: 'Content Specialist',
    status: 'idle' as const,
    avatar: 'C',
    color: 'from-purple-500 to-pink-600',
    description: 'Creates SEO-optimized content, articles, and marketing copy.',
    currentTask: 'Awaiting next content assignment',
    skills: ['SEO Writing', 'Content Strategy', 'Research'],
    lastActive: '4h ago'
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Intelligence Analyst',
    status: 'offline' as const,
    avatar: 'R',
    color: 'from-orange-500 to-red-600',
    description: 'Gathers competitive intelligence, market data, and industry insights.',
    currentTask: 'Offline',
    skills: ['Market Research', 'Competitive Analysis', 'Data Mining'],
    lastActive: '1d ago'
  },
  {
    id: 'outreach',
    name: 'Outreach',
    role: 'Link Builder',
    status: 'offline' as const,
    avatar: 'O',
    color: 'from-cyan-500 to-blue-600',
    description: 'Manages link building, partnerships, and relationship development.',
    currentTask: 'Offline',
    skills: ['Link Building', 'Partnerships', 'PR'],
    lastActive: '2d ago'
  }
];

export default function AgentsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Agent Roster</h1>
        <p className="text-slate-400">VizBiz.ai autonomous workforce</p>
      </div>
      <AgentRoster agents={agents} />
    </div>
  );
}
