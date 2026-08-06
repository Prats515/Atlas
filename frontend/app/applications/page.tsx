'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { fetchJson, postJson } from '@/services/api';

const statusOptions = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'ASSESSMENT',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
] as const;

const sourceOptions = [
  'LinkedIn',
  'Naukri',
  'Indeed',
  'Referral',
  'Career Page',
  'Other',
] as const;

type StatusOption = (typeof statusOptions)[number];
type SourceOption = (typeof sourceOptions)[number];

interface Application {
  id: number;
  company_id: number | null;
  company_name: string | null;
  recruiter_id?: number | null;
  position: string;
  status: StatusOption;
  source: SourceOption;
  applied_date: string | null;
}

interface Company {
  id: number;
  name: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCompanyId, setFormCompanyId] = useState<number | ''>('');
  const [formPosition, setFormPosition] = useState('');
  const [formStatus, setFormStatus] = useState<StatusOption>(statusOptions[0]);
  const [formSource, setFormSource] = useState<SourceOption>(sourceOptions[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
    loadCompanies();
  }, []);

  const companyOptions = useMemo(() => companies, [companies]);

  async function loadApplications() {
    setApiError(null);
    setIsLoading(true);

    try {
      const data = await fetchJson<Application[]>('/applications');
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const data = await fetchJson<Company[]>('/companies');
      setCompanies(Array.isArray(data) ? data : []);
    } catch {
      setCompanies([]);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!formCompanyId) {
      setFormError('Choose a company');
      return;
    }
    if (!formPosition.trim()) {
      setFormError('Enter a position');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const result = await postJson('/applications', {
        user_id: 1,
        company_id: formCompanyId,
        position: formPosition.trim(),
        status: formStatus,
        source: formSource,
      });

      if (!result) {
        throw new Error('Unable to create application');
      }

      await loadApplications();
      window.dispatchEvent(new Event('atlas:application-created'));
      setIsModalOpen(false);
      setFormCompanyId('');
      setFormPosition('');
      setFormStatus(statusOptions[0]);
      setFormSource(sourceOptions[0]);
      setSuccessMessage('Application created successfully.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (successMessage) {
      const timeout = window.setTimeout(() => setSuccessMessage(null), 3000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white px-6 py-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Applications</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Applications</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            + New Application
          </button>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-950">{application.company_name ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{application.position}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{application.status}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{application.source}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{application.applied_date ? new Date(application.applied_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading ? (
            <div className="mt-6 text-sm text-slate-500">Loading applications…</div>
          ) : null}

          {!isLoading && applications.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No applications yet
            </div>
          ) : null}

          {apiError ? (
            <div className="mt-6 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
              {apiError}
            </div>
          ) : null}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">New Application</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create application</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Company
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    value={formCompanyId}
                    onChange={(event) => setFormCompanyId(Number(event.target.value) || '')}
                    required
                  >
                    <option value="">Select company</option>
                    {companyOptions.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Position
                  <input
                    value={formPosition}
                    onChange={(event) => setFormPosition(event.target.value)}
                    placeholder="e.g. Product Manager"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Status
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    value={formStatus}
                    onChange={(event) => setFormStatus(event.target.value as StatusOption)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Source
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    value={formSource}
                    onChange={(event) => setFormSource(event.target.value as SourceOption)}
                  >
                    {sourceOptions.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {formError ? (
                <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
                  {formError}
                </div>
              ) : null}
              {successMessage ? (
                <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
