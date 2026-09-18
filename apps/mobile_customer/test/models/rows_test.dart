import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/features/provider_profile/domain/entities/provider_entity.dart';
import 'package:mobile_customer/features/provider_profile/domain/entities/service_entity.dart';
import 'package:mobile_customer/features/booking/domain/entities/booking_entity.dart';
import 'package:mobile_customer/features/notification/domain/entities/notification_entity.dart';
import 'package:mobile_customer/shared/utils/format_rupiah.dart';

void main() {
  group('ProviderEntity.fromJson', () {
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
      final entity = ProviderEntity.fromJson(json);
      expect(entity.id, 'p1');
      expect(entity.slug, 'barber-central');
      expect(entity.name, 'Barber Central');
      expect(entity.category, 'Barbershop');
      expect(entity.imageUrl, 'https://example.com/img.jpg');
      expect(entity.rating, 4.5);
      expect(entity.reviewCount, 120);
      expect(entity.city, 'Jakarta');
      expect(entity.address, 'Jl. Sudirman 1');
      expect(entity.description, 'Best barbershop');
      expect(entity.minPrice, 50000);
    });

    test('defaults slug to empty when slug is null', () {
      final json = {
        'id': 'p2',
        'name': 'Salon',
        'rating': 0,
        'reviewCount': 0,
      };
      final entity = ProviderEntity.fromJson(json);
      expect(entity.slug, '');
    });

    test('defaults rating and reviewCount to zero when null', () {
      final json = {
        'id': 'p3',
        'name': 'Quick Cut',
      };
      final entity = ProviderEntity.fromJson(json);
      expect(entity.rating, 0);
      expect(entity.reviewCount, 0);
      expect(entity.category, isNull);
      expect(entity.imageUrl, isNull);
      expect(entity.city, isNull);
      expect(entity.address, isNull);
      expect(entity.description, isNull);
      expect(entity.minPrice, isNull);
    });

    test('handles integer rating', () {
      final json = {
        'id': 'p4',
        'name': 'Clipper',
        'rating': 5,
        'reviewCount': 10,
      };
      final entity = ProviderEntity.fromJson(json);
      expect(entity.rating, 5.0);
      expect(entity.reviewCount, 10);
    });
  });

  group('ServiceEntity.fromJson', () {
    test('parses all fields correctly', () {
      final json = {
        'id': 's1',
        'name': 'Haircut',
        'description': 'Standard haircut',
        'price': 50000,
        'durationMinutes': 30,
        'currency': 'USD',
        'imageUrl': 'https://example.com/cut.jpg',
      };
      final entity = ServiceEntity.fromJson(json);
      expect(entity.id, 's1');
      expect(entity.name, 'Haircut');
      expect(entity.description, 'Standard haircut');
      expect(entity.price, 50000);
      expect(entity.durationMinutes, 30);
      expect(entity.currency, 'USD');
      expect(entity.imageUrl, 'https://example.com/cut.jpg');
    });

    test('defaults currency to IDR when null', () {
      final json = {
        'id': 's2',
        'name': 'Shave',
        'price': 20000,
        'durationMinutes': 15,
      };
      final entity = ServiceEntity.fromJson(json);
      expect(entity.currency, 'IDR');
      expect(entity.description, isNull);
      expect(entity.imageUrl, isNull);
    });

    test('defaults price and duration to zero when null', () {
      final json = {
        'id': 's3',
        'name': 'Treatment',
      };
      final entity = ServiceEntity.fromJson(json);
      expect(entity.price, 0);
      expect(entity.durationMinutes, 0);
    });

    test('parses public-API duration key (regression: booking 400)', () {
      // Endpoint publik /providers/{id}/services mengirim `duration`,
      // bukan `durationMinutes`. Tanpa fallback ini durasi = 0 sehingga
      // endsAt == startsAt dan backend menolak dengan
      // "Start time must be before end time".
      final json = {
        'id': 's4',
        'name': 'Cukur Jenggot',
        'price': 30000,
        'duration': 20,
      };
      final entity = ServiceEntity.fromJson(json);
      expect(entity.durationMinutes, 20);
      expect(entity.durationMinutes, greaterThan(0));
    });

    test('durationMinutes key takes precedence when both present', () {
      final json = {
        'id': 's5',
        'name': 'Fade',
        'price': 45000,
        'duration': 20,
        'durationMinutes': 45,
      };
      expect(ServiceEntity.fromJson(json).durationMinutes, 45);
    });
  });

  group('BookingEntity.fromJson', () {
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
      final entity = BookingEntity.fromJson(json);
      expect(entity.id, 'b1');
      expect(entity.bookingCode, 'DKT-001');
      expect(entity.status, 'CONFIRMED');
      expect(entity.currency, 'IDR');
      expect(entity.subtotal, 100000);
      expect(entity.discount, 10000);
      expect(entity.tax, 11000);
      expect(entity.fee, 5000);
      expect(entity.total, 106000);
      expect(entity.startsAt, isNotNull);
      expect(entity.endsAt, isNotNull);
      expect(entity.createdAt, isNotNull);
    });

    test('defaults nullable fields and dates to null/zero', () {
      final json = {
        'id': 'b2',
      };
      final entity = BookingEntity.fromJson(json);
      expect(entity.bookingCode, '');
      expect(entity.status, '');
      expect(entity.currency, 'IDR');
      expect(entity.subtotal, 0);
      expect(entity.discount, 0);
      expect(entity.tax, 0);
      expect(entity.fee, 0);
      expect(entity.total, 0);
      expect(entity.startsAt, isNull);
      expect(entity.endsAt, isNull);
      expect(entity.createdAt, isNull);
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
      final entity = BookingEntity.fromJson(json);
      expect(entity.subtotal, 0);
      expect(entity.total, 0);
    });

    test('handles invalid date strings gracefully', () {
      final json = {
        'id': 'b4',
        'startsAt': 'not-a-date',
        'endsAt': '',
      };
      final entity = BookingEntity.fromJson(json);
      expect(entity.startsAt, isNull);
      expect(entity.endsAt, isNull);
    });
  });

  group('NotificationEntity', () {
    test('parses all fields with read true', () {
      final entity = NotificationEntity(
        id: 'n1',
        channel: 'push',
        subject: 'Booking Confirmed',
        body: 'Your booking is confirmed',
        read: true,
      );
      expect(entity.id, 'n1');
      expect(entity.channel, 'push');
      expect(entity.subject, 'Booking Confirmed');
      expect(entity.body, 'Your booking is confirmed');
      expect(entity.read, true);
    });

    test('defaults read to false when null', () {
      const entity = NotificationEntity(
        id: 'n2',
        channel: '',
        subject: '',
        body: '',
        read: false,
      );
      expect(entity.channel, '');
      expect(entity.subject, '');
      expect(entity.body, '');
      expect(entity.read, false);
    });

    test('read false when explicitly false', () {
      const entity = NotificationEntity(
        id: 'n3',
        channel: 'email',
        subject: 'Welcome',
        body: 'Welcome to DEKAT',
        read: false,
      );
      expect(entity.read, false);
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
}
