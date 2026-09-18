import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_customer/core/auth/auth_provider.dart';

class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final rawName = authState.user?.name?.trim();
    final displayName =
        (rawName != null && rawName.isNotEmpty) ? rawName : 'Pengguna';
    final initial = displayName.substring(0, 1).toUpperCase();
    final email = authState.user?.email ?? '';
    final phone = authState.user?.phone;
    final avatarUrl = authState.user?.avatarUrl;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(title: const Text('Akun Saya'), centerTitle: true),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          RepaintBoundary(
            child: _ProfileHeaderCard(
              displayName: displayName,
              initial: initial,
              email: email,
              phone: phone,
              avatarUrl: avatarUrl,
              onEdit: () => context.push('/account/edit'),
            ),
          ),
          const SizedBox(height: 20),
          _MenuGroup(title: 'Booking & Aktivitas', items: [
            _MenuItem(
                icon: Icons.calendar_today_rounded,
                title: 'Booking Saya',
                onTap: () => context.go('/bookings')),
            _MenuItem(
                icon: Icons.repeat_rounded,
                title: 'Booking Berulang',
                onTap: () => context.push('/recurring')),
            _MenuItem(
                icon: Icons.star_border_rounded,
                title: 'Ulasan Saya',
                onTap: () => context.push('/my-reviews')),
            _MenuItem(
                icon: Icons.favorite_border_rounded,
                title: 'Favorit',
                onTap: () => context.push('/favorites')),
          ]),
          const SizedBox(height: 16),
          _MenuGroup(title: 'Reward', items: [
            _MenuItem(
                icon: Icons.stars_rounded,
                title: 'Poin Loyalitas',
                onTap: () => context.push('/loyalty')),
            _MenuItem(
                icon: Icons.person_add_outlined,
                title: 'Undang Teman',
                onTap: () => context.push('/referral')),
          ]),
          const SizedBox(height: 16),
          _MenuGroup(title: 'Pengaturan & Bantuan', items: [
            _MenuItem(
                icon: Icons.notifications_outlined,
                title: 'Notifikasi',
                onTap: () => context.go('/notifications')),
            _MenuItem(
                icon: Icons.notifications_active_outlined,
                title: 'Preferensi Notifikasi',
                onTap: () => context.push('/notification-preferences')),
            _MenuItem(
                icon: Icons.rss_feed_rounded,
                title: 'Feed Sosial',
                onTap: () => context.push('/feed')),
            _MenuItem(
                icon: Icons.help_outline_rounded,
                title: 'Bantuan & Dukungan',
                onTap: () => context.push('/support')),
          ]),
          const SizedBox(height: 16),
          RepaintBoundary(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: _MenuItem(
                  icon: Icons.logout_rounded,
                  title: 'Keluar',
                  textColor: Colors.red,
                  onTap: () {
                    showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                              title: const Text('Keluar'),
                              content: const Text(
                                  'Apakah Anda yakin ingin keluar dari akun?'),
                              actions: [
                                TextButton(
                                    onPressed: () => Navigator.pop(ctx),
                                    child: const Text('Batal')),
                                TextButton(
                                    onPressed: () {
                                      Navigator.pop(ctx);
                                      ref
                                          .read(authProvider.notifier)
                                          .logout();
                                      context.go('/login');
                                    },
                                    child: const Text('Keluar')),
                              ],
                            ));
                  }),
            ),
          ),
          const SizedBox(height: 20),
          Center(
              child: Text('DEKAT v1.0.0',
                  style: TextStyle(color: Colors.grey[500], fontSize: 12))),
        ],
      ),
    );
  }
}

class _ProfileHeaderCard extends StatelessWidget {
  final String displayName;
  final String initial;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final VoidCallback onEdit;

  const _ProfileHeaderCard({
    required this.displayName,
    required this.initial,
    required this.email,
    this.phone,
    this.avatarUrl,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final hasAvatar = avatarUrl != null && avatarUrl!.isNotEmpty;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [DEKATColors.primary, Color(0xFF4A44C6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(children: [
        Container(
          width: 68,
          height: 68,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withValues(alpha: 0.2),
            border: Border.all(
                color: Colors.white.withValues(alpha: 0.6), width: 2),
          ),
          clipBehavior: Clip.antiAlias,
          child: hasAvatar
              ? CachedNetworkImage(
                  imageUrl: avatarUrl!,
                  memCacheWidth: 128,
                  memCacheHeight: 128,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    color: Colors.grey.shade300,
                    alignment: Alignment.center,
                    child: Text(initial,
                        style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white)),
                  ),
                  errorWidget: (context, url, error) => Center(
                    child: Text(initial,
                        style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white)),
                  ),
                )
              : Center(
                  child: Text(initial,
                      style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white)),
                ),
        ),
        const SizedBox(width: 16),
        Expanded(
            child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(displayName,
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            if (email.isNotEmpty)
              Text(email,
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
            if (phone != null && phone!.isNotEmpty) ...[
              const SizedBox(height: 2),
              Text(phone!,
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 12)),
            ],
            const SizedBox(height: 8),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.stars_rounded, size: 14, color: Colors.white),
                SizedBox(width: 4),
                Text('Member DEKAT',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600)),
              ]),
            ),
          ],
        )),
        const SizedBox(width: 8),
        InkWell(
          onTap: onEdit,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.edit_outlined,
                  size: 14, color: DEKATColors.primary),
              SizedBox(width: 4),
              Text('Ubah',
                  style: TextStyle(
                      color: DEKATColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
            ]),
          ),
        ),
      ]),
    );
  }
}

class _MenuGroup extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;
  const _MenuGroup({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(title,
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600])),
      ),
      RepaintBoundary(
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              for (var i = 0; i < items.length; i++) ...[
                RepaintBoundary(child: items[i]),
                if (i < items.length - 1)
                  Divider(
                      height: 1,
                      indent: 64,
                      endIndent: 12,
                      color: Colors.grey.shade200),
              ],
            ],
          ),
        ),
      ),
    ]);
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color? textColor;
  final VoidCallback onTap;
  const _MenuItem(
      {required this.icon,
      required this.title,
      this.textColor,
      required this.onTap});
  @override
  Widget build(BuildContext context) {
    final color = textColor ?? DEKATColors.primary;
    return ListTile(
      dense: true,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(title,
          style: TextStyle(
              color: textColor ?? DEKATColors.textPrimary,
              fontWeight: FontWeight.w600,
              fontSize: 14)),
      trailing: Icon(Icons.chevron_right_rounded,
          color: Colors.grey.shade400),
      onTap: onTap,
    );
  }
}
