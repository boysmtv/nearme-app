import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_partner/features/payment/presentation/pages/payment_page.dart' as payment;

void main() {
  group('formatRupiah (payment_page)', () {
    test('formats zero', () {
      expect(payment.formatRupiah(0), 'Rp 0');
    });

    test('formats small amount', () {
      expect(payment.formatRupiah(500), 'Rp 500');
    });

    test('formats exactly one thousand', () {
      expect(payment.formatRupiah(1000), 'Rp 1.000');
    });

    test('formats fifteen thousand', () {
      expect(payment.formatRupiah(15000), 'Rp 15.000');
    });

    test('formats one hundred thousand', () {
      expect(payment.formatRupiah(100000), 'Rp 100.000');
    });

    test('formats one million', () {
      expect(payment.formatRupiah(1000000), 'Rp 1.000.000');
    });

    test('formats one point five million', () {
      expect(payment.formatRupiah(1500000), 'Rp 1.500.000');
    });

    test('formats large amount', () {
      expect(payment.formatRupiah(99999999), 'Rp 99.999.999');
    });

    test('rounds decimal values', () {
      expect(payment.formatRupiah(1500.6), 'Rp 1.501');
      expect(payment.formatRupiah(1500.4), 'Rp 1.500');
    });
  });
}
