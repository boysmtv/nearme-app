import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../shared/models/rows.dart';

final partnerChatMessagesProvider = FutureProvider.autoDispose.family<List<ChatMessageRow>, String>((ref, chatId) async {
  final res = await ApiService().getChatMessages(chatId);
  final data = res.data['data'] as List;
  return data.map((e) => ChatMessageRow.fromJson(e as Map<String, dynamic>)).toList();
});

class PartnerChatDetailPage extends ConsumerStatefulWidget {
  final String chatId;
  const PartnerChatDetailPage({super.key, required this.chatId});

  @override
  ConsumerState<PartnerChatDetailPage> createState() => _PartnerChatDetailPageState();
}

class _PartnerChatDetailPageState extends ConsumerState<PartnerChatDetailPage> {
  final _controller = TextEditingController();
  Timer? _timer;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) => ref.invalidate(partnerChatMessagesProvider(widget.chatId)));
  }

  @override
  void dispose() {
    _timer?.cancel();
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
      ref.invalidate(partnerChatMessagesProvider(widget.chatId));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Send failed: $e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _attach() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery);
    if (file == null) return;
    setState(() => _sending = true);
    try {
      final uploadRes = await ApiService().uploadMedia(file.path, 'provider', widget.chatId);
      final url = (uploadRes.data['data']['url'] ?? uploadRes.data['url']) as String?;
      await ApiService().sendChatMessage(widget.chatId, {'body': _controller.text.trim().isEmpty ? '📎 Lampiran' : _controller.text.trim(), 'messageType': 'IMAGE', 'attachmentUrl': url});
      _controller.clear();
      ref.invalidate(partnerChatMessagesProvider(widget.chatId));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(partnerChatMessagesProvider(widget.chatId));
    return Scaffold(
      appBar: AppBar(title: Text('Chat ${widget.chatId.substring(0, 8)}'), actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: () => ref.invalidate(partnerChatMessagesProvider(widget.chatId)))]),
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
