import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Kelola FAQ',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('Jawab pertanyaan umum pelanggan',
                style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                    fontWeight: FontWeight.w400)),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        children: [
          RepaintBoundary(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: DEKATColors.primary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.help_outline_rounded,
                            color: DEKATColors.primary, size: 22),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Tambah FAQ Baru',
                                style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15)),
                            SizedBox(height: 2),
                            Text(
                                'Tulis pertanyaan yang sering ditanyakan pelanggan',
                                style: TextStyle(
                                    color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                      controller: _q,
                      decoration: InputDecoration(
                        labelText: 'Pertanyaan',
                        hintText: 'Contoh: Apakah bisa reschedule?',
                        prefixIcon: const Icon(Icons.quiz_outlined,
                            color: DEKATColors.primary),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      )),
                  const SizedBox(height: 12),
                  TextField(
                      controller: _a,
                      decoration: InputDecoration(
                        labelText: 'Jawaban',
                        hintText: 'Tulis jawaban yang jelas dan ramah',
                        prefixIcon: const Icon(Icons.chat_bubble_outline_rounded,
                            color: DEKATColors.primary),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      maxLines: 3),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                      initialValue: _cat,
                      items: const [
                        DropdownMenuItem(
                            value: 'booking', child: Text('Booking')),
                        DropdownMenuItem(
                            value: 'pembayaran',
                            child: Text('Pembayaran')),
                        DropdownMenuItem(
                            value: 'kalender', child: Text('Kalender'))
                      ],
                      onChanged: (v) => setState(() => _cat = v!),
                      decoration: InputDecoration(
                        labelText: 'Kategori',
                        prefixIcon: const Icon(Icons.category_outlined,
                            color: DEKATColors.primary),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      )),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _create,
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Tambah FAQ',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: DEKATColors.primary,
                        foregroundColor: Colors.white,
                        padding:
                            const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: DEKATColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.format_list_bulleted_rounded,
                    color: DEKATColors.primary, size: 16),
              ),
              const SizedBox(width: 8),
              const Text('Daftar FAQ',
                  style:
                      TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 8),
          faqsAsync.when(
            data: (faqs) {
              if (faqs.isEmpty) {
                return RepaintBoundary(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 28),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: DEKATColors.primary
                                .withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.quiz_rounded,
                              size: 32, color: DEKATColors.primary),
                        ),
                        const SizedBox(height: 12),
                        const Text('Belum ada FAQ',
                            style: TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 15)),
                        const SizedBox(height: 4),
                        Text(
                            'Tambahkan FAQ pertama agar pelanggan mudah menemukan jawaban.',
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 12),
                            textAlign: TextAlign.center),
                      ],
                    ),
                  ),
                );
              }
              return Column(
                children: faqs
                    .map((f) => RepaintBoundary(
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border:
                                  Border.all(color: Colors.grey.shade200),
                            ),
                            child: ExpansionTile(
                              shape: const Border(),
                              leading: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: _categoryColor(f.category)
                                      .withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(
                                    _categoryIcon(f.category),
                                    color: _categoryColor(f.category),
                                    size: 20),
                              ),
                              title: Text(f.question,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14)),
                              subtitle: f.category != null
                                  ? Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: _categoryColor(f.category)
                                              .withValues(alpha: 0.12),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          _categoryLabel(f.category!),
                                          style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                              color: _categoryColor(
                                                  f.category)),
                                        ),
                                      ),
                                    )
                                  : null,
                              trailing: IconButton(
                                  icon: const Icon(
                                      Icons.delete_outline_rounded,
                                      color: Colors.red,
                                      size: 20),
                                  tooltip: 'Hapus FAQ',
                                  onPressed: () async {
                                    await ApiService()
                                        .deleteProviderFaq(f.id);
                                    ref.invalidate(providerFaqsProvider);
                                  }),
                              children: [
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                      16, 0, 16, 12),
                                  child: Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8F9FF),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(f.answer,
                                        style: TextStyle(
                                            color: Colors.grey[700],
                                            fontSize: 13,
                                            height: 1.5)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ))
                    .toList(),
              );
            },
            loading: () => const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                  child: CircularProgressIndicator(
                      color: DEKATColors.primary)),
            ),
            error: (e, _) => Text('Error: $e',
                style: const TextStyle(color: Colors.red)),
          ),
          const SizedBox(height: 16),
          RepaintBoundary(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.policy_outlined,
                          color: DEKATColors.primary, size: 20),
                      SizedBox(width: 8),
                      Text('Tips Kebijakan Layanan',
                          style: TextStyle(
                              fontWeight: FontWeight.w800, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _tipRow('Tulis jawaban singkat, jelas, dan ramah.'),
                  _tipRow('Pilih kategori yang tepat agar mudah dicari.'),
                  _tipRow('Perbarui FAQ saat kebijakan berubah.'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tipRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 2),
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: const Color(0xFFE6F7EE),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.check_rounded,
                color: Color(0xFF4CAF50), size: 14),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text,
                style: TextStyle(color: Colors.grey[700], fontSize: 13)),
          ),
        ],
      ),
    );
  }
}

String _categoryLabel(String category) {
  switch (category) {
    case 'pembayaran':
      return 'Pembayaran';
    case 'kalender':
      return 'Kalender';
    default:
      return 'Booking';
  }
}

IconData _categoryIcon(String? category) {
  switch (category) {
    case 'pembayaran':
      return Icons.payments_outlined;
    case 'kalender':
      return Icons.calendar_month_outlined;
    default:
      return Icons.event_note_outlined;
  }
}

Color _categoryColor(String? category) {
  switch (category) {
    case 'pembayaran':
      return const Color(0xFF4CAF50);
    case 'kalender':
      return const Color(0xFFFF9800);
    default:
      return DEKATColors.primary;
  }
}
