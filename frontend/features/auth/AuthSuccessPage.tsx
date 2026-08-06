/**
 * A simple success page showing the authenticated user's email.
 */

'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication successful</h1>
      <p>Your Google account is signed in.</p>
      {email ? <p>Email: {email}</p> : <p>No email was returned.</p>}
    </div>
  );
}
