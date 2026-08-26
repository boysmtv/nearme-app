import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_partner/shared/models/rows.dart';

void main() {
  group('formatRupiah', () {
    test('formats zero', () {
      expect(formatRupiah(0), 'Rp 0');
    });

    test('formats number below one thousand', () {
      expect(formatRupiah(999), 'Rp 999');
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

    test('formats large number', () {
      expect(formatRupiah(99999999), 'Rp 99.999.999');
    });

    test('rounds decimal values', () {
      expect(formatRupiah(1500.6), 'Rp 1.501');
      expect(formatRupiah(1500.4), 'Rp 1.500');
    });
  });
}
