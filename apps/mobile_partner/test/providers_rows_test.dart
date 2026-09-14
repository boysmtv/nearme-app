import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_partner/shared/models/rows.dart';

void main() {
  group('parsePaginated with PartnerBookingRow', () {
    test('parses booking list from API response', () {
      final payload = {
        'data': [
          {
            'id': 'b1',
            'customerName': 'Siti',
            'serviceName': 'Haircut',
            'status': 'CONFIRMED',
            'time': '10:00',
            'amount': 50000,
            'bookingCode': 'DKT-001',
          },
          {
            'id': 'b2',
            'customerName': 'Budi',
            'serviceName': 'Shave',
            'status': 'PENDING',
            'time': '11:00',
            'amount': 30000,
            'bookingCode': 'DKT-002',
          },
        ],
        'pagination': {'total': 25},
      };
      final result = parsePaginated(payload, PartnerBookingRow.fromJson);
      expect(result.items.length, 2);
      expect(result.items[0].customerName, 'Siti');
      expect(result.items[1].bookingCode, 'DKT-002');
      expect(result.total, 25);
    });

    test('handles single booking', () {
      final payload = {
        'data': [
          {
            'id': 'b1',
            'customerName': 'Andi',
            'serviceName': 'Haircut',
            'status': 'COMPLETED',
            'time': '09:00',
            'amount': 45000,
            'bookingCode': 'DKT-003',
          },
        ],
        'pagination': {'total': 1},
      };
      final result = parsePaginated(payload, PartnerBookingRow.fromJson);
      expect(result.items.length, 1);
      expect(result.items[0].status, 'COMPLETED');
      expect(result.total, 1);
    });
  });

  group('parsePaginated with PartnerStaffRow', () {
    test('parses staff list from API response', () {
      final payload = {
        'data': [
          {
            'id': 's1',
            'displayName': 'Andi',
            'title': 'Senior Barber',
            'isActive': true,
            'specialties': 'Fade, Undercut',
          },
          {
            'id': 's2',
            'displayName': 'Budi',
            'title': 'Junior Barber',
            'isActive': false,
          },
        ],
        'pagination': {'total': 2},
      };
      final result = parsePaginated(payload, PartnerStaffRow.fromJson);
      expect(result.items.length, 2);
      expect(result.items[0].displayName, 'Andi');
      expect(result.items[0].isActive, true);
      expect(result.items[1].isActive, false);
      expect(result.total, 2);
    });
  });

  group('parsePaginated edge cases', () {
    test('defaults total to list length when pagination key missing', () {
      final payload = {
        'data': [
          {'id': '1'},
          {'id': '2'},
        ],
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.total, 2);
    });

    test('defaults total to 0 when data empty and no pagination', () {
      final payload = {'data': []};
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, isEmpty);
      expect(result.total, 0);
    });

    test('handles nested total from pagination', () {
      final payload = {
        'data': List.generate(10, (i) => {'id': '$i'}),
        'pagination': {'total': 100, 'page': 1, 'limit': 10},
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items.length, 10);
      expect(result.total, 100);
    });
  });

  group('formatRupiah additional cases', () {
    test('formats negative values', () {
      expect(formatRupiah(-5000), 'Rp -5.000');
    });

    test('formats exactly one million', () {
      expect(formatRupiah(1000000), 'Rp 1.000.000');
    });

    test('formats two million', () {
      expect(formatRupiah(2000000), 'Rp 2.000.000');
    });

    test('formats very large number', () {
      expect(formatRupiah(999999999), 'Rp 999.999.999');
    });

    test('formats double input via round', () {
      expect(formatRupiah(1500.7), 'Rp 1.501');
    });
  });

  group('AnalyticsRow with real-world data', () {
    test('parses complete revenue by day', () {
      final row = AnalyticsRow.fromJson({
        'revenueByDay': [
          {'date': '2026-09-01', 'revenue': 1500000},
          {'date': '2026-09-02', 'revenue': 2000000},
          {'date': '2026-09-03', 'revenue': 800000},
        ],
        'bookingsByStatus': {
          'CONFIRMED': 15,
          'COMPLETED': 40,
          'CANCELLED': 5,
          'NO_SHOW': 2,
        },
        'retention': {
          'totalCustomers': 200,
          'returningCustomers': 90,
          'retentionPercent': 45.0,
        },
        'funnel': {
          'search': 1000,
          'view': 400,
          'hold': 80,
          'confirm': 60,
        },
        'topServices': [
          {'serviceName': 'Haircut Premium', 'bookingCount': 30, 'revenue': 1500000},
          {'serviceName': 'Shave & Cut', 'bookingCount': 20, 'revenue': 800000},
        ],
        'staffUtilization': [
          {'staffName': 'Andi', 'bookingCount': 35},
          {'staffName': 'Budi', 'bookingCount': 25},
          {'staffName': 'Citra', 'bookingCount': 15},
        ],
      });
      expect(row.revenueByDay[1]['revenue'], 2000000);
      expect(row.bookingsByStatus['COMPLETED'], 40);
      expect(row.retention['retentionPercent'], 45.0);
      expect(row.funnel['search'], 1000);
      expect(row.topServices.length, 2);
      expect(row.staffUtilization.length, 3);
    });
  });

  group('ConversationRow edge cases', () {
    test('handles long subject text', () {
      final row = ConversationRow.fromJson({
        'id': 'c1',
        'tenantId': 't1',
        'customerId': 'u1',
        'providerId': 'p1',
        'subject': 'A very long subject text that describes the booking inquiry in detail',
        'status': 'CLOSED',
      });
      expect(row.subject!.length, greaterThan(50));
      expect(row.status, 'CLOSED');
    });

    test('handles invalid date strings gracefully', () {
      final row = ConversationRow.fromJson({
        'id': 'c2',
        'tenantId': 't1',
        'customerId': 'u1',
        'providerId': 'p1',
        'createdAt': 'not-a-date',
        'updatedAt': 'also-not-a-date',
      });
      expect(row.createdAt, isNull);
      expect(row.updatedAt, isNull);
    });
  });
}
