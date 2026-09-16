import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/features/chat/domain/entities/chat_entity.dart';

void main() {
  group('ConversationEntity', () {
    test('P: normal parse', () {
      final r = ConversationEntity(
        id: 'c1',
        tenantId: 't1',
        customerId: 'u1',
        providerId: 'p1',
        subject: 'Halo',
        status: 'OPEN',
        lastMessageBody: 'Hi',
        messageCount: 5,
      );
      expect(r.id, 'c1');
      expect(r.subject, 'Halo');
      expect(r.lastMessageBody, 'Hi');
      expect(r.messageCount, 5);
    });

    test('N: missing subject handles null', () {
      final r = ConversationEntity(
        id: 'c2',
        tenantId: 't1',
        customerId: 'u1',
        providerId: 'p1',
        status: 'OPEN',
      );
      expect(r.subject, isNull);
      expect(r.status, 'OPEN');
    });

    test('E: status CLOSED', () {
      final r = ConversationEntity(
        id: 'c3',
        tenantId: 't1',
        customerId: 'u1',
        providerId: 'p1',
        status: 'CLOSED',
      );
      expect(r.status, 'CLOSED');
    });

    test('A: XSS subject preserved', () {
      final r = ConversationEntity(
        id: 'c4',
        tenantId: 't1',
        customerId: 'u1',
        providerId: 'p1',
        subject: '<script>alert(1)</script>',
        status: 'OPEN',
      );
      expect(r.subject, '<script>alert(1)</script>');
    });
  });

  group('ChatMessageEntity', () {
    test('P: TEXT message', () {
      const m = ChatMessageEntity(
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        senderRole: 'CUSTOMER',
        body: 'Halo provider',
        messageType: 'TEXT',
      );
      expect(m.body, 'Halo provider');
      expect(m.senderRole, 'CUSTOMER');
    });

    test('E: IMAGE with attachmentUrl', () {
      const m = ChatMessageEntity(
        id: 'm2',
        conversationId: 'c1',
        senderId: 'u1',
        senderRole: 'PROVIDER',
        body: 'Lihat foto',
        messageType: 'IMAGE',
        attachmentUrl: 'http://localhost:8080/uploads/img.jpg',
      );
      expect(m.attachmentUrl, contains('uploads'));
      expect(m.messageType, 'IMAGE');
    });

    test('A: empty body not crash', () {
      const m = ChatMessageEntity(
        id: 'm3',
        conversationId: 'c1',
        senderId: 'u1',
        senderRole: 'CUSTOMER',
        body: '',
        messageType: 'TEXT',
      );
      expect(m.body, '');
    });

    test('A: senderRole unknown preserved', () {
      const m = ChatMessageEntity(
        id: 'm4',
        conversationId: 'c1',
        senderId: 'u1',
        senderRole: 'UNKNOWN',
        body: 'hi',
        messageType: 'TEXT',
      );
      expect(m.senderRole, 'UNKNOWN');
    });
  });
}
