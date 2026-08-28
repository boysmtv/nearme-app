import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart' as badges;
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
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
      backgroundColor: DEKATColors.backgroundLight,
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, -4))],
          border: Border(top: BorderSide(color: DEKATColors.primary.withValues(alpha: 0.08))),
        ),
        child: NavigationBar(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          indicatorColor: DEKATColors.primaryLight,
          indicatorShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          height: 72,
          elevation: 0,
          selectedIndex: currentIndex,
          onDestinationSelected: (index) {
            ref.read(currentIndexProvider.notifier).state = index;
            context.go(_tabs[index]);
          },
          destinations: [
            const NavigationDestination(
              icon: Icon(Icons.spa_outlined),
              selectedIcon: Icon(Icons.spa_rounded, color: DEKATColors.primary),
              label: 'Discover',
            ),
            const NavigationDestination(
              icon: Icon(Icons.search_outlined),
              selectedIcon: Icon(Icons.search_rounded, color: DEKATColors.primary),
              label: 'Search',
            ),
            const NavigationDestination(
              icon: Icon(Icons.calendar_today_outlined),
              selectedIcon: Icon(Icons.calendar_today_rounded, color: DEKATColors.primary),
              label: 'Bookings',
            ),
            NavigationDestination(
              icon: notificationCount > 0
                  ? badges.Badge(
                      badgeStyle: const badges.BadgeStyle(badgeColor: DEKATColors.secondary, padding: EdgeInsets.all(5)),
                      badgeContent: Text('$notificationCount', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      child: const Icon(Icons.notifications_outlined),
                    )
                  : const Icon(Icons.notifications_outlined),
              selectedIcon: notificationCount > 0
                  ? badges.Badge(
                      badgeStyle: const badges.BadgeStyle(badgeColor: DEKATColors.secondary, padding: EdgeInsets.all(5)),
                      badgeContent: Text('$notificationCount', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      child: const Icon(Icons.notifications_rounded, color: DEKATColors.primary),
                    )
                  : const Icon(Icons.notifications_rounded, color: DEKATColors.primary),
              label: 'Alerts',
            ),
            const NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded, color: DEKATColors.primary),
              label: 'Account',
            ),
          ],
        ),
      ),
    );
  }
}
