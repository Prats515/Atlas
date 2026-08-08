'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useState } from 'react';
import { LayoutDashboard, Inbox, BrainCircuit, FileText, Building2, UserCircle, Settings, Search } from 'lucide-react';

const SearchContext = createContext({
  search: '',
  setSearch: (value: string) => {},
});

export const usePageSearch = () => useContext(SearchContext);

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/chat', label: 'AI Chat', icon: BrainCircuit },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/recruiters', label: 'Recruiters', icon: UserCircle },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const [search, setSearch] = useState('');

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-100 p-4 hidden md:flex flex-col">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
               <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Atlas</span>
          </div>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-zinc-100 pt-4 mt-auto">
             <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900">
               <Settings size={18} /> Settings
             </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-8 backdrop-blur">
            <div className="relative w-full max-w-sm">
               <Search className="absolute left-2.5 top-2.5 text-zinc-400" size={16} />
               <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm focus:border-zinc-300 focus:outline-none"
              />
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200" />
          </header>
          
          <main className="flex-1 p-8 bg-zinc-50">{children}</main>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
