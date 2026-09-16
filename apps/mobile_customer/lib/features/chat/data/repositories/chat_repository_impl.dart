import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/chat_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';
import '../../../shared/data/models/dto.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ApiService _api;
  ChatRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<ConversationEntity>>> getChats() async {
    try {
      final res = await _api.getChats();
      final data = res.data['data'] as List;
      return Right(data.map((e) => ConversationDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<ChatMessageEntity>>> getChatMessages(String chatId) async {
    try {
      final res = await _api.getChatMessages(chatId);
      final data = res.data['data'] as List;
      return Right(data.map((e) => ChatMessageDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, ConversationEntity>> createChat(Map<String, dynamic> data) async {
    try {
      final res = await _api.createChat(data);
      final result = (res.data['data'] ?? res.data) as Map<String, dynamic>;
      return Right(ConversationDto.fromJson(result));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> sendChatMessage(String chatId, Map<String, dynamic> data) async {
    try {
      await _api.sendChatMessage(chatId, data);
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> uploadMedia(String filePath, String ownerType, String ownerId) async {
    try {
      final res = await _api.uploadMedia(filePath, ownerType, ownerId);
      final url = (res.data['data']['url'] ?? res.data['url']) as String?;
      return Right({'url': url});
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
