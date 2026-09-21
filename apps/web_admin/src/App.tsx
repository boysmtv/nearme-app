import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, Component, type ReactNode } from 'react';
import { AuthProvider } from './lib/auth';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const TenantsPage = lazy(() => import('./pages/TenantsPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const CasesPage = lazy(() => import('./pages/CasesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const FeatureFlagsPage = lazy(() => import('./pages/FeatureFlagsPage'));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Terjadi Kesalahan</h2>
            <p className="mt-2 text-sm text-gray-500">{this.state.error?.message || 'Unexpected error'}</p>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      const roles = (payload.roles ?? []) as string[];
      if (!roles.includes(requiredRole)) return <Navigate to="/dashboard" replace />;
    } catch { return <Navigate to="/login" replace />; }
  }
  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/tenants" element={<ProtectedRoute><TenantsPage /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
            <Route path="/feature-flags" element={<ProtectedRoute><FeatureFlagsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}
