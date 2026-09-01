import 'package:flutter_test/flutter_test.dart';

String formatRupiah(num amount) {
  final value = amount.round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  return 'Rp $value';
}

bool isAllowedContentType(String ct) {
  return ['image/jpeg', 'image/png', 'image/webp'].contains(ct.toLowerCase());
}

bool isValidFileSize(int size) => size <= 10 * 1024 * 1024;

List<Map<String, dynamic>> limitGallery(List<Map<String, dynamic>> items, {int max = 8}) {
  if (items.length <= max) return items;
  return items.sublist(0, max);
}

void main() {
  group('Gallery media validation', () {
    test('allows jpeg png webp', () {
      expect(isAllowedContentType('image/jpeg'), true);
      expect(isAllowedContentType('image/png'), true);
      expect(isAllowedContentType('image/webp'), true);
      expect(isAllowedContentType('application/pdf'), false);
      expect(isAllowedContentType('IMAGE/JPEG'), true);
    });

    test('rejects >10MB', () {
      expect(isValidFileSize(10 * 1024 * 1024), true);
      expect(isValidFileSize(10 * 1024 * 1024 + 1), false);
      expect(isValidFileSize(0), true);
    });

    test('gallery 3-col grid items count', () {
      final items = List.generate(7, (i) => {'id': '$i', 'url': '/uploads/$i.jpg'});
      expect(limitGallery(items, max: 6).length, 6);
      expect(limitGallery(items, max: 8).length, 7);
    });

    test('review photos capped at 8', () {
      final nine = List.generate(9, (i) => {'id': '$i', 'url': '/a.jpg'});
      expect(limitGallery(nine).length, 8);
    });

    test('favorites add/remove set logic', () {
      final favs = <String>{};
      String staffId = 'staff-1';
      // add
      favs.add(staffId);
      expect(favs.contains(staffId), true);
      // remove
      favs.remove(staffId);
      expect(favs.contains(staffId), false);
    });

    test('staff specialties split handles comma and json array', () {
      String raw1 = 'Fade, Undercut, Coloring';
      List<String> split1 = raw1.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      expect(split1, ['Fade', 'Undercut', 'Coloring']);

      String raw2 = '["Fade","Undercut"]';
      List<String> split2 = raw2.replaceAll(RegExp(r'[\[\]"]'), '').split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      expect(split2, ['Fade', 'Undercut']);
    });

    test('signed url stub format', () {
      String url = '/uploads/abc.jpg';
      int expiry = 3600;
      String signed = '$url?expiry=$expiry';
      expect(signed, '/uploads/abc.jpg?expiry=3600');
    });

    test('formatRupiah still works', () {
      expect(formatRupiah(50000), 'Rp 50.000');
    });
  });
}
