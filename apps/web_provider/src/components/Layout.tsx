import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', grad: 'from-primary-500 to-violet-500' },
  { label: 'Kalender', href: '/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', grad: 'from-sky-400 to-primary-400' },
  { label: 'Layanan', href: '/services', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', grad: 'from-emerald-400 to-teal-400' },
  { label: 'Staf', href: '/staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', grad: 'from-amber-400 to-orange-400' },
  { label: 'Pelanggan', href: '/customers', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', grad: 'from-fuchsia-400 to-pink-400' },
  { label: 'Laporan', href: '/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', grad: 'from-violet-400 to-indigo-400' },
  { label: 'Pengaturan', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', grad: 'from-gray-400 to-slate-500' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#fbf8ff] via-[#f8f7ff] to-[#fff5f7]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-white/60 bg-white/80 backdrop-blur-xl md:flex shadow-sm">
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-md shadow-primary-200">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 7v10m-4-4h8" /></svg>
          </div>
          <Link to="/dashboard" className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
            DEKAT
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-400 bg-soft-violet px-1.5 py-0.5 rounded">Provider</span>
        </div>
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-primary-100 to-transparent" />
        <nav className="flex-1 space-y-1.5 px-3 py-5">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-md shadow-primary-200' : 'text-gray-600 hover:bg-soft-violet hover:text-primary-700'}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : `bg-gradient-to-br ${item.grad} text-white shadow-sm opacity-90 group-hover:opacity-100`}`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={item.icon} />
                  </svg>
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 bg-gradient-to-r from-soft-violet/40 to-soft-pink/30 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow">
              {user?.name?.[0] || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Provider'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/60 bg-white/70 px-4 sm:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 text-white font-bold text-xs">D</div>
            <Link to="/dashboard" className="text-lg font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">DEKAT</Link>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => navigate('/booking-link')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-200 hover:shadow-lg hover:from-primary-600 hover:to-violet-600 transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Salin Link Booking
            </button>
            <button
              onClick={logout}
              className="rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-soft-violet hover:text-primary-700 hover:ring-primary-200 transition-colors"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
