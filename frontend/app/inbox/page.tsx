'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchJson, postJson } from '@/services/api';

interface InboxEmail {
  id: string;
  sender: string;
  subject: string;
  date: string;
  snippet?: string;
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
  const [intelligence, setIntelligence] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const selectedEmail = useMemo(() => emails.find(e => e.id === selectedEmailId), [emails, selectedEmailId]);

  useEffect(() => {
    loadInbox();
    loadIntelligence();
  }, []);

  useEffect(() => {
    if (selectedEmailId) {
      analyzeEmail(selectedEmailId);
      suggestReply(selectedEmailId);
    } else {
      setAnalysis(null);
      setSuggestedReply(null);
    }
  }, [selectedEmailId]);

  async function analyzeEmail(emailId: string) {
    setIsAnalysisLoading(true);
    setAnalysis(null);
    try {
      const data = await postJson<EmailAnalysis>('/analyze-email?email_id=' + emailId, {});
      setAnalysis(data);
    } catch {
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
    } catch {
      setSuggestedReply(null);
    } finally {
      setIsReplyLoading(false);
    }
  }

  async function loadIntelligence() {
    try {
      const data = await fetchJson<{ summary: string }>('/brain/inbox-intelligence');
      setIntelligence(data ? data.summary : null);
    } catch {
      setIntelligence(null);
    }
  }

  async function loadInbox() {
    setIsLoading(true);
    try {
      const data = await fetchJson<InboxEmail[]>('/gmail/test');
      setEmails(Array.isArray(data) ? data : []);
    } catch {
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* 1. Folders */}
      <div className="w-48 flex-shrink-0 space-y-1">
        {['Inbox', 'Starred', 'Sent', 'Drafts'].map(label => (
          <button key={label} className="w-full text-left px-4 py-2 text-sm text-zinc-600 rounded-lg hover:bg-zinc-100 font-medium">
            {label}
          </button>
        ))}
      </div>

      {/* 2. Email List */}
      <div className="w-96 flex-shrink-0 overflow-y-auto border-r border-zinc-200 space-y-2 pr-2">
        {isLoading ? <p className="p-4 text-sm text-zinc-500">Loading...</p> : emails.map(email => (
          <button 
            key={email.id} 
            onClick={() => setSelectedEmailId(email.id)}
            className={`w-full text-left p-4 rounded-xl border transition ${selectedEmailId === email.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
          >
            <p className="font-semibold text-sm text-zinc-950 truncate">{email.sender}</p>
            <p className="text-sm font-medium text-zinc-900 truncate">{email.subject}</p>
            <p className="text-xs text-zinc-500 truncate mt-1">{email.snippet}</p>
          </button>
        ))}
      </div>

      {/* 3. Preview */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
        {selectedEmail ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-950">{selectedEmail.subject}</h2>
              <p className="text-sm text-zinc-500 mt-2">From: {selectedEmail.sender} | {selectedEmail.date}</p>
            </div>
            
            <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-6 space-y-4">
              <h3 className="font-semibold text-zinc-950">Atlas AI Analysis</h3>
              {isAnalysisLoading ? <p className="text-sm text-zinc-500">Analyzing...</p> : analysis ? (
                <div className="text-sm text-zinc-700 space-y-2">
                  <p>{analysis.summary}</p>
                  <p><strong>Priority:</strong> {analysis.priority}</p>
                  <p><strong>Action:</strong> {analysis.required_action}</p>
                </div>
              ) : <p className="text-sm text-zinc-500">No analysis available.</p>}
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-6 space-y-4">
              <h3 className="font-semibold text-zinc-950">Suggested Reply</h3>
              {isReplyLoading ? <p className="text-sm text-zinc-500">Generating...</p> : suggestedReply ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-700 bg-white p-4 rounded-lg border border-zinc-100">{suggestedReply}</p>
                  <button onClick={() => navigator.clipboard.writeText(suggestedReply)} className="text-xs font-semibold text-blue-600">Copy Reply</button>
                </div>
              ) : <p className="text-sm text-zinc-500">No suggestion available.</p>}
            </div>

            <div className="text-sm text-zinc-800 leading-relaxed pt-4 border-t border-zinc-100">
              {selectedEmail.snippet}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400">Select an email to view</div>
        )}
      </div>
    </div>
  );
}
