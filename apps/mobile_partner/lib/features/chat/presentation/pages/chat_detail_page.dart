import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../shared/models/rows.dart';

final partnerChatMessagesProvider = FutureProvider.autoDispose.family<List<ChatMessageRow>, String>((ref, chatId) async {
  final res = await ApiService().getChatMessages(chatId);
  final data = res.data['data'] as List;
  return data.map((e) => ChatMessageRow.fromJson(e as Map<String, dynamic>)).toList();
});

Future<List<ChatMessageRow>> _fetchPartnerMessages(String chatId) async {
  final res = await ApiService().getChatMessages(chatId);
  final data = res.data['data'] as List;
  return data.map((e) => ChatMessageRow.fromJson(e as Map<String, dynamic>)).toList();
}

/// Stream realtime pengganti polling Timer 3 detik.
/// SSE primer (`GET /chats/{id}/events`), fallback polling 15s + reconnect
/// bila channel realtime mati. `ref.invalidate` tetap bisa dipakai untuk refresh manual.
final partnerChatMessagesStreamProvider =
    StreamProvider.autoDispose.family<List<ChatMessageRow>, String>((ref, chatId) {
  final controller = StreamController<List<ChatMessageRow>>();
  final cancelToken = CancelToken();
  var disposed = false;

  Future<void> emitCurrent({bool reportError = false}) async {
    try {
      final rows = await _fetchPartnerMessages(chatId);
      if (!disposed) controller.add(rows);
    } catch (e) {
      if (reportError && !disposed) controller.addError(e);
    }
  }

  Future<void> pump() async {
    await emitCurrent(reportError: true);
    final sse = SseClient(ApiService().dio);
    while (!disposed) {
      try {
        await for (final _ in sse.subscribe('/chats/$chatId/events', cancelToken: cancelToken)) {
          if (disposed) break;
          await emitCurrent();
        }
      } catch (_) {
        if (disposed) break;
      }
      if (disposed) break;
      await Future.delayed(const Duration(seconds: 15));
      if (!disposed) await emitCurrent();
    }
    if (!controller.isClosed) await controller.close();
  }

  controller.onListen = pump;
  controller.onCancel = () {
    disposed = true;
    if (!cancelToken.isCancelled) cancelToken.cancel();
  };
  return controller.stream;
});

class PartnerChatDetailPage extends ConsumerStatefulWidget {
  final String chatId;
  const PartnerChatDetailPage({super.key, required this.chatId});

  @override
  ConsumerState<PartnerChatDetailPage> createState() => _PartnerChatDetailPageState();
}

class _PartnerChatDetailPageState extends ConsumerState<PartnerChatDetailPage> {
  final _controller = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ApiService().sendChatMessage(widget.chatId, {'body': text, 'messageType': 'TEXT'});
      _controller.clear();
      ref.invalidate(partnerChatMessagesStreamProvider(widget.chatId));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Send failed: $e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _attach() async {
    final picker = ImagePicker();
    // Kompresi native (max 1280px, quality 80) agar upload cepat & hemat kuota.
    final file = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1280,
      maxHeight: 1280,
      imageQuality: 80,
    );
    if (file == null) return;
    setState(() => _sending = true);
    try {
      final uploadRes = await ApiService().uploadMedia(file.path, 'provider', widget.chatId);
      final url = (uploadRes.data['data']['url'] ?? uploadRes.data['url']) as String?;
      await ApiService().sendChatMessage(widget.chatId, {'body': _controller.text.trim().isEmpty ? '📎 Lampiran' : _controller.text.trim(), 'messageType': 'IMAGE', 'attachmentUrl': url});
      _controller.clear();
      ref.invalidate(partnerChatMessagesStreamProvider(widget.chatId));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(partnerChatMessagesStreamProvider(widget.chatId));
    return Scaffold(
      appBar: AppBar(title: Text('Chat ${widget.chatId.substring(0, 8)}'), actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: () => ref.invalidate(partnerChatMessagesStreamProvider(widget.chatId)))]),
      body: Column(children: [
        Expanded(
          child: messagesAsync.when(
            data: (messages) => ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: messages.length,
              itemBuilder: (context, i) {
                final m = messages[i];
                final isProvider = m.senderRole == 'PROVIDER';
                return Align(alignment: isProvider ? Alignment.centerRight : Alignment.centerLeft, child: Container(margin: const EdgeInsets.symmetric(vertical: 4), padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: isProvider ? const Color(0xFF6C63FF) : Colors.grey[200], borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(m.body, style: TextStyle(color: isProvider ? Colors.white : Colors.black87)), if (m.attachmentUrl != null) Text('📎 ${m.attachmentUrl}', style: const TextStyle(fontSize: 11, color: Colors.blue))])));
              },
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ),
        Padding(padding: const EdgeInsets.all(8), child: Row(children: [IconButton(icon: const Icon(Icons.attach_file), onPressed: _attach), Expanded(child: TextField(controller: _controller, decoration: const InputDecoration(hintText: 'Balas pelanggan...', border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(24)))))), IconButton(icon: _sending ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send, color: Color(0xFF6C63FF)), onPressed: _send)])),
      ]),
    );
  }
}
