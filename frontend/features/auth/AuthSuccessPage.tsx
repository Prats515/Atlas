'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { postJson } from '@/services/api';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();
  const [status, setStatus] = useState('Setting up your Atlas workspace...');

  useEffect(() => {
    async function setupWorkspace() {
      if (!email) return;
      localStorage.setItem('atlas_user_email', email);

      try {
        setStatus('Syncing your Gmail...');
        console.log('Syncing Gmail...');
        await postJson(`/gmail/sync?email=${email}`, {});
        
        setStatus('Preparing your inbox intelligence...');
        console.log('Fetching dashboard...');
        // Corrected endpoint from inbox-intelligence to dashboard
        await postJson(`/brain/dashboard`, {});
        
        setStatus('Redirecting to dashboard...');
        router.push('/');
      } catch (e) {
        setStatus('Error setting up workspace. Redirecting to dashboard anyway...');
        setTimeout(() => router.push('/'), 2000);
      }
    }

    setupWorkspace();
  }, [email, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Authentication successful</h1>
        <p className="mt-4 text-slate-600">{status}</p>
      </div>
    </div>
  );
}
