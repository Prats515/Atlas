import './globals.css';
import AppShell from '@/components/AppShell';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Atlas',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
