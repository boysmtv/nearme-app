import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../shared/models/rows.dart';

final chatMessagesProvider = FutureProvider.autoDispose.family<List<ChatMessageRow>, String>((ref, chatId) async {
  final res = await ApiService().getChatMessages(chatId);
  final data = res.data['data'] as List;
  return data.map((e) => ChatMessageRow.fromJson(e as Map<String, dynamic>)).toList();
});

class ChatDetailPage extends ConsumerStatefulWidget {
  final String chatId;
  const ChatDetailPage({super.key, required this.chatId});

  @override
  ConsumerState<ChatDetailPage> createState() => _ChatDetailPageState();
}

class _ChatDetailPageState extends ConsumerState<ChatDetailPage> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _pollTimer;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted) ref.invalidate(chatMessagesProvider(widget.chatId));
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ApiService().sendChatMessage(widget.chatId, {'body': text, 'messageType': 'TEXT'});
      _controller.clear();
      ref.invalidate(chatMessagesProvider(widget.chatId));
      // scroll to bottom
      Future.delayed(const Duration(milliseconds: 300), () {
        if (_scrollController.hasClients) _scrollController.animateTo(_scrollController.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Send failed: $e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _sendAttachment() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery);
    if (file == null) return;
    setState(() => _sending = true);
    try {
      // reuse media upload via ApiService: POST /media/upload ownerType customer
      final uploadRes = await ApiService().uploadMedia(file.path, 'customer', widget.chatId);
      final url = (uploadRes.data['data']['url'] ?? uploadRes.data['url']) as String?;
      final body = _controller.text.trim().isEmpty ? '📎 Lampiran' : _controller.text.trim();
      await ApiService().sendChatMessage(widget.chatId, {'body': body, 'messageType': 'IMAGE', 'attachmentUrl': url});
      _controller.clear();
      ref.invalidate(chatMessagesProvider(widget.chatId));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(chatMessagesProvider(widget.chatId));
    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Chat ${widget.chatId.substring(0, 8)}', style: const TextStyle(fontSize: 16)),
          const Text('Realtime via SSE + polling 3s • WebSocket /ws-chat', style: TextStyle(fontSize: 10, color: Colors.white70)),
        ]),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: () => ref.invalidate(chatMessagesProvider(widget.chatId)))],
      ),
      body: Column(children: [
        Expanded(
          child: messagesAsync.when(
            data: (messages) {
              if (messages.isEmpty) return const Center(child: Text('Belum ada pesan — kirim pertama'));
              return ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(12),
                itemCount: messages.length,
                itemBuilder: (context, i) {
                  final m = messages[i];
                  final isCustomer = m.senderRole == 'CUSTOMER';
                  return Align(
                    alignment: isCustomer ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: isCustomer ? const Color(0xFF6C63FF) : Colors.grey[200],
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(m.body, style: TextStyle(color: isCustomer ? Colors.white : Colors.black87)),
                        if (m.attachmentUrl != null) Padding(padding: const EdgeInsets.only(top: 6), child: GestureDetector(onTap: () {}, child: Text('📎 ${m.attachmentUrl}', style: TextStyle(fontSize: 11, color: isCustomer ? Colors.white70 : Colors.blue, decoration: TextDecoration.underline)))),
                        const SizedBox(height: 4),
                        Text(m.createdAt != null ? '${m.createdAt!.hour}:${m.createdAt!.minute.toString().padLeft(2, '0')}' : '', style: TextStyle(fontSize: 10, color: isCustomer ? Colors.white70 : Colors.grey[600])),
                      ]),
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ),
        const Divider(height: 1),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(children: [
              IconButton(icon: const Icon(Icons.attach_file), onPressed: _sendAttachment),
              Expanded(child: TextField(controller: _controller, decoration: const InputDecoration(hintText: 'Ketik pesan...', border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(24))), contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10)), onSubmitted: (_) => _send())),
              const SizedBox(width: 8),
              _sending ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2)) : IconButton(icon: const Icon(Icons.send, color: Color(0xFF6C63FF)), onPressed: _send),
            ]),
          ),
        ),
      ]),
    );
  }
}
