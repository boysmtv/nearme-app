import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final blockedDatesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ApiService().dio.get('/provider/blocked-dates');
    final data = (res.data['data'] ?? []) as List;
    return data.cast<Map<String, dynamic>>();
  } catch (_) {
    return [];
  }
});

class BlockedDatesPage extends ConsumerStatefulWidget {
  const BlockedDatesPage({super.key});

  @override
  ConsumerState<BlockedDatesPage> createState() => _BlockedDatesPageState();
}

class _BlockedDatesPageState extends ConsumerState<BlockedDatesPage> {
  @override
  Widget build(BuildContext context) {
    final datesAsync = ref.watch(blockedDatesProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Tanggal Terblokir',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('Tutup jadwal pada hari libur',
                style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                    fontWeight: FontWeight.w400)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addBlockedDate,
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Blokir Tanggal',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: datesAsync.when(
        data: (dates) {
          if (dates.isEmpty) {
            return Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: RepaintBoundary(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: DEKATColors.primary
                                .withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.event_available_rounded,
                              size: 40, color: DEKATColors.primary),
                        ),
                        const SizedBox(height: 16),
                        const Text('Belum ada tanggal terblokir',
                            style: TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 16)),
                        const SizedBox(height: 6),
                        Text(
                          'Jadwal Anda terbuka setiap hari.\nKetuk tombol di bawah untuk memblokir tanggal.',
                          style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                              height: 1.5),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
            itemCount: dates.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return RepaintBoundary(
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.event_busy_rounded,
                              color: Colors.red, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${dates.length} Tanggal Diblokir',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14)),
                              const SizedBox(height: 2),
                              Text(
                                  'Pelanggan tidak bisa booking pada tanggal ini',
                                  style: TextStyle(
                                      color: Colors.grey[600], fontSize: 12)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }
              final d = dates[index - 1];
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.event_busy_rounded,
                              color: Colors.red, size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(d['date'] ?? '',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14)),
                              const SizedBox(height: 2),
                              Text(
                                (d['reason'] as String?)?.isNotEmpty == true
                                    ? d['reason'] as String
                                    : 'Tanpa keterangan',
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 12),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.delete_outline_rounded,
                                color: Colors.red, size: 20),
                            tooltip: 'Hapus blokir',
                            onPressed: () => _removeDate(d['date']),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(
            child: CircularProgressIndicator(color: DEKATColors.primary)),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Future<void> _addBlockedDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null) return;
    final reasonCtrl = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Alasan Pemblokiran'),
        content: TextField(controller: reasonCtrl, decoration: const InputDecoration(hintText: 'Contoh: Libur nasional'), autofocus: true),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(ctx, reasonCtrl.text), child: const Text('Simpan')),
        ],
      ),
    );
    if (reason == null) return;
    try {
      await ApiService().dio.post('/provider/blocked-dates', data: {
        'date': '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
        if (reason.isNotEmpty) 'reason': reason,
      });
      ref.invalidate(blockedDatesProvider);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tanggal diblokir'), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red));
    }
  }

  Future<void> _removeDate(String date) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Blokir?'),
        content: Text('Tanggal $date akan dibuka kembali.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hapus', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ApiService().dio.delete('/provider/blocked-dates/$date');
      ref.invalidate(blockedDatesProvider);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Blokir dihapus'), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red));
    }
  }
}
