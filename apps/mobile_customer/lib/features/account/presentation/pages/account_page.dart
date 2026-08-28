import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:mobile_customer/core/router/app_router.dart';

class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softLavender), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.person_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('My Account', style: TextStyle(fontWeight: FontWeight.w800))]),
        centerTitle: true,
      ),
      body: ListView(
        physics: const BouncingScrollPhysics(),
        children: [
          Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF8B8CFF), Color(0xFFFF8E9E), Color(0xFFFFD3A5)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.22), blurRadius: 18, offset: const Offset(0, 6))]),
            child: Stack(
              children: [
                Positioned(right: -20, top: -20, child: Container(width: 100, height: 100, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), shape: BoxShape.circle))),
                Positioned(left: -10, bottom: -10, child: Container(width: 70, height: 70, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.08), shape: BoxShape.circle))),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(children: [
                    TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutBack, builder: (c,v,ch)=> Transform.scale(scale: 0.85+0.15*v, child: ch), child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 10)]),
                      child: CircleAvatar(
                        radius: 36,
                        backgroundColor: DEKATColors.primaryLight,
                        child: Text(
                          authState.user?.name?.substring(0, 1).toUpperCase() ?? 'U',
                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: DEKATColors.primary),
                        ),
                      ),
                    )),
                    const SizedBox(width: 14),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(authState.user?.name ?? 'User', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white)),
                      const SizedBox(height: 3),
                      Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withValues(alpha: 0.3))), child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.email_rounded, size: 11, color: Colors.white), const SizedBox(width: 4), Flexible(child: Text(authState.user?.email ?? '', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis))])),
                    ])),
                    Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8)]), child: IconButton(icon: const Icon(Icons.edit_rounded, color: DEKATColors.primary, size: 18), onPressed: () => context.push('/account/edit'))),
                  ]),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('Menu', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 0.6))),
          const SizedBox(height: 8),
          _MenuItem(icon: Icons.calendar_month_rounded, gradient: DEKATColors.softViolet, title: 'My Bookings', subtitle: 'Lihat riwayat booking', onTap: () => context.go('/bookings')),
          _MenuItem(icon: Icons.help_center_rounded, gradient: DEKATColors.softSky, title: 'Help & Support', subtitle: 'Bantuan & tiket', onTap: () => context.push('/support')),
          _MenuItem(icon: Icons.notifications_active_rounded, gradient: DEKATColors.softPeach, title: 'Notifications', subtitle: 'Notifikasi terbaru', onTap: () => context.go('/notifications')),
          _MenuItem(icon: Icons.person_pin_rounded, gradient: DEKATColors.softMint, title: 'Edit Profile', subtitle: 'Ubah data diri', onTap: () => context.push('/account/edit')),
          const SizedBox(height: 8),
          Container(margin: const EdgeInsets.symmetric(horizontal: 16), height: 1, decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.transparent, Colors.grey[200]!, Colors.transparent]))),
          const SizedBox(height: 8),
          _MenuItem(icon: Icons.logout_rounded, gradient: DEKATColors.softPink, title: 'Logout', subtitle: 'Keluar dari akun', textColor: DEKATColors.error, onTap: () {
            showDialog(context: context, builder: (ctx) => AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
              title: Row(children: [Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.logout_rounded, color: DEKATColors.error, size: 18)), const SizedBox(width: 10), const Text('Logout', style: TextStyle(fontWeight: FontWeight.w800))]),
              content: const Text('Are you sure you want to logout?', style: TextStyle(fontSize: 13)),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: Colors.grey[700]))),
                FilledButton(onPressed: () {
                  Navigator.pop(ctx);
                  ref.read(authProvider.notifier).logout();
                  context.go('/login');
                }, style: FilledButton.styleFrom(backgroundColor: DEKATColors.error, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))), child: const Text('Logout')),
              ],
            ));
          }),
          const SizedBox(height: 24),
          Center(child: Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]), child: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(7)), child: const Icon(Icons.spa_rounded, color: Colors.white, size: 12)), const SizedBox(width: 7), Text('DEKAT v1.0.0 ✨', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w600, fontSize: 12))]))),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final List<Color> gradient;
  final String title;
  final String? subtitle;
  final Color? textColor;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.gradient, required this.title, this.subtitle, this.textColor, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final isLogout = textColor == DEKATColors.error;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isLogout ? DEKATColors.error.withValues(alpha: 0.14) : Colors.grey[100]!),
        boxShadow: [BoxShadow(color: isLogout ? DEKATColors.error.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        leading: Container(padding: const EdgeInsets.all(9), decoration: BoxDecoration(gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(11), boxShadow: [BoxShadow(color: gradient.first.withValues(alpha: 0.2), blurRadius: 6)]), child: Icon(icon, color: Colors.white, size: 18)),
        title: Text(title, style: TextStyle(color: textColor ?? DEKATColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
        subtitle: subtitle != null ? Text(subtitle!, style: TextStyle(color: Colors.grey[500], fontSize: 11, fontWeight: FontWeight.w500)) : null,
        trailing: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: isLogout ? DEKATColors.errorLight : Colors.grey[50], shape: BoxShape.circle), child: Icon(Icons.chevron_right_rounded, size: 16, color: isLogout ? DEKATColors.error : Colors.grey[500])),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }
}
