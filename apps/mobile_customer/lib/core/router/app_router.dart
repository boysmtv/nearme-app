import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

class AuthState {
  final bool isLoading;
  final bool isLoggedIn;
  final User? user;
  final String? error;

  const AuthState({
    this.isLoading = false,
    this.isLoggedIn = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isLoggedIn,
    User? user,
    String? error,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      user: user ?? this.user,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _checkAuthStatus();
  }

  final _apiService = ApiService();

  Future<void> _checkAuthStatus() async {
    final token = await SecureStorageService.read(StorageKeys.accessToken);
    if (token != null) {
      state = state.copyWith(isLoading: true);
      try {
        final response = await _apiService.getProfile();
        final user = User.fromJson(response.data['data']);
        state = state.copyWith(isLoading: false, isLoggedIn: true, user: user);
      } catch (e) {
        await SecureStorageService.deleteAll();
        state = state.copyWith(isLoading: false, isLoggedIn: false);
      }
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.login(email, password);
      final data = response.data['data'];
      await SecureStorageService.write(StorageKeys.accessToken, data['access_token']);
      await SecureStorageService.write(StorageKeys.refreshToken, data['refresh_token']);
      final user = User.fromJson(data['user']);
      await SecureStorageService.write(StorageKeys.userId, user.id);
      await SecureStorageService.write(StorageKeys.userEmail, user.email);
      if (user.name != null) {
        await SecureStorageService.write(StorageKeys.userName, user.name!);
      }
      state = state.copyWith(isLoading: false, isLoggedIn: true, user: user);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<void> register(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _apiService.register(data);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<void> requestOtp(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _apiService.requestOtp(email);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<void> verifyOtp(String email, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.verifyOtp(email, otp);
      final data = response.data['data'];
      await SecureStorageService.write(StorageKeys.accessToken, data['access_token']);
      await SecureStorageService.write(StorageKeys.refreshToken, data['refresh_token']);
      final user = User.fromJson(data['user']);
      state = state.copyWith(isLoading: false, isLoggedIn: true, user: user);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
    } catch (_) {}
    await SecureStorageService.deleteAll();
    state = const AuthState();
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/discovery',
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/forgot-password',
        name: 'forgotPassword',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/discovery',
            name: 'discovery',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: DiscoveryPage(),
            ),
          ),
          GoRoute(
            path: '/search',
            name: 'search',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: SearchPage(),
            ),
          ),
          GoRoute(
            path: '/bookings',
            name: 'bookings',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: BookingHistoryPage(),
            ),
          ),
          GoRoute(
            path: '/notifications',
            name: 'notifications',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: NotificationPage(),
            ),
          ),
          GoRoute(
            path: '/account',
            name: 'account',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: AccountPage(),
            ),
          ),
        ],
      ),
      GoRoute(
        path: '/providers',
        name: 'providerList',
        builder: (context, state) => const ProviderListPage(),
      ),
      GoRoute(
        path: '/provider/:id',
        name: 'providerDetail',
        builder: (context, state) => ProviderDetailPage(
          providerId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/provider/:id/availability',
        name: 'availability',
        builder: (context, state) => AvailabilityPage(
          providerId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/booking/new',
        name: 'bookingForm',
        builder: (context, state) => BookingFormPage(
          providerId: state.uri.queryParameters['providerId']!,
          serviceId: state.uri.queryParameters['serviceId']!,
        ),
      ),
      GoRoute(
        path: '/booking/confirm',
        name: 'bookingConfirmation',
        builder: (context, state) => BookingConfirmationPage(
          bookingId: state.uri.queryParameters['bookingId']!,
        ),
      ),
      GoRoute(
        path: '/booking/:id',
        name: 'bookingDetail',
        builder: (context, state) => BookingDetailPage(
          bookingId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/payment/:bookingId',
        name: 'payment',
        builder: (context, state) => PaymentPage(
          bookingId: state.pathParameters['bookingId']!,
        ),
      ),
      GoRoute(
        path: '/payment/success',
        name: 'paymentSuccess',
        builder: (context, state) => PaymentSuccessPage(
          bookingId: state.uri.queryParameters['bookingId']!,
        ),
      ),
      GoRoute(
        path: '/support',
        name: 'support',
        builder: (context, state) => const SupportPage(),
      ),
      GoRoute(
        path: '/account/edit',
        name: 'profileEdit',
        builder: (context, state) => const ProfileEditPage(),
      ),
    ],
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/forgot-password';

      if (auth.isLoading) return null;

      if (!auth.isLoggedIn && !isAuthRoute) {
        return '/login';
      }

      if (auth.isLoggedIn && isAuthRoute) {
        return '/discovery';
      }

      return null;
    },
  );
});

import '../../features/authentication/presentation/pages/login_page.dart';
import '../../features/authentication/presentation/pages/register_page.dart';
import '../../features/authentication/presentation/pages/forgot_password_page.dart';
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
import '../../shared/widgets/main_scaffold.dart';
