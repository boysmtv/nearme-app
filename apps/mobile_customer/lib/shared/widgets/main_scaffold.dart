import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart' as badges;
import 'package:flutter_api_client/flutter_api_client.dart';
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

  static const _tabs = ['/discovery', '/search', '/bookings', '/notifications', '/account'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(currentIndexProvider);
    final notificationCount = ref.watch(notificationCountProvider).valueOrNull ?? 0;

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          ref.read(currentIndexProvider.notifier).state = index;
          context.go(_tabs[index]);
        },
        destinations: [
          const NavigationDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: 'Discover'),
          const NavigationDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: 'Search'),
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
    );
  }
}
