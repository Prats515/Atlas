'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold text-slate-950">Hi Prathamesh 👋</h2>
            <p className="mt-2 text-slate-600 max-w-sm">Ask me anything about your emails, recruiters, applications or companies.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`rounded-3xl px-4 py-3 text-sm max-w-[80%] ${message.sender === 'user' ? 'bg-slate-950 text-white self-end' : 'bg-slate-100 text-slate-900 self-start'}`}>
              {message.text}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                setMessages([...messages, { sender: 'user', text: input }]);
                setInput('');
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            onClick={() => {
              if (input.trim()) {
                setMessages([...messages, { sender: 'user', text: input }]);
                setInput('');
              }
            }}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
