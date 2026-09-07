import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Tenants', href: '/admin/tenants' },
  { label: 'Bookings', href: '/admin/bookings' },
  { label: 'Payments', href: '/admin/payments' },
  { label: 'Cases', href: '/admin/cases' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Audit Logs', href: '/admin/audit-logs' },
  { label: 'Subscriptions', href: '/admin/subscriptions' },
  { label: 'Feature Flags', href: '/admin/feature-flags' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center px-6">
          <Link to="/admin/dashboard" className="text-xl font-bold text-primary-600">DEKAT Admin</Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
          <Link to="/" className="mt-3 block text-center text-xs text-gray-400 hover:text-gray-600">Kembali ke Beranda</Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-4 md:hidden"><Link to="/admin/dashboard" className="text-lg font-bold text-primary-600">DEKAT Admin</Link></div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">Admin Panel</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
