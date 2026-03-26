import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Mission Control',
  description: 'System settings and configuration',
  robots: { index: false, follow: false }
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">System configuration and preferences</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center text-3xl mx-auto mb-4">
          ⚙️
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Coming soon</p>
        <p className="text-sm text-slate-500 mt-4 max-w-md mx-auto">
          This section will contain system configuration, agent preferences, notification settings, and integration management.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-4">
          <div className="text-2xl font-bold text-white">6</div>
          <div className="text-sm text-slate-400">Active Agents</div>
        </div>
        <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-4">
          <div className="text-2xl font-bold text-white">2</div>
          <div className="text-sm text-slate-400">Active Projects</div>
        </div>
        <div className="bg-[#111118] rounded-xl border border-slate-800/50 p-4">
          <div className="text-2xl font-bold text-white">v0.1.0</div>
          <div className="text-sm text-slate-400">System Version</div>
        </div>
      </div>
    </div>
  );
}
