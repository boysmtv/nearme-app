import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Chat Pelanggan',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('Percakapan dengan pelanggan',
                style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                    fontWeight: FontWeight.w400)),
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
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
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
                          child: const Icon(Icons.forum_rounded,
                              size: 40, color: DEKATColors.primary),
                        ),
                        const SizedBox(height: 16),
                        const Text('Belum ada chat pelanggan',
                            style: TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 16)),
                        const SizedBox(height: 6),
                        Text(
                          'Chat dari pelanggan yang bertanya\ntentang layanan Anda muncul di sini.',
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
            );
          }
          final openCount =
              chats.where((c) => c.status.toUpperCase() != 'CLOSED').length;
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: chats.length + 1,
            itemBuilder: (context, i) {
              if (i == 0) {
                return RepaintBoundary(
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
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
                              Icons.mark_chat_unread_rounded,
                              color: DEKATColors.primary,
                              size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${chats.length} Percakapan',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14)),
                              const SizedBox(height: 2),
                              Text('$openCount masih terbuka',
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
              final c = chats[i - 1];
              final isOpen = c.status.toUpperCase() != 'CLOSED';
              final initial =
                  (c.subject != null && c.subject!.isNotEmpty)
                      ? c.subject![0].toUpperCase()
                      : 'C';
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isOpen
                          ? DEKATColors.primary.withValues(alpha: 0.3)
                          : Colors.grey.shade200,
                    ),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () => context.push('/partner/chat/${c.id}'),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isOpen
                                    ? DEKATColors.primary
                                        .withValues(alpha: 0.12)
                                    : Colors.grey[100],
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isOpen
                                      ? DEKATColors.primary
                                          .withValues(alpha: 0.25)
                                      : Colors.grey.shade300,
                                ),
                              ),
                              child: Text(
                                initial,
                                style: TextStyle(
                                  color: isOpen
                                      ? DEKATColors.primary
                                      : Colors.grey[500],
                                  fontWeight: FontWeight.w800,
                                  fontSize: 20,
                                ),
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
                                          c.subject ??
                                              'Chat ${c.id.substring(0, 8)}',
                                          style: TextStyle(
                                              fontWeight: isOpen
                                                  ? FontWeight.w800
                                                  : FontWeight.w600,
                                              fontSize: 14),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(_formatChatTime(c.updatedAt),
                                          style: TextStyle(
                                              color: Colors.grey[500],
                                              fontSize: 11)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          c.lastMessageBody ??
                                              'Belum ada pesan',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                              color: Colors.grey[600],
                                              fontSize: 13),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      if (isOpen &&
                                          c.messageCount > 0)
                                        Container(
                                          constraints:
                                              const BoxConstraints(
                                                  minWidth: 20),
                                          padding:
                                              const EdgeInsets.symmetric(
                                                  horizontal: 6,
                                                  vertical: 2),
                                          alignment: Alignment.center,
                                          decoration: BoxDecoration(
                                            color: DEKATColors.primary,
                                            borderRadius:
                                                BorderRadius.circular(10),
                                          ),
                                          child: Text(
                                            '${c.messageCount}',
                                            style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 11,
                                                fontWeight:
                                                    FontWeight.w700),
                                          ),
                                        ),
                                      if (isOpen && c.messageCount <= 0)
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration:
                                              const BoxDecoration(
                                            color: DEKATColors.primary,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isOpen
                                          ? const Color(0xFFE6F7EE)
                                          : Colors.grey[100],
                                      borderRadius:
                                          BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      _statusLabel(c.status),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: isOpen
                                            ? const Color(0xFF4CAF50)
                                            : Colors.grey[500],
                                      ),
                                    ),
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
          );
        },
        loading: () => const Center(
            child: CircularProgressIndicator(color: DEKATColors.primary)),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: RepaintBoundary(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                    horizontal: 24, vertical: 28),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.chat_bubble_outline_rounded,
                        size: 40, color: Colors.grey[300]),
                    const SizedBox(height: 12),
                    const Text('Gagal memuat chat',
                        style: TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text('Error: $e',
                        style:
                            TextStyle(color: Colors.grey[600], fontSize: 12),
                        textAlign: TextAlign.center),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

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

String _statusLabel(String status) {
  switch (status.toUpperCase()) {
    case 'OPEN':
      return 'Terbuka';
    case 'CLOSED':
      return 'Ditutup';
    case 'PENDING':
      return 'Menunggu';
    default:
      return status;
  }
}
