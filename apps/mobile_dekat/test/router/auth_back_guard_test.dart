import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:mobile_dekat/features/authentication/presentation/widgets/auth_back_guard.dart';

GoRouter _testRouter(String initial) {
  return GoRouter(
    initialLocation: initial,
    routes: [
      GoRoute(
        path: '/discovery',
        builder: (_, __) => const Text('DISCOVERY'),
      ),
      GoRoute(
        path: '/provider/:id',
        builder: (_, state) =>
            Text('PROVIDER ${state.pathParameters['id']}'),
      ),
      GoRoute(
        path: '/login',
        builder: (_, __) => const AuthBackGuard(child: Text('LOGIN')),
      ),
      GoRoute(
        path: '/register',
        builder: (_, __) => const AuthBackGuard(child: Text('REGISTER')),
      ),
    ],
  );
}

Future<void> _pumpRouter(WidgetTester tester, String initial) async {
  await tester.pumpWidget(MaterialApp.router(routerConfig: _testRouter(initial)));
  await tester.pumpAndSettle();
}

Future<void> _systemBack(WidgetTester tester) async {
  await tester.binding.handlePopRoute();
  await tester.pumpAndSettle();
}

void main() {
  group('isPublicLocation', () {
    test('public routes return true', () {
      for (final loc in [
        '/discovery',
        '/search',
        '/providers',
        '/provider/abc',
        '/provider/abc/reviews',
        '/support',
      ]) {
        expect(isPublicLocation(loc), isTrue, reason: loc);
      }
    });

    test('guarded routes return false', () {
      for (final loc in [
        '/login',
        '/register',
        '/account',
        '/bookings',
        '/booking/new',
        '/chat',
        '/profile/complete',
        '/',
      ]) {
        expect(isPublicLocation(loc), isFalse, reason: loc);
      }
    });

    test('ignores query string when checking', () {
      expect(isPublicLocation('/provider/abc?service=s1'), isTrue);
      expect(isPublicLocation('/account?foo=bar'), isFalse);
    });
  });

  group('AuthBackGuard system back', () {
    testWidgets('standalone login goes to discovery (never closes app)',
        (tester) async {
      await _pumpRouter(tester, '/login');
      expect(find.text('LOGIN'), findsOneWidget);
      await _systemBack(tester);
      expect(find.text('DISCOVERY'), findsOneWidget);
    });

    testWidgets('login with public redirect target goes there', (tester) async {
      await _pumpRouter(tester, '/login?redirect=%2Fprovider%2Fabc');
      expect(find.text('LOGIN'), findsOneWidget);
      await _systemBack(tester);
      expect(find.text('PROVIDER abc'), findsOneWidget);
    });

    testWidgets('login with guarded redirect target goes to discovery',
        (tester) async {
      await _pumpRouter(tester, '/login?redirect=%2Faccount');
      expect(find.text('LOGIN'), findsOneWidget);
      await _systemBack(tester);
      // /account butuh login → discovery, bukan loop / app tertutup.
      expect(find.text('DISCOVERY'), findsOneWidget);
    });

    testWidgets('standalone register goes to discovery', (tester) async {
      await _pumpRouter(tester, '/register');
      expect(find.text('REGISTER'), findsOneWidget);
      await _systemBack(tester);
      expect(find.text('DISCOVERY'), findsOneWidget);
    });

    testWidgets('register pushed from login pops back to login', (tester) async {
      final router = _testRouter('/login');
      await tester.pumpWidget(MaterialApp.router(routerConfig: router));
      await tester.pumpAndSettle();
      expect(find.text('LOGIN'), findsOneWidget);
      router.push('/register');
      await tester.pumpAndSettle();
      expect(find.text('REGISTER'), findsOneWidget);
      await _systemBack(tester);
      expect(find.text('LOGIN'), findsOneWidget);
    });
  });
}
