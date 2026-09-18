import 'dart:convert';
import 'package:equatable/equatable.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';

class AuthState extends Equatable {
  final bool isLoading;
  final bool isLoggedIn;
  final User? user;
  final String? error;
  final bool hasProfile;
  final bool profileChecked;

  const AuthState({
    this.isLoading = false,
    this.isLoggedIn = false,
    this.user,
    this.error,
    this.hasProfile = true,
    this.profileChecked = false,
  });

  @override
  List<Object?> get props =>
      [isLoading, isLoggedIn, user, error, hasProfile, profileChecked];

  AuthState copyWith({
    bool? isLoading,
    bool? isLoggedIn,
    User? user,
    String? error,
    bool? hasProfile,
    bool? profileChecked,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      user: user ?? this.user,
      error: error,
      hasProfile: hasProfile ?? this.hasProfile,
      profileChecked: profileChecked ?? this.profileChecked,
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
      _fetchProfileStatus();
    } else {
      state = state.copyWith(isLoggedIn: false, profileChecked: true);
    }
  }

  Future<void> _fetchProfileStatus() async {
    try {
      final res = await _apiService.getCustomerProfile();
      final data = res.data is Map<String, dynamic> ? res.data['data'] ?? res.data : null;
      final exists = data is Map && data['exists'] == true;
      final nickname = data is Map ? (data['nickname'] ?? data['name']) as String? : null;
      final hasProfile = exists && nickname != null && nickname.trim().isNotEmpty;
      final fallback = state.user?.name != null && state.user!.name!.trim().isNotEmpty;
      state = state.copyWith(hasProfile: hasProfile || fallback, profileChecked: true);
    } catch (_) {
      state = state.copyWith(profileChecked: true);
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
      state = state.copyWith(isLoading: false, isLoggedIn: true, user: user, profileChecked: false, hasProfile: true);
      await _fetchProfileStatus();
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
      if (state.error != null) return false;
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
    // Short-circuit: tiap respons 401 saat guest memanggil onAuthFailure.
    // Tanpa ini setiap 401 → deleteAll + notify → rebuild seluruh router
    // (badai rebuild di HP lama), padahal state tidak berubah.
    if (state == const AuthState()) return;
    try {
      final refreshToken = await SecureStorageService.read(StorageKeys.refreshToken);
      if (refreshToken != null) {
        await _apiService.logout(refreshToken: refreshToken);
      }
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
    state = state.copyWith(user: updated, hasProfile: true, profileChecked: true);
  }

  Future<bool> updateProfileRemote({required String name, String? email, String? phone}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final payload = <String, dynamic>{
        'nickname': name.trim(),
        'name': name.trim(),
        if (email != null && email.isNotEmpty) 'email': email.trim(),
        if (phone != null && phone.isNotEmpty) 'phone': phone.trim(),
      };
      final res = await _apiService.updateCustomerProfile(payload);
      final data = res.data is Map<String, dynamic> ? (res.data['data'] ?? res.data) as Map<String, dynamic>? : null;
      final resolvedName = (data?['nickname'] ?? data?['name'] ?? name) as String;
      final resolvedEmail = (data?['email'] ?? email ?? state.user?.email ?? '') as String;
      final resolvedPhone = (data?['phone'] ?? phone) as String?;
      final user = state.user;
      if (user != null) {
        final updated = User(
          id: user.id,
          email: resolvedEmail,
          name: resolvedName,
          phone: resolvedPhone ?? user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
        );
        await SecureStorageService.write(StorageKeys.userEmail, updated.email);
        if (updated.name != null) await SecureStorageService.write(StorageKeys.userName, updated.name!);
        state = state.copyWith(isLoading: false, user: updated, hasProfile: true, profileChecked: true);
      } else {
        state = state.copyWith(isLoading: false, hasProfile: true, profileChecked: true);
      }
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString().replaceAll('Exception: ', ''));
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
