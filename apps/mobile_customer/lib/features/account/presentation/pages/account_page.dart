import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/router/app_router.dart';

class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: ListView(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            child: Row(children: [
              CircleAvatar(
                radius: 40,
                backgroundColor: Colors.grey[300],
                child: Text(
                  authState.user?.name?.substring(0, 1).toUpperCase() ?? 'U',
                  style: const TextStyle(fontSize: 32),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(authState.user?.name ?? 'User', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(authState.user?.email ?? '', style: TextStyle(color: Colors.grey[600])),
                ],
              )),
              IconButton(icon: const Icon(Icons.edit), onPressed: () => context.push('/account/edit')),
            ]),
          ),
          const SizedBox(height: 8),
          _MenuItem(icon: Icons.calendar_today, title: 'My Bookings', onTap: () => context.go('/bookings')),
          _MenuItem(icon: Icons.help_outline, title: 'Help & Support', onTap: () => context.push('/support')),
          const Divider(),
          _MenuItem(icon: Icons.logout, title: 'Logout', textColor: Colors.red, onTap: () {
            showDialog(context: context, builder: (ctx) => AlertDialog(
              title: const Text('Logout'), content: const Text('Are you sure?'),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                TextButton(onPressed: () {
                  Navigator.pop(ctx);
                  ref.read(authProvider.notifier).logout();
                  context.go('/login');
                }, child: const Text('Logout')),
              ],
            ));
          }),
          const SizedBox(height: 16),
          Center(child: Text('DEKAT v1.0.0', style: TextStyle(color: Colors.grey[500]))),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color? textColor;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, this.textColor, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: textColor),
      title: Text(title, style: TextStyle(color: textColor)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
