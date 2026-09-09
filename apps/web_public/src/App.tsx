import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Suspense, lazy, Component, type ReactNode } from 'react';
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
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const CustomerBookingsPage = lazy(() => import('./pages/customer/CustomerBookingsPage'));
const CustomerBookingDetailPage = lazy(() => import('./pages/customer/CustomerBookingDetailPage'));
const CustomerNotificationsPage = lazy(() => import('./pages/customer/CustomerNotificationsPage'));
const CustomerFavoritesPage = lazy(() => import('./pages/customer/CustomerFavoritesPage'));
const CustomerAccountPage = lazy(() => import('./pages/customer/CustomerAccountPage'));
const SupportPage = lazy(() => import('./pages/customer/SupportPage'));
const CustomerLoyaltyPage = lazy(() => import('./pages/customer/CustomerLoyaltyPage'));
const CustomerNearbyPage = lazy(() => import('./pages/customer/CustomerNearbyPage'));
const CustomerReviewsPage = lazy(() => import('./pages/customer/CustomerReviewsPage'));
const CustomerReferralPage = lazy(() => import('./pages/customer/CustomerReferralPage'));
const RecurringBookingsPage = lazy(() => import('./pages/customer/RecurringBookingsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ServiceBundlesPage = lazy(() => import('./pages/provider/ServiceBundlesPage'));
const ServicesImportPage = lazy(() => import('./pages/provider/ServicesImportPage'));
const SubscriptionUpgradePage = lazy(() => import('./pages/provider/SubscriptionUpgradePage'));
const MultiLocationPage = lazy(() => import('./pages/provider/MultiLocationPage'));
const StaffManagementSuitePage = lazy(() => import('./pages/provider/StaffManagementSuitePage'));
const SmartSchedulingPage = lazy(() => import('./pages/provider/SmartSchedulingPage'));
const AnalyticsDeepPage = lazy(() => import('./pages/provider/AnalyticsDeepPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/customer/NotificationPreferencesPage'));
const SocialFeedPage = lazy(() => import('./pages/customer/SocialFeedPage'));
const CustomerDashboardPage = lazy(() => import('./pages/customer/CustomerDashboardPage'));
const WaitlistPage = lazy(() => import('./pages/provider/WaitlistPage'));
const CommissionPage = lazy(() => import('./pages/provider/CommissionPage'));
const SettlementPage = lazy(() => import('./pages/provider/SettlementPage'));

// Admin pages (lazy)
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AdminTenantsPage = lazy(() => import('./pages/admin/TenantsPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/BookingsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/PaymentsPage'));
const AdminCasesPage = lazy(() => import('./pages/admin/CasesPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const AdminAuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/SubscriptionsPage'));
const AdminFeatureFlagsPage = lazy(() => import('./pages/admin/FeatureFlagsPage'));
const AdminFaqsPage = lazy(() => import('./pages/admin/FaqsPage'));
const AdminRolesPage = lazy(() => import('./pages/admin/RolesPage'));
const AdminChatPage = lazy(() => import('./pages/admin/ChatPage'));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="text-6xl font-bold text-red-600">!</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Terjadi Kesalahan</h1>
          <p className="mt-2 text-gray-500 max-w-md">{this.state.error?.message || 'Silakan muat ulang halaman.'}</p>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700">Muat Ulang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

function CustomerDashboardOrHome() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user?.role === 'ROLE_CUSTOMER') {
    return <CustomerDashboardPage />;
  }
  return <HomePage />;
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
    <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<RequireProfileGuard><CustomerDashboardOrHome /></RequireProfileGuard>} />
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
        <Route path="/account/loyalty" element={<ProtectedRoute><CustomerLoyaltyPage /></ProtectedRoute>} />
        <Route path="/account/referral" element={<ProtectedRoute><CustomerReferralPage /></ProtectedRoute>} />
        <Route path="/account/reviews" element={<ProtectedRoute><CustomerReviewsPage /></ProtectedRoute>} />
        <Route path="/account/recurring" element={<ProtectedRoute><RecurringBookingsPage /></ProtectedRoute>} />
        <Route path="/nearby" element={<RequireProfileGuard><CustomerNearbyPage /></RequireProfileGuard>} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/feed" element={<ProtectedRoute><SocialFeedPage /></ProtectedRoute>} />
        <Route path="/notification-preferences" element={<ProtectedRoute><NotificationPreferencesPage /></ProtectedRoute>} />

        <Route path="/provider/dashboard" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderDashboardPage /></ProtectedRoute>} />
        <Route path="/provider/calendar" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderCalendarPage /></ProtectedRoute>} />
        <Route path="/provider/bookings" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderBookingsPage /></ProtectedRoute>} />
        <Route path="/provider/services" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderServicesPage /></ProtectedRoute>} />
        <Route path="/provider/staff" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderStaffPage /></ProtectedRoute>} />
        <Route path="/provider/customers" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderCustomersPage /></ProtectedRoute>} />
        <Route path="/provider/reports" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderReportsPage /></ProtectedRoute>} />
        <Route path="/provider/media" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderMediaPage /></ProtectedRoute>} />
        <Route path="/provider/bundles" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ServiceBundlesPage /></ProtectedRoute>} />
        <Route path="/provider/import" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ServicesImportPage /></ProtectedRoute>} />
        <Route path="/provider/faq" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderFaqPage /></ProtectedRoute>} />
        <Route path="/provider/reviews" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderReviewsPage /></ProtectedRoute>} />
        <Route path="/provider/promotions" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderPromotionsPage /></ProtectedRoute>} />
        <Route path="/provider/notifications" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderNotificationsPage /></ProtectedRoute>} />
        <Route path="/provider/settings" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><ProviderSettingsPage /></ProtectedRoute>} />
        <Route path="/provider/upgrade" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><SubscriptionUpgradePage /></ProtectedRoute>} />
        <Route path="/provider/locations" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><MultiLocationPage /></ProtectedRoute>} />
        <Route path="/provider/staff-suite" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><StaffManagementSuitePage /></ProtectedRoute>} />
        <Route path="/provider/smart-scheduling" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><SmartSchedulingPage /></ProtectedRoute>} />
        <Route path="/provider/analytics-deep" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><AnalyticsDeepPage /></ProtectedRoute>} />
        <Route path="/provider/waitlist" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><WaitlistPage /></ProtectedRoute>} />
        <Route path="/provider/commission" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><CommissionPage /></ProtectedRoute>} />
        <Route path="/provider/settlement" element={<ProtectedRoute requiredRole="ROLE_PROVIDER_OWNER"><SettlementPage /></ProtectedRoute>} />

        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentPage />} />
        <Route path="/chats" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chats/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/booking/:bookingId/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/tenants" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminTenantsPage /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminBookingsPage /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminPaymentsPage /></ProtectedRoute>} />
        <Route path="/admin/cases" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminCasesPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminAnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminAuditLogPage /></ProtectedRoute>} />
        <Route path="/admin/subscriptions" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminSubscriptionsPage /></ProtectedRoute>} />
        <Route path="/admin/feature-flags" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminFeatureFlagsPage /></ProtectedRoute>} />
        <Route path="/admin/faqs" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminFaqsPage /></ProtectedRoute>} />
        <Route path="/admin/roles" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminRolesPage /></ProtectedRoute>} />
        <Route path="/admin/chats" element={<ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"><AdminChatPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}
