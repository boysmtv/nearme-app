import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_partner/shared/models/rows.dart';

void main() {
  group('PartnerBookingRow.fromJson', () {
    test('parses all fields correctly', () {
      final json = {
        'id': 'b1',
        'customerName': 'Siti',
        'serviceName': 'Haircut',
        'status': 'CONFIRMED',
        'time': '2026-08-25 10:00',
        'amount': 50000,
        'bookingCode': 'DKT-001',
      };
      final row = PartnerBookingRow.fromJson(json);
      expect(row.id, 'b1');
      expect(row.customerName, 'Siti');
      expect(row.serviceName, 'Haircut');
      expect(row.status, 'CONFIRMED');
      expect(row.time, '2026-08-25 10:00');
      expect(row.amount, 50000);
      expect(row.bookingCode, 'DKT-001');
    });

    test('defaults nullable fields', () {
      final json = {
        'id': 'b2',
      };
      final row = PartnerBookingRow.fromJson(json);
      expect(row.customerName, '-');
      expect(row.serviceName, '');
      expect(row.status, '');
      expect(row.time, '');
      expect(row.amount, 0);
      expect(row.bookingCode, '');
    });

    test('handles zero amount', () {
      final json = {
        'id': 'b3',
        'amount': 0,
      };
      final row = PartnerBookingRow.fromJson(json);
      expect(row.amount, 0);
    });

    test('handles large amount', () {
      final json = {
        'id': 'b4',
        'amount': 1000000,
      };
      final row = PartnerBookingRow.fromJson(json);
      expect(row.amount, 1000000);
    });
  });

  group('PartnerStaffRow.fromJson', () {
    test('parses all fields with isActive true', () {
      final json = {
        'id': 'st1',
        'userId': 'u1',
        'displayName': 'Andi',
        'title': 'Senior Barber',
        'bio': 'Expert barber',
        'avatarUrl': 'https://example.com/andi.jpg',
        'isActive': true,
      };
      final row = PartnerStaffRow.fromJson(json);
      expect(row.id, 'st1');
      expect(row.userId, 'u1');
      expect(row.displayName, 'Andi');
      expect(row.title, 'Senior Barber');
      expect(row.bio, 'Expert barber');
      expect(row.avatarUrl, 'https://example.com/andi.jpg');
      expect(row.isActive, true);
    });

    test('defaults nullable fields and isActive false', () {
      final json = {
        'id': 'st2',
      };
      final row = PartnerStaffRow.fromJson(json);
      expect(row.userId, isNull);
      expect(row.displayName, '');
      expect(row.title, isNull);
      expect(row.bio, isNull);
      expect(row.avatarUrl, isNull);
      expect(row.isActive, false);
    });

    test('isActive false when explicitly false', () {
      final json = {
        'id': 'st3',
        'displayName': 'Budi',
        'isActive': false,
      };
      final row = PartnerStaffRow.fromJson(json);
      expect(row.isActive, false);
    });

    test('isActive false when non-boolean value', () {
      final json = {
        'id': 'st4',
        'displayName': 'Citra',
        'isActive': 'yes',
      };
      final row = PartnerStaffRow.fromJson(json);
      expect(row.isActive, false);
    });
  });

  group('PartnerReportRow.fromJson', () {
    test('parses all fields correctly', () {
      final json = {
        'totalBookings': 150,
        'completedBookings': 120,
        'cancelledBookings': 10,
        'totalRevenue': 7500000,
        'avgRating': 4.7,
        'currency': 'USD',
      };
      final row = PartnerReportRow.fromJson(json);
      expect(row.totalBookings, 150);
      expect(row.completedBookings, 120);
      expect(row.cancelledBookings, 10);
      expect(row.totalRevenue, 7500000);
      expect(row.avgRating, 4.7);
      expect(row.currency, 'USD');
    });

    test('defaults all fields to zero/null when empty', () {
      final json = <String, dynamic>{};
      final row = PartnerReportRow.fromJson(json);
      expect(row.totalBookings, 0);
      expect(row.completedBookings, 0);
      expect(row.cancelledBookings, 0);
      expect(row.totalRevenue, 0);
      expect(row.avgRating, 0);
      expect(row.currency, 'IDR');
    });

    test('handles integer avgRating', () {
      final json = {
        'avgRating': 5,
      };
      final row = PartnerReportRow.fromJson(json);
      expect(row.avgRating, 5.0);
    });

    test('handles zero values explicitly', () {
      final json = {
        'totalBookings': 0,
        'completedBookings': 0,
        'cancelledBookings': 0,
        'totalRevenue': 0,
        'avgRating': 0.0,
      };
      final row = PartnerReportRow.fromJson(json);
      expect(row.totalBookings, 0);
      expect(row.totalRevenue, 0);
    });
  });

  group('formatRupiah', () {
    test('formats zero', () {
      expect(formatRupiah(0), 'Rp 0');
    });

    test('formats small number without separator', () {
      expect(formatRupiah(500), 'Rp 500');
    });

    test('formats thousands with dot separator', () {
      expect(formatRupiah(1000), 'Rp 1.000');
    });

    test('formats ten thousands', () {
      expect(formatRupiah(15000), 'Rp 15.000');
    });

    test('formats hundred thousands', () {
      expect(formatRupiah(100000), 'Rp 100.000');
    });

    test('formats millions', () {
      expect(formatRupiah(1500000), 'Rp 1.500.000');
    });
  });

  group('parsePaginated', () {
    test('parses valid paginated data', () {
      final payload = {
        'data': [
          {'id': '1'},
          {'id': '2'},
        ],
        'pagination': {'total': 50},
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, ['1', '2']);
      expect(result.total, 50);
    });

    test('handles empty data', () {
      final payload = {
        'data': [],
        'pagination': {'total': 0},
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, isEmpty);
      expect(result.total, 0);
    });

    test('defaults total to list length when pagination missing', () {
      final payload = {
        'data': [
          {'id': 'a'},
          {'id': 'b'},
          {'id': 'c'},
        ],
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items.length, 3);
      expect(result.total, 3);
    });

    test('handles missing data key', () {
      final payload = <String, dynamic>{};
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, isEmpty);
      expect(result.total, 0);
    });
  });
}
