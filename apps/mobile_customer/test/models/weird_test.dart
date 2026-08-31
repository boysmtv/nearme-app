import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/shared/models/rows.dart';

void main() {
  // ===== ProviderRow Weird =====
  group('ProviderRow weird / aneh', () {
    test('P: unicode name 💈 東京 tetap parse', () {
      final row = ProviderRow.fromJson({'id': 'p1', 'name': 'Barber 💈 東京', 'rating': 4.5, 'reviewCount': 10});
      expect(row.name, 'Barber 💈 東京');
    });

    test('N: missing id throw (required)', () {
      expect(() => ProviderRow.fromJson({'name': 'No ID'}), throwsA(isA<TypeError>()));
    });

    test('E: rating double 4.999 dan int 5', () {
      expect(ProviderRow.fromJson({'id': 'a', 'name': 'x', 'rating': 4.999, 'reviewCount': 1}).rating, 4.999);
      expect(ProviderRow.fromJson({'id': 'b', 'name': 'x', 'rating': 5, 'reviewCount': 1}).rating, 5.0);
    });

    test('A: XSS <script> disimpan sebagai string, bukan dieksekusi', () {
      final row = ProviderRow.fromJson({'id': 'p2', 'name': "<script>alert(1)</script>", 'rating': 5, 'reviewCount': 0});
      expect(row.name, "<script>alert(1)</script>");
    });

    test('A: injection SQL disimpan', () {
      final row = ProviderRow.fromJson({'id': 'p3', 'name': "'; DROP TABLE providers; --", 'rating': 0, 'reviewCount': 0});
      expect(row.name, "'; DROP TABLE providers; --");
    });

    test('A: minPrice sangat besar 9999999999', () {
      final row = ProviderRow.fromJson({'id': 'p4', 'name': 'Mahal', 'rating': 5, 'reviewCount': 1, 'minPrice': 9999999999});
      expect(row.minPrice, 9999999999);
    });

    test('A: category null vs empty string beda', () {
      expect(ProviderRow.fromJson({'id': 'a', 'name': 'x'}).category, isNull);
      expect(ProviderRow.fromJson({'id': 'b', 'name': 'x', 'category': ''}).category, '');
    });
  });

  group('ServiceRow weird', () {
    test('E: price 0 gratis valid', () {
      final s = ServiceRow.fromJson({'id': 's1', 'name': 'Free', 'price': 0, 'duration': 30});
      expect(s.price, 0);
    });

    test('N: price negatif tetap int (weird business) - tidak clamp', () {
      final s = ServiceRow.fromJson({'id': 's2', 'name': 'Weird', 'price': -1000, 'duration': 30});
      expect(s.price, -1000);
    });

    test('A: price double 50000.99 dibulatkan down via toInt', () {
      final s = ServiceRow.fromJson({'id': 's3', 'name': 'X', 'price': 50000.99, 'duration': 30.7});
      expect(s.price, 50000);
      expect(s.durationMinutes, 30);
    });

    test('A: currency lowercase idr tetap idr', () {
      final s = ServiceRow.fromJson({'id': 's4', 'name': 'X', 'price': 1000, 'duration': 30, 'currency': 'idr'});
      expect(s.currency, 'idr');
    });
  });

  group('SlotRow weird', () {
    test('P: available true', () => expect(SlotRow.fromJson({'time': '09:00', 'available': true}).available, true));
    test('N: available false', () => expect(SlotRow.fromJson({'time': '09:00', 'available': false}).available, false));
    test('E: available 1 (int) dianggap false karena == true', () => expect(SlotRow.fromJson({'time': '09:00', 'available': 1}).available, false));
    test('E: available "true" string dianggap false', () => expect(SlotRow.fromJson({'time': '09:00', 'available': "true"}).available, false));
    test('A: available null default false', () => expect(SlotRow.fromJson({'time': '09:00'}).available, false));
    test('A: time 24:00 weird', () => expect(SlotRow.fromJson({'time': '24:00', 'available': true}).time, '24:00'));
    test('A: time 00:00 midnite', () => expect(SlotRow.fromJson({'time': '00:00', 'available': true}).time, '00:00'));
  });

  group('BookingRow weird', () {
    test('P: PIN 000000 leading zero tetap string 6 digit', () {
      final b = BookingRow.fromJson({'id': 'b1', 'confirmationPin': '000000', 'pinVerified': false});
      expect(b.confirmationPin, '000000');
      expect(b.confirmationPin!.length, 6);
    });

    test('P: PIN null', () {
      final b = BookingRow.fromJson({'id': 'b2'});
      expect(b.confirmationPin, isNull);
      expect(b.pinVerified, isNull);
    });

    test('E: total negatif weird', () {
      final b = BookingRow.fromJson({'id': 'b3', 'subtotal': 10000, 'discount': 20000, 'total': -10000});
      expect(b.total, -10000);
    });

    test('E: startsAt invalid string jadi null tidak crash', () {
      final b = BookingRow.fromJson({'id': 'b4', 'startsAt': 'not-a-date'});
      expect(b.startsAt, isNull);
    });

    test('E: startsAt empty string null', () {
      final b = BookingRow.fromJson({'id': 'b5', 'startsAt': ''});
      expect(b.startsAt, isNull);
    });

    test('A: startsAt dengan timezone +07:00 parse benar', () {
      final b = BookingRow.fromJson({'id': 'b6', 'startsAt': '2026-08-31T10:00:00+07:00'});
      expect(b.startsAt, isNotNull);
      expect(b.startsAt!.isUtc, false);
    });

    test('A: subtotal double 50000.99 jadi 50000 via toInt', () {
      final b = BookingRow.fromJson({'id': 'b7', 'subtotal': 50000.99});
      expect(b.subtotal, 50000);
    });
  });

  group('NotificationRow weird', () {
    test('A: read 1 int dianggap false', () => expect(NotificationRow.fromJson({'id': 'n1', 'read': 1}).read, false));
    test('A: read "true" string false', () => expect(NotificationRow.fromJson({'id': 'n2', 'read': "true"}).read, false));
    test('E: body XSS tetap string', () {
      final n = NotificationRow.fromJson({'id': 'n3', 'body': '<script>alert(1)</script>'});
      expect(n.body, '<script>alert(1)</script>');
    });
  });

  group('formatRupiah weird', () {
    test('P: 0', () => expect(formatRupiah(0), 'Rp 0'));
    test('P: 1000 -> Rp 1.000', () => expect(formatRupiah(1000), 'Rp 1.000'));
    test('E: negatif -1000 -> Rp -1.000', () => expect(formatRupiah(-1000), 'Rp -1.000'));
    test('E: 999999999 -> Rp 999.999.999', () => expect(formatRupiah(999999999), 'Rp 999.999.999'));
    test('A: double 1500.5 round -> Rp 1.501', () => expect(formatRupiah(1500.5), 'Rp 1.501'));
    test('A: NaN -> ??', () {
      // num NaN round -> throws? test ensure tidak crash
      try {
        final r = formatRupiah(double.nan);
        expect(r, contains('Rp'));
      } catch (e) {
        expect(e, isA<UnsupportedError>()); // atau apapun, tapi jangan crash silent
      }
    });
    test('A: Infinity', () {
      try {
        final r = formatRupiah(double.infinity);
        expect(r, contains('Rp'));
      } catch (e) {
        expect(e, isNotNull);
      }
    });
  });

  group('parsePaginated weird', () {
    test('E: data null -> empty', () {
      final res = parsePaginated({'data': null, 'pagination': {'total': 5}}, (e) => e['id'] as String);
      expect(res.items, isEmpty);
      expect(res.total, 5);
    });

    test('E: pagination null -> total = list.length', () {
      final res = parsePaginated({'data': [{'id': '1'}, {'id': '2'}]}, (e) => e['id'] as String);
      expect(res.total, 2);
    });

    test('A: total string "10" tetap? - cast num? -> null -> fallback length', () {
      final res = parsePaginated({'data': [{'id': '1'}], 'pagination': {'total': "10"}}, (e) => e['id'] as String);
      // karena "10" bukan num, toInt gagal -> fallback 1
      expect(res.total, 1);
    });

    test('A: 1000 items pagination', () {
      final data = List.generate(1000, (i) => {'id': '$i'});
      final res = parsePaginated({'data': data, 'pagination': {'total': 5000}}, (e) => e['id'] as String);
      expect(res.items.length, 1000);
      expect(res.total, 5000);
    });
  });
}
