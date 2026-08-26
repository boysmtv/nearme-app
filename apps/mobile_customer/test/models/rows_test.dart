import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/shared/models/rows.dart';

void main() {
  group('ProviderRow.fromJson', () {
    test('parses all fields correctly', () {
      final json = {
        'id': 'p1',
        'slug': 'barber-central',
        'name': 'Barber Central',
        'category': 'Barbershop',
        'imageUrl': 'https://example.com/img.jpg',
        'rating': 4.5,
        'reviewCount': 120,
        'city': 'Jakarta',
        'address': 'Jl. Sudirman 1',
        'description': 'Best barbershop',
        'minPrice': 50000,
      };
      final row = ProviderRow.fromJson(json);
      expect(row.id, 'p1');
      expect(row.slug, 'barber-central');
      expect(row.name, 'Barber Central');
      expect(row.category, 'Barbershop');
      expect(row.imageUrl, 'https://example.com/img.jpg');
      expect(row.rating, 4.5);
      expect(row.reviewCount, 120);
      expect(row.city, 'Jakarta');
      expect(row.address, 'Jl. Sudirman 1');
      expect(row.description, 'Best barbershop');
      expect(row.minPrice, 50000);
    });

    test('defaults slug to id when slug is null', () {
      final json = {
        'id': 'p2',
        'name': 'Salon',
        'rating': 0,
        'reviewCount': 0,
      };
      final row = ProviderRow.fromJson(json);
      expect(row.slug, 'p2');
    });

    test('defaults rating and reviewCount to zero when null', () {
      final json = {
        'id': 'p3',
        'name': 'Quick Cut',
      };
      final row = ProviderRow.fromJson(json);
      expect(row.rating, 0);
      expect(row.reviewCount, 0);
      expect(row.category, isNull);
      expect(row.imageUrl, isNull);
      expect(row.city, isNull);
      expect(row.address, isNull);
      expect(row.description, isNull);
      expect(row.minPrice, isNull);
    });

    test('handles integer rating', () {
      final json = {
        'id': 'p4',
        'name': 'Clipper',
        'rating': 5,
        'reviewCount': 10,
      };
      final row = ProviderRow.fromJson(json);
      expect(row.rating, 5.0);
      expect(row.reviewCount, 10);
    });
  });

  group('ServiceRow.fromJson', () {
    test('parses all fields correctly', () {
      final json = {
        'id': 's1',
        'name': 'Haircut',
        'description': 'Standard haircut',
        'price': 50000,
        'duration': 30,
        'currency': 'USD',
        'imageUrl': 'https://example.com/cut.jpg',
      };
      final row = ServiceRow.fromJson(json);
      expect(row.id, 's1');
      expect(row.name, 'Haircut');
      expect(row.description, 'Standard haircut');
      expect(row.price, 50000);
      expect(row.durationMinutes, 30);
      expect(row.currency, 'USD');
      expect(row.imageUrl, 'https://example.com/cut.jpg');
    });

    test('defaults currency to IDR when null', () {
      final json = {
        'id': 's2',
        'name': 'Shave',
        'price': 20000,
        'duration': 15,
      };
      final row = ServiceRow.fromJson(json);
      expect(row.currency, 'IDR');
      expect(row.description, isNull);
      expect(row.imageUrl, isNull);
    });

    test('defaults price and duration to zero when null', () {
      final json = {
        'id': 's3',
        'name': 'Treatment',
      };
      final row = ServiceRow.fromJson(json);
      expect(row.price, 0);
      expect(row.durationMinutes, 0);
    });
  });

  group('PublicStaffRow.fromJson', () {
    test('parses all fields correctly', () {
      final json = {
        'id': 'st1',
        'name': 'Andi',
        'title': 'Senior Barber',
        'bio': '10 years experience',
        'avatar': 'https://example.com/andi.jpg',
      };
      final row = PublicStaffRow.fromJson(json);
      expect(row.id, 'st1');
      expect(row.name, 'Andi');
      expect(row.title, 'Senior Barber');
      expect(row.bio, '10 years experience');
      expect(row.avatar, 'https://example.com/andi.jpg');
    });

    test('defaults nullable fields to null', () {
      final json = {
        'id': 'st2',
        'name': 'Budi',
      };
      final row = PublicStaffRow.fromJson(json);
      expect(row.title, isNull);
      expect(row.bio, isNull);
      expect(row.avatar, isNull);
    });

    test('handles empty strings for nullable fields', () {
      final json = {
        'id': 'st3',
        'name': 'Citra',
        'title': '',
        'bio': '',
        'avatar': '',
      };
      final row = PublicStaffRow.fromJson(json);
      expect(row.title, '');
      expect(row.bio, '');
      expect(row.avatar, '');
    });
  });

  group('SlotRow.fromJson', () {
    test('parses available true', () {
      final row = SlotRow.fromJson({'time': '09:00', 'available': true});
      expect(row.time, '09:00');
      expect(row.available, true);
    });

    test('parses available false', () {
      final row = SlotRow.fromJson({'time': '10:00', 'available': false});
      expect(row.time, '10:00');
      expect(row.available, false);
    });

    test('defaults available to false when null', () {
      final row = SlotRow.fromJson({'time': '11:00'});
      expect(row.available, false);
    });

    test('treats non-true values as false', () {
      final row = SlotRow.fromJson({'time': '12:00', 'available': 'yes'});
      expect(row.available, false);
    });
  });

  group('BookingRow.fromJson', () {
    test('parses all fields with dates', () {
      final json = {
        'id': 'b1',
        'bookingCode': 'DKT-001',
        'status': 'CONFIRMED',
        'currency': 'IDR',
        'subtotal': 100000,
        'discount': 10000,
        'tax': 11000,
        'fee': 5000,
        'total': 106000,
        'startsAt': '2026-08-25T10:00:00+07:00',
        'endsAt': '2026-08-25T11:00:00+07:00',
        'createdAt': '2026-08-20T08:00:00+07:00',
      };
      final row = BookingRow.fromJson(json);
      expect(row.id, 'b1');
      expect(row.bookingCode, 'DKT-001');
      expect(row.status, 'CONFIRMED');
      expect(row.currency, 'IDR');
      expect(row.subtotal, 100000);
      expect(row.discount, 10000);
      expect(row.tax, 11000);
      expect(row.fee, 5000);
      expect(row.total, 106000);
      expect(row.startsAt, isNotNull);
      expect(row.endsAt, isNotNull);
      expect(row.createdAt, isNotNull);
    });

    test('defaults nullable fields and dates to null/zero', () {
      final json = {
        'id': 'b2',
      };
      final row = BookingRow.fromJson(json);
      expect(row.bookingCode, '');
      expect(row.status, '');
      expect(row.currency, 'IDR');
      expect(row.subtotal, 0);
      expect(row.discount, 0);
      expect(row.tax, 0);
      expect(row.fee, 0);
      expect(row.total, 0);
      expect(row.startsAt, isNull);
      expect(row.endsAt, isNull);
      expect(row.createdAt, isNull);
    });

    test('handles zero amounts', () {
      final json = {
        'id': 'b3',
        'bookingCode': 'DKT-003',
        'status': 'PENDING',
        'subtotal': 0,
        'discount': 0,
        'tax': 0,
        'fee': 0,
        'total': 0,
      };
      final row = BookingRow.fromJson(json);
      expect(row.subtotal, 0);
      expect(row.total, 0);
    });

    test('handles invalid date strings gracefully', () {
      final json = {
        'id': 'b4',
        'startsAt': 'not-a-date',
        'endsAt': '',
      };
      final row = BookingRow.fromJson(json);
      expect(row.startsAt, isNull);
      expect(row.endsAt, isNull);
    });
  });

  group('NotificationRow.fromJson', () {
    test('parses all fields with read true', () {
      final json = {
        'id': 'n1',
        'channel': 'push',
        'subject': 'Booking Confirmed',
        'body': 'Your booking is confirmed',
        'read': true,
        'createdAt': '2026-08-25T10:00:00+07:00',
      };
      final row = NotificationRow.fromJson(json);
      expect(row.id, 'n1');
      expect(row.channel, 'push');
      expect(row.subject, 'Booking Confirmed');
      expect(row.body, 'Your booking is confirmed');
      expect(row.read, true);
      expect(row.createdAt, isNotNull);
    });

    test('defaults read to false when null', () {
      final json = {
        'id': 'n2',
      };
      final row = NotificationRow.fromJson(json);
      expect(row.channel, '');
      expect(row.subject, '');
      expect(row.body, '');
      expect(row.read, false);
      expect(row.createdAt, isNull);
    });

    test('read false when explicitly false', () {
      final json = {
        'id': 'n3',
        'channel': 'email',
        'subject': 'Welcome',
        'body': 'Welcome to DEKAT',
        'read': false,
      };
      final row = NotificationRow.fromJson(json);
      expect(row.read, false);
    });
  });

  group('formatRupiah', () {
    test('formats zero', () {
      expect(formatRupiah(0), 'Rp 0');
    });

    test('formats small number', () {
      expect(formatRupiah(500), 'Rp 500');
    });

    test('formats thousands with separator', () {
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

    test('rounds decimal values', () {
      expect(formatRupiah(1500.6), 'Rp 1.501');
      expect(formatRupiah(1500.4), 'Rp 1.500');
    });
  });

  group('parsePaginated', () {
    test('parses valid paginated data', () {
      final payload = {
        'data': [
          {'id': '1', 'name': 'Item 1'},
          {'id': '2', 'name': 'Item 2'},
        ],
        'pagination': {'total': 50},
      };
      final result = parsePaginated(payload, (e) => e['name'] as String);
      expect(result.items, ['Item 1', 'Item 2']);
      expect(result.total, 50);
    });

    test('defaults total to list length when pagination missing', () {
      final payload = {
        'data': [
          {'id': '1'},
          {'id': '2'},
          {'id': '3'},
        ],
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items.length, 3);
      expect(result.total, 3);
    });

    test('handles empty data list', () {
      final payload = {
        'data': [],
        'pagination': {'total': 0},
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, isEmpty);
      expect(result.total, 0);
    });

    test('defaults data to empty list when key missing', () {
      final payload = <String, dynamic>{
        'pagination': {'total': 10},
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, isEmpty);
      expect(result.total, 10);
    });
  });
}
