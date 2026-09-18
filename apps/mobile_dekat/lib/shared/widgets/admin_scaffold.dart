import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

/// Bottom nav + exit-dialog khusus role admin di aplikasi unifikasi.
class AdminScaffold extends ConsumerWidget {
  final Widget child;
  const AdminScaffold({super.key, required this.child});

  static const _tabs = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/tenants',
    '/admin/bookings',
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/admin/users')) return 1;
    if (location.startsWith('/admin/tenants')) return 2;
    if (location.startsWith('/admin/bookings')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final navigator = Navigator.of(context);
        if (navigator.canPop()) {
          navigator.pop();
          return;
        }
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Keluar?'),
            content:
                const Text('Apakah anda ingin keluar dari aplikasi?'),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(ctx, false),
                  child: const Text('Tidak')),
              TextButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('Ya',
                      style: TextStyle(color: Colors.red))),
            ],
          ),
        );
        if (confirmed == true && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        body: child,
        bottomNavigationBar: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          currentIndex: _currentIndex(context),
          onTap: (index) => context.go(_tabs[index]),
          items: const [
            BottomNavigationBarItem(
                icon: Icon(Icons.dashboard_outlined),
                activeIcon: Icon(Icons.dashboard),
                label: 'Dashboard'),
            BottomNavigationBarItem(
                icon: Icon(Icons.people_outline),
                activeIcon: Icon(Icons.people),
                label: 'Pengguna'),
            BottomNavigationBarItem(
                icon: Icon(Icons.store_outlined),
                activeIcon: Icon(Icons.store),
                label: 'Tenant'),
            BottomNavigationBarItem(
                icon: Icon(Icons.book_outlined),
                activeIcon: Icon(Icons.book),
                label: 'Booking'),
          ],
        ),
      ),
    );
  }
}
