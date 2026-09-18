import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
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

// Deferred imports — provider + admin pages (loaded only when needed)
import '../../features/payment/presentation/pages/partner_payment_detail_page.dart'
    deferred as partner_payment;
import '../../features/calendar/presentation/pages/calendar_page.dart'
    deferred as provider_calendar;
import '../../features/booking_management/presentation/pages/booking_list_page.dart'
    deferred as provider_bookings;
import '../../features/booking_management/presentation/pages/booking_detail_page.dart'
    deferred as provider_booking_detail;
import '../../features/payment/presentation/pages/earnings_page.dart'
    deferred as provider_earnings;
import '../../features/staff_management/presentation/pages/staff_list_page.dart'
    deferred as provider_staff;
import '../../features/reports/presentation/pages/reports_page.dart'
    deferred as provider_reports;
import '../../features/service_management/presentation/pages/services_page.dart'
    deferred as provider_services;
import '../../features/review_management/presentation/pages/reviews_page.dart'
    deferred as provider_reviews;
import '../../features/promotion/presentation/pages/promotions_page.dart'
    deferred as provider_promotions;
import '../../features/notification/presentation/pages/notification_inbox_page.dart'
    deferred as provider_notifications;
import '../../features/faq_management/presentation/pages/faq_page.dart'
    deferred as provider_faq;
import '../../features/settings/presentation/pages/settings_page.dart'
    deferred as provider_settings;
import '../../features/settings/presentation/pages/blocked_dates_page.dart'
    deferred as provider_blocked_dates;
import '../../features/customer_management/presentation/pages/customers_page.dart'
    deferred as provider_customers;
import '../../features/staff/presentation/pages/staff_checkin_page.dart'
    deferred as provider_staff_checkin;
import '../../features/admin/presentation/pages/admin_dashboard_page.dart'
    deferred as admin_dashboard;
import '../../features/admin/presentation/pages/admin_users_page.dart'
    deferred as admin_users;
import '../../features/admin/presentation/pages/admin_tenants_page.dart'
    deferred as admin_tenants;
import '../../features/admin/presentation/pages/admin_bookings_page.dart'
    deferred as admin_bookings;

class GoRouterRefresh extends ChangeNotifier {
  GoRouterRefresh(this.ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
  final Ref ref;
}

/// Wraps a deferred-loaded page so its library is loaded on first visit.
class _DeferredPage extends StatefulWidget {
  final Future<void> Function() loader;
  final Widget child;
  const _DeferredPage({required this.loader, required this.child});

  @override
  State<_DeferredPage> createState() => _DeferredPageState();
}

class _DeferredPageState extends State<_DeferredPage> {
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    widget.loader().then((_) {
      if (mounted) setState(() => _loaded = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return widget.child;
  }
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
              builder: (_, __) => _DeferredPage(
                  loader: provider_calendar.loadLibrary,
                  child: provider_calendar.CalendarPage())),
          GoRoute(
              path: '/provider/bookings',
              name: 'providerBookings',
              builder: (_, __) => _DeferredPage(
                  loader: provider_bookings.loadLibrary,
                  child: provider_bookings.BookingListPage())),
          GoRoute(
              path: '/provider/payments',
              name: 'providerPayments',
              builder: (_, __) => _DeferredPage(
                  loader: provider_earnings.loadLibrary,
                  child: provider_earnings.EarningsPage())),
          GoRoute(
              path: '/provider/staff',
              name: 'providerStaff',
              builder: (_, __) => _DeferredPage(
                  loader: provider_staff.loadLibrary,
                  child: provider_staff.StaffListPage())),
          GoRoute(
              path: '/provider/reports',
              name: 'providerReports',
              builder: (_, __) => _DeferredPage(
                  loader: provider_reports.loadLibrary,
                  child: provider_reports.ReportsPage())),
          GoRoute(
              path: '/provider/chats',
              name: 'providerChats',
              builder: (_, __) => const ChatListPage()),
          GoRoute(
              path: '/provider/services',
              name: 'providerServices',
              builder: (_, __) => _DeferredPage(
                  loader: provider_services.loadLibrary,
                  child: provider_services.ServicesPage())),
          GoRoute(
              path: '/provider/reviews',
              name: 'providerReviewsList',
              builder: (_, __) => _DeferredPage(
                  loader: provider_reviews.loadLibrary,
                  child: provider_reviews.ReviewsPage())),
          GoRoute(
              path: '/provider/promotions',
              name: 'providerPromotions',
              builder: (_, __) => _DeferredPage(
                  loader: provider_promotions.loadLibrary,
                  child: provider_promotions.PromotionsPage())),
          GoRoute(
              path: '/provider/notifications',
              name: 'providerNotifications',
              builder: (_, __) => _DeferredPage(
                  loader: provider_notifications.loadLibrary,
                  child: provider_notifications.NotificationInboxPage())),
          GoRoute(
              path: '/provider/faq',
              name: 'providerFaq',
              builder: (_, __) => _DeferredPage(
                  loader: provider_faq.loadLibrary,
                  child: provider_faq.ProviderFaqPage())),
          GoRoute(
              path: '/provider/settings',
              name: 'providerSettings',
              builder: (_, __) => _DeferredPage(
                  loader: provider_settings.loadLibrary,
                  child: provider_settings.SettingsPage())),
          GoRoute(
              path: '/provider/blocked-dates',
              name: 'providerBlockedDates',
              builder: (_, __) => _DeferredPage(
                  loader: provider_blocked_dates.loadLibrary,
                  child: provider_blocked_dates.BlockedDatesPage())),
          GoRoute(
              path: '/provider/customers',
              name: 'providerCustomers',
              builder: (_, __) => _DeferredPage(
                  loader: provider_customers.loadLibrary,
                  child: provider_customers.CustomersPage())),
          GoRoute(
              path: '/provider/staff-checkin',
              name: 'providerStaffCheckin',
              builder: (_, __) => _DeferredPage(
                  loader: provider_staff_checkin.loadLibrary,
                  child: provider_staff_checkin.StaffCheckInPage())),
          GoRoute(
              path: '/provider/payment/:id',
              name: 'providerPaymentDetail',
              builder: (_, state) => _DeferredPage(
                  loader: partner_payment.loadLibrary,
                  child: partner_payment.PartnerPaymentDetailPage(
                      paymentId: state.pathParameters['id']!))),
          GoRoute(
              path: '/provider/booking/:id',
              name: 'providerBookingDetail',
              builder: (_, state) => _DeferredPage(
                  loader: provider_booking_detail.loadLibrary,
                  child: provider_booking_detail.BookingDetailPage(
                      bookingId: state.pathParameters['id']!))),
        ],
      ),
      // ── Admin shell ──
      ShellRoute(
        builder: (_, __, child) => AdminScaffold(child: child),
        routes: [
          GoRoute(
              path: '/admin/dashboard',
              name: 'adminDashboard',
              builder: (_, __) => _DeferredPage(
                  loader: admin_dashboard.loadLibrary,
                  child: admin_dashboard.AdminDashboardPage())),
          GoRoute(
              path: '/admin/users',
              name: 'adminUsers',
              builder: (_, __) => _DeferredPage(
                  loader: admin_users.loadLibrary,
                  child: admin_users.AdminUsersPage())),
          GoRoute(
              path: '/admin/tenants',
              name: 'adminTenants',
              builder: (_, __) => _DeferredPage(
                  loader: admin_tenants.loadLibrary,
                  child: admin_tenants.AdminTenantsPage())),
          GoRoute(
              path: '/admin/bookings',
              name: 'adminBookings',
              builder: (_, __) => _DeferredPage(
                  loader: admin_bookings.loadLibrary,
                  child: admin_bookings.AdminBookingsPage())),
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
      // ── Provider detail routes (outside ShellRoute for direct navigation) ──
      GoRoute(
          path: '/provider/booking/:id',
          name: 'providerBookingDetail',
          builder: (_, state) => _DeferredPage(
              loader: provider_booking_detail.loadLibrary,
              child: provider_booking_detail.BookingDetailPage(
                  bookingId: state.pathParameters['id']!))),
      GoRoute(
          path: '/provider/payment/:id',
          name: 'providerPaymentDetail',
          builder: (_, state) => _DeferredPage(
              loader: partner_payment.loadLibrary,
              child: partner_payment.PartnerPaymentDetailPage(
                  paymentId: state.pathParameters['id']!))),
      GoRoute(
          path: '/provider/chat/:id',
          name: 'providerChatDetail',
          builder: (_, state) =>
              ChatDetailPage(chatId: state.pathParameters['id']!)),
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
