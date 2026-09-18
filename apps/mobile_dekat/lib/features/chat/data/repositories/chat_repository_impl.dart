import 'dart:async';

import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import '../../domain/entities/chat_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';
import '../../../shared/data/models/dto.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ApiService _api;
  final SseClient? _sseClientOverride;

  /// [sseClientOverride] hanya untuk testing (injeksi SSE palsu).
  ChatRepositoryImpl(this._api, {SseClient? sseClientOverride})
      : _sseClientOverride = sseClientOverride;

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

  @override
  Stream<List<ChatMessageEntity>> watchChatMessages(
    String chatId, {
    Duration fallbackPollInterval = const Duration(seconds: 15),
  }) {
    final controller = StreamController<List<ChatMessageEntity>>();
    final cancelToken = CancelToken();
    var disposed = false;

    Future<void> emitCurrent({bool reportError = false}) async {
      try {
        final result = await getChatMessages(chatId);
        result.fold(
          (l) {
            if (reportError && !disposed) {
              controller.addError(Exception(l.message));
            }
            // Error susulan diabaikan: UI tetap menampilkan data terakhir
            // agar blink putus-nyambung tidak menghapus percakapan.
          },
          (r) {
            if (!disposed) controller.add(r);
          },
        );
      } catch (e) {
        if (reportError && !disposed) controller.addError(e);
      }
    }

    Future<void> pump() async {
      // 1. Data awal secepatnya (perilaku sama seperti FutureProvider lama).
      await emitCurrent(reportError: true);
      final sse = _sseClientOverride ?? SseClient(_api.dio);
      // 2. Realtime via SSE; bila putus, fallback polling jarang + reconnect.
      while (!disposed) {
        try {
          await for (final _ in sse.subscribe('/chats/$chatId/events',
              cancelToken: cancelToken)) {
            if (disposed) break;
            await emitCurrent();
          }
        } catch (_) {
          if (disposed) break;
          // Jatuh ke fallback di bawah (sekaligus reconnect SSE).
        }
        if (disposed) break;
        await Future.delayed(fallbackPollInterval);
        if (!disposed) await emitCurrent();
      }
      if (!controller.isClosed) await controller.close();
    }

    controller.onListen = pump;
    controller.onCancel = () {
      disposed = true;
      if (!cancelToken.isCancelled) cancelToken.cancel();
    };
    return controller.stream;
  }
}
