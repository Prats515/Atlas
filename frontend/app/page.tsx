'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchCount, fetchJson } from '@/services/api';

const APPLICATION_CREATED_EVENT = 'atlas:application-created';

interface Application {
  id: number;
  company_name: string | null;
  position: string;
  status: string;
}

interface BrainSummary {
  total_emails: number;
  recruiter_emails: number;
  interview_emails: number;
  companies: string[];
  needs_reply: string[];
  latest_subjects: string[];
}

const initialBrainSummary: BrainSummary = {
  total_emails: 0,
  recruiter_emails: 0,
  interview_emails: 0,
  companies: [],
  needs_reply: [],
  latest_subjects: [],
};

export default function DashboardPage() {
  const [intelligence, setIntelligence] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  useEffect(() => {
    loadIntelligence();
  }, []);

  async function loadIntelligence() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ summary: string }>('/brain/inbox-intelligence');
      setIntelligence(data ? data.summary : null);
    } catch (e) {
      setError('Unable to load your daily briefing');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-3xl bg-white px-8 py-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Atlas</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">{greeting}</h1>
        </header>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center text-slate-500 shadow-sm">
            Preparing your daily briefing...
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-rose-50 px-8 py-6 text-rose-700 ring-1 ring-rose-100 shadow-sm">
            {error}
          </div>
        ) : intelligence ? (
          <div className="rounded-3xl bg-white px-8 py-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-950">Today's Overview</h2>
            <div className="mt-6 text-slate-700 leading-7 whitespace-pre-line">{intelligence}</div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-12 text-center text-slate-500">
            No intelligence data available.
          </div>
        )}
      </div>
    </div>
  );
}
