'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

const pageTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/inbox': 'Inbox',
  '/chat': 'Atlas AI',
  '/applications': 'Applications',
  '/companies': 'Companies',
  '/recruiters': 'Recruiters',
  '/settings': 'Settings',
};

const SearchContext = createContext({
  search: '',
  setSearch: (search: string) => {},
});

export function usePageSearch() {
  return useContext(SearchContext);
}

function getTitle(pathname: string) {
  return pageTitleMap[pathname] || 'Atlas';
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const title = getTitle(pathname);
  const [search, setSearch] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
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
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
                  <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 lg:hidden"
                    onClick={() => setIsNavOpen((current) => !current)}
                  >
                    Menu
                  </button>
                  <div className="hidden items-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 lg:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700">U</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">User</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search current page..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:max-w-xl"
                />
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 lg:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700">U</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">User</p>
                  </div>
                </div>
              </div>
            </div>

            {isNavOpen ? (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
                <nav className="space-y-2 text-sm font-medium text-slate-700">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          setIsNavOpen(false);
                          router.push(item.href);
                        }}
                        className={`w-full text-left rounded-2xl px-4 py-3 transition ${
                          isActive ? 'bg-slate-100 text-slate-950' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ) : null}
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </SearchContext.Provider>
  );
}
