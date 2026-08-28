import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', color: 'from-primary-500 to-violet-500' },
  { label: 'Users', href: '/users', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-sky-400 to-primary-400' },
  { label: 'Tenants', href: '/tenants', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'from-emerald-400 to-teal-400' },
  { label: 'Bookings', href: '/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-amber-400 to-orange-400' },
  { label: 'Payments', href: '/payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-fuchsia-400 to-pink-400' },
  { label: 'Cases', href: '/cases', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-rose-400 to-red-400' },
  { label: 'Config', href: '/config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'from-gray-400 to-slate-500' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#fbf8ff] via-[#f8f7ff] to-[#fff5f7]">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-white/60 bg-white/80 backdrop-blur-xl md:flex shadow-sm">
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-md shadow-primary-200">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <Link to="/dashboard" className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">DEKAT Admin</Link>
        </div>
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-primary-100 to-transparent" />
        <nav className="flex-1 space-y-1.5 px-3 py-5">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-md shadow-primary-200' : 'text-gray-600 hover:bg-soft-violet hover:text-primary-700'}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : `bg-gradient-to-br ${item.color} text-white shadow-sm opacity-90 group-hover:opacity-100`}`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={item.icon} /></svg>
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 bg-gradient-to-r from-soft-violet/40 to-soft-pink/30 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow">A</div>
              <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Admin'}</p><p className="text-xs text-gray-500 truncate">{user?.email || ''}</p></div>
            </div>
            <button onClick={logout} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-400 shadow-sm ring-1 ring-gray-100 hover:text-rose-500 hover:ring-rose-100 transition-colors" title="Logout">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-white/60 bg-white/70 px-4 sm:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 md:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 text-white font-bold text-xs">D</div><Link to="/dashboard" className="text-lg font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">DEKAT Admin</Link></div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-soft-violet to-soft-pink px-3 py-1.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />Admin Panel
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
