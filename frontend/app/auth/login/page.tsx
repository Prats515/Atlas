import GoogleLoginButton from '@/features/auth/GoogleLoginButton';

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold text-slate-950">Welcome to Atlas</h1>
        <p className="mt-2 text-slate-600">Your AI Gmail Assistant</p>
        
        <div className="mt-8 space-y-4 text-sm text-slate-700">
          <p>Atlas helps you:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Track applications</li>
            <li>Organize recruiters</li>
            <li>Summarize emails</li>
            <li>Draft replies</li>
            <li>Prioritize interviews</li>
          </ul>
        </div>
        
        <div className="mt-10">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
