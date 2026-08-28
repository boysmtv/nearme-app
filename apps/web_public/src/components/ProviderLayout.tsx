import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';

const sidebarItems = [
  { label: 'Dashboard', href: '/provider/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', accent: 'from-[#e8e8ff] to-[#e8f2ff]' },
  { label: 'Kalender', href: '/provider/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', accent: 'from-[#e8f2ff] to-[#e6f7ee]' },
  { label: 'Layanan', href: '/provider/services', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', accent: 'from-[#fff4d6] to-[#ffe8ec]' },
  { label: 'Staf', href: '/provider/staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', accent: 'from-[#e6f7ee] to-[#e8e8ff]' },
  { label: 'Pelanggan', href: '/provider/customers', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', accent: 'from-[#f0e8ff] to-[#ffe8ec]' },
  { label: 'Laporan', href: '/provider/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', accent: 'from-[#ffe8ec] to-[#fff4d6]' },
  { label: 'Pengaturan', href: '/provider/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', accent: 'from-[#e8e8ff] to-[#f0e8ff]' },
];

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#FAF9FF]">
      <aside className="hidden w-64 flex-shrink-0 border-r border-[#E8E8FF] bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-[#FAF9FF]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-xs font-black text-white">D</span>
          <Link to="/provider/dashboard" className="bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] bg-clip-text text-[15px] font-black tracking-tight text-transparent">
            DEKAT Provider
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] text-white shadow-md shadow-[#8B8CFF]/20'
                    : 'text-gray-600 hover:bg-[#FAF9FF] hover:text-[#6a6acc]'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? 'bg-white/20 text-white' : `bg-gradient-to-br ${item.accent} text-[#6a6acc]`}`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={item.icon} />
                  </svg>
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#E8E8FF] p-4 bg-gradient-to-br from-[#FAF9FF] to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8B8CFF] to-[#FF8E9E] text-sm font-bold text-white shadow-sm">
              {user?.name?.[0] || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Provider'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-[#e8f2ff] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#5a7ab3]">PRO</span>
            <span className="rounded-full bg-[#e6f7ee] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Aktif</span>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-[#E8E8FF] bg-white/80 backdrop-blur px-4 sm:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-white font-black text-xs">D</span>
            <Link to="/provider/dashboard" className="text-sm font-black bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] bg-clip-text text-transparent">DEKAT</Link>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="rounded-full bg-[#FAF9FF] px-3 py-1 font-medium text-gray-500 ring-1 ring-[#E8E8FF]">Provider Workspace</span>
            <span className="h-1 w-1 rounded-full bg-[#8B8CFF]" />
            <span className="text-gray-400">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => navigate('/')}
              className="hidden rounded-full bg-[#FAF9FF] px-4 py-2 text-sm font-semibold text-[#6a6acc] ring-1 ring-[#E8E8FF] hover:bg-white sm:inline-flex items-center gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Lihat Publik
            </button>
            <button
              onClick={logout}
              className="rounded-full border border-[#E8E8FF] bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-[#ffe8ec] hover:text-rose-600 hover:border-rose-200 transition"
            >
              Keluar
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF9FF]">
          {children}
        </main>
      </div>
    </div>
  );
}
