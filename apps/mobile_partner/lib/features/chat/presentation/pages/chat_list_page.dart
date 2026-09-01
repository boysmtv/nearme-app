import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final partnerChatListProvider = FutureProvider.autoDispose<List<ConversationRow>>((ref) async {
  final res = await ApiService().getChats();
  final data = res.data['data'] as List;
  return data.map((e) => ConversationRow.fromJson(e as Map<String, dynamic>)).toList();
});

class PartnerChatListPage extends ConsumerWidget {
  const PartnerChatListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatsAsync = ref.watch(partnerChatListProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Chat Pelanggan')),
      body: chatsAsync.when(
        data: (chats) {
          if (chats.isEmpty) return const Center(child: Text('Belum ada chat pelanggan'));
          return ListView.separated(
            itemCount: chats.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final c = chats[i];
              return ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(c.subject ?? 'Chat ${c.id.substring(0, 8)}'),
                subtitle: Text(c.lastMessageBody ?? 'Belum ada pesan'),
                trailing: Text(c.status, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                onTap: () => context.push('/partner/chat/${c.id}'),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
