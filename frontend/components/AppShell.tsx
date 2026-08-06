'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/applications', label: 'Applications' },
  { href: '/companies', label: 'Companies' },
  { href: '/recruiters', label: 'Recruiters' },
  { href: '/settings', label: 'Settings' },
];

const SearchContext = createContext({
  search: '',
  setSearch: (search: string) => {},
});

export function usePageSearch() {
  return useContext(SearchContext);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const [search, setSearch] = useState('');

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <div className="flex min-h-screen bg-zinc-50">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-200 bg-white p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600"></div>
            <span className="text-xl font-bold text-zinc-950">Atlas</span>
          </div>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-8 backdrop-blur">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full max-w-sm rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="h-8 w-8 rounded-full bg-zinc-200" />
          </header>
          
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
