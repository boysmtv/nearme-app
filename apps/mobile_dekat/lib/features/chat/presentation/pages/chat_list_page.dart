import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

import '../../../chat/presentation/viewmodel/chat_viewmodel.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

String _formatChatTime(DateTime? time) {
  if (time == null) return '';
  final local = time.toLocal();
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final day = DateTime(local.year, local.month, local.day);
  final diff = today.difference(day).inDays;
  if (diff == 0) {
    return '${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }
  if (diff == 1) return 'Kemarin';
  return '${local.day.toString().padLeft(2, '0')}/${local.month.toString().padLeft(2, '0')}/${local.year}';
}

class ChatListPage extends ConsumerWidget {
  const ChatListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatsAsync = ref.watch(chatListProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Chat', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('Percakapan dengan provider', style: TextStyle(color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.w400)),
          ],
        ),
      ),
      body: chatsAsync.when(
        data: (chats) {
          if (chats.isEmpty) {
            return Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: RepaintBoundary(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          color: DEKATColors.primary.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.forum_rounded, size: 40, color: DEKATColors.primary),
                      ),
                      const SizedBox(height: 16),
                      const Text('Belum ada percakapan', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                      const SizedBox(height: 6),
                      Text(
                        'Mulai percakapan baru untuk bertanya tentang layanan provider.',
                        style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.5),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () async {
                          try {
                            await ApiService().createChat({'subject': 'Pertanyaan umum'});
                            ref.invalidate(chatListProvider);
                          } catch (e) {
                            if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: DEKATColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Buat Percakapan', style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ]),
                  ),
                ),
              ),
            );
          }
          return Column(
            children: [
              RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: DEKATColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.mark_chat_unread_rounded, color: DEKATColors.primary, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('${chats.length} Percakapan', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                        const SizedBox(height: 2),
                        Text('Tarik ke bawah untuk memuat ulang', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      ]),
                    ),
                  ]),
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  color: DEKATColors.primary,
                  onRefresh: () async => ref.invalidate(chatListProvider),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
                    itemCount: chats.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, i) {
                      final c = chats[i];
                      return RepaintBoundary(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () => context.push('/chat/${c.id}'),
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Row(children: [
                                  Container(
                                    width: 52,
                                    height: 52,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: DEKATColors.primary.withValues(alpha: 0.12),
                                      shape: BoxShape.circle,
                                      border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.2)),
                                    ),
                                    child: Text(
                                      c.subject != null && c.subject!.isNotEmpty ? c.subject![0].toUpperCase() : 'C',
                                      style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 20),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                      Row(children: [
                                        Expanded(
                                          child: Text(
                                            c.subject ?? 'Chat ${c.id.substring(0, 8)}',
                                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(_formatChatTime(c.updatedAt), style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                                      ]),
                                      const SizedBox(height: 4),
                                      Row(children: [
                                        Expanded(
                                          child: Text(
                                            c.lastMessageBody ?? 'Belum ada pesan',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        if (c.messageCount > 0)
                                          Container(
                                            constraints: const BoxConstraints(minWidth: 20),
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              color: DEKATColors.primary,
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: Text(
                                              '${c.messageCount}',
                                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                      ]),
                                      const SizedBox(height: 4),
                                      Text(c.status, style: TextStyle(fontSize: 10, color: Colors.grey[500])),
                                    ]),
                                  ),
                                ]),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const ShimmerCardList(),
        error: (e, _) => Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: RepaintBoundary(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(color: Colors.red[50], shape: BoxShape.circle),
                    child: Icon(Icons.chat_bubble_outline_rounded, size: 32, color: Colors.red[300]),
                  ),
                  const SizedBox(height: 16),
                  const Text('Gagal memuat chat', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  const SizedBox(height: 6),
                  Text('Error: $e', style: TextStyle(color: Colors.grey[600], fontSize: 12), textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  TextButton(onPressed: () => ref.invalidate(chatListProvider), child: const Text('Coba Lagi')),
                ]),
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        tooltip: 'Chat baru',
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
        child: const Icon(Icons.add_comment_rounded),
      ),
    );
  }
}
