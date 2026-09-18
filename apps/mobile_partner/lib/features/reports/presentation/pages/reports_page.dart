import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';
import '../../../../shared/widgets/main_scaffold.dart';

final reportProvider = FutureProvider.autoDispose<PartnerReportRow>((ref) async {
  final now = DateTime.now();
  final firstDay = '${now.year}-${now.month.toString().padLeft(2, '0')}-01';
  final today = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  final response = await ApiService().getReports(params: {'startDate': firstDay, 'endDate': today});
  return PartnerReportRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

final analyticsProvider = FutureProvider.autoDispose<AnalyticsRow>((ref) async {
  final now = DateTime.now();
  final firstDay = '${now.year}-${now.month.toString().padLeft(2, '0')}-01';
  final today = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  final response = await ApiService().getAnalytics(params: {'startDate': firstDay, 'endDate': today, 'granularity': 'day'});
  final data = response.data['data'] as Map<String, dynamic>;
  return AnalyticsRow.fromJson(data);
});

const _monthNames = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

class ReportsPage extends ConsumerWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportAsync = ref.watch(reportProvider);
    final analyticsAsync = ref.watch(analyticsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => partnerScaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Laporan & Analitik',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1D26),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(reportProvider);
          ref.invalidate(analyticsProvider);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _buildPeriodCard(context, ref),
            const SizedBox(height: 16),
            reportAsync.when(
              data: (report) {
                return Column(children: [
                  Row(children: [
                    _StatCard(title: 'Booking', value: '${report.totalBookings}', icon: Icons.calendar_month_outlined, color: DEKATColors.primary),
                    const SizedBox(width: 12),
                    _StatCard(title: 'Pendapatan', value: formatRupiah(report.totalRevenue), icon: Icons.payments_outlined, color: Colors.green),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    _StatCard(title: 'Selesai', value: '${report.completedBookings}', icon: Icons.check_circle_outline, color: Colors.purple),
                    const SizedBox(width: 12),
                    _StatCard(title: 'Rata-rata Rating', value: report.avgRating.toStringAsFixed(1), icon: Icons.star_outline, color: Colors.amber),
                  ]),
                ]);
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Failed: $e')),
            ),
            const SizedBox(height: 24),
            const Text('Analitik Lanjutan',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Tren pendapatan, status booking, dan performa layanan Anda',
                style: TextStyle(fontSize: 12, color: Colors.grey[500])),
            const SizedBox(height: 16),
            analyticsAsync.when(
              data: (a) {
                return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // Revenue by day AreaChart (LineChart with filled area)
                  _SectionCard(
                    title: 'Pendapatan Harian',
                    subtitle: 'Tren pendapatan bulan berjalan',
                    icon: Icons.trending_up,
                    child: SizedBox(
                      height: 180,
                      child: a.revenueByDay.isEmpty
                          ? const Center(child: Text('No data', style: TextStyle(color: Colors.grey)))
                          : LineChart(
                              LineChartData(
                                gridData: FlGridData(show: true, drawVerticalLine: false),
                                titlesData: FlTitlesData(
                                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (v, meta) { final idx = v.toInt(); if (idx < 0 || idx >= a.revenueByDay.length) return const SizedBox(); final date = (a.revenueByDay[idx]['date'] ?? '') as String; return Text(date.length > 5 ? date.substring(5) : date, style: const TextStyle(fontSize: 9)); }, reservedSize: 22)),
                                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40, getTitlesWidget: (v, meta) => Text('${(v / 1000).toInt()}k', style: const TextStyle(fontSize: 9)))),
                                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                ),
                                borderData: FlBorderData(show: false),
                                lineBarsData: [
                                  LineChartBarData(
                                    spots: List.generate(a.revenueByDay.length, (i) => FlSpot(i.toDouble(), ((a.revenueByDay[i]['revenue'] ?? 0) as num).toDouble())),
                                    isCurved: true,
                                    color: const Color(0xFF6C63FF),
                                    barWidth: 3,
                                    dotData: const FlDotData(show: false),
                                    belowBarData: BarAreaData(show: true, color: const Color(0x336C63FF)),
                                  ),
                                ],
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Bookings by status BarChart
                  _SectionCard(
                    title: 'Booking per Status',
                    subtitle: 'Sebaran status booking periode ini',
                    icon: Icons.bar_chart_outlined,
                    child: SizedBox(
                      height: 180,
                      child: a.bookingsByStatus.isEmpty
                          ? const Center(child: Text('No data'))
                          : BarChart(
                              BarChartData(
                                gridData: FlGridData(show: false),
                                titlesData: FlTitlesData(
                                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (v, meta) { final keys = a.bookingsByStatus.keys.toList(); final idx = v.toInt(); if (idx < 0 || idx >= keys.length) return const SizedBox(); return Padding(padding: const EdgeInsets.only(top: 4), child: Text(keys[idx].length > 7 ? keys[idx].substring(0, 7) : keys[idx], style: const TextStyle(fontSize: 8))); })),
                                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30)),
                                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                ),
                                barGroups: List.generate(a.bookingsByStatus.keys.length, (i) { final key = a.bookingsByStatus.keys.elementAt(i); final val = (a.bookingsByStatus[key] as num?)?.toDouble() ?? 0; return BarChartGroupData(x: i, barRods: [BarChartRodData(toY: val, color: const Color(0xFF6C63FF), width: 16, borderRadius: BorderRadius.circular(4))]); }),
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Funnel PieChart
                  _SectionCard(
                    title: 'Corong Konversi',
                    subtitle: 'Pencarian → dilihat → ditahan → dikonfirmasi',
                    icon: Icons.filter_alt_outlined,
                    child: SizedBox(
                      height: 180,
                      child: a.funnel.isEmpty
                          ? const Center(child: Text('No funnel'))
                          : PieChart(PieChartData(sections: List.generate(a.funnel.keys.length, (i) { final k = a.funnel.keys.elementAt(i); final v = (a.funnel[k] as num).toDouble(); final colors = [const Color(0xFF6C63FF), const Color(0xFF10B981), const Color(0xFFF59E0B), const Color(0xFFEF4444), Colors.blue]; return PieChartSectionData(value: v, title: '$k:${v.toInt()}', color: colors[i % colors.length], radius: 60, titleStyle: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white)); }), centerSpaceRadius: 20)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Retention
                  if (a.retention.isNotEmpty)
                    _SectionCard(
                      title: 'Retensi Pelanggan',
                      subtitle: 'Pelanggan yang kembali memakai layanan',
                      icon: Icons.repeat_outlined,
                      child: Row(children: [
                        Expanded(child: _MiniStat(label: 'Total Pelanggan', value: '${a.retention['totalCustomers'] ?? 0}')),
                        Expanded(child: _MiniStat(label: 'Pelanggan Kembali', value: '${a.retention['returningCustomers'] ?? 0}')),
                        Expanded(child: _MiniStat(label: 'Tingkat Retensi', value: '${a.retention['retentionPercent'] ?? 0}%')),
                      ]),
                    ),
                  if (a.retention.isNotEmpty) const SizedBox(height: 12),
                  // Top Services table
                  _SectionCard(
                    title: 'Layanan Terlaris',
                    subtitle: 'Layanan dengan booking terbanyak',
                    icon: Icons.workspace_premium_outlined,
                    child: a.topServices.isEmpty
                        ? const Text('No top services', style: TextStyle(color: Colors.grey))
                        : Column(children: a.topServices.map((s) => RepaintBoundary(child: ListTile(dense: true, contentPadding: EdgeInsets.zero, title: Text(s['serviceName'] ?? '-', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)), subtitle: Text('Bookings: ${s['bookingCount']} • Revenue: ${formatRupiah((s['revenue'] as num?)?.toInt() ?? 0)}', style: const TextStyle(fontSize: 11)), leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.spa, size: 18, color: DEKATColors.primary)),))).toList()),
                  ),
                  const SizedBox(height: 12),
                  // Staff Utilization
                  _SectionCard(
                    title: 'Utilisasi Staf',
                    subtitle: 'Jumlah booking yang ditangani tiap staf',
                    icon: Icons.groups_outlined,
                    child: a.staffUtilization.isEmpty
                        ? const Text('No staff data', style: TextStyle(color: Colors.grey))
                        : Column(children: a.staffUtilization.map((s) { final count = (s['bookingCount'] as num?)?.toInt() ?? 0; final max = a.staffUtilization.map((e) => (e['bookingCount'] as num?)?.toInt() ?? 0).reduce((a, b) => a > b ? a : b); final ratio = max == 0 ? 0.0 : count / max; return RepaintBoundary(child: Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(children: [Expanded(flex: 2, child: Text(s['staffName'] ?? '-', style: const TextStyle(fontSize: 12))), Expanded(flex: 3, child: ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: ratio, minHeight: 8, color: const Color(0xFF10B981), backgroundColor: Colors.grey.shade100))), const SizedBox(width: 8), Text('$count', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))]))); }).toList()),
                  ),
                ]);
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Analytics error: $e'),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _buildPeriodCard(BuildContext context, WidgetRef ref) {
    final now = DateTime.now();
    final range =
        '01 ${_monthNames[now.month]} – ${now.day} ${_monthNames[now.month]} ${now.year}';
    return Container(
      padding: const EdgeInsets.all(16),
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
              color: DEKATColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.date_range_outlined,
                color: DEKATColors.primary, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Bulan Ini',
                    style: TextStyle(
                        fontSize: 12, color: Colors.grey[500])),
                const SizedBox(height: 2),
                Text(range,
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          OutlinedButton.icon(
            icon: const Icon(Icons.download, size: 16),
            label: const Text('Ekspor CSV'),
            onPressed: () async { try { await ApiService().exportAnalytics(params: {'startDate': '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-01', 'endDate': '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-${DateTime.now().day.toString().padLeft(2, '0')}'}); if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('CSV exported (check backend /provider/reports/export)'))); } catch (e) { if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Export failed: $e'))); } },
            style: OutlinedButton.styleFrom(
              foregroundColor: DEKATColors.primary,
              side: const BorderSide(color: DEKATColors.primary),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title, value;
  final IconData icon;
  final Color color;
  const _StatCard({required this.title, required this.value, required this.icon, required this.color});
  @override
  Widget build(BuildContext context) {
    return Expanded(
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
                  Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12)),
                      child: Icon(icon, color: color, size: 22)),
                  const SizedBox(height: 12),
                  Text(value,
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(title,
                      style:
                          TextStyle(fontSize: 12, color: Colors.grey[500])),
                ])));
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData? icon;
  final Widget child;
  const _SectionCard(
      {required this.title, this.subtitle, this.icon, required this.child});
  @override
  Widget build(BuildContext context) {
    return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                if (icon != null) ...[
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color:
                          DEKATColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon,
                        size: 18, color: DEKATColors.primary),
                  ),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                            style: const TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15)),
                        if (subtitle != null) ...[
                          const SizedBox(height: 2),
                          Text(subtitle!,
                              style: TextStyle(
                                  fontSize: 12, color: Colors.grey[500])),
                        ],
                      ]),
                ),
              ]),
              const SizedBox(height: 12),
              child
            ]));
  }
}

class _MiniStat extends StatelessWidget {
  final String label, value;
  const _MiniStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(children: [
        Text(value,
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: DEKATColors.primary)),
        const SizedBox(height: 4),
        Text(label,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: Colors.grey[500])),
      ]),
    );
  }
}
