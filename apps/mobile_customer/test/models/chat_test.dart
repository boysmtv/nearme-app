import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/shared/models/rows.dart';

void main() {
  group('ConversationRow', () {
    test('P: normal parse', () {
      final r = ConversationRow.fromJson({
        'id': 'c1',
        'tenantId': 't1',
        'customerId': 'u1',
        'providerId': 'p1',
        'subject': 'Halo',
        'status': 'OPEN',
        'createdAt': '2026-08-01T10:00:00+07:00',
        'updatedAt': '2026-08-02T10:00:00+07:00',
        'lastMessage': {'body': 'Hi'},
        'messageCount': 5,
      });
      expect(r.id, 'c1');
      expect(r.subject, 'Halo');
      expect(r.lastMessageBody, 'Hi');
      expect(r.messageCount, 5);
    });

    test('N: missing subject handles null', () {
      final r = ConversationRow.fromJson({'id': 'c2', 'tenantId': 't1', 'customerId': 'u1', 'providerId': 'p1'});
      expect(r.subject, isNull);
      expect(r.status, 'OPEN');
    });

    test('E: status CLOSED', () {
      final r = ConversationRow.fromJson({'id': 'c3', 'tenantId': 't1', 'customerId': 'u1', 'providerId': 'p1', 'status': 'CLOSED'});
      expect(r.status, 'CLOSED');
    });

    test('A: XSS subject preserved', () {
      final r = ConversationRow.fromJson({'id': 'c4', 'tenantId': 't1', 'customerId': 'u1', 'providerId': 'p1', 'subject': '<script>alert(1)</script>'});
      expect(r.subject, '<script>alert(1)</script>');
    });
  });

  group('ChatMessageRow', () {
    test('P: TEXT message', () {
      final m = ChatMessageRow.fromJson({
        'id': 'm1',
        'conversationId': 'c1',
        'senderId': 'u1',
        'senderRole': 'CUSTOMER',
        'body': 'Halo provider',
        'messageType': 'TEXT',
        'createdAt': '2026-08-31T10:00:00+07:00',
      });
      expect(m.body, 'Halo provider');
      expect(m.senderRole, 'CUSTOMER');
    });

    test('E: IMAGE with attachmentUrl', () {
      final m = ChatMessageRow.fromJson({
        'id': 'm2',
        'conversationId': 'c1',
        'senderId': 'u1',
        'senderRole': 'PROVIDER',
        'body': 'Lihat foto',
        'messageType': 'IMAGE',
        'attachmentUrl': 'http://localhost:8080/uploads/img.jpg',
      });
      expect(m.attachmentUrl, contains('uploads'));
      expect(m.messageType, 'IMAGE');
    });

    test('A: empty body not crash', () {
      final m = ChatMessageRow.fromJson({'id': 'm3', 'conversationId': 'c1', 'senderId': 'u1', 'body': ''});
      expect(m.body, '');
    });

    test('A: senderRole unknown fallback', () {
      final m = ChatMessageRow.fromJson({'id': 'm4', 'conversationId': 'c1', 'senderId': 'u1', 'body': 'hi', 'senderRole': 'UNKNOWN'});
      expect(m.senderRole, 'UNKNOWN');
    });
  });

  group('AnalyticsRow', () {
    test('P: full parse', () {
      final a = AnalyticsRow.fromJson({
        'revenueByDay': [{'date': '2026-08-01', 'revenue': 100000}],
        'bookingsByStatus': {'CONFIRMED': 5},
        'retention': {'totalCustomers': 10, 'retentionPercent': 30},
        'funnel': {'search': 100, 'confirm': 10},
        'topServices': [{'serviceName': 'Potong'}],
        'staffUtilization': [{'staffName': 'Andi', 'bookingCount': 5}],
      });
      expect(a.revenueByDay.length, 1);
      expect(a.retention['retentionPercent'], 30);
      expect(a.funnel['confirm'], 10);
    });

    test('N: empty analytics', () {
      final a = AnalyticsRow.fromJson({});
      expect(a.revenueByDay, isEmpty);
      expect(a.bookingsByStatus, isEmpty);
    });

    test('A: retention with null', () {
      final a = AnalyticsRow.fromJson({'retention': null});
      expect(a.retention, isEmpty);
    });
  });
}
