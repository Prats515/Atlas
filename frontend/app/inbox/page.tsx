'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '@/services/api';

interface InboxEmail {
  id: string;
  sender: string;
  subject: string;
  date: string;
  snippet?: string;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEmails = emails.length > 0;
  const formattedCount = useMemo(() => `${emails.length} ${emails.length === 1 ? 'email' : 'emails'}`, [emails.length]);

  useEffect(() => {
    loadInbox();
  }, []);

  async function loadInbox() {
    setError(null);
    setIsLoading(true);

    try {
      const data = await fetchJson<InboxEmail[]>('/gmail/test');
      setEmails(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load inbox');
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSync() {
    setError(null);
    setIsSyncing(true);

    try {
      const data = await fetchJson<InboxEmail[]>('/gmail/test');
      setEmails(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to sync Gmail');
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white px-6 py-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Inbox</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Inbox</h1>
            <p className="mt-2 text-sm text-slate-600">{formattedCount}</p>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSyncing ? 'Syncing…' : 'Sync Gmail'}
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Loading emails…
            </div>
          ) : hasEmails ? (
            emails.map((email) => (
              <button
                key={email.id}
                type="button"
                onClick={() => {}}
                className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{email.sender}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{email.subject || 'No subject'}</p>
                  </div>
                  <p className="text-sm text-slate-500">{email.date}</p>
                </div>
                {email.snippet ? (
                  <p className="mt-4 text-sm leading-6 text-slate-600">{email.snippet}</p>
                ) : null}
              </button>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No emails found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
