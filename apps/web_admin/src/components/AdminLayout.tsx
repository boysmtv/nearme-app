import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Users', href: '/users' },
  { label: 'Tenants', href: '/tenants' },
  { label: 'Bookings', href: '/bookings' },
  { label: 'Payments', href: '/payments' },
  { label: 'Cases', href: '/cases' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Audit Logs', href: '/audit-logs' },
  { label: 'Subscriptions', href: '/subscriptions' },
  { label: 'Feature Flags', href: '/feature-flags' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center px-6">
          <Link to="/dashboard" className="text-xl font-bold text-primary-600">DEKAT Admin</Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">A</div>
              <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</p><p className="text-xs text-gray-500 truncate">{user?.email || ''}</p></div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-gray-600" title="Logout">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-6">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-xl font-bold text-primary-600">DEKAT Admin</Link>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button onClick={() => { logout(); setMobileOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-700 md:hidden">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">Admin Panel</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
