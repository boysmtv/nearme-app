import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_partner/shared/models/rows.dart';

void main() {
  group('Partner ConversationRow', () {
    test('P: parse', () {
      final r = ConversationRow.fromJson({'id': 'c1', 'tenantId': 't1', 'customerId': 'u1', 'providerId': 'p1', 'subject': 'Tanya', 'status': 'OPEN'});
      expect(r.id, 'c1');
      expect(r.subject, 'Tanya');
    });

    test('N: missing optional', () {
      final r = ConversationRow.fromJson({'id': 'c2', 'tenantId': 't1', 'customerId': 'u1', 'providerId': 'p1'});
      expect(r.subject, isNull);
    });
  });

  group('ChatMessageRow', () {
    test('P: customer message', () {
      final m = ChatMessageRow.fromJson({'id': 'm1', 'conversationId': 'c1', 'senderId': 'u1', 'senderRole': 'CUSTOMER', 'body': 'Halo', 'messageType': 'TEXT'});
      expect(m.body, 'Halo');
    });

    test('E: provider message', () {
      final m = ChatMessageRow.fromJson({'id': 'm2', 'conversationId': 'c1', 'senderId': 'p1', 'senderRole': 'PROVIDER', 'body': 'Siap', 'messageType': 'TEXT'});
      expect(m.senderRole, 'PROVIDER');
    });
  });

  group('AnalyticsRow', () {
    test('P: analytics parse', () {
      final a = AnalyticsRow.fromJson({
        'revenueByDay': [{'date': '2026-08-01', 'revenue': 200000}],
        'bookingsByStatus': {'CONFIRMED': 3},
        'retention': {'totalCustomers': 5},
        'funnel': {'search': 50},
        'topServices': [],
        'staffUtilization': [{'staffName': 'Andi'}]
      });
      expect(a.revenueByDay.first['revenue'], 200000);
    });

    test('A: empty', () {
      final a = AnalyticsRow.fromJson({});
      expect(a.funnel, isEmpty);
    });
  });
}
