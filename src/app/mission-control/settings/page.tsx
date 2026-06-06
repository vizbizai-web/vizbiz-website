import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Mission Control',
  description: 'System settings and configuration',
  robots: { index: false, follow: false }
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">System configuration and integration status</p>
      </div>

      <div className="bg-[#111118] rounded-xl border border-amber-500/30 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl">⚠️</div>
          <div>
            <h2 className="text-xl font-semibold text-white">Settings source unavailable</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Mission Control settings are not wired to a durable VizBiz configuration source yet. This page intentionally avoids fake agent counts, fake project counts, or placeholder integration success.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-amber-200">
              Missing integration: approved settings/config store
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
