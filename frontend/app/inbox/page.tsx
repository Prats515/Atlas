'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchJson, postJson } from '@/services/api';
import { usePageSearch } from '@/components/AppShell';

interface InboxEmail {
  id: string;
  sender: string;
  subject: string;
  date: string;
  snippet?: string;
  matchedCompany?: Company | null;
  matchedRecruiter?: Recruiter | null;
  matchedApplication?: Application | null;
}

interface Application {
  id: number;
  company_id: number | null;
  company_name: string | null;
  recruiter_id?: number | null;
  position: string;
}

interface Company {
  id: number;
  name: string;
}

interface Recruiter {
  id: number;
  name: string;
  email?: string | null;
}

interface EmailAnalysis {
  summary: string;
  priority: 'High' | 'Medium' | 'Low';
  required_action: string;
  deadline: string | null;
  key_people: string[];
  key_company: string | null;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [intelligence, setIntelligence] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIntellLoading, setIsIntellLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intellError, setIntellError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null);

  useEffect(() => {
    if (selectedEmail) {
      analyzeEmail(selectedEmail.id);
      suggestReply(selectedEmail.id);
    } else {
      setAnalysis(null);
      setSuggestedReply(null);
    }
  }, [selectedEmail]);

  async function analyzeEmail(emailId: string) {
    setIsAnalysisLoading(true);
    setAnalysis(null);
    try {
      const data = await postJson<EmailAnalysis>('/analyze-email?email_id=' + emailId, {});
      setAnalysis(data);
    } catch (e) {
      setAnalysis(null);
    } finally {
      setIsAnalysisLoading(false);
    }
  }

  async function suggestReply(emailId: string) {
    setIsReplyLoading(true);
    setSuggestedReply(null);
    try {
      const data = await postJson<{ reply: string }>('/suggest-reply?email_id=' + emailId, {});
      setSuggestedReply(data ? data.reply : null);
    } catch (e) {
      setSuggestedReply(null);
    } finally {
      setIsReplyLoading(false);
    }
  }

  const { search } = usePageSearch();
  const filteredEmails = useMemo(() => {
    if (!search.trim()) {
      return emails;
    }

    const query = search.trim().toLowerCase();
    return emails.filter((email) => {
      return [email.sender, email.subject, email.date, email.snippet]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [emails, search]);

  const hasEmails = filteredEmails.length > 0;

  const matchedEmails = useMemo(() => {
    const lowerCaseName = (value?: string | null) => String(value || '').toLowerCase();

    return filteredEmails.map((email) => {
      const sender = lowerCaseName(email.sender);
      const subject = lowerCaseName(email.subject);
      const sourceDomain = sender.split('@')[1] || '';

      const matchedRecruiter = recruiters.find((recruiter) => {
        const recruiterEmail = lowerCaseName(recruiter.email);
        return recruiterEmail && sender.includes(recruiterEmail);
      });

      const matchedCompany = companies.find((company) => {
        const companyName = lowerCaseName(company.name);
        return companyName && (subject.includes(companyName) || sender.includes(companyName) || sourceDomain.includes(companyName));
      });

      const matchedApplication = applications.find((application) => {
        const companyName = lowerCaseName(application.company_name);
        const position = lowerCaseName(application.position);

        return (
          (companyName && (subject.includes(companyName) || sender.includes(companyName) || sourceDomain.includes(companyName))) ||
          (position && subject.includes(position))
        );
      });

      return {
        ...email,
        matchedCompany,
        matchedRecruiter,
        matchedApplication,
      };
    });
  }, [filteredEmails, companies, recruiters, applications]);

  const formattedCount = useMemo(() => `${filteredEmails.length} ${filteredEmails.length === 1 ? 'email' : 'emails'}`, [filteredEmails.length]);

  useEffect(() => {
    loadInbox();
    loadApplications();
    loadCompanies();
    loadRecruiters();
    loadIntelligence();
  }, []);

  async function loadIntelligence() {
    setIntellError(null);
    setIsIntellLoading(true);
    try {
      const data = await fetchJson<{ summary: string }>('/brain/inbox-intelligence');
      setIntelligence(data ? data.summary : null);
    } catch (e) {
      setIntellError('Unable to load intelligence');
    } finally {
      setIsIntellLoading(false);
    }
  }

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

  async function loadApplications() {
    try {
      const data = await fetchJson<Application[]>('/applications');
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
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

  async function loadRecruiters() {
    try {
      const data = await fetchJson<Recruiter[]>('/recruiters');
      setRecruiters(Array.isArray(data) ? data : []);
    } catch {
      setRecruiters([]);
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

        {isIntellLoading ? (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500 shadow-sm">
            Atlas is analyzing your inbox…
          </div>
        ) : intellError ? (
          <div className="mb-6 rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-100 shadow-sm">
            {intellError}
          </div>
        ) : intelligence ? (
          <div className="mb-6 rounded-3xl bg-white px-6 py-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">Atlas Inbox Intelligence</h2>
            <div className="mt-4 text-sm text-slate-700 whitespace-pre-line">{intelligence}</div>
          </div>
        ) : null}

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Loading emails…
            </div>
          ) : hasEmails ? (
            matchedEmails.map((email) => (
              <button
                key={email.id}
                type="button"
                onClick={() => setSelectedEmail(email)}
                className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{email.sender}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{email.subject || 'No subject'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                      {email.matchedCompany ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">Company</span>
                      ) : null}
                      {email.matchedRecruiter ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">Recruiter</span>
                      ) : null}
                      {email.matchedApplication ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">Application</span>
                      ) : null}
                      {!email.matchedCompany && !email.matchedRecruiter && !email.matchedApplication ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">Unlinked</span>
                      ) : null}
                    </div>
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
              {search.trim() ? 'No emails match your search.' : 'No emails found.'}
            </div>
          )}
        </div>

        {selectedEmail ? (
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Email details</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{selectedEmail.subject || 'No subject'}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-semibold text-slate-950">Atlas AI Analysis</h3>
              {isAnalysisLoading ? (
                <div className="mt-4 text-sm text-slate-500">Analyzing email…</div>
              ) : analysis ? (
                <div className="mt-4 space-y-4 text-sm text-slate-700">
                  <p className="leading-6">{analysis.summary}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <span className="block text-xs font-semibold uppercase text-slate-500">Priority</span>
                      <p className={`mt-1 font-semibold ${analysis.priority === 'High' ? 'text-rose-600' : analysis.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>{analysis.priority}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <span className="block text-xs font-semibold uppercase text-slate-500">Deadline</span>
                      <p className="mt-1 font-semibold text-slate-950">{analysis.deadline || 'None'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-slate-500">Required Action</span>
                    <p className="mt-1 font-medium text-slate-950">{analysis.required_action}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="block text-xs font-semibold uppercase text-slate-500">Key People</span>
                      <p className="mt-1 font-medium text-slate-950">{analysis.key_people.join(', ') || 'None'}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase text-slate-500">Key Company</span>
                      <p className="mt-1 font-medium text-slate-950">{analysis.key_company || 'None'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-rose-700">Unable to analyze email.</div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-semibold text-slate-950">Suggested Reply</h3>
              {isReplyLoading ? (
                <div className="mt-4 text-sm text-slate-500">Generating reply…</div>
              ) : suggestedReply ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 leading-6">
                    {suggestedReply}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(suggestedReply)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Copy Reply
                  </button>
                </div>
              ) : (
                <div className="mt-4 text-sm text-rose-700">Unable to generate reply.</div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 space-y-4 text-sm text-slate-700">
              <div>
                <span className="block text-slate-500">Sender</span>
                <p className="mt-1 font-semibold text-slate-950">{selectedEmail.sender}</p>
              </div>
              <div>
                <span className="block text-slate-500">Date</span>
                <p className="mt-1 font-semibold text-slate-950">{selectedEmail.date}</p>
              </div>
              {selectedEmail.snippet ? (
                <div>
                  <span className="block text-slate-500">Snippet</span>
                  <p className="mt-1 text-slate-700">{selectedEmail.snippet}</p>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="block text-slate-500">Matched Company</span>
                  <p className="mt-1 font-semibold text-slate-950">
                    {selectedEmail.matchedCompany?.name || 'None'}
                  </p>
                </div>
                <div>
                  <span className="block text-slate-500">Matched Recruiter</span>
                  <p className="mt-1 font-semibold text-slate-950">
                    {selectedEmail.matchedRecruiter?.name || 'None'}
                  </p>
                </div>
                <div>
                  <span className="block text-slate-500">Matched Application</span>
                  <p className="mt-1 font-semibold text-slate-950">
                    {selectedEmail.matchedApplication ? selectedEmail.matchedApplication.position : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
