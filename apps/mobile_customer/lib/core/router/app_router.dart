import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
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

User? userFromAccessToken(String accessToken, String? fallbackEmail) {
  try {
    final parts = accessToken.split('.');
    if (parts.length < 2) return null;
    final normalized = base64Url.normalize(parts[1].padRight((parts[1].length + 3) & ~3, '='));
    final claims = jsonDecode(utf8.decode(base64Url.decode(normalized))) as Map<String, dynamic>;
    final email = (claims['email'] ?? fallbackEmail) as String?;
    final id = (claims['sub'] ?? '') as String;
    return User(id: id, email: email ?? '', name: email?.split('@').first);
  } catch (_) {
    return null;
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
      final email = await SecureStorageService.read(StorageKeys.userEmail);
      final name = await SecureStorageService.read(StorageKeys.userName);
      final userId = await SecureStorageService.read(StorageKeys.userId);
      final user = userFromAccessToken(token, email) ??
          User(id: userId ?? '', email: email ?? '', name: name);
      state = state.copyWith(isLoggedIn: true, user: user);
    } else {
      state = state.copyWith(isLoggedIn: false);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.login(email, password);
      final data = response.data['data'] as Map<String, dynamic>;
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String?;
      await SecureStorageService.write(StorageKeys.accessToken, accessToken);
      if (refreshToken != null) {
        await SecureStorageService.write(StorageKeys.refreshToken, refreshToken);
      }
      final user = userFromAccessToken(accessToken, email);
      if (user != null) {
        await SecureStorageService.write(StorageKeys.userId, user.id);
        await SecureStorageService.write(StorageKeys.userEmail, user.email);
        if (user.name != null) {
          await SecureStorageService.write(StorageKeys.userName, user.name!);
        }
      }
      state = state.copyWith(isLoading: false, isLoggedIn: true, user: user);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  Future<bool> register(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiService.register(data);
      if (response.data['success'] == false) {
        throw Exception(response.data['message'] ?? 'Registration failed');
      }
      await login(data['email'] as String, data['password'] as String);
      if (state.error != null) {
        return false;
      }
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
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
      final data = response.data['data'] as Map<String, dynamic>;
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String?;
      await SecureStorageService.write(StorageKeys.accessToken, accessToken);
      if (refreshToken != null) {
        await SecureStorageService.write(StorageKeys.refreshToken, refreshToken);
      }
      final user = userFromAccessToken(accessToken, email);
      if (user != null) {
        await SecureStorageService.write(StorageKeys.userId, user.id);
        await SecureStorageService.write(StorageKeys.userEmail, user.email);
        if (user.name != null) {
          await SecureStorageService.write(StorageKeys.userName, user.name!);
        }
      }
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

  void updateLocal({String? name, String? email, String? phone}) {
    final user = state.user;
    if (user == null) return;
    final updated = User(
      id: user.id,
      email: (email != null && email.isNotEmpty) ? email : user.email,
      name: (name != null && name.isNotEmpty) ? name : user.name,
      phone: phone ?? user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
    );
    SecureStorageService.write(StorageKeys.userEmail, updated.email);
    if (updated.name != null) {
      SecureStorageService.write(StorageKeys.userName, updated.name!);
    }
    state = state.copyWith(user: updated);
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
          providerSlug: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/provider/:id/availability',
        name: 'availability',
        builder: (context, state) => AvailabilityPage(
          providerId: state.pathParameters['id']!,
          locationId: state.uri.queryParameters['locationId'],
          initialServiceId: state.uri.queryParameters['serviceId'],
        ),
      ),
      GoRoute(
        path: '/booking/new',
        name: 'bookingForm',
        builder: (context, state) => BookingFormPage(
          providerId: state.uri.queryParameters['providerId']!,
          serviceId: state.uri.queryParameters['serviceId'],
          date: state.uri.queryParameters['date'],
          time: state.uri.queryParameters['time'],
          locationId: state.uri.queryParameters['locationId'],
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
          tenantId: state.uri.queryParameters['tenantId'],
          amount: num.tryParse(state.uri.queryParameters['amount'] ?? '') ?? 0,
          currency: state.uri.queryParameters['currency'] ?? 'IDR',
        ),
      ),
      GoRoute(
        path: '/payment/success',
        name: 'paymentSuccess',
        builder: (context, state) => PaymentSuccessPage(
          bookingId: state.uri.queryParameters['bookingId'] ?? '',
          bookingCode: state.uri.queryParameters['bookingCode'],
          amount: num.tryParse(state.uri.queryParameters['amount'] ?? '') ?? 0,
          currency: state.uri.queryParameters['currency'] ?? 'IDR',
          method: state.uri.queryParameters['method'],
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
