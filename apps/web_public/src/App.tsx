import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './lib/ProtectedRoute';
import { useAuth } from './lib/auth';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProviderPage = lazy(() => import('./pages/ProviderPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

const ProviderDashboardPage = lazy(() => import('./pages/provider/DashboardPage'));
const ProviderCalendarPage = lazy(() => import('./pages/provider/CalendarPage'));
const ProviderBookingsPage = lazy(() => import('./pages/provider/BookingsPage'));
const ProviderServicesPage = lazy(() => import('./pages/provider/ServicesPage'));
const ProviderStaffPage = lazy(() => import('./pages/provider/StaffPage'));
const ProviderCustomersPage = lazy(() => import('./pages/provider/CustomersPage'));
const ProviderReportsPage = lazy(() => import('./pages/provider/ReportsPage'));
const ProviderSettingsPage = lazy(() => import('./pages/provider/SettingsPage'));
const ProviderMediaPage = lazy(() => import('./pages/provider/MediaPage'));
const ProviderFaqPage = lazy(() => import('./pages/provider/FaqPage'));
const ProviderReviewsPage = lazy(() => import('./pages/provider/ReviewsPage'));
const ProviderPromotionsPage = lazy(() => import('./pages/provider/PromotionsPage'));
const ProviderNotificationsPage = lazy(() => import('./pages/provider/NotificationsPage'));
const ProfileCompletePage = lazy(() => import('./pages/ProfileCompletePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProviderRegisterPage = lazy(() => import('./pages/ProviderRegisterPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const CustomerBookingsPage = lazy(() => import('./pages/customer/CustomerBookingsPage'));
const CustomerBookingDetailPage = lazy(() => import('./pages/customer/CustomerBookingDetailPage'));
const CustomerNotificationsPage = lazy(() => import('./pages/customer/CustomerNotificationsPage'));
const CustomerFavoritesPage = lazy(() => import('./pages/customer/CustomerFavoritesPage'));
const CustomerAccountPage = lazy(() => import('./pages/customer/CustomerAccountPage'));
const SupportPage = lazy(() => import('./pages/customer/SupportPage'));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-gray-500">Halaman yang Anda cari tidak tersedia.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

function ProfileCompleteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.hasProfile) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireProfileGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user && !user.hasProfile && user.role === 'ROLE_CUSTOMER') {
    return <Navigate to="/profile/complete" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<RequireProfileGuard><HomePage /></RequireProfileGuard>} />
        <Route path="/search" element={<RequireProfileGuard><SearchPage /></RequireProfileGuard>} />
        <Route path="/provider/:slug" element={<RequireProfileGuard><ProviderPage /></RequireProfileGuard>} />
        <Route path="/booking/:providerId" element={<RequireProfileGuard><BookingPage /></RequireProfileGuard>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/provider/register" element={<ProviderRegisterPage />} />
        <Route path="/profile/complete" element={<ProfileCompleteGuard><ProfileCompletePage /></ProfileCompleteGuard>} />

        <Route path="/bookings" element={<ProtectedRoute><CustomerBookingsPage /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><CustomerBookingDetailPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><CustomerNotificationsPage /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><CustomerFavoritesPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><CustomerAccountPage /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

        <Route path="/provider/dashboard" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderDashboardPage /></ProtectedRoute>} />
        <Route path="/provider/calendar" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderCalendarPage /></ProtectedRoute>} />
        <Route path="/provider/bookings" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderBookingsPage /></ProtectedRoute>} />
        <Route path="/provider/services" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderServicesPage /></ProtectedRoute>} />
        <Route path="/provider/staff" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderStaffPage /></ProtectedRoute>} />
        <Route path="/provider/customers" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderCustomersPage /></ProtectedRoute>} />
        <Route path="/provider/reports" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderReportsPage /></ProtectedRoute>} />
        <Route path="/provider/media" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderMediaPage /></ProtectedRoute>} />
        <Route path="/provider/faq" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderFaqPage /></ProtectedRoute>} />
        <Route path="/provider/reviews" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderReviewsPage /></ProtectedRoute>} />
        <Route path="/provider/promotions" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderPromotionsPage /></ProtectedRoute>} />
        <Route path="/provider/notifications" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderNotificationsPage /></ProtectedRoute>} />
        <Route path="/provider/settings" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderSettingsPage /></ProtectedRoute>} />

        <Route path="/chats" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chats/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/booking/:bookingId/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
