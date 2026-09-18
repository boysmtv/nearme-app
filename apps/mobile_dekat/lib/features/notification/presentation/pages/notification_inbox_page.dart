import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class NotificationInboxPage extends ConsumerStatefulWidget {
  const NotificationInboxPage({super.key});

  @override
  ConsumerState<NotificationInboxPage> createState() => _NotificationInboxPageState();
}

class _NotificationInboxPageState extends ConsumerState<NotificationInboxPage> {
  List<dynamic> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService().getNotifications();
      final data = response.data['data'];
      setState(() {
        _notifications = data is List ? data : [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount =
        _notifications.where((n) => n['read'] != true).length;
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Notifikasi',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
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
        actions: [
          TextButton(
            onPressed: () async {
              try {
                await ApiService().markAllNotificationsRead();
                setState(() {
                  for (var n in _notifications) {
                    n['read'] = true;
                  }
                });
              } catch (e) {
                if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
              }
            },
            child: Text('Tandai Dibaca',
                style: TextStyle(
                    color: unreadCount == 0
                        ? Colors.grey[300]
                        : DEKATColors.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 12)),
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child:
                  CircularProgressIndicator(color: DEKATColors.primary))
          : _notifications.isEmpty
              ? Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: RepaintBoundary(
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border:
                              Border.all(color: Colors.grey.shade200),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 88,
                              height: 88,
                              decoration: BoxDecoration(
                                color: DEKATColors.primary
                                    .withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                  Icons.notifications_none_rounded,
                                  size: 40,
                                  color: DEKATColors.primary),
                            ),
                            const SizedBox(height: 16),
                            const Text('Belum ada notifikasi',
                                style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16)),
                            const SizedBox(height: 6),
                            Text(
                              'Info booking, pembayaran & ulasan\nmuncul di sini.',
                              style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 13,
                                  height: 1.5),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                )
              : RefreshIndicator(
                  color: DEKATColors.primary,
                  onRefresh: _loadNotifications,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                    itemCount: _notifications.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return RepaintBoundary(
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border:
                                  Border.all(color: Colors.grey.shade200),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: DEKATColors.primary
                                        .withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                      Icons.inbox_rounded,
                                      color: DEKATColors.primary,
                                      size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                          '$unreadCount Belum Dibaca',
                                          style: const TextStyle(
                                              fontWeight: FontWeight.w800,
                                              fontSize: 14)),
                                      const SizedBox(height: 2),
                                      Text(
                                          'Ketuk notifikasi untuk menandai dibaca',
                                          style: TextStyle(
                                              color: Colors.grey[600],
                                              fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }
                      final n = _notifications[index - 1];
                      final isRead = n['read'] == true;
                      return RepaintBoundary(
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: isRead
                                ? Colors.white
                                : DEKATColors.primary
                                    .withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isRead
                                  ? Colors.grey.shade200
                                  : DEKATColors.primary
                                      .withValues(alpha: 0.3),
                            ),
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () async {
                                if (!isRead) {
                                  try {
                                    await ApiService()
                                        .markNotificationRead(n['id']);
                                    setState(() => n['read'] = true);
                                  } catch (e) {
                                    debugPrint('Mark read error: $e');
                                  }
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Row(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: isRead
                                            ? Colors.grey[100]
                                            : DEKATColors.primary
                                                .withValues(alpha: 0.12),
                                        borderRadius:
                                            BorderRadius.circular(12),
                                      ),
                                      child: Icon(
                                        isRead
                                            ? Icons
                                                .notifications_none_rounded
                                            : Icons
                                                .notifications_active_rounded,
                                        color: isRead
                                            ? Colors.grey
                                            : DEKATColors.primary,
                                        size: 22,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                    n['title'] ??
                                                        'Notifikasi',
                                                    style: TextStyle(
                                                        fontWeight: isRead
                                                            ? FontWeight.w600
                                                            : FontWeight.w800,
                                                        fontSize: 13)),
                                              ),
                                              if (!isRead)
                                                Container(
                                                  width: 8,
                                                  height: 8,
                                                  margin:
                                                      const EdgeInsets.only(
                                                          left: 6),
                                                  decoration:
                                                      const BoxDecoration(
                                                    color: Colors.red,
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                              n['message'] ??
                                                  n['body'] ??
                                                  '',
                                              maxLines: 2,
                                              overflow:
                                                  TextOverflow.ellipsis,
                                              style: TextStyle(
                                                  color: Colors.grey[600],
                                                  fontSize: 12)),
                                          const SizedBox(height: 4),
                                          Text(
                                            _formatTime(n['createdAt']),
                                            style: TextStyle(
                                                fontSize: 11,
                                                color: Colors.grey[400]),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  String _formatTime(String? isoString) {
    if (isoString == null) return '';
    try {
      final date = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inMinutes < 1) return 'Baru saja';
      if (diff.inMinutes < 60) return '${diff.inMinutes} mnt lalu';
      if (diff.inHours < 24) return '${diff.inHours} jam lalu';
      if (diff.inDays < 7) return '${diff.inDays} hari lalu';
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return '';
    }
  }
}
