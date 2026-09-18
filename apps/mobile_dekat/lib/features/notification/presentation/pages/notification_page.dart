import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

import '../../../notification/presentation/viewmodel/notification_viewmodel.dart';
import '../../../../shared/widgets/shimmer_loading.dart';
import '../../domain/entities/notification_entity.dart';

String _timeAgo(DateTime? dt) {
  if (dt == null) return '';
  final diff = DateTime.now().difference(dt);
  if (diff.inMinutes < 1) return 'Baru saja';
  if (diff.inMinutes < 60) return '${diff.inMinutes} mnt lalu';
  if (diff.inHours < 24) return '${diff.inHours} jam lalu';
  if (diff.inDays < 7) return '${diff.inDays} hari lalu';
  return '${dt.day}/${dt.month}/${dt.year}';
}

String _groupLabel(DateTime? dt) {
  if (dt == null) return 'Lainnya';
  final now = DateTime.now();
  final day = DateTime(dt.year, dt.month, dt.day);
  final today = DateTime(now.year, now.month, now.day);
  final diff = today.difference(day).inDays;
  if (diff <= 0) return 'Hari Ini';
  if (diff == 1) return 'Kemarin';
  if (diff < 7) return 'Minggu Ini';
  return 'Lebih Lama';
}

class _ChannelTheme {
  final IconData icon;
  final Color bg;
  final Color fg;
  const _ChannelTheme(this.icon, this.bg, this.fg);
}

_ChannelTheme _channelTheme(String channel) {
  switch (channel.toUpperCase()) {
    case 'EMAIL':
      return const _ChannelTheme(
          Icons.email_rounded, Color(0xFFE8F4FF), Color(0xFF2196F3));
    case 'PUSH':
      return const _ChannelTheme(Icons.notifications_rounded,
          Color(0xFFEFEDFF), Color(0xFF6C63FF));
    case 'SMS':
    case 'WHATSAPP':
      return const _ChannelTheme(Icons.chat_rounded, Color(0xFFE6F7EE),
          Color(0xFF4CAF50));
    default:
      return const _ChannelTheme(Icons.notifications_rounded,
          Color(0xFFFFF3E0), Color(0xFFFF9800));
  }
}

class NotificationPage extends ConsumerStatefulWidget {
  const NotificationPage({super.key});

  @override
  ConsumerState<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends ConsumerState<NotificationPage> {
  bool _markingAllRead = false;

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(notificationsProvider);
    final unreadCount = notificationsAsync.maybeWhen(
      data: (list) => list.where((n) => !n.read).length,
      orElse: () => 0,
    );
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Notifikasi',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            if (unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  unreadCount > 99 ? '99+' : '$unreadCount',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ],
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _markingAllRead || unreadCount == 0
                ? null
                : () async {
                    setState(() => _markingAllRead = true);
                    try {
                      await ApiService().markAllNotificationsRead();
                      ref.invalidate(notificationsProvider);
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text('Gagal: $e'),
                            backgroundColor: Colors.red));
                      }
                    } finally {
                      if (mounted) {
                        setState(() => _markingAllRead = false);
                      }
                    }
                  },
            child: _markingAllRead
                ? const SizedBox(
                    height: 14,
                    width: 14,
                    child: CircularProgressIndicator(strokeWidth: 2))
                : Text('Tandai Dibaca',
                    style: TextStyle(
                        color: unreadCount == 0
                            ? Colors.grey[300]
                            : DEKATColors.primary,
                        fontWeight: FontWeight.w700,
                        fontSize: 12)),
          ),
        ],
      ),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      color: DEKATColors.primary.withValues(alpha: 0.08),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.notifications_none_rounded,
                      size: 40,
                      color:
                          DEKATColors.primary.withValues(alpha: 0.6),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Belum ada notifikasi',
                      style: TextStyle(
                          fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text('Info booking & promo muncul di sini',
                      style:
                          TextStyle(color: Colors.grey[500], fontSize: 13)),
                ],
              ),
            );
          }
          // Kelompokkan per tanggal, belum dibaca dulu di tiap grup.
          final groups = <String, List<NotificationEntity>>{};
          for (final n in notifications) {
            groups.putIfAbsent(_groupLabel(n.createdAt), () => []).add(n);
          }
          const order = ['Hari Ini', 'Kemarin', 'Minggu Ini', 'Lebih Lama'];
          final keys = [
            ...order.where(groups.containsKey),
            ...groups.keys.where((k) => !order.contains(k)),
          ];
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: keys.fold<int>(
                0, (sum, k) => sum + 1 + groups[k]!.length),
            itemBuilder: (context, index) {
              var cursor = index;
              for (final k in keys) {
                if (cursor == 0) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8, bottom: 8),
                    child: Text(k,
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 13)),
                  );
                }
                cursor--;
                final items = groups[k]!;
                if (cursor < items.length) {
                  return RepaintBoundary(
                    child: _NotificationCard(
                      item: items[cursor],
                      onTap: () async {
                        final n = items[cursor];
                        if (!n.read) {
                          try {
                            await ApiService().markNotificationRead(n.id);
                            ref.invalidate(notificationsProvider);
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                      content: Text('Gagal: $e'),
                                      backgroundColor: Colors.red));
                            }
                          }
                        }
                      },
                    ),
                  );
                }
                cursor -= items.length;
              }
              return const SizedBox.shrink();
            },
          );
        },
        loading: () => const ShimmerCardList(),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.wifi_off_rounded,
                  size: 48, color: Colors.grey[300]),
              const SizedBox(height: 12),
              const Text('Gagal memuat notifikasi',
                  style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.invalidate(notificationsProvider),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final NotificationEntity item;
  final VoidCallback onTap;
  const _NotificationCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = _channelTheme(item.channel);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: item.read ? Colors.white : DEKATColors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: item.read
                    ? Colors.grey.shade200
                    : DEKATColors.primary.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: theme.bg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(theme.icon, color: theme.fg, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.subject.isEmpty
                                  ? '(Tanpa subjek)'
                                  : item.subject,
                              style: TextStyle(
                                fontWeight: item.read
                                    ? FontWeight.w600
                                    : FontWeight.w800,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          if (!item.read)
                            Container(
                              width: 8,
                              height: 8,
                              margin: const EdgeInsets.only(left: 6),
                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.body,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                            color: Colors.grey[600], fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _timeAgo(item.createdAt),
                        style: TextStyle(
                            color: Colors.grey[400], fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
