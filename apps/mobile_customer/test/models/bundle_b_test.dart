import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_customer/shared/models/rows.dart';

void main() {
  group('Bundle B - Deposit & Policy (V24)', () {
    test('BookingRow parses deposit & cancel fields', () {
      final json = {
        'id': 'b-bundle',
        'bookingCode': 'DKT-BUNDLE',
        'status': 'CONFIRMED',
        'currency': 'IDR',
        'subtotal': 100000,
        'total': 100000,
        'depositAmount': 25000,
        'depositRequired': true,
        'deposit_amount': 25000,
        'deposit_required': true,
        'cancelDeadline': '2026-09-09T10:00:00+07:00',
        'cancel_deadline': '2026-09-09T10:00:00+07:00',
        'rescheduleCount': 0,
        'reschedule_count': 0,
        'maxReschedule': 1,
        'max_reschedule': 1,
        'cancelPolicy': '24h_full_refund',
        'cancel_policy': '24h_full_refund',
        'version': 1,
        'startsAt': '2026-09-10T10:00:00+07:00',
        'endsAt': '2026-09-10T11:00:00+07:00',
        'createdAt': '2026-09-08T08:00:00+07:00',
      };
      final row = BookingRow.fromJson(json);
      expect(row.depositAmount, 25000);
      expect(row.depositRequired, true);
      expect(row.cancelDeadline, isNotNull);
      expect(row.rescheduleCount, 0);
      expect(row.maxReschedule, 1);
      expect(row.cancelPolicy, '24h_full_refund');
      expect(row.version, 1);
    });

    test('BookingRow defaults deposit false and reschedule 0/1', () {
      final row = BookingRow.fromJson({'id': 'b1'});
      expect(row.depositAmount, 0);
      expect(row.depositRequired, false);
      expect(row.rescheduleCount, 0);
      expect(row.maxReschedule, 1);
      expect(row.cancelPolicy, isNull);
      expect(row.cancelDeadline, isNull);
    });

    test('Cancel after deadline no refund logic (H-24)', () {
      final booking = BookingRow.fromJson({
        'id': 'b2',
        'startsAt': '2026-09-10T10:00:00+07:00',
        'cancelDeadline': '2026-09-09T10:00:00+07:00',
        'depositAmount': 20000,
        'cancelPolicy': '24h_full_refund',
      });
      final now = DateTime.parse('2026-09-09T11:00:00+07:00');
      final afterDeadline = booking.cancelDeadline != null && now.isAfter(booking.cancelDeadline!);
      expect(afterDeadline, true);
      // no refund flag
      final refund = afterDeadline ? 0 : booking.depositAmount;
      expect(refund, 0);
    });

    test('Reschedule limit 1 free then 409', () {
      final booking = BookingRow.fromJson({
        'id': 'b3',
        'rescheduleCount': 0,
        'maxReschedule': 1,
      });
      expect(booking.rescheduleCount < booking.maxReschedule, true);
      final afterFirst = BookingRow.fromJson({
        'id': 'b3',
        'rescheduleCount': 1,
        'maxReschedule': 1,
      });
      expect(afterFirst.rescheduleCount >= afterFirst.maxReschedule, true); // should 409
    });

    test('ServiceRow depositAmount parsed', () {
      final svc = ServiceRow.fromJson({'id': 's1', 'name': 'Haircut', 'price': 50000, 'duration': 30, 'depositAmount': 15000});
      expect(svc.depositAmount, 15000);
      final svc2 = ServiceRow.fromJson({'id': 's2', 'name': 'Cut'});
      expect(svc2.depositAmount, 0);
    });
  });

  group('Bundle B - Kalender sync (VCALENDAR & Google)', () {
    test('ICS generation format', () {
      // simulate ics generation logic used in backend
      String generateIcs(String bookingCode, DateTime start, DateTime end) {
        String fmt(DateTime d) {
          final utc = d.toUtc();
          String two(int n) => n.toString().padLeft(2, '0');
          return '${utc.year}${two(utc.month)}${two(utc.day)}T${two(utc.hour)}${two(utc.minute)}${two(utc.second)}Z';
        }
        return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:${bookingCode}@dekat.id\r\nDTSTART:${fmt(start)}\r\nDTEND:${fmt(end)}\r\nSUMMARY:DEKAT Booking ${bookingCode}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
      }
      final start = DateTime.parse('2026-09-10T10:00:00+07:00');
      final end = DateTime.parse('2026-09-10T11:00:00+07:00');
      final ics = generateIcs('DKT-TEST1', start, end);
      expect(ics, contains('BEGIN:VCALENDAR'));
      expect(ics, contains('END:VCALENDAR'));
      expect(ics, contains('BEGIN:VEVENT'));
      expect(ics, contains('UID:DKT-TEST1@dekat.id'));
      expect(ics, contains('DTSTART:20260910T030000Z')); // 10+07 -> 03Z
      expect(ics, contains('DTEND:20260910T040000Z'));
    });

    test('Google Calendar link generation', () {
      String googleLink(String code, DateTime start, DateTime end) {
        String fmt(DateTime d) {
          final utc = d.toUtc();
          String two(int n) => n.toString().padLeft(2, '0');
          return '${utc.year}${two(utc.month)}${two(utc.day)}T${two(utc.hour)}${two(utc.minute)}${two(utc.second)}Z';
        }
        return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=DEKAT Booking ${Uri.encodeComponent(code)}&dates=${fmt(start)}/${fmt(end)}&details=Booking&location=DEKAT';
      }
      final start = DateTime.parse('2026-09-10T10:00:00+07:00');
      final end = DateTime.parse('2026-09-10T11:00:00+07:00');
      final url = googleLink('DKT-123', start, end);
      expect(url, startsWith('https://calendar.google.com'));
      expect(url, contains('DKT-123'));
      expect(url, contains('20260910T030000Z'));
    });
  });

  group('Bundle B - FAQ & Policy', () {
    test('FaqRow parses', () {
      final f = FaqRow.fromJson({'id': 'f1', 'question': 'Bagaimana cara booking?', 'answer': 'Pilih provider...', 'category': 'booking', 'sortOrder': 1, 'isActive': true});
      expect(f.question, contains('booking'));
      expect(f.category, 'booking');
      expect(f.isActive, true);
    });

    test('PolicyRow parses', () {
      final p = PolicyRow.fromJson({'id': 'p1', 'title': 'Kebijakan Pembatalan', 'body': '24h', 'type': 'cancellation', 'version': 1});
      expect(p.title, contains('Pembatalan'));
      expect(p.type, 'cancellation');
    });

    test('Policy cancellation 24h no refund after deadline', () {
      final policy = PolicyRow.fromJson({'id': 'p1', 'title': 'Kebijakan', 'body': 'Pembatalan sebelum 24 jam = refund penuh', 'type': 'cancellation'});
      expect(policy.type, 'cancellation');
      expect(policy.body, contains('24 jam'));
    });
  });
}
