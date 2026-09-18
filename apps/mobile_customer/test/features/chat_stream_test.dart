import 'dart:async';

import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_customer/core/error/failure.dart';
import 'package:mobile_customer/features/chat/data/repositories/chat_repository_impl.dart';
import 'package:mobile_customer/features/chat/domain/entities/chat_entity.dart';

const _m1 = ChatMessageEntity(
  id: 'm1',
  conversationId: 'c1',
  senderId: 'u1',
  senderRole: 'CUSTOMER',
  body: 'Halo',
  messageType: 'TEXT',
);

const _m2 = ChatMessageEntity(
  id: 'm2',
  conversationId: 'c1',
  senderId: 'p1',
  senderRole: 'PROVIDER',
  body: 'Siap kak',
  messageType: 'TEXT',
);

/// SSE palsu: memutar skrip [SseEvent]/[Exception] lalu menutup stream
/// (meniru server yang memutus koneksi).
class _ScriptedSseClient extends SseClient {
  final List<Object> script;
  _ScriptedSseClient(this.script) : super(Dio());

  @override
  Stream<SseEvent> subscribe(
    String path, {
    CancelToken? cancelToken,
    Map<String, dynamic>? queryParameters,
  }) async* {
    for (final item in script) {
      if (item is Exception) throw item;
      yield item as SseEvent;
    }
  }
}

class _FakeChatRepo extends ChatRepositoryImpl {
  int fetchCount = 0;
  final List<List<ChatMessageEntity>> script;
  final bool failFetch;

  _FakeChatRepo(
    super.api, {
    super.sseClientOverride,
    this.script = const [],
    this.failFetch = false,
  });

  @override
  Future<Either<Failure, List<ChatMessageEntity>>> getChatMessages(
      String chatId) async {
    fetchCount++;
    if (failFetch) return const Left(ServerFailure('offline'));
    if (script.isEmpty) return const Right(<ChatMessageEntity>[]);
    final data = fetchCount <= script.length ? script[fetchCount - 1] : script.last;
    return Right(data);
  }
}

void main() {
  group('ChatRepositoryImpl.watchChatMessages', () {
    test('emits initial fetch immediately', () async {
      final repo = _FakeChatRepo(
        ApiService(),
        sseClientOverride: _ScriptedSseClient(const []),
        script: const [
          [_m1],
        ],
      );
      final stream = repo.watchChatMessages(
        'c1',
        fallbackPollInterval: const Duration(milliseconds: 50),
      );
      final first = await stream.first;
      expect(first.map((m) => m.id), ['m1']);
    });

    test('refetches on every SSE message event', () async {
      final repo = _FakeChatRepo(
        ApiService(),
        sseClientOverride: _ScriptedSseClient(const [
          SseEvent(name: 'connected', data: '{}'),
          SseEvent(name: 'message', data: '{"id":"m2"}'),
          SseEvent(name: 'message', data: '{"id":"m3"}'),
        ]),
        script: const [
          [_m1],
          [_m1, _m2],
          [_m1, _m2],
        ],
      );
      final emissions = await repo
          .watchChatMessages('c1',
              fallbackPollInterval: const Duration(milliseconds: 50))
          .take(3)
          .toList();
      expect(emissions.length, 3);
      expect(emissions[0].map((m) => m.id), ['m1']);
      expect(emissions[1].map((m) => m.id), ['m1', 'm2']);
      expect(repo.fetchCount, greaterThanOrEqualTo(3));
    });

    test('falls back to polling when SSE throws', () async {
      final repo = _FakeChatRepo(
        ApiService(),
        sseClientOverride:
            _ScriptedSseClient([Exception('sse down')]),
        script: const [
          [_m1],
        ],
      );
      final emissions = await repo
          .watchChatMessages('c1',
              fallbackPollInterval: const Duration(milliseconds: 50))
          .take(3)
          .toList();
      // 1x fetch awal + 2x fallback poll (SSE langsung error tiap reconnect)
      expect(emissions.length, 3);
      expect(repo.fetchCount, greaterThanOrEqualTo(3));
    });

    test('emits error when initial fetch fails', () async {
      final repo = _FakeChatRepo(
        ApiService(),
        sseClientOverride: _ScriptedSseClient(const []),
        failFetch: true,
      );
      await expectLater(
        repo.watchChatMessages('c1',
            fallbackPollInterval: const Duration(milliseconds: 50)),
        emitsError(isA<Exception>()),
      );
    });

    test('cancelling subscription stops the pump', () async {
      final repo = _FakeChatRepo(
        ApiService(),
        sseClientOverride:
            _ScriptedSseClient([Exception('sse down')]),
        script: const [
          [_m1],
        ],
      );
      final sub = repo
          .watchChatMessages('c1',
              fallbackPollInterval: const Duration(milliseconds: 30))
          .listen((_) {});
      await Future<void>.delayed(const Duration(milliseconds: 120));
      final countAtCancel = repo.fetchCount;
      await sub.cancel();
      await Future<void>.delayed(const Duration(milliseconds: 120));
      expect(repo.fetchCount, countAtCancel);
    });
  });
}
