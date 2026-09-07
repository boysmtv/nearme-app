import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:fl_chart/fl_chart.dart';
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

class ReportsPage extends ConsumerWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportAsync = ref.watch(reportProvider);
    final analyticsAsync = ref.watch(analyticsProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => partnerScaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Reports • Analytics'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(reportProvider);
          ref.invalidate(analyticsProvider);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            reportAsync.when(
              data: (report) {
                return Column(children: [
                  Row(children: [
                    _StatCard(title: 'Bookings', value: '${report.totalBookings}', icon: Icons.calendar_today, color: Colors.blue),
                    const SizedBox(width: 12),
                    _StatCard(title: 'Revenue', value: formatRupiah(report.totalRevenue), icon: Icons.payments, color: Colors.green),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    _StatCard(title: 'Completed', value: '${report.completedBookings}', icon: Icons.check_circle, color: Colors.purple),
                    const SizedBox(width: 12),
                    _StatCard(title: 'Avg Rating', value: report.avgRating.toStringAsFixed(1), icon: Icons.star, color: Colors.amber),
                  ]),
                ]);
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Failed: $e')),
            ),
            const SizedBox(height: 24),
            const Text('Analytics Lanjutan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('GET /provider/reports/analytics?startDate&endDate&granularity → {revenueByDay, bookingsByStatus, retention, funnel, topServices, staffUtilization} • Export CSV /provider/reports/export', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
            const SizedBox(height: 16),
            analyticsAsync.when(
              data: (a) {
                return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // Revenue by day AreaChart (LineChart with filled area)
                  _SectionCard(
                    title: 'Revenue by Day (AreaChart)',
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
                    title: 'Bookings by Status (BarChart)',
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
                    title: 'Funnel search→view→hold→confirm (Pie)',
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
                      title: 'Retention',
                      child: Row(children: [
                        Expanded(child: _MiniStat(label: 'Total Customers', value: '${a.retention['totalCustomers'] ?? 0}')),
                        Expanded(child: _MiniStat(label: 'Returning', value: '${a.retention['returningCustomers'] ?? 0}')),
                        Expanded(child: _MiniStat(label: 'Rate', value: '${a.retention['retentionPercent'] ?? 0}%')),
                      ]),
                    ),
                  const SizedBox(height: 12),
                  // Top Services table
                  _SectionCard(
                    title: 'Top Services (join catalog)',
                    child: a.topServices.isEmpty
                        ? const Text('No top services', style: TextStyle(color: Colors.grey))
                        : Column(children: a.topServices.map((s) => ListTile(dense: true, title: Text(s['serviceName'] ?? '-', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)), subtitle: Text('Bookings: ${s['bookingCount']} • Revenue: ${formatRupiah((s['revenue'] as num?)?.toInt() ?? 0)}', style: const TextStyle(fontSize: 11)), leading: const Icon(Icons.spa, size: 18, color: Color(0xFF6C63FF)),)).toList()),
                  ),
                  const SizedBox(height: 12),
                  // Staff Utilization
                  _SectionCard(
                    title: 'Staff Utilization (booking count per staff)',
                    child: a.staffUtilization.isEmpty
                        ? const Text('No staff data', style: TextStyle(color: Colors.grey))
                        : Column(children: a.staffUtilization.map((s) { final count = (s['bookingCount'] as num?)?.toInt() ?? 0; final max = a.staffUtilization.map((e) => (e['bookingCount'] as num?)?.toInt() ?? 0).reduce((a, b) => a > b ? a : b); final ratio = max == 0 ? 0.0 : count / max; return Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(children: [Expanded(flex: 2, child: Text(s['staffName'] ?? '-', style: const TextStyle(fontSize: 12))), Expanded(flex: 3, child: LinearProgressIndicator(value: ratio, color: const Color(0xFF10B981), backgroundColor: Colors.grey[200])), const SizedBox(width: 8), Text('$count', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))])); }).toList()),
                  ),
                  const SizedBox(height: 12),
                  Align(alignment: Alignment.centerRight, child: TextButton.icon(icon: const Icon(Icons.download, size: 16), label: const Text('Export CSV'), onPressed: () async { try { final res = await ApiService().exportAnalytics(params: {'startDate': '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-01', 'endDate': '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-${DateTime.now().day.toString().padLeft(2, '0')}'}); if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('CSV exported (check backend /provider/reports/export)'))); } catch (e) { if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Export failed: $e'))); } })),
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
}

class _StatCard extends StatelessWidget {
  final String title, value;
  final IconData icon;
  final Color color;
  const _StatCard({required this.title, required this.value, required this.icon, required this.color});
  @override
  Widget build(BuildContext context) {
    return Expanded(child: Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: Icon(icon, color: color, size: 20)), const SizedBox(height: 12), Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)), const SizedBox(height: 4), Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey))]))));
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _SectionCard({required this.title, required this.child});
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 12), child])));
  }
}

class _MiniStat extends StatelessWidget {
  final String label, value;
  const _MiniStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Column(children: [Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)), Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey))]);
  }
}
