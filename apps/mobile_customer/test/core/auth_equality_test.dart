import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_customer/core/auth/auth_provider.dart';

/// Equality bernilai: Riverpod hanya me-notify bila state BERBEDA.
/// Tanpa ini setiap `state = ...` (mis. tiap 401 → logout()) me-rebuild
/// seluruh router meskipun tidak ada yang berubah → jank di HP lama.
void main() {
  group('AuthState equality', () {
    test('identical states are equal (no notify)', () {
      expect(const AuthState(), const AuthState());
    });

    test('copyWith without changes stays equal', () {
      const base = AuthState(isLoggedIn: true, profileChecked: true);
      expect(base.copyWith(), base);
    });

    test('different login status is not equal', () {
      expect(
        const AuthState(isLoggedIn: true),
        isNot(const AuthState(isLoggedIn: false)),
      );
    });

    test('logout target state equals fresh logged-out state', () {
      // logout() meng-assign const AuthState(); bila state sudah sama,
      // guard `state == const AuthState()` menghentikan badai notify.
      const loggedOut = AuthState(isLoggedIn: false, profileChecked: true);
      expect(loggedOut == const AuthState(), isFalse);
      expect(const AuthState(), const AuthState());
    });
  });

  group('User equality', () {
    const user = User(id: 'u1', email: 'a@b.c', name: 'A');

    test('same values are equal', () {
      expect(
        const User(id: 'u1', email: 'a@b.c', name: 'A'),
        user,
      );
    });

    test('different id is not equal', () {
      expect(
        const User(id: 'u2', email: 'a@b.c', name: 'A'),
        isNot(user),
      );
    });
  });
}
