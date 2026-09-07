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
      appBar: AppBar(
        title: const Text('Tanggal Terblokir'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addBlockedDate,
        backgroundColor: DEKATColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: datesAsync.when(
        data: (dates) {
          if (dates.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_busy, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text('Belum ada tanggal terblokir'),
                  const SizedBox(height: 8),
                  const Text('Klik + untuk memblokir tanggal', style: TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: dates.length,
            itemBuilder: (context, index) {
              final d = dates[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const Icon(Icons.event_busy, color: Colors.red),
                  title: Text(d['date'] ?? ''),
                  subtitle: d['reason'] != null ? Text(d['reason'], style: const TextStyle(fontSize: 12)) : null,
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                    onPressed: () => _removeDate(d['date']),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
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
