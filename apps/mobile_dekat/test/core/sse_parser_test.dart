import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SseParser', () {
    test('dispatches named event with single data line', () {
      final parser = SseParser();
      expect(parser.addLine('event: message'), isNull);
      expect(parser.addLine('data: {"a":1}'), isNull);
      final event = parser.addLine('');
      expect(event, isNotNull);
      expect(event!.name, 'message');
      expect(event.data, '{"a":1}');
    });

    test('dispatches event without explicit name', () {
      final parser = SseParser();
      parser.addLine('data: hello');
      final event = parser.addLine('');
      expect(event, isNotNull);
      expect(event!.name, isNull);
      expect(event.data, 'hello');
    });

    test('joins multi-line data with newline', () {
      final parser = SseParser();
      parser.addLine('data: line1');
      parser.addLine('data: line2');
      final event = parser.addLine('');
      expect(event!.data, 'line1\nline2');
    });

    test('ignores comment and heartbeat lines', () {
      final parser = SseParser();
      expect(parser.addLine(': ping'), isNull);
      expect(parser.addLine(':keep-alive'), isNull);
      parser.addLine('data: x');
      expect(parser.addLine('')!.data, 'x');
    });

    test('blank line without data yields nothing', () {
      final parser = SseParser();
      expect(parser.addLine(''), isNull);
      // event: without data is also dropped (spec)
      parser.addLine('event: message');
      expect(parser.addLine(''), isNull);
    });

    test('strips single leading space after colon', () {
      final parser = SseParser();
      parser.addLine('event:  spaced');
      parser.addLine('data:  two-spaces-kept-one');
      final event = parser.addLine('');
      expect(event!.name, ' spaced');
      expect(event.data, ' two-spaces-kept-one');
    });

    test('ignores unknown fields like id and retry', () {
      final parser = SseParser();
      parser.addLine('id: 42');
      parser.addLine('retry: 3000');
      parser.addLine('data: ok');
      expect(parser.addLine('')!.data, 'ok');
    });

    test('resets state between events', () {
      final parser = SseParser();
      parser.addLine('event: message');
      parser.addLine('data: first');
      final first = parser.addLine('');
      parser.addLine('data: second');
      final second = parser.addLine('');
      expect(first!.name, 'message');
      expect(first.data, 'first');
      expect(second!.name, isNull);
      expect(second.data, 'second');
    });

    test('flush emits trailing event without blank line', () {
      final parser = SseParser();
      parser.addLine('event: message');
      parser.addLine('data: tail');
      final event = parser.flush();
      expect(event!.data, 'tail');
    });

    test('handles Spring SseEmitter connected frame', () {
      final parser = SseParser();
      for (final line in <String>[
        'event:connected',
        'data:{"conversationId":"c1"}',
        '',
      ]) {
        parser.addLine(line);
      }
      // parser reusable setelah dispatch
      parser.addLine('event:message');
      parser.addLine('data:{"id":"m1"}');
      final event = parser.addLine('');
      expect(event!.name, 'message');
      expect(event.data, '{"id":"m1"}');
    });
  });
}
