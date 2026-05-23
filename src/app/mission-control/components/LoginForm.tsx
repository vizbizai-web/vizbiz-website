'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm({ redirect }: { redirect?: string }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/mission-control/api/auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        router.push(redirect || '/mission-control');
        router.refresh();
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-slate-800/50 bg-[#111118] p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="box-border w-full max-w-full rounded-lg border border-slate-700 bg-[#0a0a0f] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            placeholder="Enter password"
            required
            autoFocus
          />
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full max-w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authenticating...
            </span>
          ) : (
            'Access Mission Control'
          )}
        </button>
      </form>
    </div>
  );
}
