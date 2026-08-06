'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { deleteJson, fetchJson, postJson, putJson } from '@/services/api';
import { usePageSearch } from '@/components/AppShell';

interface Recruiter {
  id: number;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
}

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadRecruiters();
  }, []);

  const { search } = usePageSearch();
  const recruiterCountText = useMemo(() => `${recruiters.length} ${recruiters.length === 1 ? 'recruiter' : 'recruiters'}`, [recruiters.length]);
  const isEditing = Boolean(selectedRecruiter);

  const filteredRecruiters = useMemo(() => {
    if (!search.trim()) {
      return recruiters;
    }

    const query = search.trim().toLowerCase();
    return recruiters.filter((recruiter) => {
      return [recruiter.name, recruiter.company, recruiter.email, recruiter.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [recruiters, search]);

  async function loadRecruiters() {
    setError(null);
    setIsLoading(true);

    try {
      const data = await fetchJson<Recruiter[]>('/recruiters');
      setRecruiters(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load recruiters');
      setRecruiters([]);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setSelectedRecruiter(null);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(recruiter: Recruiter) {
    setSelectedRecruiter(recruiter);
    setName(recruiter.name);
    setCompany(recruiter.company ?? '');
    setEmail(recruiter.email ?? '');
    setPhone(recruiter.phone ?? '');
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Recruiter name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      };

      const result = selectedRecruiter
        ? await putJson<Recruiter>(`/recruiters/${selectedRecruiter.id}`, payload)
        : await postJson<Recruiter>('/recruiters', payload);

      if (!result) {
        throw new Error(selectedRecruiter ? 'Unable to update recruiter' : 'Unable to create recruiter');
      }

      await loadRecruiters();
      setIsModalOpen(false);
      setSelectedRecruiter(null);
      setSuccessMessage(selectedRecruiter ? 'Recruiter updated successfully.' : 'Recruiter created successfully.');
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Unable to save recruiter');
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
      const deleted = await deleteJson(`/recruiters/${deleteId}`);
      if (!deleted) {
        throw new Error('Unable to delete recruiter');
      }

      await loadRecruiters();
      setSuccessMessage('Recruiter deleted successfully.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete recruiter');
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recruiters</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Recruiters</h1>
            <p className="mt-2 text-sm text-slate-600">{recruiterCountText}</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + New Recruiter
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
              Loading recruiters…
            </div>
          ) : filteredRecruiters.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              {search.trim() ? 'No recruiters match your search.' : 'No recruiters yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecruiters.map((recruiter) => (
                <div key={recruiter.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{recruiter.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{recruiter.company || 'Company not available'}</p>
                    </div>
                    <p className="text-sm text-slate-500">{recruiter.email || 'No email'}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-700">{recruiter.phone || 'No phone provided'}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(recruiter)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(recruiter.id)}
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
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{isEditing ? 'Edit Recruiter' : 'New Recruiter'}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{isEditing ? 'Update recruiter' : 'Create recruiter'}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRecruiter(null);
                }}
                className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Doe"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Company
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Acme Inc."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="jane@example.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Phone
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(555) 555-5555"
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
                    setSelectedRecruiter(null);
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
            <h2 className="text-xl font-semibold text-slate-950">Delete recruiter?</h2>
            <p className="mt-3 text-sm text-slate-600">This action cannot be undone. Are you sure you want to delete this recruiter?</p>
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
