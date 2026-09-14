import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_partner/core/router/app_router.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('PartnerAuthState', () {
    test('default constructor creates logged-out state', () {
      const state = PartnerAuthState();
      expect(state.isLoading, false);
      expect(state.isLoggedIn, false);
      expect(state.user, isNull);
      expect(state.error, isNull);
    });

    test('copyWith isLoading', () {
      const state = PartnerAuthState();
      final s1 = state.copyWith(isLoading: true);
      expect(s1.isLoading, true);
      expect(s1.isLoggedIn, false);

      final s2 = s1.copyWith(isLoading: false);
      expect(s2.isLoading, false);
    });

    test('copyWith isLoggedIn', () {
      const state = PartnerAuthState();
      final s1 = state.copyWith(isLoggedIn: true);
      expect(s1.isLoggedIn, true);
      expect(s1.isLoading, false);
    });

    test('copyWith error sets error', () {
      const state = PartnerAuthState();
      final s1 = state.copyWith(error: 'Invalid credentials');
      expect(s1.error, 'Invalid credentials');
    });

    test('copyWith null error clears error', () {
      const state = PartnerAuthState(error: 'old');
      final s2 = state.copyWith(error: null);
      expect(s2.error, isNull);
    });
  });

  group('partnerAuthProvider', () {
    test('is a StateNotifierProvider', () {
      expect(partnerAuthProvider, isA<StateNotifierProvider>());
    });
  });

  group('routerProvider', () {
    test('is a Provider', () {
      expect(routerProvider, isA<Provider>());
    });
  });
}
