'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { deleteJson, fetchJson, postJson, putJson } from '@/services/api';
import { usePageSearch } from '@/components/AppShell';

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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
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

  const { search } = usePageSearch();
  const companyCountText = useMemo(() => `${companies.length} ${companies.length === 1 ? 'company' : 'companies'}`, [companies.length]);
  const isEditing = Boolean(selectedCompany);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) {
      return companies;
    }

    const query = search.trim().toLowerCase();
    return companies.filter((company) => {
      return [company.name, company.website, company.industry, company.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [companies, search]);

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

  function openCreateModal() {
    setSelectedCompany(null);
    setName('');
    setWebsite('');
    setIndustry('');
    setLocation('');
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(company: Company) {
    setSelectedCompany(company);
    setName(company.name);
    setWebsite(company.website ?? '');
    setIndustry(company.industry ?? '');
    setLocation(company.location ?? '');
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Company name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
        location: location.trim() || undefined,
      };

      const result = selectedCompany
        ? await putJson<Company>(`/companies/${selectedCompany.id}`, payload)
        : await postJson<Company>('/companies', payload);

      if (!result) {
        throw new Error(selectedCompany ? 'Unable to update company' : 'Unable to create company');
      }

      await loadCompanies();
      setIsModalOpen(false);
      setSelectedCompany(null);
      setSuccessMessage(selectedCompany ? 'Company updated successfully.' : 'Company created successfully.');
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : 'Unable to save company');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (deleteId === null) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const deleted = await deleteJson(`/companies/${deleteId}`);
      if (!deleted) {
        throw new Error('Unable to delete company');
      }

      await loadCompanies();
      setSuccessMessage('Company deleted successfully.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete company');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
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
            onClick={openCreateModal}
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
          ) : filteredCompanies.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              {search.trim() ? 'No companies match your search.' : 'No companies yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{company.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{company.industry || 'Industry not available'}</p>
                    </div>
                    <p className="text-sm text-slate-500">{company.location || 'Location unknown'}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-700">{company.website ? company.website : 'No website provided'}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(company)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(company.id)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 transition hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
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
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{isEditing ? 'Edit Company' : 'New Company'}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{isEditing ? 'Update company' : 'Create company'}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCompany(null);
                }}
                className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedCompany(null);
                  }}
                  className="inline-flex justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (isEditing ? 'Updating…' : 'Creating…') : isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-950">Delete company?</h2>
            <p className="mt-3 text-sm text-slate-600">This action cannot be undone. Are you sure you want to delete this company?</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="inline-flex justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
