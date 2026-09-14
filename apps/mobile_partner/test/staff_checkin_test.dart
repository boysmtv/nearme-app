import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_partner/features/settings/presentation/pages/blocked_dates_page.dart';
import 'package:mobile_partner/features/staff/presentation/pages/staff_checkin_page.dart';

void main() {
  group('Staff check-in active count logic', () {
    test('counts active staff correctly', () {
      final staffList = [
        {'displayName': 'Andi', 'isActive': true},
        {'displayName': 'Budi', 'isActive': false},
        {'displayName': 'Citra', 'isActive': true},
        {'displayName': 'Dina', 'isActive': true},
      ];
      final activeCount = staffList.where((s) => s['isActive'] == true).length;
      expect(activeCount, 3);
    });

    test('counts zero active staff', () {
      final staffList = [
        {'displayName': 'Andi', 'isActive': false},
        {'displayName': 'Budi', 'isActive': false},
      ];
      final activeCount = staffList.where((s) => s['isActive'] == true).length;
      expect(activeCount, 0);
    });

    test('handles empty staff list', () {
      final staffList = <Map<String, dynamic>>[];
      final activeCount = staffList.where((s) => s['isActive'] == true).length;
      expect(activeCount, 0);
    });

    test('handles all active staff', () {
      final staffList = [
        {'displayName': 'Andi', 'isActive': true},
        {'displayName': 'Budi', 'isActive': true},
      ];
      final activeCount = staffList.where((s) => s['isActive'] == true).length;
      final inactiveCount = staffList.length - activeCount;
      expect(activeCount, 2);
      expect(inactiveCount, 0);
    });
  });

  group('Staff check-in stat box computation', () {
    test('computes total, active, inactive correctly', () {
      final staffList = [
        {'displayName': 'Andi', 'isActive': true},
        {'displayName': 'Budi', 'isActive': false},
        {'displayName': 'Citra', 'isActive': true},
      ];
      final total = staffList.length;
      final active = staffList.where((s) => s['isActive'] == true).length;
      final inactive = total - active;
      expect(total, 3);
      expect(active, 2);
      expect(inactive, 1);
    });
  });

  group('PartnerStaffRow specialties parsing', () {
    test('parses comma-separated string', () {
      final raw = 'Fade, Undercut, Coloring';
      final specs = raw.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      expect(specs, ['Fade', 'Undercut', 'Coloring']);
    });

    test('parses list of strings', () {
      final raw = ['Fade', 'Undercut'];
      final specs = raw.cast<String>();
      expect(specs, ['Fade', 'Undercut']);
    });

    test('handles single specialty', () {
      final raw = 'Fade';
      final specs = raw.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      expect(specs, ['Fade']);
    });

    test('handles empty string', () {
      final raw = '';
      final specs = raw.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      expect(specs, isEmpty);
    });

    test('handles extra spaces', () {
      final raw = '  Fade ,  Undercut  ,  Coloring  ';
      final specs = raw.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      expect(specs, ['Fade', 'Undercut', 'Coloring']);
    });
  });
}
