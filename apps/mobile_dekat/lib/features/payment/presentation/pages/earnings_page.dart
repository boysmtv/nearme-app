import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/widgets/partner_scaffold.dart';

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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => partnerScaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Pendapatan',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1D26),
        elevation: 0,
      ),
      body: statsAsync.when(
        data: (stats) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _buildBalanceHero(context, stats),
              const SizedBox(height: 16),
              Row(children: [
                Expanded(child: _SummaryCard(label: 'Pendapatan Minggu Ini', value: 'Rp ${stats.weekRevenue}', icon: Icons.account_balance_wallet_outlined, color: Colors.green)),
                const SizedBox(width: 12),
                Expanded(child: _SummaryCard(label: 'Booking Minggu Ini', value: '${stats.weekBookings}', icon: Icons.calendar_month_outlined, color: DEKATColors.primary)),
              ]),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: _SummaryCard(label: 'Total Pelanggan', value: '${stats.totalCustomers}', icon: Icons.groups_outlined, color: Colors.purple)),
                const SizedBox(width: 12),
                Expanded(child: _SummaryCard(label: 'Status Akun', value: 'Aktif', icon: Icons.verified_outlined, color: Colors.teal)),
              ]),
              const SizedBox(height: 24),
              Row(
                children: [
                  const Text('Transaksi Terbaru',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: DEKATColors.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text('${stats.recentBookings.length} transaksi',
                        style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: DEKATColors.primary)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (stats.recentBookings.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.receipt_long,
                          size: 36, color: Colors.grey[300]),
                    ),
                    const SizedBox(height: 12),
                    const Text('Belum ada transaksi',
                        style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text('Transaksi terbaru akan tampil di sini',
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey[500])),
                  ]),
                )
              else ...stats.recentBookings.map((t) => _buildTransactionItem(t)),
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

  Widget _buildBalanceHero(BuildContext context, PartnerStats stats) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [DEKATColors.primary, Color(0xFF9D97FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.account_balance_wallet,
                  color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Text('Saldo Pendapatan Hari Ini',
                style: TextStyle(color: Colors.white70, fontSize: 14)),
          ],
        ),
        const SizedBox(height: 12),
        Text('Rp ${stats.todayRevenue}',
            style: const TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(children: [
            _MiniStat(
                label: 'Booking Hari Ini',
                value: '${stats.todayBookings}'),
            Container(
              width: 1,
              height: 32,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              color: Colors.white.withValues(alpha: 0.3),
            ),
            _MiniStat(
                label: 'Rating Rata-rata',
                value: stats.avgRating.toStringAsFixed(1)),
            Container(
              width: 1,
              height: 32,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              color: Colors.white.withValues(alpha: 0.3),
            ),
            _MiniStat(
                label: 'Booking Minggu Ini',
                value: '${stats.weekBookings}'),
          ]),
        ),
      ]),
    );
  }

  Widget _buildTransactionItem(Map<String, dynamic> t) {
    final isCompleted = t['status'] == 'COMPLETED';
    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isCompleted
                    ? Colors.green.withValues(alpha: 0.1)
                    : Colors.orange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.receipt,
                  size: 20,
                  color: isCompleted ? Colors.green : Colors.orange),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${t['customerName'] ?? '-'}',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text('${t['serviceName'] ?? ''} · ${t['time'] ?? ''}',
                      style: TextStyle(
                          fontSize: 12, color: Colors.grey[500])),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('Rp ${t['amount'] ?? 0}',
                    style: TextStyle(
                      color: isCompleted ? Colors.green : Colors.orange,
                      fontWeight: FontWeight.bold,
                    )),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? Colors.green.shade50
                        : Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isCompleted ? 'Selesai' : '${t['status'] ?? ''}',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: isCompleted
                          ? Colors.green.shade700
                          : Colors.orange.shade700,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label, value;
  const _MiniStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label,
            style: const TextStyle(color: Colors.white70, fontSize: 11)),
        const SizedBox(height: 2),
        Text(value,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 15)),
      ]),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _SummaryCard(
      {required this.label,
      required this.value,
      required this.icon,
      required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: color),
              ),
              const SizedBox(height: 10),
              Text(value,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(label,
                  style: TextStyle(color: Colors.grey[500], fontSize: 12)),
            ]));
  }
}
