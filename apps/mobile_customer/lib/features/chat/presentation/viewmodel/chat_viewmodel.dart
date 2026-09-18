import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/chat_entity.dart';
import '../../../../core/di/providers.dart';
import '../../data/repositories/chat_repository_impl.dart';

final chatListProvider = FutureProvider<List<ConversationEntity>>((ref) async {
  final repo = ChatRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getChats();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final chatMessagesProvider = FutureProvider.autoDispose.family<List<ChatMessageEntity>, String>((ref, chatId) async {
  final repo = ChatRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getChatMessages(chatId);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

/// Stream realtime pengganti polling Timer (lihat chat_detail_page).
/// - Data awal langsung dari fetch (cepat, seperti Future biasa).
/// - Update berikutnya didorong server via SSE; bila SSE mati, repository
///   otomatis fallback ke polling jarang (15s) + reconnect.
/// - `ref.invalidate` tetap berfungsi: StreamProvider di-subscribe ulang.
final chatMessagesStreamProvider =
    StreamProvider.autoDispose.family<List<ChatMessageEntity>, String>((ref, chatId) {
  final repo = ChatRepositoryImpl(ref.read(apiServiceProvider));
  return repo.watchChatMessages(chatId);
});
