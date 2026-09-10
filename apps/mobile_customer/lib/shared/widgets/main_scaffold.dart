import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart' as badges;
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../core/router/app_router.dart';
import '../models/rows.dart';

final currentIndexProvider = StateProvider<int>((ref) => 0);

final notificationCountProvider = FutureProvider.autoDispose<int>((ref) async {
  final response = await ApiService().getNotifications(params: {'page': 1, 'limit': 50});
  final rows = parsePaginated(response.data['data'], NotificationRow.fromJson).items;
  return rows.where((n) => !n.read).length;
});

class MainScaffold extends ConsumerWidget {
  final Widget child;
  const MainScaffold({super.key, required this.child});

  static const _tabs = ['/discovery', '/search', '/chat', '/bookings', '/notifications', '/account'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(currentIndexProvider);
    final notificationCount = ref.watch(notificationCountProvider).valueOrNull ?? 0;
    final isLoggedIn = ref.watch(authProvider.select((s) => s.isLoggedIn));

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
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
        body: child,
        bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          ref.read(currentIndexProvider.notifier).state = index;
          final tab = _tabs[index];
          final isProtected = tab == '/bookings' || tab == '/notifications' || tab == '/account' || tab == '/chat';
          if (isProtected && !isLoggedIn) {
            context.go('/login?redirect=${Uri.encodeComponent(tab)}');
          } else {
            context.go(tab);
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
