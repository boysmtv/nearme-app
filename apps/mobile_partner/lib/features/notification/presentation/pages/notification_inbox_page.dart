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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
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
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
              }
            },
            child: const Text('Mark all read', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_none, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 16),
                      const Text('No notifications'),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final n = _notifications[index];
                      final isRead = n['read'] == true;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        color: isRead ? null : DEKATColors.primary.withOpacity(0.05),
                        child: ListTile(
                          leading: Icon(
                            isRead ? Icons.notifications_none : Icons.notifications_active,
                            color: isRead ? Colors.grey : DEKATColors.primary,
                          ),
                          title: Text(n['title'] ?? 'Notification',
                              style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold)),
                          subtitle: Text(n['message'] ?? n['body'] ?? '',
                              maxLines: 2, overflow: TextOverflow.ellipsis),
                          trailing: Text(
                            _formatTime(n['createdAt']),
                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                          onTap: () async {
                            if (!isRead) {
                              try {
                                await ApiService().markNotificationRead(n['id']);
                                setState(() => n['read'] = true);
                              } catch (e) {
                                debugPrint('Mark read error: $e');
                              }
                            }
                          },
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
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (e) {
      return '';
    }
  }
}
