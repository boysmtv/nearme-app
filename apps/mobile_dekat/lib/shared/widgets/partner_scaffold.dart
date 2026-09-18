import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/auth/auth_provider.dart';

/// Kunci global warisan halaman partner (drawer/Scaffold lama).
final GlobalKey<ScaffoldState> partnerScaffoldKey =
    GlobalKey<ScaffoldState>();

/// Bottom nav + drawer khusus role provider di aplikasi unifikasi.
/// Adaptasi dari MainScaffold aplikasi partner lama (semua path kini
/// berprefix /provider agar tidak tabrakan dengan route customer).
class PartnerScaffold extends ConsumerWidget {
  final Widget child;
  const PartnerScaffold({super.key, required this.child});

  static const _tabs = [
    '/provider/calendar',
    '/provider/bookings',
    '/provider/payments',
    '/provider/staff',
    '/provider/reports',
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/provider/bookings')) return 1;
    if (location.startsWith('/provider/payments')) return 2;
    if (location.startsWith('/provider/staff')) return 3;
    if (location.startsWith('/provider/reports')) return 4;
    return 0;
  }

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout?'),
        content: const Text('Anda akan keluar dari aplikasi.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Batal')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child:
                  const Text('Logout', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(authProvider.notifier).logout();
      if (context.mounted) context.go('/login');
    }
  }

  void _drawerGo(BuildContext context, String location) {
    Navigator.pop(context);
    context.go(location);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    bool sel(String prefix) => location.startsWith(prefix);
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
        key: partnerScaffoldKey,
        drawer: Drawer(
          child: SafeArea(
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.spa, color: Colors.white, size: 40),
                      SizedBox(height: 8),
                      Text('DEKAT Partner',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('Kelola bisnis Anda',
                          style:
                              TextStyle(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                _DrawerItem(
                    icon: Icons.dashboard_outlined,
                    title: 'Dashboard',
                    selected: sel('/provider/calendar'),
                    onTap: () => _drawerGo(context, '/provider/calendar')),
                _DrawerItem(
                    icon: Icons.book_outlined,
                    title: 'Bookings',
                    selected: sel('/provider/bookings'),
                    onTap: () => _drawerGo(context, '/provider/bookings')),
                _DrawerItem(
                    icon: Icons.payments_outlined,
                    title: 'Pendapatan',
                    selected: sel('/provider/payments'),
                    onTap: () => _drawerGo(context, '/provider/payments')),
                _DrawerItem(
                    icon: Icons.design_services_outlined,
                    title: 'Layanan',
                    selected: sel('/provider/services'),
                    onTap: () => _drawerGo(context, '/provider/services')),
                _DrawerItem(
                    icon: Icons.people_outline,
                    title: 'Staf',
                    selected: sel('/provider/staff') &&
                        !sel('/provider/staff-checkin'),
                    onTap: () => _drawerGo(context, '/provider/staff')),
                _DrawerItem(
                    icon: Icons.fact_check_outlined,
                    title: 'Absensi Staf',
                    selected: sel('/provider/staff-checkin'),
                    onTap: () =>
                        _drawerGo(context, '/provider/staff-checkin')),
                const Divider(),
                _DrawerItem(
                    icon: Icons.chat_outlined,
                    title: 'Chat',
                    selected: sel('/provider/chats'),
                    onTap: () => _drawerGo(context, '/provider/chats')),
                _DrawerItem(
                    icon: Icons.star_outline,
                    title: 'Ulasan',
                    selected: sel('/provider/reviews'),
                    onTap: () => _drawerGo(context, '/provider/reviews')),
                _DrawerItem(
                    icon: Icons.local_offer_outlined,
                    title: 'Promosi',
                    selected: sel('/provider/promotions'),
                    onTap: () =>
                        _drawerGo(context, '/provider/promotions')),
                _DrawerItem(
                    icon: Icons.notifications_outlined,
                    title: 'Notifikasi',
                    selected: sel('/provider/notifications'),
                    onTap: () =>
                        _drawerGo(context, '/provider/notifications')),
                _DrawerItem(
                    icon: Icons.help_outline,
                    title: 'FAQ',
                    selected: sel('/provider/faq'),
                    onTap: () => _drawerGo(context, '/provider/faq')),
                _DrawerItem(
                    icon: Icons.bar_chart_outlined,
                    title: 'Laporan',
                    selected: sel('/provider/reports'),
                    onTap: () => _drawerGo(context, '/provider/reports')),
                const Divider(),
                _DrawerItem(
                    icon: Icons.event_busy_outlined,
                    title: 'Tanggal Terblokir',
                    selected: sel('/provider/blocked-dates'),
                    onTap: () =>
                        _drawerGo(context, '/provider/blocked-dates')),
                _DrawerItem(
                    icon: Icons.people_outline,
                    title: 'Pelanggan',
                    selected: sel('/provider/customers'),
                    onTap: () =>
                        _drawerGo(context, '/provider/customers')),
                _DrawerItem(
                    icon: Icons.settings_outlined,
                    title: 'Pengaturan',
                    selected: sel('/provider/settings'),
                    onTap: () => _drawerGo(context, '/provider/settings')),
                const Spacer(),
                const Divider(),
                _DrawerItem(
                    icon: Icons.logout,
                    title: 'Logout',
                    selected: false,
                    onTap: () => _logout(context, ref)),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
        body: child,
        bottomNavigationBar: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          currentIndex: _currentIndex(context),
          onTap: (index) => context.go(_tabs[index]),
          items: const [
            BottomNavigationBarItem(
                icon: Icon(Icons.calendar_month_outlined),
                activeIcon: Icon(Icons.calendar_month),
                label: 'Kalender'),
            BottomNavigationBarItem(
                icon: Icon(Icons.book_outlined),
                activeIcon: Icon(Icons.book),
                label: 'Booking'),
            BottomNavigationBarItem(
                icon: Icon(Icons.payments_outlined),
                activeIcon: Icon(Icons.payments),
                label: 'Pendapatan'),
            BottomNavigationBarItem(
                icon: Icon(Icons.people_outline),
                activeIcon: Icon(Icons.people),
                label: 'Staf'),
            BottomNavigationBarItem(
                icon: Icon(Icons.bar_chart_outlined),
                activeIcon: Icon(Icons.bar_chart),
                label: 'Laporan'),
          ],
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool selected;
  final VoidCallback onTap;

  const _DrawerItem(
      {required this.icon,
      required this.title,
      required this.selected,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon,
          color: selected ? Theme.of(context).colorScheme.primary : null),
      title: Text(title,
          style: TextStyle(
              fontWeight: selected ? FontWeight.bold : FontWeight.normal,
              color: selected ? Theme.of(context).colorScheme.primary : null)),
      selected: selected,
      onTap: onTap,
    );
  }
}
