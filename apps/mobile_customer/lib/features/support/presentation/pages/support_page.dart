import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final faqsProvider = FutureProvider.autoDispose<List<FaqRow>>((ref) async {
  final res = await ApiService().getPublicFaqs();
  final data = (res.data['data'] ?? []) as List;
  return data.map((e) => FaqRow.fromJson(e as Map<String, dynamic>)).toList();
});

final policiesProvider = FutureProvider.autoDispose<List<PolicyRow>>((ref) async {
  final res = await ApiService().getPublicPolicies();
  final data = (res.data['data'] ?? []) as List;
  return data.map((e) => PolicyRow.fromJson(e as Map<String, dynamic>)).toList();
});

class SupportPage extends ConsumerStatefulWidget {
  const SupportPage({super.key});
  @override
  ConsumerState<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends ConsumerState<SupportPage> {
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedCategory = 'general';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final faqAsync = ref.watch(faqsProvider);
    final policyAsync = ref.watch(policiesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('FAQ', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('GET /public/faqs?tenantId - Deposit, pembatalan, reschedule & kalender', style: TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 12),
          faqAsync.when(
            data: (faqs) => faqs.isEmpty
                ? const Text('Belum ada FAQ.', style: TextStyle(color: Colors.grey))
                : Column(
                    children: faqs.map((f) => Card(
                      child: ExpansionTile(
                        title: Text(f.question, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: f.category != null ? Text(f.category!, style: const TextStyle(fontSize: 12, color: Colors.grey)) : null,
                        children: [Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: Text(f.answer, style: const TextStyle(fontSize: 13, color: Colors.black87)))],
                      ),
                    )).toList(),
                  ),
            loading: () => const Center(child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator())),
            error: (e, _) => Text('Gagal load FAQ: $e', style: const TextStyle(color: Colors.red, fontSize: 12)),
          ),
          const SizedBox(height: 16),
          Text('Kebijakan', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('GET /public/policies - Kebijakan deposit & pembatalan', style: TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 12),
          policyAsync.when(
            data: (pols) => pols.isEmpty
                ? const Text('Belum ada kebijakan.', style: TextStyle(color: Colors.grey))
                : Column(
                    children: pols.map((p) => Card(
                      child: ListTile(
                        title: Text(p.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(p.body, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
                          const SizedBox(height: 4),
                          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(12)), child: Text(p.type, style: TextStyle(color: Colors.blue[700], fontSize: 11, fontWeight: FontWeight.w600))),
                        ]),
                      ),
                    )).toList(),
                  ),
            loading: () => const Center(child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator())),
            error: (e, _) => Text('Gagal load kebijakan: $e', style: const TextStyle(color: Colors.red, fontSize: 12)),
          ),
          const Divider(height: 32),
          Text('Submit a Ticket', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _selectedCategory,
            decoration: const InputDecoration(labelText: 'Category', prefixIcon: Icon(Icons.category_outlined)),
            items: const [
              DropdownMenuItem(value: 'general', child: Text('General Inquiry')),
              DropdownMenuItem(value: 'booking', child: Text('Booking Issue')),
              DropdownMenuItem(value: 'payment', child: Text('Payment Issue')),
              DropdownMenuItem(value: 'account', child: Text('Account Issue')),
            ],
            onChanged: (v) => setState(() => _selectedCategory = v!),
          ),
          const SizedBox(height: 12),
          TextField(controller: _subjectController, decoration: const InputDecoration(labelText: 'Subject')),
          const SizedBox(height: 12),
          TextField(controller: _messageController, maxLines: 5, decoration: const InputDecoration(labelText: 'Message', alignLabelWithHint: true)),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitTicket,
            child: _isSubmitting
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitTicket() async {
    if (_subjectController.text.isEmpty || _messageController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      await ApiService().submitSupportTicket({
        'category': _selectedCategory,
        'subject': _subjectController.text,
        'message': _messageController.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ticket submitted!'), backgroundColor: Colors.green));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}
