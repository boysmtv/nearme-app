import 'package:dartz/dartz.dart';
import '../entities/chat_entity.dart';
import '../../../../core/error/failure.dart';

abstract class ChatRepository {
  Future<Either<Failure, List<ConversationEntity>>> getChats();
  Future<Either<Failure, List<ChatMessageEntity>>> getChatMessages(String chatId);
  Future<Either<Failure, ConversationEntity>> createChat(Map<String, dynamic> data);
  Future<Either<Failure, void>> sendChatMessage(String chatId, Map<String, dynamic> data);
  Future<Either<Failure, Map<String, dynamic>>> uploadMedia(String filePath, String ownerType, String ownerId);

  /// Stream daftar pesan realtime untuk satu percakapan.
  ///
  /// Strategi: emit hasil fetch awal secepatnya, lalu dengarkan SSE
  /// `GET /chats/{id}/events` dan refetch setiap ada event `message`.
  /// Bila SSE mati (error/putus), otomatis fallback ke polling jarang
  /// ([fallbackPollInterval]) + reconnect — jauh lebih hemat dari polling 3s.
  Stream<List<ChatMessageEntity>> watchChatMessages(
    String chatId, {
    Duration fallbackPollInterval = const Duration(seconds: 15),
  });
}
