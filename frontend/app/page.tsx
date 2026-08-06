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
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [recruiterCount, setRecruiterCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brainSummary, setBrainSummary] = useState<BrainSummary>(initialBrainSummary);
  const [brainLoading, setBrainLoading] = useState(false);
  const [brainError, setBrainError] = useState<string | null>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  useEffect(() => {
    loadOverview();
    loadBrainSummary();

    const handleApplicationCreated = () => {
      loadOverview();
    };

    window.addEventListener(APPLICATION_CREATED_EVENT, handleApplicationCreated);
    return () => {
      window.removeEventListener(APPLICATION_CREATED_EVENT, handleApplicationCreated);
    };
  }, []);

  async function loadOverview() {
    setIsLoading(true);
    setError(null);

    try {
      const [applicationsCount, companiesCount, recruitersCount, applicationsData, inboxData] = await Promise.all([
        fetchCount('/applications'),
        fetchCount('/companies'),
        fetchCount('/recruiters'),
        fetchJson<Application[]>('/applications'),
        fetchJson<unknown>('/gmail/test'),
      ]);

      setApplicationCount(applicationsCount);
      setCompanyCount(companiesCount);
      setRecruiterCount(recruitersCount);
      setApplications(Array.isArray(applicationsData) ? applicationsData.slice(0, 5) : []);
      setEmailCount(Array.isArray(inboxData) ? inboxData.length : 0);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load dashboard');
      setApplicationCount(0);
      setCompanyCount(0);
      setRecruiterCount(0);
      setApplications([]);
      setEmailCount(0);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBrainSummary() {
    setBrainLoading(true);
    setBrainError(null);

    try {
      const data = await fetchJson<BrainSummary>('/brain/inbox-summary');
      if (data) {
        setBrainSummary(data);
      } else {
        throw new Error('Unable to load inbox intelligence');
      }
    } catch (fetchError) {
      setBrainError(fetchError instanceof Error ? fetchError.message : 'Unable to load inbox intelligence');
      setBrainSummary(initialBrainSummary);
    } finally {
      setBrainLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-3xl bg-white px-6 py-6 shadow-sm ring-1 ring-slate-200 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Atlas</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">{greeting}</h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/applications"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <p className="text-sm font-medium text-slate-500">Applications</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{applicationCount}</p>
          </Link>
          <Link
            href="/companies"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <p className="text-sm font-medium text-slate-500">Companies</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{companyCount}</p>
          </Link>
          <Link
            href="/recruiters"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <p className="text-sm font-medium text-slate-500">Recruiters</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{recruiterCount}</p>
          </Link>
          <Link
            href="/inbox"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <p className="text-sm font-medium text-slate-500">Inbox</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{emailCount}</p>
          </Link>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Recent Applications</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Latest activity</h2>
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : applications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                No applications yet
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{application.company_name ?? 'Unknown Company'}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-600">
                        {application.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{application.position}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Inbox Intelligence</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Brain summary</h2>
              </div>

              {brainLoading ? (
                <p className="text-sm text-slate-500">Loading inbox intelligence…</p>
              ) : brainError ? (
                <div className="rounded-3xl bg-rose-50 px-4 py-4 text-sm text-rose-700 ring-1 ring-rose-100">
                  {brainError}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 px-4 py-4">
                      <p className="text-sm text-slate-500">Total Emails</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{brainSummary.total_emails}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-4 py-4">
                      <p className="text-sm text-slate-500">Recruiter Emails</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{brainSummary.recruiter_emails}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-4 py-4">
                      <p className="text-sm text-slate-500">Interview Emails</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{brainSummary.interview_emails}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Latest Subjects</p>
                      {brainSummary.latest_subjects.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">No recent subjects</p>
                      ) : (
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                          {brainSummary.latest_subjects.slice(0, 5).map((subject, index) => (
                            <li key={index} className="rounded-2xl bg-slate-50 px-3 py-2">
                              {subject || 'No subject'}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">Needs Reply</p>
                      {brainSummary.needs_reply.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">No emails need reply</p>
                      ) : (
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                          {brainSummary.needs_reply.slice(0, 5).map((item, index) => (
                            <li key={index} className="rounded-2xl bg-slate-50 px-3 py-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
              <div className="mt-6 grid gap-3">
                <Link href="/applications" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Applications
                </Link>
                <Link href="/companies" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Companies
                </Link>
                <Link href="/recruiters" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Recruiters
                </Link>
                <Link href="/inbox" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Inbox
                </Link>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
