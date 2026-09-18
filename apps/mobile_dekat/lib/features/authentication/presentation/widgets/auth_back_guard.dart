import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Lokasi publik yang aman dituju tombol back tanpa perlu login.
/// Cerminan `isPublicRoute` di `app_router.dart` (sengaja dipisah agar
/// bisa di-unit-test tanpa membangun router).
bool isPublicLocation(String location) {
  final path = Uri.tryParse(location)?.path ?? location;
  return path == '/discovery' ||
      path == '/search' ||
      path == '/providers' ||
      path.startsWith('/provider/') ||
      path == '/support';
}

/// Pengaman tombol back khusus halaman auth (login/register/forgot-password).
///
/// Masalah: `redirect` GoRouter bersifat *replace*, jadi user guest yang
/// dilempar ke `/login` hanya punya 1 halaman di stack — tombol back
/// Android langsung menutup aplikasi. Lebih parah lagi, `pop()` mentah
/// bisa menjebak user dalam loop (kembali ke halaman proteksi → redirect
/// melempar balik ke login).
///
/// Aturan back di sini (deterministik, tanpa loop):
/// - `/register` & `/forgot-password` + masih ada halaman di bawah → `pop()`
///   (pasti kembali ke login; auth route tidak kena redirect, jadi aman).
/// - Selain itu baca `?redirect=`: kalau targetnya publik → `go()` ke sana.
/// - Sisanya (termasuk target proteksi) → `go('/discovery')`.
///   Tidak pernah menutup aplikasi dari halaman auth.
class AuthBackGuard extends StatelessWidget {
  final Widget child;

  const AuthBackGuard({super.key, required this.child});

  static const _subAuthPaths = {'/register', '/forgot-password'};

  /// Dipisah agar bisa dipanggil tombol back di AppBar juga bila ada.
  static void handleBack(BuildContext context) {
    final uri = GoRouterState.of(context).uri;
    if (_subAuthPaths.contains(uri.path) && context.canPop()) {
      context.pop();
      return;
    }
    final redirect = uri.queryParameters['redirect'];
    if (redirect != null && redirect.isNotEmpty) {
      var target = redirect;
      try {
        target = Uri.decodeComponent(redirect);
      } catch (_) {}
      if (isPublicLocation(target)) {
        context.go(target);
        return;
      }
    }
    context.go('/discovery');
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        handleBack(context);
      },
      child: child,
    );
  }
}
