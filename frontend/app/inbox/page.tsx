'use client';

import { useEffect, useState } from 'react';
import { fetchJson, postJson } from '@/services/api';
import { Card, Badge } from '../../components/ui/primitives';
import { Mail, Inbox, Star, Archive, RefreshCw } from 'lucide-react';

export default function InboxPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadInbox();
  }, []);

  async function loadInbox() {
    const email = localStorage.getItem('atlas_user_email');
    if (!email) return;

    try {
      const data = await fetchJson<any[]>(`/gmail/test?email=${encodeURIComponent(email)}`);
      setEmails(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function handleSync() {
    const email = localStorage.getItem('atlas_user_email');
    if (!email) {
      alert('User not authenticated. Please login again.');
      return;
    }

    setIsSyncing(true);
    try {
      await postJson(`/gmail/sync?email=${email}`, {});
      await loadInbox();
    } catch (e) {
      alert('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      <div className="w-64 space-y-4">
        <button 
           onClick={handleSync}
           disabled={isSyncing}
           className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400"
        >
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? 'Syncing...' : 'Sync Gmail'}
        </button>
        <div className="space-y-1">
          {[ {label: 'Inbox', icon: Inbox}, {label: 'Starred', icon: Star}, {label: 'Archive', icon: Archive} ].map(item => (
            <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 rounded-lg hover:bg-zinc-100 font-medium">
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>
      </div>
...

      <div className="w-96 overflow-y-auto space-y-2">
        {emails.map(email => (
          <button 
            key={email.id} 
            onClick={() => setSelectedEmail(email)}
            className={`w-full text-left p-4 rounded-xl border transition ${selectedEmail?.id === email.id ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100 hover:border-zinc-200'}`}
          >
            <div className="flex justify-between items-start">
               <p className="font-semibold text-sm text-zinc-950">{email.sender}</p>
               <span className="text-xs text-zinc-400">10m</span>
            </div>
            <p className="text-sm font-medium text-zinc-900 mt-1">{email.subject}</p>
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{email.snippet}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-zinc-200 shadow-sm p-8 overflow-y-auto">
        {selectedEmail ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-950">{selectedEmail.subject}</h2>
            <div className="flex items-center gap-2">
               <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">A</div>
               <div>
                 <p className="font-semibold">{selectedEmail.sender}</p>
                 <p className="text-sm text-zinc-500">to me</p>
               </div>
            </div>
            <div className="prose text-zinc-700">{selectedEmail.snippet}</div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400">Select an email to view</div>
        )}
      </div>
    </div>
  );
}
