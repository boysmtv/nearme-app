import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../shared/models/rows.dart';

final reportProvider = FutureProvider.autoDispose<PartnerReportRow>((ref) async {
  final now = DateTime.now();
  final firstDay = '${now.year}-${now.month.toString().padLeft(2, '0')}-01';
  final today = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  final response = await ApiService().getReports(params: {'startDate': firstDay, 'endDate': today});
  return PartnerReportRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class ReportsPage extends ConsumerWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportAsync = ref.watch(reportProvider);

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: reportAsync.when(
          data: (report) {
            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(reportProvider),
              color: DEKATColors.primary,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: const Color(0xFFE6A532).withValues(alpha: 0.22), blurRadius: 10, offset: const Offset(0, 4))]), child: const Icon(Icons.insights_rounded, color: Color(0xFF9A6B2E), size: 20)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Laporan', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                      Text('Performa bisnismu bulan ini', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                    ])),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!)), child: Row(children: [Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF7ED8A6), shape: BoxShape.circle)), const SizedBox(width: 6), Text('${DateTime.now().month}/${DateTime.now().year}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700))])),
                  ]),
                  const SizedBox(height: 16),
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: 1),
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.easeOutCubic,
                    builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10 * (1 - v)), child: child)),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF8B8CFF), Color(0xFFB8B5FF)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.22), blurRadius: 14, offset: const Offset(0, 6))]),
                      child: Row(children: [
                        Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.auto_graph_rounded, color: Colors.white, size: 20)),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Bulan Ini', style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text(formatRupiah(report.totalRevenue), style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                        ])),
                        Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: Row(children: [Icon(Icons.trending_up_rounded, size: 14, color: DEKATColors.primary), const SizedBox(width: 4), Text('${report.completedBookings} selesai', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: DEKATColors.primary))])),
                      ]),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(children: [
                    _StatCard(title: 'Total Booking', value: '${report.totalBookings}', icon: Icons.calendar_month_rounded, gradient: DEKATColors.softSky, color: const Color(0xFF5AA9E6), delay: 0),
                    const SizedBox(width: 10),
                    _StatCard(title: 'Pendapatan', value: formatRupiah(report.totalRevenue), icon: Icons.account_balance_wallet_rounded, gradient: DEKATColors.softMint, color: const Color(0xFF2E7D5B), delay: 80),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    _StatCard(title: 'Selesai', value: '${report.completedBookings}', icon: Icons.check_circle_rounded, gradient: DEKATColors.softViolet, color: DEKATColors.primary, delay: 160),
                    const SizedBox(width: 10),
                    _StatCard(title: 'Rating', value: report.avgRating.toStringAsFixed(1), icon: Icons.star_rounded, gradient: DEKATColors.softPeach, color: const Color(0xFFE6A532), delay: 240, suffix: ' ⭐'),
                  ]),
                  const SizedBox(height: 14),
                  // insight cards
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4))]),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softLavender[1], borderRadius: BorderRadius.circular(9)), child: Icon(Icons.lightbulb_rounded, size: 16, color: DEKATColors.softLavender[0])),
                        const SizedBox(width: 8),
                        const Text('Insight Cepat', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      ]),
                      const SizedBox(height: 12),
                      _InsightRow(icon: Icons.trending_up_rounded, label: 'Tingkat penyelesaian', value: report.totalBookings > 0 ? '${((report.completedBookings / report.totalBookings) * 100).toStringAsFixed(0)}%' : '-', color: DEKATColors.softMint[0]),
                      Divider(height: 18, color: Colors.grey[100]),
                      _InsightRow(icon: Icons.cancel_outlined, label: 'Dibatalkan', value: '${report.cancelledBookings}', color: DEKATColors.softPink[0]),
                      Divider(height: 18, color: Colors.grey[100]),
                      _InsightRow(icon: Icons.payments_rounded, label: 'Rata-rata per booking', value: report.totalBookings > 0 ? formatRupiah(report.totalRevenue ~/ report.totalBookings) : '-', color: DEKATColors.softSky[0]),
                    ]),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: DEKATColors.softViolet[1].withValues(alpha: 0.6), borderRadius: BorderRadius.circular(14), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.12))),
                    child: Row(children: [
                      Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)]), child: const Icon(Icons.auto_awesome_rounded, size: 16, color: DEKATColors.primary)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Tips untuk meningkatkan pendapatan', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                        const SizedBox(height: 3),
                        Text('Aktif di jam sibuk & respon booking cepat meningkatkan rating ✨', style: TextStyle(fontSize: 11, color: Colors.grey[700], height: 1.4)),
                      ])),
                    ]),
                  ),
                ]),
              ),
            );
          },
          loading: () => ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 72, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)))),
              const SizedBox(height: 12),
              Row(children: [Expanded(child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 110, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))) , const SizedBox(width: 10), Expanded(child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 110, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))))]),
              const SizedBox(height: 10),
              Row(children: [Expanded(child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 110, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))) , const SizedBox(width: 10), Expanded(child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 110, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))))]),
            ],
          ),
          error: (e, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Container(padding: const EdgeInsets.all(12), decoration: const BoxDecoration(color: DEKATColors.errorLight, shape: BoxShape.circle), child: const Icon(Icons.insights_rounded, color: DEKATColors.error)),
                  const SizedBox(height: 12),
                  const Text('Gagal memuat laporan', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                  const SizedBox(height: 14),
                  FilledButton.icon(onPressed: () => ref.invalidate(reportProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba lagi')),
                ]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title, value;
  final IconData icon;
  final List<Color> gradient;
  final Color color;
  final int delay;
  final String suffix;
  const _StatCard({required this.title, required this.value, required this.icon, required this.gradient, required this.color, required this.delay, this.suffix = ''});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: Duration(milliseconds: 400 + delay),
        curve: Curves.easeOutCubic,
        builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10 * (1 - v)), child: child)),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4))]),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(gradient: LinearGradient(colors: gradient), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: color, size: 18)),
            const SizedBox(height: 12),
            Text(value + suffix, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color, letterSpacing: -0.3), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 3),
            Text(title, style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w600)),
          ]),
        ),
      ),
    );
  }
}

class _InsightRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  const _InsightRow({required this.icon, required this.label, required this.value, required this.color});
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: color.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(9)), child: Icon(icon, size: 14, color: color)),
      const SizedBox(width: 10),
      Expanded(child: Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[700], fontWeight: FontWeight.w600))),
      Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: color)),
    ]);
  }
}
