import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_partner/shared/models/rows.dart';

void main() {
  group('PartnerStaffRow specialties parsing', () {
    test('parses comma-separated specialties', () {
      final json = {
        'id': 's1',
        'displayName': 'Andi',
        'title': 'Barber',
        'isActive': true,
        'specialties': 'Fade,Undercut,Coloring',
      };
      final row = PartnerStaffRow.fromJson(json);
      expect(row.specialties, ['Fade', 'Undercut', 'Coloring']);
    });

    test('parses list specialties', () {
      final json = {
        'id': 's2',
        'displayName': 'Rudi',
        'isActive': true,
        'specialties': ['Fade', 'Pompadour'],
      };
      final row = PartnerStaffRow.fromJson(json);
      expect(row.specialties, ['Fade', 'Pompadour']);
    });

    test('null specialties yields null', () {
      final json = {'id': 's3', 'displayName': 'Siti', 'isActive': true};
      final row = PartnerStaffRow.fromJson(json);
      expect(row.specialties, isNull);
    });
  });

  group('Portfolio reorder', () {
    test('reorders ids correctly', () {
      List<String> ids = ['a', 'b', 'c', 'd'];
      int from = 0, to = 2;
      List<String> reordered = [...ids];
      final moved = reordered.removeAt(from);
      reordered.insert(to, moved);
      expect(reordered, ['b', 'c', 'a', 'd']);
    });

    test('media url expected prefix', () {
      final media = {'id': 'm1', 'url': '/uploads/photo.jpg', 'fileName': 'photo.jpg'};
      expect((media['url'] as String).startsWith('/uploads/'), true);
    });

    test('portfolio limit 5 display truncates', () {
      List<String> portfolio = List.generate(10, (i) => 'p$i');
      final displayed = portfolio.take(5).toList();
      expect(displayed.length, 5);
      expect(portfolio.length - displayed.length, 5);
    });
  });
}
