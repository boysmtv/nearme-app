import 'package:dartz/dartz.dart';
import '../entities/chat_entity.dart';
import '../repositories/chat_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetChats extends UseCase<List<ConversationEntity>, NoParams> {
  final ChatRepository repository;
  GetChats(this.repository);

  @override
  Future<Either<Failure, List<ConversationEntity>>> call(NoParams params) {
    return repository.getChats();
  }
}

class GetChatMessages extends UseCase<List<ChatMessageEntity>, String> {
  final ChatRepository repository;
  GetChatMessages(this.repository);

  @override
  Future<Either<Failure, List<ChatMessageEntity>>> call(String chatId) {
    return repository.getChatMessages(chatId);
  }
}

class CreateChat extends UseCase<ConversationEntity, Map<String, dynamic>> {
  final ChatRepository repository;
  CreateChat(this.repository);

  @override
  Future<Either<Failure, ConversationEntity>> call(Map<String, dynamic> data) {
    return repository.createChat(data);
  }
}

class SendChatMessage extends UseCase<void, SendMessageParams> {
  final ChatRepository repository;
  SendChatMessage(this.repository);

  @override
  Future<Either<Failure, void>> call(SendMessageParams params) {
    return repository.sendChatMessage(params.chatId, params.data);
  }
}

class SendMessageParams {
  final String chatId;
  final Map<String, dynamic> data;
  const SendMessageParams({required this.chatId, required this.data});
}
