import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final reportProvider = FutureProvider.autoDispose<Report>((ref) async {
  try {
    final response = await ApiService().getReports();
    return Report.fromJson(response.data['data']);
  } catch (e) {
    return const Report(revenue: 0, bookings: 0, customers: 0, avgRating: 0);
  }
});

class ReportsPage extends ConsumerWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportAsync = ref.watch(reportProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: reportAsync.when(
        data: (report) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                _StatCard(title: 'Bookings', value: '${report.bookings}', icon: Icons.calendar_today, color: Colors.blue),
                const SizedBox(width: 12),
                _StatCard(title: 'Revenue', value: 'Rp ${report.revenue}', icon: Icons.payments, color: Colors.green),
              ]),
              const SizedBox(height: 12),
              Row(children: [
                _StatCard(title: 'Customers', value: '${report.customers}', icon: Icons.people, color: Colors.purple),
                const SizedBox(width: 12),
                _StatCard(title: 'Avg Rating', value: report.avgRating.toStringAsFixed(1), icon: Icons.star, color: Colors.amber),
              ]),
              const SizedBox(height: 24),
              if (report.popularServices != null && report.popularServices!.isNotEmpty) ...[
                const Text('Popular Services', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Card(child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(children: [
                    SizedBox(height: 200, child: BarChart(BarChartData(
                      alignment: BarChartAlignment.spaceAround,
                      maxY: report.popularServices!.fold(0, (max, s) => s.count > max ? s.count : max).toDouble() + 5,
                      barGroups: report.popularServices!.asMap().entries.map((entry) {
                        return BarChartGroupData(x: entry.key, barRods: [
                          BarChartRodData(toY: entry.value.count.toDouble(), color: Theme.of(context).colorScheme.primary, width: 20, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
                        ]);
                      }).toList(),
                      titlesData: FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      gridData: const FlGridData(show: false),
                    ))),
                    const SizedBox(height: 12),
                    Wrap(spacing: 16, runSpacing: 8, children: report.popularServices!.asMap().entries.map((entry) {
                      return Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width: 12, height: 12, decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.8 - entry.key * 0.15),
                          borderRadius: BorderRadius.circular(2),
                        )),
                        const SizedBox(width: 4),
                        Text(entry.value.name, style: const TextStyle(fontSize: 12)),
                      ]);
                    }).toList()),
                  ]),
                )),
                const SizedBox(height: 24),
              ],
              if (report.topStaff != null && report.topStaff!.isNotEmpty) ...[
                const Text('Top Staff', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                ...report.topStaff!.map((s) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(backgroundColor: Colors.blue[50], child: const Icon(Icons.person, color: Colors.blue)),
                    title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${s.bookings} bookings completed'),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.star, size: 14, color: Colors.amber),
                      Text(s.rating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 8),
                      Text('#${s.rank}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                    ]),
                  ),
                )),
              ],
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load')),
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
    return Expanded(child: Card(child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: color, size: 20)),
        const SizedBox(height: 12),
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 4),
        Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ]),
    )));
  }
}
