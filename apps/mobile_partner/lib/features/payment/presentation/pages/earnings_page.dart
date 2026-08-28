import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:shimmer/shimmer.dart';

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

  String _rupiah(num amount) {
    final v = amount.round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
    return 'Rp $v';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(earningsProvider);

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: statsAsync.when(
          data: (stats) {
            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(earningsProvider),
              color: DEKATColors.primary,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: const Color(0xFF7ED8A6).withValues(alpha: 0.22), blurRadius: 10, offset: const Offset(0, 4))]), child: const Icon(Icons.account_balance_wallet_rounded, color: Color(0xFF2E7D5B), size: 20)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Pendapatan', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                      Text('Ringkasan keuangan bisnismu', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                    ])),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!)), child: Row(children: [Icon(Icons.trending_up_rounded, size: 14, color: const Color(0xFF4CAF7D)), const SizedBox(width: 4), Text('${stats.avgRating.toStringAsFixed(1)} ⭐', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700))])),
                  ]),
                  const SizedBox(height: 16),
                  // Hero gradient card
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: 1),
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeOutCubic,
                    builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10 * (1 - v)), child: child)),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF8B8CFF), Color(0xFFB8B5FF), Color(0xFFFFB5C2)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 18, offset: const Offset(0, 8))],
                      ),
                      child: Stack(
                        children: [
                          Positioned(right: -10, top: -10, child: Container(width: 90, height: 90, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), shape: BoxShape.circle))),
                          Positioned(right: 30, bottom: -12, child: Container(width: 60, height: 60, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.08), shape: BoxShape.circle))),
                          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(children: [
                              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withValues(alpha: 0.22))), child: Row(children: [const Icon(Icons.today_rounded, size: 12, color: Colors.white), const SizedBox(width: 6), const Text('Hari Ini', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700))])),
                              const Spacer(),
                              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), shape: BoxShape.circle), child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 16)),
                            ]),
                            const SizedBox(height: 14),
                            Text(_rupiah(stats.todayRevenue), style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: -0.8, height: 1)),
                            const SizedBox(height: 6),
                            Text('Total pendapatan hari ini', style: TextStyle(color: Colors.white.withValues(alpha: 0.88), fontSize: 12, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 16),
                            Row(children: [
                              _MiniStat(icon: Icons.receipt_long_rounded, label: 'Booking Hari Ini', value: '${stats.todayBookings}'),
                              const SizedBox(width: 12),
                              Container(width: 1, height: 36, color: Colors.white.withValues(alpha: 0.22)),
                              const SizedBox(width: 12),
                              _MiniStat(icon: Icons.star_rounded, label: 'Rating', value: stats.avgRating.toStringAsFixed(1)),
                              const Spacer(),
                              Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: Row(children: [Icon(Icons.arrow_outward_rounded, size: 14, color: DEKATColors.primary), const SizedBox(width: 4), const Text('Lihat detail', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: DEKATColors.primary))])),
                            ]),
                          ]),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(children: [
                    Expanded(child: _SummaryCard(icon: Icons.calendar_view_week_rounded, gradient: DEKATColors.softSky, iconColor: const Color(0xFF5AA9E6), label: 'Minggu Ini', value: _rupiah(stats.weekRevenue), sub: '${stats.weekBookings} booking')),
                    const SizedBox(width: 10),
                    Expanded(child: _SummaryCard(icon: Icons.people_rounded, gradient: DEKATColors.softLavender, iconColor: const Color(0xFF9A7BFF), label: 'Pelanggan', value: '${stats.totalCustomers}', sub: 'total pelanggan')),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(child: _SummaryCard(icon: Icons.show_chart_rounded, gradient: DEKATColors.softPeach, iconColor: const Color(0xFFE6A532), label: 'Rata-rata Booking', value: stats.weekBookings > 0 ? '${(stats.weekRevenue / (stats.weekBookings == 0 ? 1 : stats.weekBookings)).round() ~/ 1000}k' : '0', sub: 'per transaksi')),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 4))]),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.verified_rounded, size: 18, color: Color(0xFF2E7D5B))),
                          const SizedBox(height: 10),
                          const Text('Aktif', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 2),
                          Row(children: [Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF7ED8A6), shape: BoxShape.circle)), const SizedBox(width: 6), Text('Status toko', style: TextStyle(color: Colors.grey[600], fontSize: 11, fontWeight: FontWeight.w600))] ),
                        ]),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 18),
                  Row(children: [
                    Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.receipt_long_rounded, size: 16, color: DEKATColors.primary)),
                    const SizedBox(width: 10),
                    const Text('Transaksi Terbaru', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: -0.2)),
                    const Spacer(),
                    if (stats.recentBookings.isNotEmpty) Text('${stats.recentBookings.length} transaksi', style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                  ]),
                  const SizedBox(height: 10),
                  if (stats.recentBookings.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!)),
                      child: Column(children: [
                        Container(width: 64, height: 64, decoration: BoxDecoration(color: DEKATColors.softLavender[1], shape: BoxShape.circle), child: Icon(Icons.receipt_long_rounded, size: 28, color: DEKATColors.softLavender[0])),
                        const SizedBox(height: 12),
                        const Text('Belum ada transaksi', style: TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        Text('Transaksi pelanggan akan muncul di sini', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      ]),
                    )
                  else
                    ...List.generate(stats.recentBookings.length, (i) {
                      final t = stats.recentBookings[i];
                      final isCompleted = (t['status']?.toString().toUpperCase() == 'COMPLETED' || t['status']?.toString().toUpperCase() == 'PAID');
                      return TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: 1),
                        duration: Duration(milliseconds: 280 + i * 55),
                        curve: Curves.easeOutCubic,
                        builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 8 * (1 - v)), child: child)),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3))]),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            leading: Container(
                              width: 44, height: 44,
                              decoration: BoxDecoration(gradient: LinearGradient(colors: isCompleted ? DEKATColors.softMint : DEKATColors.softPeach), borderRadius: BorderRadius.circular(12)),
                              child: Icon(isCompleted ? Icons.check_circle_rounded : Icons.hourglass_top_rounded, color: isCompleted ? const Color(0xFF2E7D5B) : const Color(0xFF9A6B2E), size: 20),
                            ),
                            title: Text('${t['customerName'] ?? '-'}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                            subtitle: Text('${t['serviceName'] ?? ''} • ${t['time'] ?? ''}', style: TextStyle(fontSize: 11, color: Colors.grey[600]), maxLines: 1, overflow: TextOverflow.ellipsis),
                            trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                              Text(_rupiah((t['amount'] as num?) ?? 0), style: TextStyle(color: isCompleted ? const Color(0xFF2E7D5B) : const Color(0xFFE6A532), fontWeight: FontWeight.w800, fontSize: 12)),
                              const SizedBox(height: 3),
                              Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: isCompleted ? const Color(0xFFE6F7EE) : const Color(0xFFFFF4D6), borderRadius: BorderRadius.circular(20)), child: Text((t['status'] ?? 'PENDING').toString().toLowerCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: isCompleted ? const Color(0xFF2E7D5B) : const Color(0xFF9A6B2E)))),
                            ]),
                          ),
                        ),
                      );
                    }),
                  const SizedBox(height: 12),
                ]),
              ),
            );
          },
          loading: () => ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 160, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)))),
              const SizedBox(height: 12),
              Row(children: [Expanded(child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 96, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))) , const SizedBox(width: 10), Expanded(child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 96, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))))]),
            ],
          ),
          error: (e, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Container(padding: const EdgeInsets.all(12), decoration: const BoxDecoration(color: DEKATColors.errorLight, shape: BoxShape.circle), child: const Icon(Icons.error_outline_rounded, color: DEKATColors.error)),
                  const SizedBox(height: 12),
                  const Text('Gagal memuat pendapatan', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                  const SizedBox(height: 14),
                  FilledButton.icon(onPressed: () => ref.invalidate(earningsProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba lagi')),
                ]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _MiniStat({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 12, color: Colors.white)),
      const SizedBox(width: 8),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.86), fontSize: 11, fontWeight: FontWeight.w600)),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
      ]),
    ]);
  }
}

class _SummaryCard extends StatelessWidget {
  final IconData icon;
  final List<Color> gradient;
  final Color iconColor;
  final String label, value, sub;
  const _SummaryCard({required this.icon, required this.gradient, required this.iconColor, required this.label, required this.value, required this.sub});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 4))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(gradient: LinearGradient(colors: gradient), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: iconColor, size: 18)),
        const SizedBox(height: 10),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: iconColor, letterSpacing: -0.3), maxLines: 1, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: Colors.grey[700], fontSize: 11, fontWeight: FontWeight.w700)),
        Text(sub, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
      ]),
    );
  }
}
