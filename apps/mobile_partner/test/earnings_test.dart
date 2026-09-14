import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_partner/features/payment/presentation/pages/earnings_page.dart';

void main() {
  group('PartnerStats', () {
    test('constructs with zero values', () {
      const stats = PartnerStats(
        todayBookings: 0,
        todayRevenue: 0,
        weekBookings: 0,
        weekRevenue: 0,
        totalCustomers: 0,
        avgRating: 0.0,
        recentBookings: [],
      );
      expect(stats.todayBookings, 0);
      expect(stats.todayRevenue, 0);
      expect(stats.weekBookings, 0);
      expect(stats.weekRevenue, 0);
      expect(stats.totalCustomers, 0);
      expect(stats.avgRating, 0.0);
      expect(stats.recentBookings, isEmpty);
    });

    test('constructs with realistic values', () {
      const stats = PartnerStats(
        todayBookings: 8,
        todayRevenue: 400000,
        weekBookings: 45,
        weekRevenue: 2250000,
        totalCustomers: 350,
        avgRating: 4.7,
        recentBookings: [
          {'id': 'b1', 'customerName': 'Siti', 'amount': 50000, 'status': 'COMPLETED'},
          {'id': 'b2', 'customerName': 'Budi', 'amount': 75000, 'status': 'CONFIRMED'},
        ],
      );
      expect(stats.todayBookings, 8);
      expect(stats.todayRevenue, 400000);
      expect(stats.weekBookings, 45);
      expect(stats.weekRevenue, 2250000);
      expect(stats.totalCustomers, 350);
      expect(stats.avgRating, 4.7);
      expect(stats.recentBookings.length, 2);
    });

    test('recentBookings can contain mixed statuses', () {
      const stats = PartnerStats(
        todayBookings: 3,
        todayRevenue: 150000,
        weekBookings: 15,
        weekRevenue: 750000,
        totalCustomers: 80,
        avgRating: 4.5,
        recentBookings: [
          {'status': 'COMPLETED'},
          {'status': 'PENDING'},
          {'status': 'CANCELLED'},
        ],
      );
      expect(stats.recentBookings[0]['status'], 'COMPLETED');
      expect(stats.recentBookings[1]['status'], 'PENDING');
      expect(stats.recentBookings[2]['status'], 'CANCELLED');
    });
  });
}
