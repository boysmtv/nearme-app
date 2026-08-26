import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/core/router/app_router.dart';

String _makeJwt(Map<String, dynamic> claims) {
  final header = base64Url.encode(utf8.encode('{"alg":"HS256","typ":"JWT"}'));
  final payload = base64Url.encode(utf8.encode(jsonEncode(claims)));
  final sig = base64Url.encode(utf8.encode('fake-sig'));
  return '$header.$payload.$sig';
}

void main() {
  group('userFromAccessToken', () {
    test('returns User with valid JWT containing email and sub', () {
      final token = _makeJwt({
        'sub': 'user-123',
        'email': 'test@example.com',
      });
      final user = userFromAccessToken(token, null);
      expect(user, isNotNull);
      expect(user!.id, 'user-123');
      expect(user.email, 'test@example.com');
      expect(user.name, 'test');
    });

    test('uses fallbackEmail when JWT has no email claim', () {
      final token = _makeJwt({
        'sub': 'user-456',
      });
      final user = userFromAccessToken(token, 'fallback@example.com');
      expect(user, isNotNull);
      expect(user!.email, 'fallback@example.com');
      expect(user.name, 'fallback');
    });

    test('returns null for invalid JWT format', () {
      final user = userFromAccessToken('not-a-jwt', null);
      expect(user, isNull);
    });

    test('returns null for malformed base64', () {
      final user = userFromAccessToken('header.!!!invalid!!!.sig', null);
      expect(user, isNull);
    });

    test('returns null for JWT with fewer than 2 parts', () {
      final user = userFromAccessToken('onlyheader', null);
      expect(user, isNull);
    });

    test('returns User when both JWT email and fallback are provided', () {
      final token = _makeJwt({
        'sub': 'u1',
        'email': 'jwt@example.com',
      });
      final user = userFromAccessToken(token, 'fallback@example.com');
      expect(user!.email, 'jwt@example.com');
    });

    test('defaults name from email local part', () {
      final token = _makeJwt({
        'sub': 'u2',
        'email': 'john.doe@domain.com',
      });
      final user = userFromAccessToken(token, null);
      expect(user!.name, 'john.doe');
    });
  });

  group('AuthState', () {
    test('has correct defaults', () {
      const state = AuthState();
      expect(state.isLoading, false);
      expect(state.isLoggedIn, false);
      expect(state.user, isNull);
      expect(state.error, isNull);
    });

    test('copyWith preserves isLoading and isLoggedIn when not overridden', () {
      const original = AuthState(
        isLoading: true,
        isLoggedIn: true,
        error: 'some error',
      );
      final copied = original.copyWith();
      expect(copied.isLoading, true);
      expect(copied.isLoggedIn, true);
      expect(copied.error, isNull);
    });

    test('copyWith overrides specified fields and clears error', () {
      const original = AuthState(isLoading: true, isLoggedIn: false);
      final copied = original.copyWith(isLoading: false, isLoggedIn: true);
      expect(copied.isLoading, false);
      expect(copied.isLoggedIn, true);
      expect(copied.error, isNull);
    });

    test('copyWith clears error when error is set to null explicitly', () {
      const original = AuthState(error: 'old error');
      final copied = original.copyWith(error: 'new error');
      expect(copied.error, 'new error');
    });

    test('copyWith with user field', () {
      const original = AuthState();
      final copied = original.copyWith(
        isLoggedIn: true,
      );
      expect(copied.isLoggedIn, true);
      expect(copied.user, isNull);
    });
  });
}
