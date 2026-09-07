import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class FaqRow {
  final String id;
  final String question;
  final String answer;
  final String? category;
  FaqRow({required this.id, required this.question, required this.answer, this.category});
  factory FaqRow.fromJson(Map<String, dynamic> j) => FaqRow(id: j['id'], question: j['question'], answer: j['answer'], category: j['category']);
}

final providerFaqsProvider = FutureProvider.autoDispose<List<FaqRow>>((ref) async {
  final res = await ApiService().getProviderFaqs();
  final data = (res.data['data'] ?? []) as List;
  return data.map((e) => FaqRow.fromJson(e as Map<String, dynamic>)).toList();
});

class ProviderFaqPage extends ConsumerStatefulWidget {
  const ProviderFaqPage({super.key});
  @override
  ConsumerState<ProviderFaqPage> createState() => _ProviderFaqPageState();
}

class _ProviderFaqPageState extends ConsumerState<ProviderFaqPage> {
  final _q = TextEditingController();
  final _a = TextEditingController();
  String _cat = 'booking';

  @override
  void dispose() { _q.dispose(); _a.dispose(); super.dispose(); }

  Future<void> _create() async {
    if (_q.text.isEmpty || _a.text.isEmpty) return;
    await ApiService().createProviderFaq({'question': _q.text, 'answer': _a.text, 'category': _cat});
    _q.clear(); _a.clear();
    ref.invalidate(providerFaqsProvider);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('FAQ created'), backgroundColor: Colors.green));
  }

  @override
  Widget build(BuildContext context) {
    final faqsAsync = ref.watch(providerFaqsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('FAQ Management')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Kelola FAQ - GET /public/faqs?tenantId', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          TextField(controller: _q, decoration: const InputDecoration(labelText: 'Pertanyaan', border: OutlineInputBorder())),
          const SizedBox(height: 8),
          TextField(controller: _a, decoration: const InputDecoration(labelText: 'Jawaban', border: OutlineInputBorder()), maxLines: 3),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(value: _cat, items: const [DropdownMenuItem(value: 'booking', child: Text('booking')), DropdownMenuItem(value: 'pembayaran', child: Text('pembayaran')), DropdownMenuItem(value: 'kalender', child: Text('kalender'))], onChanged: (v) => setState(() => _cat = v!), decoration: const InputDecoration(labelText: 'Kategori')),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: _create, child: const Text('Tambah FAQ')),
          const Divider(height: 32),
          faqsAsync.when(
            data: (faqs) => faqs.isEmpty ? const Text('Belum ada FAQ', style: TextStyle(color: Colors.grey)) : Column(children: faqs.map((f) => Card(child: ExpansionTile(title: Text(f.question, style: const TextStyle(fontWeight: FontWeight.w600)), subtitle: f.category != null ? Text(f.category!) : null, children: [Padding(padding: const EdgeInsets.all(16), child: Text(f.answer))], trailing: IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () async { await ApiService().deleteProviderFaq(f.id); ref.invalidate(providerFaqsProvider); })))) .toList()),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Error: $e', style: const TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
