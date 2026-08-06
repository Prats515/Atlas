'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/applications', label: 'Applications' },
  { href: '/companies', label: 'Companies' },
  { href: '/recruiters', label: 'Recruiters' },
  { href: '/settings', label: 'Settings' },
  { href: '/gmail/test', label: 'Gmail Test' },
];

const pageTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/inbox': 'Inbox',
  '/gmail/test': 'Gmail Test',
  '/applications': 'Applications',
  '/companies': 'Companies',
  '/recruiters': 'Recruiters',
  '/settings': 'Settings',
};

function getTitle(pathname: string) {
  return pageTitleMap[pathname] || 'Atlas';
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const title = getTitle(pathname);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white px-6 py-8 lg:flex">
        <div className="mb-10">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Atlas</span>
        </div>
        <nav className="space-y-2 text-sm font-medium text-slate-700">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 transition ${
                  isActive ? 'bg-slate-100 text-slate-950' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
            </div>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700">U</div>
              <div>
                <p className="text-sm font-semibold text-slate-950">User</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
