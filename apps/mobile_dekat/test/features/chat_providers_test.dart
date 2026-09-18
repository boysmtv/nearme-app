import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile_dekat/features/chat/domain/entities/chat_entity.dart';
import 'package:mobile_dekat/features/chat/presentation/viewmodel/chat_viewmodel.dart';

void main() {
  group('chatListProvider', () {
    test('returns list of conversations from override', () async {
      final container = ProviderContainer(
        overrides: [
          chatListProvider.overrideWith((ref) => Future.value([
                const ConversationEntity(
                  id: 'c1',
                  tenantId: 't1',
                  customerId: 'cust1',
                  providerId: 'prov1',
                  subject: 'Booking Issue',
                  status: 'OPEN',
                  lastMessageBody: 'Hello',
                  messageCount: 3,
                ),
                const ConversationEntity(
                  id: 'c2',
                  tenantId: 't2',
                  customerId: 'cust1',
                  providerId: 'prov2',
                  subject: 'Payment Question',
                  status: 'CLOSED',
                  messageCount: 0,
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final chats = await container.read(chatListProvider.future);
      expect(chats.length, 2);
      expect(chats[0].subject, 'Booking Issue');
      expect(chats[0].status, 'OPEN');
      expect(chats[1].status, 'CLOSED');
    });

    test('returns empty list when no conversations', () async {
      final container = ProviderContainer(
        overrides: [
          chatListProvider.overrideWith((ref) => Future.value(<ConversationEntity>[])),
        ],
      );
      addTearDown(container.dispose);

      final chats = await container.read(chatListProvider.future);
      expect(chats, isEmpty);
    });

    test('propagates error', () async {
      final container = ProviderContainer(
        overrides: [
          chatListProvider
              .overrideWith((ref) => Future.error(Exception('Connection failed'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(chatListProvider.future),
        throwsA(isA<Exception>()),
      );
    });

    test('conversation with null subject shows correctly', () async {
      final container = ProviderContainer(
        overrides: [
          chatListProvider.overrideWith((ref) => Future.value([
                const ConversationEntity(
                  id: 'c3',
                  tenantId: 't1',
                  customerId: 'cust1',
                  providerId: 'prov1',
                  status: 'OPEN',
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final chats = await container.read(chatListProvider.future);
      expect(chats[0].subject, isNull);
      expect(chats[0].lastMessageBody, isNull);
    });
  });

  group('chatMessagesProvider', () {
    test('returns list of messages for a chat', () async {
      final container = ProviderContainer(
        overrides: [
          chatMessagesProvider('chat1').overrideWith((ref) => Future.value([
                const ChatMessageEntity(
                  id: 'm1',
                  conversationId: 'chat1',
                  senderId: 'cust1',
                  senderRole: 'CUSTOMER',
                  body: 'Hello',
                  messageType: 'TEXT',
                ),
                const ChatMessageEntity(
                  id: 'm2',
                  conversationId: 'chat1',
                  senderId: 'prov1',
                  senderRole: 'PROVIDER',
                  body: 'Hi there!',
                  messageType: 'TEXT',
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final messages = await container.read(chatMessagesProvider('chat1').future);
      expect(messages.length, 2);
      expect(messages[0].body, 'Hello');
      expect(messages[0].senderRole, 'CUSTOMER');
      expect(messages[1].senderRole, 'PROVIDER');
    });

    test('different chat ids resolve independently', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final p1 = container.read(chatMessagesProvider('chat-a'));
      final p2 = container.read(chatMessagesProvider('chat-b'));
      expect(p1, isNot(same(p2)));
    });

    test('message with attachment shows attachmentUrl', () async {
      final container = ProviderContainer(
        overrides: [
          chatMessagesProvider('chat1').overrideWith((ref) => Future.value([
                const ChatMessageEntity(
                  id: 'm3',
                  conversationId: 'chat1',
                  senderId: 'cust1',
                  senderRole: 'CUSTOMER',
                  body: 'Photo',
                  messageType: 'IMAGE',
                  attachmentUrl: 'https://example.com/photo.jpg',
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final messages = await container.read(chatMessagesProvider('chat1').future);
      expect(messages[0].attachmentUrl, 'https://example.com/photo.jpg');
      expect(messages[0].messageType, 'IMAGE');
    });

    test('propagates error from override', () async {
      final container = ProviderContainer(
        overrides: [
          chatMessagesProvider('bad-chat').overrideWith(
              (ref) => Future.error(Exception('Chat not found'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(chatMessagesProvider('bad-chat').future),
        throwsA(isA<Exception>()),
      );
    });
  });
}
