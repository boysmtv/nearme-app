import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class PartnerStats {
  final int todayBookings;
  final int todayRevenue;
  final int weekBookings;
  final int weekRevenue;
  final int totalCustomers;
  final double avgRating;
  final List<Map<String, dynamic>> recentBookings;
  const PartnerStats({
    required this.todayBookings,
    required this.todayRevenue,
    required this.weekBookings,
    required this.weekRevenue,
    required this.totalCustomers,
    required this.avgRating,
    required this.recentBookings,
  });
}

final earningsProvider = FutureProvider.autoDispose<PartnerStats>((ref) async {
  final api = ApiService();
  final statsRes = await api.getPartnerDashboardStats();
  final stats = (statsRes.data['data'] ?? {}) as Map<String, dynamic>;
  List<Map<String, dynamic>> recent = [];
  try {
    final recentRes = await api.getPartnerRecentBookings();
    recent = ((recentRes.data['data'] ?? []) as List).cast<Map<String, dynamic>>();
  } catch (_) {}
  return PartnerStats(
    todayBookings: (stats['todayBookings'] as num?)?.toInt() ?? 0,
    todayRevenue: (stats['todayRevenue'] as num?)?.toInt() ?? 0,
    weekBookings: (stats['weekBookings'] as num?)?.toInt() ?? 0,
    weekRevenue: (stats['weekRevenue'] as num?)?.toInt() ?? 0,
    totalCustomers: (stats['totalCustomers'] as num?)?.toInt() ?? 0,
    avgRating: (stats['avgRating'] as num?)?.toDouble() ?? 0,
    recentBookings: recent,
  );
});

class EarningsPage extends ConsumerWidget {
  const EarningsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(earningsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pendapatan')),
      body: statsAsync.when(
        data: (stats) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Card(child: Container(
                width: double.infinity, padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Theme.of(context).colorScheme.primary, Theme.of(context).colorScheme.primary.withValues(alpha: 0.7)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Pendapatan Hari Ini', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text('Rp ${stats.todayRevenue}', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(children: [
                    _MiniStat(label: 'Booking Hari Ini', value: '${stats.todayBookings}'),
                    const SizedBox(width: 24),
                    _MiniStat(label: 'Rating', value: stats.avgRating.toStringAsFixed(1)),
                  ]),
                ]),
              )),
              const SizedBox(height: 16),
              Row(children: [
                Expanded(child: _SummaryCard(label: 'Pendapatan Minggu Ini', value: 'Rp ${stats.weekRevenue}')),
                const SizedBox(width: 12),
                Expanded(child: _SummaryCard(label: 'Booking Minggu Ini', value: '${stats.weekBookings}')),
              ]),
              const SizedBox(height: 16),
              Row(children: [
                Expanded(child: _SummaryCard(label: 'Total Pelanggan', value: '${stats.totalCustomers}')),
                const SizedBox(width: 12),
                Expanded(child: _SummaryCard(label: 'Status', value: 'Aktif')),
              ]),
              const SizedBox(height: 24),
              const Text('Transaksi Terbaru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              if (stats.recentBookings.isEmpty)
                Center(child: Column(children: [
                  Icon(Icons.receipt_long, size: 48, color: Colors.grey[300]),
                  const SizedBox(height: 8), Text('Belum ada transaksi', style: TextStyle(color: Colors.grey)),
                ]))
              else ...stats.recentBookings.map((t) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: t['status'] == 'COMPLETED' ? Colors.green[50] : Colors.grey[100],
                    child: Icon(Icons.receipt, color: t['status'] == 'COMPLETED' ? Colors.green : Colors.grey),
                  ),
                  title: Text('${t['customerName'] ?? '-'}', style: const TextStyle(fontWeight: FontWeight.w500)),
                  subtitle: Text('${t['serviceName'] ?? ''} · ${t['time'] ?? ''}', style: const TextStyle(fontSize: 12)),
                  trailing: Text('Rp ${t['amount'] ?? 0}', style: TextStyle(
                    color: t['status'] == 'COMPLETED' ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.bold,
                  )),
                ),
              )),
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('Gagal memuat pendapatan'),
          const SizedBox(height: 8),
          TextButton(onPressed: () => ref.invalidate(earningsProvider), child: const Text('Coba lagi')),
        ])),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label, value;
  const _MiniStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
      Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
    ]);
  }
}

class _SummaryCard extends StatelessWidget {
  final String label, value;
  const _SummaryCard({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
      const SizedBox(height: 6),
      Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
    ])));
  }
}
