import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final GlobalKey<ScaffoldState> partnerScaffoldKey = GlobalKey<ScaffoldState>();

class MainScaffold extends StatelessWidget {
  final Widget child;
  const MainScaffold({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/bookings')) return 1;
    if (location.startsWith('/payments')) return 2;
    if (location.startsWith('/staff')) return 3;
    if (location.startsWith('/reports')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0: context.go('/calendar'); break;
      case 1: context.go('/bookings'); break;
      case 2: context.go('/payments'); break;
      case 3: context.go('/staff'); break;
      case 4: context.go('/reports'); break;
    }
  }

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout?'),
        content: const Text('Anda akan keluar dari aplikasi.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Logout', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed == true) {
      final apiService = ApiService();
      final refreshToken = await SecureStorageService.read(StorageKeys.refreshToken);
      try {
        await apiService.logout(refreshToken: refreshToken);
      } catch (_) {}
      await SecureStorageService.deleteAll();
      if (context.mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    return Scaffold(
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.spa, color: Colors.white, size: 40),
                    const SizedBox(height: 8),
                    const Text('DEKAT Partner', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text('Kelola bisnis Anda', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              _DrawerItem(
                icon: Icons.dashboard_outlined,
                title: 'Dashboard',
                selected: location.startsWith('/calendar'),
                onTap: () { Navigator.pop(context); context.go('/calendar'); },
              ),
              _DrawerItem(
                icon: Icons.book_outlined,
                title: 'Bookings',
                selected: location.startsWith('/bookings'),
                onTap: () { Navigator.pop(context); context.go('/bookings'); },
              ),
              _DrawerItem(
                icon: Icons.payments_outlined,
                title: 'Pendapatan',
                selected: location.startsWith('/payments'),
                onTap: () { Navigator.pop(context); context.go('/payments'); },
              ),
              _DrawerItem(
                icon: Icons.design_services_outlined,
                title: 'Layanan',
                selected: location.startsWith('/services'),
                onTap: () { Navigator.pop(context); context.go('/services'); },
              ),
              _DrawerItem(
                icon: Icons.people_outline,
                title: 'Staf',
                selected: location.startsWith('/staff'),
                onTap: () { Navigator.pop(context); context.go('/staff'); },
              ),
              _DrawerItem(
                icon: Icons.fact_check_outlined,
                title: 'Absensi Staf',
                selected: location.startsWith('/staff-checkin'),
                onTap: () { Navigator.pop(context); context.go('/staff-checkin'); },
              ),
              const Divider(),
              _DrawerItem(
                icon: Icons.chat_outlined,
                title: 'Chat',
                selected: location.startsWith('/chats'),
                onTap: () { Navigator.pop(context); context.go('/chats'); },
              ),
              _DrawerItem(
                icon: Icons.star_outline,
                title: 'Ulasan',
                selected: location.startsWith('/reviews'),
                onTap: () { Navigator.pop(context); context.go('/reviews'); },
              ),
              _DrawerItem(
                icon: Icons.local_offer_outlined,
                title: 'Promosi',
                selected: location.startsWith('/promotions'),
                onTap: () { Navigator.pop(context); context.go('/promotions'); },
              ),
              _DrawerItem(
                icon: Icons.notifications_outlined,
                title: 'Notifikasi',
                selected: location.startsWith('/notifications'),
                onTap: () { Navigator.pop(context); context.go('/notifications'); },
              ),
              _DrawerItem(
                icon: Icons.help_outline,
                title: 'FAQ',
                selected: location.startsWith('/faq'),
                onTap: () { Navigator.pop(context); context.go('/faq'); },
              ),
              _DrawerItem(
                icon: Icons.bar_chart_outlined,
                title: 'Laporan',
                selected: location.startsWith('/reports'),
                onTap: () { Navigator.pop(context); context.go('/reports'); },
              ),
              const Divider(),
              _DrawerItem(
                icon: Icons.event_busy_outlined,
                title: 'Tanggal Terblokir',
                selected: location.startsWith('/blocked-dates'),
                onTap: () { Navigator.pop(context); context.go('/blocked-dates'); },
              ),
              _DrawerItem(
                icon: Icons.people_outline,
                title: 'Pelanggan',
                selected: location.startsWith('/customers'),
                onTap: () { Navigator.pop(context); context.go('/customers'); },
              ),
              _DrawerItem(
                icon: Icons.settings_outlined,
                title: 'Pengaturan',
                selected: location.startsWith('/settings'),
                onTap: () { Navigator.pop(context); context.go('/settings'); },
              ),
              const Spacer(),
              const Divider(),
              _DrawerItem(
                icon: Icons.logout,
                title: 'Logout',
                selected: false,
                onTap: () => _logout(context),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex(context),
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month_outlined), activeIcon: Icon(Icons.calendar_month), label: 'Kalender'),
          BottomNavigationBarItem(icon: Icon(Icons.book_outlined), activeIcon: Icon(Icons.book), label: 'Booking'),
          BottomNavigationBarItem(icon: Icon(Icons.payments_outlined), activeIcon: Icon(Icons.payments), label: 'Pendapatan'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'Staf'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart_outlined), activeIcon: Icon(Icons.bar_chart), label: 'Laporan'),
        ],
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool selected;
  final VoidCallback onTap;

  const _DrawerItem({required this.icon, required this.title, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: selected ? Theme.of(context).colorScheme.primary : null),
      title: Text(title, style: TextStyle(fontWeight: selected ? FontWeight.bold : FontWeight.normal, color: selected ? Theme.of(context).colorScheme.primary : null)),
      selected: selected,
      onTap: onTap,
    );
  }
}
