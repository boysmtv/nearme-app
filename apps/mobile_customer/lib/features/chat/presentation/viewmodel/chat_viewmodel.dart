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
