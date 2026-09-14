import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_partner/features/booking_management/presentation/pages/booking_list_page.dart';
import 'package:mobile_partner/features/booking_management/presentation/pages/booking_detail_page.dart';
import 'package:mobile_partner/features/calendar/presentation/pages/calendar_page.dart';
import 'package:mobile_partner/features/chat/presentation/pages/chat_list_page.dart';
import 'package:mobile_partner/features/chat/presentation/pages/chat_detail_page.dart';
import 'package:mobile_partner/features/customer_management/presentation/pages/customers_page.dart';
import 'package:mobile_partner/features/payment/presentation/pages/earnings_page.dart';
import 'package:mobile_partner/features/payment/presentation/pages/payment_page.dart';
import 'package:mobile_partner/features/promotion/presentation/pages/promotions_page.dart';
import 'package:mobile_partner/features/reports/presentation/pages/reports_page.dart';
import 'package:mobile_partner/features/service_management/presentation/pages/services_page.dart';
import 'package:mobile_partner/features/settings/presentation/pages/settings_page.dart';
import 'package:mobile_partner/features/settings/presentation/pages/blocked_dates_page.dart';
import 'package:mobile_partner/features/staff_management/presentation/pages/staff_list_page.dart';
import 'package:mobile_partner/features/staff/presentation/pages/staff_checkin_page.dart';
import 'package:mobile_partner/features/faq_management/presentation/pages/faq_page.dart';
import 'package:mobile_partner/shared/models/rows.dart';
import 'package:mobile_partner/core/router/app_router.dart';

void main() {
  group('BookingFilter enum', () {
    test('has all filter values', () {
      expect(BookingFilter.values.length, 5);
      expect(BookingFilter.values, contains(BookingFilter.all));
      expect(BookingFilter.values, contains(BookingFilter.pending));
      expect(BookingFilter.values, contains(BookingFilter.confirmed));
      expect(BookingFilter.values, contains(BookingFilter.completed));
      expect(BookingFilter.values, contains(BookingFilter.cancelled));
    });

    test('name returns lowercase', () {
      expect(BookingFilter.all.name, 'all');
      expect(BookingFilter.pending.name, 'pending');
      expect(BookingFilter.confirmed.name, 'confirmed');
    });

    test('first is all by default', () {
      expect(BookingFilter.values.first, BookingFilter.all);
    });
  });

  group('PartnerAuthState', () {
    test('default values are false/null', () {
      const state = PartnerAuthState();
      expect(state.isLoading, false);
      expect(state.isLoggedIn, false);
      expect(state.user, isNull);
      expect(state.error, isNull);
    });

    test('copyWith overrides specified fields', () {
      const state = PartnerAuthState();
      final updated = state.copyWith(isLoading: true, error: 'fail');
      expect(updated.isLoading, true);
      expect(updated.isLoggedIn, false);
      expect(updated.error, 'fail');
    });

    test('copyWith preserves unspecified fields', () {
      const state = PartnerAuthState(isLoading: true, isLoggedIn: true, error: 'old');
      final updated = state.copyWith(error: 'new');
      expect(updated.isLoading, true);
      expect(updated.isLoggedIn, true);
      expect(updated.error, 'new');
    });
  });

  group('PartnerStats', () {
    test('constructs with all required fields', () {
      const stats = PartnerStats(
        todayBookings: 5,
        todayRevenue: 250000,
        weekBookings: 30,
        weekRevenue: 1500000,
        totalCustomers: 120,
        avgRating: 4.5,
        recentBookings: [],
      );
      expect(stats.todayBookings, 5);
      expect(stats.todayRevenue, 250000);
      expect(stats.weekBookings, 30);
      expect(stats.weekRevenue, 1500000);
      expect(stats.totalCustomers, 120);
      expect(stats.avgRating, 4.5);
      expect(stats.recentBookings, isEmpty);
    });

    test('constructs with non-empty recentBookings', () {
      const stats = PartnerStats(
        todayBookings: 2,
        todayRevenue: 100000,
        weekBookings: 10,
        weekRevenue: 500000,
        totalCustomers: 50,
        avgRating: 4.8,
        recentBookings: [
          {'id': 'b1', 'customerName': 'Siti'},
          {'id': 'b2', 'customerName': 'Budi'},
        ],
      );
      expect(stats.recentBookings.length, 2);
      expect(stats.recentBookings[0]['customerName'], 'Siti');
    });
  });

  group('PartnerBookingRow model (provider inputs)', () {
    test('parses with all fields populated', () {
      final row = PartnerBookingRow.fromJson({
        'id': 'booking-123',
        'customerName': 'Siti Aminah',
        'serviceName': 'Haircut Premium',
        'status': 'CONFIRMED',
        'time': '2026-09-14 10:00',
        'amount': 75000,
        'bookingCode': 'DKT-0001',
      });
      expect(row.id, 'booking-123');
      expect(row.customerName, 'Siti Aminah');
      expect(row.serviceName, 'Haircut Premium');
      expect(row.status, 'CONFIRMED');
      expect(row.time, '2026-09-14 10:00');
      expect(row.amount, 75000);
      expect(row.bookingCode, 'DKT-0001');
    });

    test('handles all possible statuses for color logic', () {
      for (final status in ['PENDING', 'HELD', 'PENDING_APPROVAL', 'CONFIRMED',
        'CHECKED_IN', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'UNKNOWN']) {
        final row = PartnerBookingRow.fromJson({
          'id': 'b1',
          'status': status,
        });
        expect(row.status, status);
      }
    });
  });

  group('PartnerStaffRow model (provider inputs)', () {
    test('parses specialties as comma-separated string', () {
      final row = PartnerStaffRow.fromJson({
        'id': 's1',
        'displayName': 'Andi',
        'specialties': 'Fade, Undercut, Coloring',
      });
      expect(row.specialties, ['Fade', 'Undercut', 'Coloring']);
    });

    test('parses specialties as list', () {
      final row = PartnerStaffRow.fromJson({
        'id': 's2',
        'displayName': 'Budi',
        'specialties': ['Fade', 'Undercut'],
      });
      expect(row.specialties, ['Fade', 'Undercut']);
    });

    test('handles empty specialties string', () {
      final row = PartnerStaffRow.fromJson({
        'id': 's3',
        'displayName': 'Citra',
        'specialties': '',
      });
      expect(row.specialties, isNull);
    });

    test('handles null specialties', () {
      final row = PartnerStaffRow.fromJson({
        'id': 's4',
        'displayName': 'Dina',
      });
      expect(row.specialties, isNull);
    });
  });

  group('AnalyticsRow model (provider inputs)', () {
    test('parses complete analytics data', () {
      final row = AnalyticsRow.fromJson({
        'revenueByDay': [
          {'date': '2026-09-01', 'revenue': 500000},
          {'date': '2026-09-02', 'revenue': 750000},
        ],
        'bookingsByStatus': {'CONFIRMED': 10, 'COMPLETED': 25, 'CANCELLED': 3},
        'retention': {'totalCustomers': 100, 'returningCustomers': 45, 'retentionPercent': 45.0},
        'funnel': {'search': 500, 'view': 200, 'hold': 50, 'confirm': 30},
        'topServices': [
          {'serviceName': 'Haircut', 'bookingCount': 50, 'revenue': 2500000},
        ],
        'staffUtilization': [
          {'staffName': 'Andi', 'bookingCount': 30},
          {'staffName': 'Budi', 'bookingCount': 20},
        ],
      });
      expect(row.revenueByDay.length, 2);
      expect(row.bookingsByStatus['CONFIRMED'], 10);
      expect(row.retention['retentionPercent'], 45.0);
      expect(row.funnel['search'], 500);
      expect(row.topServices.first['serviceName'], 'Haircut');
      expect(row.staffUtilization.length, 2);
    });

    test('handles all empty/missing data', () {
      final row = AnalyticsRow.fromJson({});
      expect(row.revenueByDay, isEmpty);
      expect(row.bookingsByStatus, isEmpty);
      expect(row.retention, isEmpty);
      expect(row.funnel, isEmpty);
      expect(row.topServices, isEmpty);
      expect(row.staffUtilization, isEmpty);
    });
  });

  group('ConversationRow model (chat provider input)', () {
    test('parses with all fields including lastMessage', () {
      final row = ConversationRow.fromJson({
        'id': 'conv-1',
        'bookingId': 'b1',
        'tenantId': 't1',
        'customerId': 'c1',
        'providerId': 'p1',
        'subject': 'Booking inquiry',
        'status': 'OPEN',
        'createdAt': '2026-09-14T10:00:00Z',
        'updatedAt': '2026-09-14T10:30:00Z',
        'lastMessage': {'body': 'Hello there'},
        'messageCount': 5,
      });
      expect(row.id, 'conv-1');
      expect(row.bookingId, 'b1');
      expect(row.subject, 'Booking inquiry');
      expect(row.status, 'OPEN');
      expect(row.lastMessageBody, 'Hello there');
      expect(row.messageCount, 5);
      expect(row.createdAt, isNotNull);
      expect(row.updatedAt, isNotNull);
    });

    test('handles missing lastMessage', () {
      final row = ConversationRow.fromJson({
        'id': 'conv-2',
        'tenantId': 't1',
        'customerId': 'c1',
        'providerId': 'p1',
      });
      expect(row.lastMessageBody, isNull);
      expect(row.messageCount, 0);
      expect(row.status, 'OPEN');
    });
  });

  group('ChatMessageRow model (chat detail provider input)', () {
    test('parses all fields including attachment', () {
      final msg = ChatMessageRow.fromJson({
        'id': 'm1',
        'conversationId': 'conv-1',
        'senderId': 'u1',
        'senderRole': 'PROVIDER',
        'body': 'Check this out',
        'messageType': 'IMAGE',
        'attachmentUrl': 'https://example.com/photo.jpg',
        'createdAt': '2026-09-14T10:00:00Z',
      });
      expect(msg.id, 'm1');
      expect(msg.senderRole, 'PROVIDER');
      expect(msg.body, 'Check this out');
      expect(msg.messageType, 'IMAGE');
      expect(msg.attachmentUrl, 'https://example.com/photo.jpg');
      expect(msg.createdAt, isNotNull);
    });

    test('defaults missing fields', () {
      final msg = ChatMessageRow.fromJson({
        'id': 'm2',
      });
      expect(msg.conversationId, '');
      expect(msg.senderId, '');
      expect(msg.senderRole, 'CUSTOMER');
      expect(msg.body, '');
      expect(msg.messageType, 'TEXT');
      expect(msg.attachmentUrl, isNull);
      expect(msg.createdAt, isNull);
    });
  });

  group('PartnerReportRow model (report provider input)', () {
    test('constructs with typical values', () {
      const row = PartnerReportRow(
        totalBookings: 200,
        completedBookings: 180,
        cancelledBookings: 10,
        totalRevenue: 9000000,
        avgRating: 4.6,
        currency: 'IDR',
      );
      expect(row.totalBookings, 200);
      expect(row.completedBookings, 180);
      expect(row.cancelledBookings, 10);
      expect(row.totalRevenue, 9000000);
      expect(row.avgRating, 4.6);
      expect(row.currency, 'IDR');
    });
  });

  group('PageData', () {
    test('holds items and total', () {
      final data = PageData(
        items: ['a', 'b', 'c'],
        total: 10,
      );
      expect(data.items.length, 3);
      expect(data.total, 10);
    });
  });
}
