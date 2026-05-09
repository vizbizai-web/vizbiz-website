'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Draft {
  leadId: string;
  dealershipName: string;
  email: string;
  contactName: string;
  city: string;
  website: string;
  status: string;
  subject: string;
  body: string;
  templateName: string;
}

function useEmailDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email-drafts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDrafts(json.drafts || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { drafts, loading, error, refetch: fetchData };
}

function useLeadAction() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const runAction = async (leadId: string, action: string, data?: any) => {
    setLoadingId(leadId);
    setErrorId(null);
    try {
      const res = await fetch('/api/lead-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action, data }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLoadingId(null);
      return true;
    } catch (err: any) {
      setErrorId(leadId);
      setLoadingId(null);
      return false;
    }
  };

  return { runAction, loadingId, errorId };
}

export default function EmailsPage() {
  const { drafts, loading, error, refetch } = useEmailDrafts();
  const { runAction, loadingId, errorId } = useLeadAction();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = drafts.filter((d) => {
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchSearch =
      search === '' ||
      d.dealershipName?.toLowerCase().includes(search.toLowerCase()) ||
      d.contactName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleApprove = async (draft: Draft) => {
    const ok = await runAction(draft.leadId, 'update_status', { status: 'contacted' });
    if (ok) {
      setConfirmId(null);
      refetch();
    }
  };

  const handleReject = async (draft: Draft) => {
    const ok = await runAction(draft.leadId, 'update_status', { status: 'approved' });
    if (ok) refetch();
  };

  const handleEditSave = (draft: Draft) => {
    // TODO: Wire to real save endpoint when available
    console.log('Save edit', draft.leadId, editBody);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Emails</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Email Hub</h1>
          <p className="text-slate-400 mt-1">
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''} ready for review
          </p>
        </div>
        {loading && <span className="text-slate-500 text-sm">Loading...</span>}
      </div>

      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          Error: {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111118] border border-slate-800/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-600"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111118] border border-slate-800/50 text-white text-sm focus:outline-none focus:border-slate-600"
        >
          <option value="all">All Statuses</option>
          <option value="email_drafted">Drafted</option>
          <option value="contacted">Contacted</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        {filtered.length === 0 && !loading && (
          <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-8 text-center">
            <p className="text-slate-400">No drafts match your filters</p>
          </div>
        )}

        {filtered.map((draft) => {
          const isExpanded = expandedId === draft.leadId;
          const isEditing = editingId === draft.leadId;
          const isLoading = loadingId === draft.leadId;
          const isError = errorId === draft.leadId;

          return (
            <div
              key={draft.leadId}
              className="bg-[#111118] border border-slate-800/50 rounded-xl p-5 hover:border-slate-600 transition-colors"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/mission-control/leads/${draft.leadId}`}
                    className="text-white font-medium text-sm hover:text-blue-400 transition-colors"
                  >
                    {draft.dealershipName || 'Unknown Dealership'}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {draft.contactName} • {draft.email} • {draft.city}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 whitespace-nowrap">
                  {draft.status}
                </span>
              </div>

              {/* Subject */}
              <p className="text-sm text-slate-300 mt-3 font-medium">{draft.subject || 'No subject'}</p>

              {/* Preview */}
              {!isEditing && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-3">
                  {draft.body?.split('\n').slice(0, 3).join('\n') || 'No body'}
                </p>
              )}

              {/* Expanded body */}
              {isExpanded && !isEditing && (
                <div className="mt-3 bg-slate-900/50 rounded-lg p-4">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{draft.body}</pre>
                </div>
              )}

              {/* Inline editor */}
              {isEditing && (
                <div className="mt-3">
                  <textarea
                    className="w-full h-48 bg-slate-900/50 border border-slate-800/50 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-slate-600 font-sans resize-y"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditSave(draft)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/50">
                <button
                  onClick={() => {
                    if (isExpanded) {
                      setExpandedId(null);
                    } else {
                      setExpandedId(draft.leadId);
                      setEditingId(null);
                    }
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>

                <button
                  onClick={() => {
                    if (isEditing) {
                      setEditingId(null);
                    } else {
                      setEditingId(draft.leadId);
                      setEditBody(draft.body || '');
                      setExpandedId(null);
                    }
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                >
                  {isEditing ? 'Close Editor' : 'Edit'}
                </button>

                <button
                  onClick={() => setConfirmId(draft.leadId)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? '...' : 'Approve for Sending'}
                </button>

                <button
                  onClick={() => handleReject(draft)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>

                {isError && <span className="text-xs text-red-400">Error</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirmId && (
        (() => {
          const draft = drafts.find((d) => d.leadId === confirmId);
          if (!draft) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-[#111118] border border-slate-800/50 rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-white mb-2">Approve for Sending</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Send this email to {draft.contactName} at {draft.email}?
                </p>
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                  Email will be sent after Alex&apos;s final approval.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(draft)}
                    className="px-4 py-2 rounded-lg text-sm bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
