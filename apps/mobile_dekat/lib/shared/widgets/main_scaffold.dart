import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart' as badges;
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../core/auth/auth_provider.dart';

class _NotificationRow {
  final String id;
  final bool read;
  const _NotificationRow({required this.id, required this.read});
  factory _NotificationRow.fromJson(Map<String, dynamic> json) =>
      _NotificationRow(id: json['id'] as String, read: json['read'] == true);
}

final notificationCountProvider = FutureProvider<int>((ref) async {
  // Jangan tembak API saat guest: pasti 401 → memicu onAuthFailure/logout
  // → rebuild seluruh router. Badge 0 tanpa network sama sekali.
  final isLoggedIn = ref.watch(authProvider.select((s) => s.isLoggedIn));
  if (!isLoggedIn) return 0;
  final response = await ApiService().getNotifications(params: {'page': 1, 'limit': 50});
  final data = (response.data['data'] ?? []) as List;
  final items = data.map((e) => _NotificationRow.fromJson(e as Map<String, dynamic>)).toList();
  return items.where((n) => !n.read).length;
});

class MainScaffold extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;
  const MainScaffold({super.key, required this.navigationShell});

  static const _tabs = ['/discovery', '/search', '/chat', '/bookings', '/notifications', '/account'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = navigationShell.currentIndex;
    final notificationCount = ref.watch(notificationCountProvider).valueOrNull ?? 0;
    final isLoggedIn = ref.watch(authProvider.select((s) => s.isLoggedIn));

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;

        // If current branch has its own navigator stack, pop that first
        final navigator = Navigator.of(context);
        if (navigator.canPop()) {
          navigator.pop();
          return;
        }

        final confirmed = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Keluar?'),
            content: const Text('Apakah anda ingin keluar dari aplikasi?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Tidak')),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ya', style: TextStyle(color: Colors.red))),
            ],
          ),
        );
        if (confirmed == true && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        body: navigationShell,
        bottomNavigationBar: NavigationBar(
          selectedIndex: currentIndex,
          onDestinationSelected: (index) {
            final tab = _tabs[index];
            final isProtected = tab == '/bookings' || tab == '/notifications' || tab == '/account' || tab == '/chat';
            if (isProtected && !isLoggedIn) {
              context.go('/login?redirect=${Uri.encodeComponent(tab)}');
            } else {
              navigationShell.goBranch(
                index,
                initialLocation: index == currentIndex,
              );
            }
          },
          destinations: [
            const NavigationDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: 'Discover'),
            const NavigationDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: 'Search'),
            const NavigationDestination(icon: Icon(Icons.chat_bubble_outline), selectedIcon: Icon(Icons.chat_bubble), label: 'Chat'),
            const NavigationDestination(icon: Icon(Icons.calendar_today_outlined), selectedIcon: Icon(Icons.calendar_today), label: 'Bookings'),
            NavigationDestination(
              icon: notificationCount > 0
                  ? badges.Badge(badgeContent: Text('$notificationCount', style: const TextStyle(color: Colors.white, fontSize: 10)), child: const Icon(Icons.notifications_outlined))
                  : const Icon(Icons.notifications_outlined),
              selectedIcon: notificationCount > 0
                  ? badges.Badge(badgeContent: Text('$notificationCount', style: const TextStyle(color: Colors.white, fontSize: 10)), child: const Icon(Icons.notifications))
                  : const Icon(Icons.notifications),
              label: 'Alerts',
            ),
            const NavigationDestination(icon: Icon(Icons.person_outlined), selectedIcon: Icon(Icons.person), label: 'Account'),
          ],
        ),
      ),
    );
  }
}
