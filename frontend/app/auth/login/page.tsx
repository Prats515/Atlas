import GoogleLoginButton from '@/features/auth/GoogleLoginButton';

export default function Page() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sign in to Atlas</h1>
      <p>Use Google OAuth to authenticate and continue.</p>
      <GoogleLoginButton />
    </div>
  );
}
