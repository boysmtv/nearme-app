import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:url_launcher/url_launcher.dart';

class _FaqRow {
  final String id;
  final String question;
  final String answer;
  final String? category;
  const _FaqRow({required this.id, required this.question, required this.answer, this.category});
  factory _FaqRow.fromJson(Map<String, dynamic> json) => _FaqRow(
        id: json['id'] as String,
        question: json['question'] as String,
        answer: json['answer'] as String,
        category: json['category'] as String?,
      );
}

class _PolicyRow {
  final String id;
  final String title;
  final String body;
  final String type;
  const _PolicyRow({required this.id, required this.title, required this.body, required this.type});
  factory _PolicyRow.fromJson(Map<String, dynamic> json) => _PolicyRow(
        id: json['id'] as String,
        title: json['title'] as String,
        body: json['body'] as String,
        type: json['type'] as String,
      );
}

final faqsProvider = FutureProvider.autoDispose<List<_FaqRow>>((ref) async {
  final res = await ApiService().getPublicFaqs();
  final data = (res.data['data'] ?? []) as List;
  return data.map((e) => _FaqRow.fromJson(e as Map<String, dynamic>)).toList();
});

final policiesProvider = FutureProvider.autoDispose<List<_PolicyRow>>((ref) async {
  final res = await ApiService().getPublicPolicies();
  final data = (res.data['data'] ?? []) as List;
  return data.map((e) => _PolicyRow.fromJson(e as Map<String, dynamic>)).toList();
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

  static const _categories = [
    ('general', 'Umum', Icons.chat_bubble_outline_rounded),
    ('booking', 'Booking', Icons.calendar_month_outlined),
    ('payment', 'Pembayaran', Icons.wallet_outlined),
    ('account', 'Akun', Icons.person_outline_rounded),
  ];

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _launchContact(String scheme, String target) async {
    final uri = Uri(scheme: scheme, path: target);
    try {
      await launchUrl(uri);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Tidak dapat membuka: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final faqAsync = ref.watch(faqsProvider);
    final policyAsync = ref.watch(policiesProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(title: const Text('Bantuan & Dukungan')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Help categories
          _sectionHeader('Kategori Bantuan', Icons.grid_view_rounded),
          const SizedBox(height: 4),
          Text(
            'Pilih kategori sesuai kendala Anda',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
          const SizedBox(height: 12),
          GridView.builder(
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 0.82,
            ),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final c = _categories[index];
              final selected = _selectedCategory == c.$1;
              return RepaintBoundary(
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => setState(() => _selectedCategory = c.$1),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                    decoration: BoxDecoration(
                      color: selected ? DEKATColors.primary.withValues(alpha: 0.08) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: selected ? DEKATColors.primary.withValues(alpha: 0.4) : Colors.grey.shade200,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: selected ? DEKATColors.primary : Colors.grey[100],
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            c.$3,
                            size: 20,
                            color: selected ? Colors.white : Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          c.$2,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: selected ? DEKATColors.primary : Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          // FAQ
          _sectionHeader('Pertanyaan Umum (FAQ)', Icons.help_outline_rounded),
          const SizedBox(height: 4),
          Text(
            'Jawaban seputar deposit, pembatalan, reschedule & kalender',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
          const SizedBox(height: 12),
          faqAsync.when(
            data: (faqs) => faqs.isEmpty
                ? _emptyNote('Belum ada FAQ.')
                : Column(
                    children: faqs.map((f) => RepaintBoundary(
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: ExpansionTile(
                              shape: const Border(),
                              collapsedShape: const Border(),
                              leading: Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: DEKATColors.primary.withValues(alpha: 0.08),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.question_mark_rounded,
                                  size: 18,
                                  color: DEKATColors.primary,
                                ),
                              ),
                              title: Text(f.question,
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                              subtitle: f.category != null
                                  ? Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[100],
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(f.category!,
                                            style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                                      ),
                                    )
                                  : null,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                                  child: Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8F9FF),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(f.answer,
                                        style: const TextStyle(fontSize: 13, color: Colors.black87, height: 1.5)),
                                  ),
                                )
                              ],
                            ),
                          ),
                        )).toList(),
                  ),
            loading: () => const Center(
                child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator())),
            error: (e, _) => Text('Gagal load FAQ: $e', style: const TextStyle(color: Colors.red, fontSize: 12)),
          ),
          const SizedBox(height: 20),
          // Policies
          _sectionHeader('Kebijakan', Icons.policy_outlined),
          const SizedBox(height: 4),
          Text(
            'Kebijakan deposit, pembatalan & penggunaan layanan',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
          const SizedBox(height: 12),
          policyAsync.when(
            data: (pols) => pols.isEmpty
                ? _emptyNote('Belum ada kebijakan.')
                : Column(
                    children: pols.map((p) => RepaintBoundary(
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(Icons.description_outlined,
                                      size: 20, color: Colors.blue[700]),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(p.title,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w700, fontSize: 14)),
                                        const SizedBox(height: 4),
                                        Text(p.body,
                                            maxLines: 3,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                                fontSize: 12, color: Colors.grey[600], height: 1.5)),
                                        const SizedBox(height: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.blue[50],
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Text(p.type,
                                              style: TextStyle(
                                                  color: Colors.blue[700],
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w700)),
                                        ),
                                      ]),
                                ),
                              ],
                            ),
                          ),
                        )).toList(),
                  ),
            loading: () => const Center(
                child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator())),
            error: (e, _) =>
                Text('Gagal load kebijakan: $e', style: const TextStyle(color: Colors.red, fontSize: 12)),
          ),
          const SizedBox(height: 20),
          // Contact actions
          _sectionHeader('Hubungi Kami', Icons.headset_mic_outlined),
          const SizedBox(height: 4),
          Text(
            'Tim kami siap membantu setiap hari 08.00–21.00 WIB',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _launchContact('tel', '1500123'),
                  icon: const Icon(Icons.call_outlined, size: 18),
                  label: const Text('1500-123'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: DEKATColors.primary,
                    side: BorderSide(color: DEKATColors.primary.withValues(alpha: 0.4)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _launchContact('mailto', 'cs@dekat.id'),
                  icon: const Icon(Icons.mail_outline_rounded, size: 18),
                  label: const Text('cs@dekat.id'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: DEKATColors.primary,
                    side: BorderSide(color: DEKATColors.primary.withValues(alpha: 0.4)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Ticket form
          _sectionHeader('Kirim Tiket Bantuan', Icons.confirmation_number_outlined),
          const SizedBox(height: 4),
          Text(
            'Ceritakan kendala Anda, kami akan segera menindaklanjuti',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
          const SizedBox(height: 12),
          Container(
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
                    const Icon(Icons.category_outlined, size: 16, color: DEKATColors.primary),
                    const SizedBox(width: 6),
                    Text(
                      'Kategori: ${_categoryLabel(_selectedCategory)}',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: DEKATColors.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Dari kategori di atas',
                        style: TextStyle(fontSize: 11, color: DEKATColors.primary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _subjectController,
                  decoration: InputDecoration(
                    labelText: 'Subjek',
                    hintText: 'Contoh: Gagal membayar booking',
                    prefixIcon: const Icon(Icons.subject_rounded),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _messageController,
                  maxLines: 5,
                  decoration: InputDecoration(
                    labelText: 'Pesan',
                    hintText: 'Jelaskan kendala Anda selengkap mungkin...',
                    alignLabelWithHint: true,
                    prefixIcon: const Icon(Icons.message_outlined),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _isSubmitting ? null : _submitTicket,
                    style: FilledButton.styleFrom(
                      backgroundColor: DEKATColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    icon: _isSubmitting
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.send_rounded, size: 18),
                    label: Text(
                      _isSubmitting ? 'Mengirim...' : 'Kirim Tiket',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
        const SizedBox(width: 8),
        Icon(icon, size: 18, color: DEKATColors.primary),
        const SizedBox(width: 6),
        Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, fontSize: 16)),
      ],
    );
  }

  Widget _emptyNote(String text) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Text(text, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, fontSize: 13)),
    );
  }

  String _categoryLabel(String value) {
    for (final c in _categories) {
      if (c.$1 == value) return c.$2;
    }
    return value;
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
