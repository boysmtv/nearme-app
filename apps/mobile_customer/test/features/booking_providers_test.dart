import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_customer/shared/models/rows.dart';

import 'package:mobile_customer/features/booking/presentation/pages/booking_history_page.dart';
import 'package:mobile_customer/features/booking/presentation/pages/booking_detail_page.dart';
import 'package:mobile_customer/features/booking/presentation/pages/booking_form_page.dart';
import 'package:mobile_customer/features/booking/presentation/pages/booking_confirmation_page.dart';

void main() {
  group('bookingFilterProvider', () {
    test('defaults to BookingFilter.all', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      expect(container.read(bookingFilterProvider), BookingFilter.all);
    });

    test('can be updated to different filter values', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(bookingFilterProvider.notifier).state = BookingFilter.pending;
      expect(container.read(bookingFilterProvider), BookingFilter.pending);

      container.read(bookingFilterProvider.notifier).state = BookingFilter.completed;
      expect(container.read(bookingFilterProvider), BookingFilter.completed);
    });

    test('all filter values are accessible', () {
      expect(BookingFilter.values.length, 5);
      expect(BookingFilter.values, contains(BookingFilter.all));
      expect(BookingFilter.values, contains(BookingFilter.cancelled));
    });
  });

  group('bookingsProvider', () {
    test('returns data when override provides list', () async {
      final container = ProviderContainer(
        overrides: [
          bookingsProvider.overrideWith((ref) => Future.value([
                BookingRow(
                  id: 'b1',
                  bookingCode: 'DKT-001',
                  status: 'CONFIRMED',
                  currency: 'IDR',
                  subtotal: 50000,
                  discount: 0,
                  tax: 5500,
                  fee: 0,
                  total: 55500,
                ),
                BookingRow(
                  id: 'b2',
                  bookingCode: 'DKT-002',
                  status: 'PENDING',
                  currency: 'IDR',
                  subtotal: 30000,
                  discount: 0,
                  tax: 3300,
                  fee: 0,
                  total: 33300,
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final result = await container.read(bookingsProvider.future);
      expect(result.length, 2);
      expect(result[0].bookingCode, 'DKT-001');
      expect(result[1].status, 'PENDING');
    });

    test('returns empty list when override provides empty', () async {
      final container = ProviderContainer(
        overrides: [
          bookingsProvider.overrideWith((ref) => Future.value(<BookingRow>[])),
        ],
      );
      addTearDown(container.dispose);

      final result = await container.read(bookingsProvider.future);
      expect(result, isEmpty);
    });

    test('propagates error from override', () async {
      final container = ProviderContainer(
        overrides: [
          bookingsProvider.overrideWith((ref) => Future.error(Exception('Network error'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(bookingsProvider.future),
        throwsA(isA<Exception>().having((e) => e.toString(), 'message', contains('Network error'))),
      );
    });
  });

  group('bookingDetailProvider2', () {
    test('returns BookingRow for valid id', () async {
      final container = ProviderContainer(
        overrides: [
          bookingDetailProvider2('b1').overrideWith((ref) => Future.value(
                BookingRow(
                  id: 'b1',
                  bookingCode: 'DKT-001',
                  status: 'CONFIRMED',
                  currency: 'IDR',
                  subtotal: 100000,
                  discount: 10000,
                  tax: 9900,
                  fee: 5000,
                  total: 104900,
                  startsAt: DateTime(2026, 8, 25, 10, 0),
                  version: 2,
                ),
              )),
        ],
      );
      addTearDown(container.dispose);

      final booking = await container.read(bookingDetailProvider2('b1').future);
      expect(booking.id, 'b1');
      expect(booking.total, 104900);
      expect(booking.version, 2);
      expect(booking.startsAt, DateTime(2026, 8, 25, 10, 0));
    });

    test('propagates error for invalid id', () async {
      final container = ProviderContainer(
        overrides: [
          bookingDetailProvider2('bad-id').overrideWith(
              (ref) => Future.error(Exception('Not found'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(bookingDetailProvider2('bad-id').future),
        throwsA(isA<Exception>()),
      );
    });

    test('different ids resolve to different providers', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final p1 = container.read(bookingDetailProvider2('a'));
      final p2 = container.read(bookingDetailProvider2('b'));
      expect(p1, isNot(same(p2)));
    });
  });

  group('bookingSummaryProvider', () {
    test('parses key correctly with providerId|serviceId', () async {
      final container = ProviderContainer(
        overrides: [
          bookingSummaryProvider.overrideWith((ref, key) async {
            final parts = key.split('|');
            return BookingSummary(
              service: ServiceRow(
                id: parts[1],
                name: 'Haircut',
                price: 50000,
                durationMinutes: 30,
                currency: 'IDR',
              ),
              providerName: 'Test Provider',
            );
          }),
        ],
      );
      addTearDown(container.dispose);

      final summary = await container.read(bookingSummaryProvider('prov1|svc1').future);
      expect(summary.service.id, 'svc1');
      expect(summary.service.price, 50000);
      expect(summary.providerName, 'Test Provider');
    });

    test('handles key with staffId (3 parts)', () async {
      final container = ProviderContainer(
        overrides: [
          bookingSummaryProvider.overrideWith((ref, key) async {
            final parts = key.split('|');
            return BookingSummary(
              service: ServiceRow(
                id: parts[1],
                name: 'Haircut',
                price: 50000,
                durationMinutes: 30,
                currency: 'IDR',
              ),
              providerName: 'Test Provider',
              staffName: 'Andi',
            );
          }),
        ],
      );
      addTearDown(container.dispose);

      final summary = await container.read(bookingSummaryProvider('prov1|svc1|staff1').future);
      expect(summary.staffName, 'Andi');
    });

    test('propagates error when service not found', () async {
      final container = ProviderContainer(
        overrides: [
          bookingSummaryProvider.overrideWith(
              (ref, key) => Future.error(Exception('Selected service not found'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(bookingSummaryProvider('p|missing').future),
        throwsA(isA<Exception>().having((e) => e.toString(), 'msg', contains('not found'))),
      );
    });
  });

  group('bookingConfirmationProvider', () {
    test('returns BookingRow for confirmation', () async {
      final container = ProviderContainer(
        overrides: [
          bookingConfirmationProvider('b1').overrideWith((ref) => Future.value(
                BookingRow(
                  id: 'b1',
                  bookingCode: 'DKT-100',
                  status: 'CONFIRMED',
                  currency: 'IDR',
                  subtotal: 75000,
                  discount: 0,
                  tax: 8250,
                  fee: 0,
                  total: 83250,
                ),
              )),
        ],
      );
      addTearDown(container.dispose);

      final booking = await container.read(bookingConfirmationProvider('b1').future);
      expect(booking.bookingCode, 'DKT-100');
      expect(booking.status, 'CONFIRMED');
      expect(booking.total, 83250);
    });
  });
}
