'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { fetchJson, postJson } from '@/services/api';

interface Company {
  id: number;
  name: string;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const companyCountText = useMemo(() => `${companies.length} ${companies.length === 1 ? 'company' : 'companies'}`, [companies.length]);

  async function loadCompanies() {
    setError(null);
    setIsLoading(true);

    try {
      const data = await fetchJson<Company[]>('/companies');
      setCompanies(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load companies');
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Company name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await postJson<Company>('/companies', {
        name: name.trim(),
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
        location: location.trim() || undefined,
      });

      if (!result) {
        throw new Error('Unable to create company');
      }

      await loadCompanies();
      setIsModalOpen(false);
      setName('');
      setWebsite('');
      setIndustry('');
      setLocation('');
      setSuccessMessage('Company created successfully.');
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : 'Unable to create company');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeout = window.setTimeout(() => setSuccessMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white px-6 py-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Companies</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Companies</h1>
            <p className="mt-2 text-sm text-slate-600">{companyCountText}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + New Company
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
            {successMessage}
          </div>
        ) : null}

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              Loading companies…
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No companies yet.
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{company.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{company.industry || 'Industry not available'}</p>
                    </div>
                    <p className="text-sm text-slate-500">{company.location || 'Location unknown'}</p>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{company.website ? company.website : 'No website provided'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">New Company</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create company</h2>
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
                  Company Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Acme Inc."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Website
                  <input
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://acme.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Industry
                  <input
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    placeholder="Software"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Location
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="San Francisco, CA"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>

              {formError ? (
                <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
                  {formError}
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
