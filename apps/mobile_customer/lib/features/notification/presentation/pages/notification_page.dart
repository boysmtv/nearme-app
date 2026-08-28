import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final notificationsProvider = FutureProvider.autoDispose<List<NotificationRow>>((ref) async {
  final response = await ApiService().getNotifications(params: {'page': 1, 'limit': 50});
  return parsePaginated(response.data['data'], NotificationRow.fromJson).items;
});

class NotificationPage extends ConsumerWidget {
  const NotificationPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('Notifications', style: TextStyle(fontWeight: FontWeight.w800))]),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(10)),
            child: TextButton.icon(
              onPressed: () async {
                try {
                  await ApiService().markAllNotificationsRead();
                  ref.invalidate(notificationsProvider);
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('All marked as read ✨'), backgroundColor: DEKATColors.success));
                } catch (e) {
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: DEKATColors.error));
                }
              },
              icon: const Icon(Icons.done_all_rounded, size: 14, color: DEKATColors.primary),
              label: const Text('Read all', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: DEKATColors.primary)),
            ),
          ),
        ],
      ),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 600), curve: Curves.elasticOut, builder: (c,v,ch)=> Transform.scale(scale: 0.8+0.2*v, child: ch), child: Container(padding: const EdgeInsets.all(18), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.notifications_none_rounded, size: 36, color: Colors.white))),
                    const SizedBox(height: 14),
                    Text('No notifications', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Kamu belum ada notifikasi ✨', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                  ],
                ),
              ),
            );
          }
          return ListView.builder(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final n = notifications[index];
              final isUnread = !n.read;
              return TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: Duration(milliseconds: 300+index*35), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isUnread ? DEKATColors.primary.withValues(alpha: 0.18) : Colors.grey[100]!),
                  boxShadow: isUnread ? [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.09), blurRadius: 12, offset: const Offset(0, 4))] : [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)],
                ),
                child: Stack(
                  children: [
                    if (isUnread) Positioned(left: 0, top: 12, bottom: 12, child: Container(width: 4, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topCenter, end: Alignment.bottomCenter), borderRadius: const BorderRadius.horizontal(right: Radius.circular(4))))),
                    ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      leading: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: isUnread ? DEKATColors.softViolet : [Colors.grey[100]!, Colors.grey[50]!], begin: Alignment.topLeft, end: Alignment.bottomRight),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: isUnread ? [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.16), blurRadius: 8)] : null,
                        ),
                        child: Icon(n.channel == 'EMAIL' ? Icons.email_rounded : Icons.notifications_rounded, color: isUnread ? Colors.white : Colors.grey[500], size: 20),
                      ),
                      title: Row(children: [Expanded(child: Text(n.subject.isEmpty ? '(no subject)' : n.subject, style: TextStyle(fontWeight: isUnread ? FontWeight.w800 : FontWeight.w600, fontSize: 13, color: isUnread ? DEKATColors.textPrimary : Colors.grey[700]))), if (isUnread) Container(width: 8, height: 8, decoration: BoxDecoration(color: DEKATColors.secondary, shape: BoxShape.circle, boxShadow: [BoxShadow(color: DEKATColors.secondary.withValues(alpha: 0.3), blurRadius: 6)]))]),
                      subtitle: Padding(padding: const EdgeInsets.only(top: 4), child: Text(n.body, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600], fontSize: 12, height: 1.4))),
                      trailing: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: isUnread ? DEKATColors.primaryLight : Colors.grey[50], shape: BoxShape.circle), child: Icon(isUnread ? Icons.mark_email_read_rounded : Icons.chevron_right_rounded, size: 14, color: isUnread ? DEKATColors.primary : Colors.grey[400])),
                      onTap: () async {
                        if (!n.read) {
                          try {
                            await ApiService().markNotificationRead(n.id);
                            ref.invalidate(notificationsProvider);
                          } catch (e) {
                            if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: DEKATColors.error));
                          }
                        }
                      },
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ],
                ),
              ));
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
        error: (e, _) => Center(
          child: Container(margin: const EdgeInsets.all(24), padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12))), child: Column(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.wifi_off_rounded, color: DEKATColors.error)), const SizedBox(height: 10), const Text('Failed to load notifications', style: TextStyle(fontWeight: FontWeight.w600)), const SizedBox(height: 10), FilledButton.icon(onPressed: () => ref.invalidate(notificationsProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry'))])),
        ),
      ),
    );
  }
}
