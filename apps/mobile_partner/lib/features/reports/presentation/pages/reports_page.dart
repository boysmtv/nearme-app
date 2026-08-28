import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
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
      appBar: AppBar(title: const Text('Reports')),
      body: reportAsync.when(
        data: (report) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
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
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load reports'),
              TextButton(onPressed: () => ref.invalidate(reportProvider), child: const Text('Coba lagi')),
            ],
          ),
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
    return Expanded(child: Card(child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: color, size: 20)),
        const SizedBox(height: 12),
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 4),
        Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ]),
    )));
  }
}
