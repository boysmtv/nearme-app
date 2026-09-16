import 'package:dartz/dartz.dart';
import '../entities/chat_entity.dart';
import '../../../../core/error/failure.dart';

abstract class ChatRepository {
  Future<Either<Failure, List<ConversationEntity>>> getChats();
  Future<Either<Failure, List<ChatMessageEntity>>> getChatMessages(String chatId);
  Future<Either<Failure, ConversationEntity>> createChat(Map<String, dynamic> data);
  Future<Either<Failure, void>> sendChatMessage(String chatId, Map<String, dynamic> data);
  Future<Either<Failure, Map<String, dynamic>>> uploadMedia(String filePath, String ownerType, String ownerId);
}
