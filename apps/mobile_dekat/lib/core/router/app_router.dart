import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import '../auth/auth_provider.dart';
// Auth (satu login untuk semua role)
import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/register_page.dart';
import '../../features/authentication/presentation/pages/forgot_password_page.dart';
import '../../features/authentication/presentation/pages/onboarding_page.dart';
// Customer shell tabs
import '../../features/discovery/presentation/pages/discovery_page.dart';
import '../../features/discovery/presentation/pages/search_page.dart';
import '../../features/provider_profile/presentation/pages/provider_list_page.dart';
import '../../features/provider_profile/presentation/pages/provider_detail_page.dart';
import '../../features/availability/presentation/pages/availability_page.dart';
import '../../features/booking/presentation/pages/booking_form_page.dart';
import '../../features/booking/presentation/pages/booking_confirmation_page.dart';
import '../../features/booking/presentation/pages/booking_history_page.dart';
import '../../features/booking/presentation/pages/booking_detail_page.dart';
import '../../features/payment/presentation/pages/payment_page.dart';
import '../../features/payment/presentation/pages/payment_success_page.dart';
import '../../features/payment/presentation/pages/partner_payment_detail_page.dart';
import '../../features/notification/presentation/pages/notification_page.dart';
import '../../features/support/presentation/pages/support_page.dart';
import '../../features/account/presentation/pages/account_page.dart';
import '../../features/account/presentation/pages/profile_edit_page.dart';
import '../../features/account/presentation/pages/profile_complete_page.dart';
import '../../features/account/presentation/pages/loyalty_page.dart';
import '../../features/account/presentation/pages/nearby_page.dart';
import '../../features/account/presentation/pages/my_reviews_page.dart';
import '../../features/account/presentation/pages/referral_page.dart';
import '../../features/account/presentation/pages/notification_preferences_page.dart';
import '../../features/account/presentation/pages/social_feed_page.dart';
import '../../features/booking/presentation/pages/recurring_bookings_page.dart';
import '../../features/chat/presentation/pages/chat_list_page.dart';
import '../../features/chat/presentation/pages/chat_detail_page.dart';
import '../../features/favorites/presentation/pages/favorites_page.dart';
import '../../features/provider_profile/presentation/pages/provider_reviews_page.dart';
import '../../shared/widgets/main_scaffold.dart';
import '../../shared/widgets/partner_scaffold.dart';
import '../../shared/widgets/admin_scaffold.dart';
import '../../features/calendar/presentation/pages/calendar_page.dart';
import '../../features/booking_management/presentation/pages/booking_list_page.dart'
    as provider_bookings;
import '../../features/booking_management/presentation/pages/booking_detail_page.dart'
    as provider_booking_detail;
import '../../features/payment/presentation/pages/earnings_page.dart';
import '../../features/staff_management/presentation/pages/staff_list_page.dart';
import '../../features/reports/presentation/pages/reports_page.dart';
import '../../features/service_management/presentation/pages/services_page.dart';
import '../../features/review_management/presentation/pages/reviews_page.dart';
import '../../features/promotion/presentation/pages/promotions_page.dart';
import '../../features/notification/presentation/pages/notification_inbox_page.dart';
import '../../features/faq_management/presentation/pages/faq_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/settings/presentation/pages/blocked_dates_page.dart';
import '../../features/customer_management/presentation/pages/customers_page.dart';
import '../../features/staff/presentation/pages/staff_checkin_page.dart';
// Admin pages
import '../../features/admin/presentation/pages/admin_dashboard_page.dart';
import '../../features/admin/presentation/pages/admin_users_page.dart';
import '../../features/admin/presentation/pages/admin_tenants_page.dart';
import '../../features/admin/presentation/pages/admin_bookings_page.dart';

class GoRouterRefresh extends ChangeNotifier {
  GoRouterRefresh(this.ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
  final Ref ref;
}

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = GoRouterRefresh(ref);

  ApiClient.onAuthFailure = () {
    ref.read(authProvider.notifier).logout();
  };

  return GoRouter(
    refreshListenable: refresh,
    initialLocation: '/discovery',
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
          path: '/login',
          name: 'login',
          builder: (_, __) => const LoginPage()),
      GoRoute(
          path: '/register',
          name: 'register',
          builder: (_, __) => const RegisterPage()),
      GoRoute(
          path: '/forgot-password',
          name: 'forgotPassword',
          builder: (_, __) => const ForgotPasswordPage()),
      GoRoute(
          path: '/onboarding',
          name: 'onboarding',
          builder: (_, __) => const OnboardingPage()),
      // ── Customer shell ──
      StatefulShellRoute.indexedStack(
        builder: (_, __, navigationShell) =>
            MainScaffold(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
                path: '/discovery',
                name: 'discovery',
                pageBuilder: (_, __) => const NoTransitionPage(
                    child: DiscoveryPage())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: '/search',
                name: 'search',
                pageBuilder: (_, __) =>
                    const NoTransitionPage(child: SearchPage())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/chat',
              name: 'chatList',
              pageBuilder: (_, __) =>
                  const NoTransitionPage(child: ChatListPage()),
              routes: [
                GoRoute(
                    path: ':id',
                    name: 'chatDetail',
                    builder: (_, state) => ChatDetailPage(
                        chatId: state.pathParameters['id']!)),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: '/bookings',
                name: 'bookings',
                pageBuilder: (_, __) =>
                    const NoTransitionPage(child: BookingHistoryPage())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: '/notifications',
                name: 'notifications',
                pageBuilder: (_, __) =>
                    const NoTransitionPage(child: NotificationPage())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: '/account',
                name: 'account',
                pageBuilder: (_, __) =>
                    const NoTransitionPage(child: AccountPage())),
          ]),
        ],
      ),
      // ── Provider shell (ShellRoute seperti aplikasi partner asli) ──
      ShellRoute(
        builder: (_, __, child) => PartnerScaffold(child: child),
        routes: [
          GoRoute(
              path: '/provider/calendar',
              name: 'providerCalendar',
              builder: (_, __) => const CalendarPage()),
          GoRoute(
              path: '/provider/bookings',
              name: 'providerBookings',
              builder: (_, __) =>
                  const provider_bookings.BookingListPage()),
          GoRoute(
              path: '/provider/payments',
              name: 'providerPayments',
              builder: (_, __) => const EarningsPage()),
          GoRoute(
              path: '/provider/staff',
              name: 'providerStaff',
              builder: (_, __) => const StaffListPage()),
          GoRoute(
              path: '/provider/reports',
              name: 'providerReports',
              builder: (_, __) => const ReportsPage()),
          GoRoute(
              path: '/provider/chats',
              name: 'providerChats',
              builder: (_, __) => const ChatListPage()),
          GoRoute(
              path: '/provider/services',
              name: 'providerServices',
              builder: (_, __) => const ServicesPage()),
          GoRoute(
              path: '/provider/reviews',
              name: 'providerReviewsList',
              builder: (_, __) => const ReviewsPage()),
          GoRoute(
              path: '/provider/promotions',
              name: 'providerPromotions',
              builder: (_, __) => const PromotionsPage()),
          GoRoute(
              path: '/provider/notifications',
              name: 'providerNotifications',
              builder: (_, __) => const NotificationInboxPage()),
          GoRoute(
              path: '/provider/faq',
              name: 'providerFaq',
              builder: (_, __) => const ProviderFaqPage()),
          GoRoute(
              path: '/provider/settings',
              name: 'providerSettings',
              builder: (_, __) => const SettingsPage()),
          GoRoute(
              path: '/provider/blocked-dates',
              name: 'providerBlockedDates',
              builder: (_, __) => const BlockedDatesPage()),
          GoRoute(
              path: '/provider/customers',
              name: 'providerCustomers',
              builder: (_, __) => const CustomersPage()),
          GoRoute(
              path: '/provider/staff-checkin',
              name: 'providerStaffCheckin',
              builder: (_, __) => const StaffCheckInPage()),
        ],
      ),
      // ── Admin shell ──
      ShellRoute(
        builder: (_, __, child) => AdminScaffold(child: child),
        routes: [
          GoRoute(
              path: '/admin/dashboard',
              name: 'adminDashboard',
              builder: (_, __) => const AdminDashboardPage()),
          GoRoute(
              path: '/admin/users',
              name: 'adminUsers',
              builder: (_, __) => const AdminUsersPage()),
          GoRoute(
              path: '/admin/tenants',
              name: 'adminTenants',
              builder: (_, __) => const AdminTenantsPage()),
          GoRoute(
              path: '/admin/bookings',
              name: 'adminBookings',
              builder: (_, __) => const AdminBookingsPage()),
        ],
      ),
      // ── Customer detail routes ──
      GoRoute(
          path: '/providers',
          name: 'providerList',
          builder: (_, __) => const ProviderListPage()),
      GoRoute(
          path: '/provider/:id',
          name: 'providerDetail',
          builder: (_, state) =>
              ProviderDetailPage(providerSlug: state.pathParameters['id']!)),
      GoRoute(
          path: '/provider/:id/reviews',
          name: 'providerReviews',
          builder: (_, state) => ProviderReviewsPage(
              providerId: state.pathParameters['id']!)),
      GoRoute(
          path: '/provider/:id/availability',
          name: 'availability',
          builder: (_, state) => AvailabilityPage(
                providerId: state.pathParameters['id']!,
                locationId: state.uri.queryParameters['locationId'],
                initialServiceId: state.uri.queryParameters['serviceId'],
              )),
      GoRoute(
          path: '/booking/new',
          name: 'bookingForm',
          builder: (_, state) => BookingFormPage(
                providerId: state.uri.queryParameters['providerId']!,
                serviceId: state.uri.queryParameters['serviceId'],
                date: state.uri.queryParameters['date'],
                time: state.uri.queryParameters['time'],
                locationId: state.uri.queryParameters['locationId'],
                staffId: state.uri.queryParameters['staffId'],
              )),
      GoRoute(
          path: '/booking/confirm',
          name: 'bookingConfirmation',
          builder: (_, state) => BookingConfirmationPage(
              bookingId: state.uri.queryParameters['bookingId']!)),
      GoRoute(
          path: '/booking/:id',
          name: 'bookingDetail',
          builder: (_, state) =>
              BookingDetailPage(bookingId: state.pathParameters['id']!)),
      GoRoute(
          path: '/payment/:bookingId',
          name: 'payment',
          builder: (_, state) => PaymentPage(
                bookingId: state.pathParameters['bookingId']!,
                tenantId: state.uri.queryParameters['tenantId'],
                amount:
                    num.tryParse(state.uri.queryParameters['amount'] ?? '') ??
                        0,
                currency: state.uri.queryParameters['currency'] ?? 'IDR',
              )),
      GoRoute(
          path: '/payment/success',
          name: 'paymentSuccess',
          builder: (_, state) => PaymentSuccessPage(
                bookingId: state.uri.queryParameters['bookingId'] ?? '',
                bookingCode: state.uri.queryParameters['bookingCode'],
                amount:
                    num.tryParse(state.uri.queryParameters['amount'] ?? '') ??
                        0,
                currency: state.uri.queryParameters['currency'] ?? 'IDR',
                method: state.uri.queryParameters['method'],
              )),
      GoRoute(
          path: '/support',
          name: 'support',
          builder: (_, __) => const SupportPage()),
      GoRoute(
          path: '/account/edit',
          name: 'profileEdit',
          builder: (_, __) => const ProfileEditPage()),
      GoRoute(
          path: '/profile/complete',
          name: 'profileComplete',
          builder: (_, __) => const ProfileCompletePage()),
      GoRoute(
          path: '/favorites',
          name: 'favorites',
          builder: (_, __) => const FavoritesPage()),
      GoRoute(
          path: '/loyalty',
          name: 'loyalty',
          builder: (_, __) => const LoyaltyPage()),
      GoRoute(
          path: '/nearby',
          name: 'nearby',
          builder: (_, __) => const NearbyPage()),
      GoRoute(
          path: '/my-reviews',
          name: 'myReviews',
          builder: (_, __) => const MyReviewsPage()),
      GoRoute(
          path: '/referral',
          name: 'referral',
          builder: (_, __) => const ReferralPage()),
      GoRoute(
          path: '/recurring',
          name: 'recurringBookings',
          builder: (_, __) => const RecurringBookingsPage()),
      GoRoute(
          path: '/notification-preferences',
          name: 'notificationPreferences',
          builder: (_, __) => const NotificationPreferencesPage()),
      GoRoute(
          path: '/feed',
          name: 'socialFeed',
          builder: (_, __) => const SocialFeedPage()),
      // ── Provider detail routes ──
      GoRoute(
          path: '/provider/booking/:id',
          name: 'providerBookingDetail',
          builder: (_, state) =>
              provider_booking_detail.BookingDetailPage(
                  bookingId: state.pathParameters['id']!)),
      GoRoute(
          path: '/provider/payment/:id',
          name: 'providerPaymentDetail',
          builder: (_, state) => PartnerPaymentDetailPage(
              paymentId: state.pathParameters['id']!)),
      GoRoute(
          path: '/provider/chat/:id',
          name: 'providerChatDetail',
          builder: (_, state) =>
              ChatDetailPage(chatId: state.pathParameters['id']!)),
      GoRoute(
          path: '/provider/chats',
          name: 'providerChats',
          builder: (_, __) => const ChatListPage()),
      GoRoute(
          path: '/provider/services',
          name: 'providerServices',
          builder: (_, __) => const ServicesPage()),
      GoRoute(
          path: '/provider/reviews',
          name: 'providerReviews',
          builder: (_, __) => const ReviewsPage()),
      GoRoute(
          path: '/provider/promotions',
          name: 'providerPromotions',
          builder: (_, __) => const PromotionsPage()),
      GoRoute(
          path: '/provider/notifications',
          name: 'providerNotifications',
          builder: (_, __) => const NotificationInboxPage()),
      GoRoute(
          path: '/provider/faq',
          name: 'providerFaq',
          builder: (_, __) => const ProviderFaqPage()),
      GoRoute(
          path: '/provider/settings',
          name: 'providerSettings',
          builder: (_, __) => const SettingsPage()),
      GoRoute(
          path: '/provider/blocked-dates',
          name: 'providerBlockedDates',
          builder: (_, __) => const BlockedDatesPage()),
      GoRoute(
          path: '/provider/customers',
          name: 'providerCustomers',
          builder: (_, __) => const CustomersPage()),
      GoRoute(
          path: '/provider/staff-checkin',
          name: 'providerStaffCheckin',
          builder: (_, __) => const StaffCheckInPage()),
    ],
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final location = state.matchedLocation;
      final isAuthRoute = location == '/login' ||
          location == '/register' ||
          location == '/forgot-password' ||
          location == '/onboarding';
      final isCompleteRoute = location == '/profile/complete';
      final isPublicRoute = location == '/discovery' ||
          location == '/search' ||
          location == '/providers' ||
          (location.startsWith('/provider/') &&
              !location.startsWith('/provider/booking')) ||
          location == '/support';
      final isProviderRoute = location.startsWith('/provider/');
      final isAdminRoute = location.startsWith('/admin/');

      if (auth.isLoading) return null;

      if (!auth.isLoggedIn && !isAuthRoute && !isPublicRoute && !isCompleteRoute) {
        return '/login?redirect=${Uri.encodeComponent(state.uri.toString())}';
      }

      if (auth.isLoggedIn && isAuthRoute) {
        if (!auth.hasProfile && auth.profileChecked && !auth.isProvider && !auth.isAdmin) {
          return '/profile/complete';
        }
        final redirect = state.uri.queryParameters['redirect'];
        if (redirect != null && redirect.isNotEmpty) {
          try {
            return Uri.decodeComponent(redirect);
          } catch (_) {
            return redirect;
          }
        }
        return _homeFor(auth.role);
      }

      if (auth.isLoggedIn &&
          !auth.hasProfile &&
          auth.profileChecked &&
          !isCompleteRoute &&
          !auth.isProvider &&
          !auth.isAdmin) {
        return '/profile/complete';
      }

      if (auth.isLoggedIn && auth.hasProfile && isCompleteRoute) {
        final redirect = state.uri.queryParameters['redirect'];
        if (redirect != null && redirect.isNotEmpty) {
          try {
            return Uri.decodeComponent(redirect);
          } catch (_) {
            return redirect;
          }
        }
        return _homeFor(auth.role);
      }

      // Batas antar role: provider tak bisa ke area customer/admin dan sebaliknya.
      if (auth.isLoggedIn) {
        if ((auth.isProvider || auth.isAdmin) &&
            !isProviderRoute &&
            !isAdminRoute &&
            !isAuthRoute &&
            !isPublicRoute &&
            !isCompleteRoute) {
          return _homeFor(auth.role);
        }
        if (!auth.isProvider && !auth.isAdmin && (isProviderRoute || isAdminRoute)) {
          return _homeFor(auth.role);
        }
        if (auth.isProvider && !auth.isAdmin && isAdminRoute) {
          return _homeFor(auth.role);
        }
        if (auth.isAdmin && !isAdminRoute && isProviderRoute) {
          return _homeFor(auth.role);
        }
      }

      return null;
    },
  );
});

String _homeFor(String role) {
  if (role.startsWith('ROLE_PROVIDER')) return '/provider/calendar';
  if (role == 'ROLE_PLATFORM_ADMIN') return '/admin/dashboard';
  return '/discovery';
}
