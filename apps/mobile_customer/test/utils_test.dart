import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/shared/models/rows.dart';

void main() {
  group('formatRupiah', () {
    test('formats zero', () {
      expect(formatRupiah(0), 'Rp 0');
    });

    test('formats number below thousand', () {
      expect(formatRupiah(500), 'Rp 500');
    });

    test('formats exactly one thousand', () {
      expect(formatRupiah(1000), 'Rp 1.000');
    });

    test('formats fifteen thousand', () {
      expect(formatRupiah(15000), 'Rp 15.000');
    });

    test('formats one hundred thousand', () {
      expect(formatRupiah(100000), 'Rp 100.000');
    });

    test('formats one million five hundred thousand', () {
      expect(formatRupiah(1500000), 'Rp 1.500.000');
    });

    test('formats large number with multiple separators', () {
      expect(formatRupiah(1234567890), 'Rp 1.234.567.890');
    });

    test('rounds float values', () {
      expect(formatRupiah(1500.7), 'Rp 1.501');
    });
  });

  group('parsePaginated', () {
    test('parses valid payload with pagination', () {
      final payload = {
        'data': [
          {'id': 'a'},
          {'id': 'b'},
        ],
        'pagination': {'total': 100},
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, ['a', 'b']);
      expect(result.total, 100);
    });

    test('handles missing data key', () {
      final payload = <String, dynamic>{};
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items, isEmpty);
      expect(result.total, 0);
    });

    test('handles null pagination total', () {
      final payload = {
        'data': [
          {'id': 'x'},
        ],
        'pagination': null,
      };
      final result = parsePaginated(payload, (e) => e['id'] as String);
      expect(result.items.length, 1);
      expect(result.total, 1);
    });
  });
}
