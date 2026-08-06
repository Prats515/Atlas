import { Suspense } from 'react';
import AuthSuccessPage from '@/features/auth/AuthSuccessPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessPage />
    </Suspense>
  );
}
