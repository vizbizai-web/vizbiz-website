
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ActivityFeed, ParsedDay } from './ActivityFeed';

const AGENTS = ['Vlad', 'Forge', 'Reko', 'Pulse', 'Gekko'] as const;
const AGENT_EMOJI: Record<string, string> = {
  Vlad: '🏗️',
  Forge: '🔨',
  Reko: '🔍',
  Pulse: '📢',
  Gekko: '📈',
};

interface Event {
  time: string;
  agent: string;
  agentEmoji: string;
  text: string;
  files: string[];
}

function parseDailyLog(content: string, dateLabel: string): Event[] {
  const lines = content.split('\n');
  const events: Event[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Look for agent mentions
    let matchedAgent = '';
    for (const agent of AGENTS) {
      if (trimmed.includes(agent)) {
        matchedAgent = agent;
        break;
      }
    }

    // Extract file paths
    const fileMatches = trimmed.match(/[\w/.-]+\.(md|tsx?|json|css|py|sh)/g) || [];

    // Only include lines that look like substantive events (bullets or numbered items with content)
    if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/) || trimmed.startsWith('##') || trimmed.startsWith('###')) {
      const text = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^#+\s*/, '');
      if (text.length > 5) {
        events.push({
          time: dateLabel,
          agent: matchedAgent || 'System',
          agentEmoji: matchedAgent ? AGENT_EMOJI[matchedAgent] : '⚙️',
          text: text.length > 200 ? text.slice(0, 200) + '…' : text,
          files: fileMatches,
        });
      }
    }
  }

  return events;
}

function loadDays(): ParsedDay[] {
  const memoryDir = join(process.cwd(), '..', '..', 'memory');
  let files: string[];
  try {
    files = readdirSync(memoryDir)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse()
      .slice(0, 3);
  } catch {
    return [];
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return files.map((f) => {
    const dateStr = f.replace('.md', '');
    let label: string;
    if (dateStr === today) label = 'Today';
    else if (dateStr === yesterday) label = 'Yesterday';
    else label = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const content = readFileSync(join(memoryDir, f), 'utf-8');
    return { label, date: dateStr, events: parseDailyLog(content, dateStr) };
  });
}

export default function ActivityPage() {
  const days = loadDays();
  const totalEvents = days.reduce((s, d) => s + d.events.length, 0);
  const totalFiles = days.reduce(
    (s, d) => s + d.events.reduce((e, ev) => e + ev.files.length, 0),
    0
  );
  const agentsUsed = new Set(days.flatMap((d) => d.events.map((e) => e.agent))).size;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Agent Activity</h1>
        <p className="text-slate-400">Recent events from daily logs</p>
      </div>

      <ActivityFeed days={days} totalEvents={totalEvents} totalFiles={totalFiles} agentsUsed={agentsUsed} />
    </div>
  );
}
