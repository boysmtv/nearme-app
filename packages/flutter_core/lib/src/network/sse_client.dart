import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';

/// Satu event Server-Sent Events (SSE) yang sudah di-parse.
class SseEvent {
  /// Nama event dari field `event:` (mis. `message`, `connected`).
  /// Null bila server tidak mengirim nama event.
  final String? name;

  /// Payload gabungan dari field `data:` (multi-line digabung `\n`).
  final String data;

  const SseEvent({this.name, required this.data});
}

/// Parser frame SSE yang murni (tanpa I/O) sehingga mudah di-unit-test.
///
/// Protokol: https://html.spec.whatwg.org/multipage/server-sent-events.html
/// - Baris kosong = dispatch event yang sedang dirakit.
/// - Baris diawali `:` = komentar/heartbeat, diabaikan.
/// - Field yang dikenali: `event:` dan `data:` (boleh multi-line).
class SseParser {
  String? _eventName;
  final List<String> _dataLines = <String>[];

  /// Umpankan satu baris hasil decode. Mengembalikan [SseEvent] yang
  /// lengkap setiap menemui baris kosong, atau null bila belum lengkap.
  SseEvent? addLine(String line) {
    if (line.isEmpty) return _dispatch();
    if (line.startsWith(':')) return null; // komentar / heartbeat SSE
    final colon = line.indexOf(':');
    final field = colon == -1 ? line : line.substring(0, colon);
    var value = colon == -1 ? '' : line.substring(colon + 1);
    // Satu spasi setelah ':' adalah bagian format, bukan bagian value.
    if (value.startsWith(' ')) value = value.substring(1);
    switch (field) {
      case 'event':
        _eventName = value;
      case 'data':
        _dataLines.add(value);
      default:
        break; // id:, retry: dll diabaikan dengan sengaja
    }
    return null;
  }

  /// Dipanggil saat stream berakhir tanpa baris kosong penutup.
  /// Server yang patuh selalu menutup dengan baris kosong; ini toleransi saja.
  SseEvent? flush() => _dispatch();

  SseEvent? _dispatch() {
    if (_dataLines.isEmpty) {
      _eventName = null;
      return null;
    }
    final event = SseEvent(name: _eventName, data: _dataLines.join('\n'));
    _eventName = null;
    _dataLines.clear();
    return event;
  }
}

/// Client SSE di atas [Dio] agar interceptor auth/refresh/retry tetap berlaku.
///
/// Catatan threading (sesuai arsitektur SSE):
/// - Koneksi HTTP long-lived berjalan sebagai I/O async di event loop,
///   BUKAN di thread terpisah — main isolate tidak diblokir selama menunggu.
/// - Parsing dilakukan per baris teks pendek (murah, sync di main isolate OK).
/// - Jangan dipakai untuk payload raksasa; untuk itu gunakan isolate.
class SseClient {
  final Dio dio;

  SseClient(this.dio);

  /// Buka koneksi SSE `GET [path]` dan yield setiap event yang lengkap.
  ///
  /// - Header `Accept: text/event-stream` dioverride eksplisit karena
  ///   default client mengirim `application/json` (bisa 406 di server).
  /// - `receiveTimeout` dioverride longgar karena koneksi SSE memang idle
  ///   di antara event; pemutusan tetap ditangani reconnect oleh pemanggil.
  /// - Batalkan via [cancelToken] (mis. saat provider di-dispose).
  Stream<SseEvent> subscribe(
    String path, {
    CancelToken? cancelToken,
    Map<String, dynamic>? queryParameters,
  }) async* {
    final res = await dio.get<ResponseBody>(
      path,
      queryParameters: queryParameters,
      options: Options(
        responseType: ResponseType.stream,
        headers: const <String, dynamic>{'Accept': 'text/event-stream'},
        receiveTimeout: const Duration(minutes: 5),
      ),
      cancelToken: cancelToken,
    );
    final parser = SseParser();
    // ResponseBody.stream adalah Stream<Uint8List>; cast ke List<int> dulu
    // karena generic Dart invariant terhadap StreamTransformer utf8.
    await for (final line in res.data!.stream
        .cast<List<int>>()
        .transform(utf8.decoder)
        .transform(const LineSplitter())) {
      final event = parser.addLine(line);
      if (event != null) yield event;
    }
    final tail = parser.flush();
    if (tail != null) yield tail;
  }
}
