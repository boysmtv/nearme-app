import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final chatListProvider = FutureProvider.autoDispose<List<ConversationRow>>((ref) async {
  final res = await ApiService().getChats();
  final data = res.data['data'] as List;
  return data.map((e) => ConversationRow.fromJson(e as Map<String, dynamic>)).toList();
});

class ChatListPage extends ConsumerWidget {
  const ChatListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatsAsync = ref.watch(chatListProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Chat')),
      body: chatsAsync.when(
        data: (chats) {
          if (chats.isEmpty) {
            return Center(
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey),
                const SizedBox(height: 12),
                const Text('Belum ada percakapan', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      await ApiService().createChat({'subject': 'Pertanyaan umum'});
                      ref.invalidate(chatListProvider);
                    } catch (e) {
                      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                    }
                  },
                  child: const Text('Buat Percakapan'),
                ),
                const SizedBox(height: 8),
                Text('Realtime: WebSocket /ws-chat + SSE /chats/{id}/events (polling 3s fallback)', style: TextStyle(fontSize: 11, color: Colors.grey[500]), textAlign: TextAlign.center),
              ]),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(chatListProvider),
            child: ListView.separated(
              itemCount: chats.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final c = chats[i];
                return ListTile(
                  leading: CircleAvatar(child: Text(c.subject != null && c.subject!.isNotEmpty ? c.subject![0].toUpperCase() : 'C')),
                  title: Text(c.subject ?? 'Chat ${c.id.substring(0, 8)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(c.lastMessageBody ?? 'Belum ada pesan', maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Text(c.status, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    if (c.messageCount > 0) Container(margin: const EdgeInsets.only(top: 4), padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFF6C63FF), borderRadius: BorderRadius.circular(10)), child: Text('${c.messageCount}', style: const TextStyle(color: Colors.white, fontSize: 11))),
                  ]),
                  onTap: () => context.push('/chat/${c.id}'),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Text('Error: $e'), TextButton(onPressed: () => ref.invalidate(chatListProvider), child: const Text('Retry'))])),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          try {
            final res = await ApiService().createChat({'subject': 'Halo, butuh bantuan'});
            final chatId = (res.data['data']['id'] ?? res.data['id']) as String;
            if (context.mounted) context.push('/chat/$chatId');
            ref.invalidate(chatListProvider);
          } catch (e) {
            if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal buat chat: $e')));
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
