import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/onboarding_page.dart';
import '../../features/calendar/presentation/pages/calendar_page.dart';
import '../../features/booking_management/presentation/pages/booking_list_page.dart';
import '../../features/booking_management/presentation/pages/booking_detail_page.dart';
import '../../features/payment/presentation/pages/earnings_page.dart';
import '../../features/payment/presentation/pages/payment_page.dart';
import '../../features/staff_management/presentation/pages/staff_list_page.dart';
import '../../features/reports/presentation/pages/reports_page.dart';
import '../../features/chat/presentation/pages/chat_list_page.dart';
import '../../features/chat/presentation/pages/chat_detail_page.dart';
import '../../features/service_management/presentation/pages/services_page.dart';
import '../../features/review_management/presentation/pages/reviews_page.dart';
import '../../features/promotion/presentation/pages/promotions_page.dart';
import '../../features/notification/presentation/pages/notification_inbox_page.dart';
import '../../features/faq_management/presentation/pages/faq_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/settings/presentation/pages/blocked_dates_page.dart';
import '../../features/customer_management/presentation/pages/customers_page.dart';
import '../../features/staff/presentation/pages/staff_checkin_page.dart';
import '../../shared/widgets/main_scaffold.dart';

final partnerAuthProvider = StateNotifierProvider<PartnerAuthNotifier, PartnerAuthState>((ref) {
  return PartnerAuthNotifier();
});

class PartnerAuthState {
  final bool isLoading;
  final bool isLoggedIn;
  final User? user;
  final String? error;
  const PartnerAuthState({this.isLoading = false, this.isLoggedIn = false, this.user, this.error});
  PartnerAuthState copyWith({bool? isLoading, bool? isLoggedIn, User? user, String? error}) {
    return PartnerAuthState(isLoading: isLoading ?? this.isLoading, isLoggedIn: isLoggedIn ?? this.isLoggedIn, user: user ?? this.user, error: error);
  }
}

class PartnerAuthNotifier extends StateNotifier<PartnerAuthState> {
  PartnerAuthNotifier() : super(const PartnerAuthState()) { _checkAuth(); }
  final _apiService = ApiService();

  Future<void> _checkAuth() async {
    final token = await SecureStorageService.read(StorageKeys.accessToken);
    if (token != null) {
      state = state.copyWith(isLoggedIn: true);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.login(email, password);
      final data = response.data['data'] as Map<String, dynamic>;
      await SecureStorageService.write(StorageKeys.accessToken, data['accessToken'] as String);
      final refreshToken = data['refreshToken'] as String?;
      if (refreshToken != null) {
        await SecureStorageService.write(StorageKeys.refreshToken, refreshToken);
      }
      state = state.copyWith(isLoading: false, isLoggedIn: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> logout() async {
    final refreshToken = await SecureStorageService.read(StorageKeys.refreshToken);
    try {
      await _apiService.logout(refreshToken: refreshToken);
    } catch (_) {}
    await SecureStorageService.deleteAll();
    state = const PartnerAuthState();
  }

  void clearError() => state = state.copyWith(error: null);
}

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/calendar',
    debugLogDiagnostics: true,
    routes: [
      GoRoute(path: '/login', name: 'login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/onboarding', name: 'onboarding', builder: (_, __) => const OnboardingPage()),
      ShellRoute(builder: (context, state, child) => MainScaffold(child: child), routes: [
        GoRoute(path: '/calendar', name: 'calendar', pageBuilder: (_, __) => const NoTransitionPage(child: CalendarPage())),
        GoRoute(path: '/bookings', name: 'bookings', pageBuilder: (_, __) => const NoTransitionPage(child: BookingListPage())),
        GoRoute(path: '/payments', name: 'payments', pageBuilder: (_, __) => const NoTransitionPage(child: EarningsPage())),
        GoRoute(path: '/staff', name: 'staff', pageBuilder: (_, __) => const NoTransitionPage(child: StaffListPage())),
        GoRoute(path: '/reports', name: 'reports', pageBuilder: (_, __) => const NoTransitionPage(child: ReportsPage())),
        GoRoute(path: '/chats', name: 'partnerChats', pageBuilder: (_, __) => const NoTransitionPage(child: PartnerChatListPage())),
        GoRoute(path: '/services', name: 'services', pageBuilder: (_, __) => const NoTransitionPage(child: ServicesPage())),
        GoRoute(path: '/reviews', name: 'reviews', pageBuilder: (_, __) => const NoTransitionPage(child: ReviewsPage())),
        GoRoute(path: '/promotions', name: 'promotions', pageBuilder: (_, __) => const NoTransitionPage(child: PromotionsPage())),
        GoRoute(path: '/notifications', name: 'notifications', pageBuilder: (_, __) => const NoTransitionPage(child: NotificationInboxPage())),
        GoRoute(path: '/faq', name: 'faq', pageBuilder: (_, __) => const NoTransitionPage(child: ProviderFaqPage())),
        GoRoute(path: '/settings', name: 'settings', pageBuilder: (_, __) => const NoTransitionPage(child: SettingsPage())),
        GoRoute(path: '/blocked-dates', name: 'blockedDates', pageBuilder: (_, __) => const NoTransitionPage(child: BlockedDatesPage())),
        GoRoute(path: '/customers', name: 'customers', pageBuilder: (_, __) => const NoTransitionPage(child: CustomersPage())),
        GoRoute(path: '/staff-checkin', name: 'staffCheckin', pageBuilder: (_, __) => const NoTransitionPage(child: StaffCheckInPage())),
      ]),
      GoRoute(path: '/booking/:id', name: 'bookingDetail', builder: (_, state) => BookingDetailPage(bookingId: state.pathParameters['id']!)),
      GoRoute(path: '/payment/:id', name: 'paymentDetail', builder: (_, state) => PaymentPage(paymentId: state.pathParameters['id']!)),
      GoRoute(path: '/partner/chat/:id', name: 'partnerChatDetail', builder: (_, state) => PartnerChatDetailPage(chatId: state.pathParameters['id']!)),
      GoRoute(path: '/chat/:id', name: 'chatDetailAlias', builder: (_, state) => PartnerChatDetailPage(chatId: state.pathParameters['id']!)),
    ],
    redirect: (context, state) {
      final auth = ref.read(partnerAuthProvider);
      final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/onboarding';
      if (auth.isLoading) return null;
      if (!auth.isLoggedIn && !isAuthRoute) return '/login';
      if (auth.isLoggedIn && isAuthRoute) return '/calendar';
      return null;
    },
  );
});
