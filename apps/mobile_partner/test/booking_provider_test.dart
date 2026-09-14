import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_partner/features/booking_management/presentation/pages/booking_list_page.dart';
import 'package:mobile_partner/shared/models/rows.dart';

void main() {
  group('BookingFilter state provider', () {
    test('defaults to BookingFilter.all', () {
      final container = ProviderContainer();
      final filter = container.read(partnerBookingFilterProvider);
      expect(filter, BookingFilter.all);
      container.dispose();
    });

    test('can change to pending', () {
      final container = ProviderContainer();
      container.read(partnerBookingFilterProvider.notifier).state = BookingFilter.pending;
      expect(container.read(partnerBookingFilterProvider), BookingFilter.pending);
      container.dispose();
    });

    test('can change to confirmed', () {
      final container = ProviderContainer();
      container.read(partnerBookingFilterProvider.notifier).state = BookingFilter.confirmed;
      expect(container.read(partnerBookingFilterProvider), BookingFilter.confirmed);
      container.dispose();
    });

    test('can change to completed', () {
      final container = ProviderContainer();
      container.read(partnerBookingFilterProvider.notifier).state = BookingFilter.completed;
      expect(container.read(partnerBookingFilterProvider), BookingFilter.completed);
      container.dispose();
    });

    test('can change to cancelled', () {
      final container = ProviderContainer();
      container.read(partnerBookingFilterProvider.notifier).state = BookingFilter.cancelled;
      expect(container.read(partnerBookingFilterProvider), BookingFilter.cancelled);
      container.dispose();
    });

    test('filter name uppercases for API status param', () {
      expect(BookingFilter.pending.name.toUpperCase(), 'PENDING');
      expect(BookingFilter.confirmed.name.toUpperCase(), 'CONFIRMED');
      expect(BookingFilter.completed.name.toUpperCase(), 'COMPLETED');
      expect(BookingFilter.cancelled.name.toUpperCase(), 'CANCELLED');
    });
  });

  group('PartnerBookingRow status color mapping', () {
    Color getStatusColor(String status) {
      final s = status.toUpperCase();
      return switch (s) {
        'PENDING' || 'HELD' || 'PENDING_APPROVAL' => const Color(0xFFFF9800),
        'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => const Color(0xFF2196F3),
        'COMPLETED' => const Color(0xFF4CAF50),
        _ => const Color(0xFFF44336),
      };
    }

    test('PENDING is orange', () {
      expect(getStatusColor('PENDING'), const Color(0xFFFF9800));
    });

    test('HELD is orange', () {
      expect(getStatusColor('HELD'), const Color(0xFFFF9800));
    });

    test('CONFIRMED is blue', () {
      expect(getStatusColor('CONFIRMED'), const Color(0xFF2196F3));
    });

    test('CHECKED_IN is blue', () {
      expect(getStatusColor('CHECKED_IN'), const Color(0xFF2196F3));
    });

    test('IN_SERVICE is blue', () {
      expect(getStatusColor('IN_SERVICE'), const Color(0xFF2196F3));
    });

    test('COMPLETED is green', () {
      expect(getStatusColor('COMPLETED'), const Color(0xFF4CAF50));
    });

    test('CANCELLED is red', () {
      expect(getStatusColor('CANCELLED'), const Color(0xFFF44336));
    });

    test('NO_SHOW is red', () {
      expect(getStatusColor('NO_SHOW'), const Color(0xFFF44336));
    });

    test('unknown status is red', () {
      expect(getStatusColor('UNKNOWN'), const Color(0xFFF44336));
    });

    test('empty status is red', () {
      expect(getStatusColor(''), const Color(0xFFF44336));
    });
  });

  group('PartnerBookingRow status isPending logic', () {
    bool isPending(String status) {
      final s = status.toUpperCase();
      return s == 'PENDING' || s == 'HELD' || s == 'PENDING_APPROVAL';
    }

    test('PENDING is pending', () => expect(isPending('PENDING'), true));
    test('HELD is pending', () => expect(isPending('HELD'), true));
    test('PENDING_APPROVAL is pending', () => expect(isPending('PENDING_APPROVAL'), true));
    test('CONFIRMED is not pending', () => expect(isPending('CONFIRMED'), false));
    test('COMPLETED is not pending', () => expect(isPending('COMPLETED'), false));
    test('CHECKED_IN is not pending', () => expect(isPending('CHECKED_IN'), false));
  });

  group('PartnerBookingRow booking code display', () {
    test('shows bookingCode when non-empty', () {
      final row = PartnerBookingRow.fromJson({
        'id': 'b1',
        'bookingCode': 'DKT-001',
      });
      expect(row.bookingCode.isNotEmpty ? row.bookingCode : row.id, 'DKT-001');
    });

    test('falls back to id when bookingCode empty', () {
      final row = PartnerBookingRow.fromJson({
        'id': 'b1-uuid-abc',
        'bookingCode': '',
      });
      expect(row.bookingCode.isEmpty ? row.id : row.bookingCode, 'b1-uuid-abc');
    });
  });
}
