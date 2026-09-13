import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

final notificationsProvider = FutureProvider<List<NotificationRow>>((ref) async {
  final response = await ApiService().getNotifications(params: {'page': 1, 'limit': 50});
  return parsePaginated(response.data['data'], NotificationRow.fromJson).items;
});

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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: _markingAllRead ? null : () async {
              setState(() => _markingAllRead = true);
              try {
                await ApiService().markAllNotificationsRead();
                ref.invalidate(notificationsProvider);
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red));
                }
              } finally {
                if (mounted) setState(() => _markingAllRead = false);
              }
            },
            child: _markingAllRead
                ? const SizedBox(height: 14, width: 14, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Mark all read'),
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
                  Icon(Icons.notifications_none, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No notifications', style: TextStyle(color: Colors.grey[500])),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final n = notifications[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                color: n.read ? null : Colors.blue[50],
                child: ListTile(
                  leading: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(8)),
                    child: Icon(n.channel == 'EMAIL' ? Icons.email : Icons.notifications, color: Colors.blue[700], size: 20),
                  ),
                  title: Text(n.subject.isEmpty ? '(no subject)' : n.subject, style: TextStyle(fontWeight: n.read ? FontWeight.normal : FontWeight.bold)),
                  subtitle: Text(n.body, maxLines: 2, overflow: TextOverflow.ellipsis),
                  onTap: () async {
                    if (!n.read) {
                      try {
                        await ApiService().markNotificationRead(n.id);
                        ref.invalidate(notificationsProvider);
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red));
                        }
                      }
                    }
                  },
                ),
              );
            },
          );
        },
        loading: () => const ShimmerCardList(),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load notifications'),
              TextButton(onPressed: () => ref.invalidate(notificationsProvider), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }
}
