'use client';

import { useState } from 'react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000';

interface GmailMessage {
  subject: string;
  sender: string;
  received_date: string;
}

export default function GmailTestPage() {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    setMessages([]);

    const email = window.prompt('Enter your authenticated email to fetch Gmail messages');
    if (!email) {
      setError('Email is required to connect Gmail.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/gmail/test?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || 'Failed to fetch Gmail messages.');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', padding: '40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#ffffff', borderRadius: 28, padding: 32, boxShadow: '0 24px 80px rgba(20, 20, 40, 0.08)' }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#111827' }}>Gmail Connection</h1>
        <p style={{ marginTop: 8, color: '#6b7280' }}>Connect your Gmail account and preview your latest messages.</p>

        <button
          onClick={handleConnect}
          disabled={isLoading}
          style={{
            marginTop: 24,
            padding: '14px 24px',
            borderRadius: 16,
            border: 'none',
            background: '#000000',
            color: '#ffffff',
            fontSize: 16,
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Connecting…' : 'Connect Gmail'}
        </button>

        {error ? (
          <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        ) : null}

        {messages.length > 0 ? (
          <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
            {messages.map((message, index) => (
              <div key={index} style={{ padding: 20, borderRadius: 20, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{message.sender}</div>
                <div style={{ marginTop: 10, fontSize: 18, fontWeight: 600, color: '#111827' }}>{message.subject || 'No subject'}</div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>{message.received_date}</div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div style={{ marginTop: 24, color: '#6b7280' }}>
              Click Connect Gmail to load the latest messages.
            </div>
          )
        )}
      </div>
    </div>
  );
}
