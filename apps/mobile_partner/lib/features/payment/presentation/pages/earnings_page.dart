import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final earningsProvider = FutureProvider.autoDispose<Earnings>((ref) async {
  try {
    final response = await ApiService().getPartnerEarnings();
    return Earnings.fromJson(response.data['data']);
  } catch (e) {
    return const Earnings(totalEarnings: 0, thisWeek: 0, thisMonth: 0, recentTransactions: []);
  }
});

class EarningsPage extends ConsumerWidget {
  const EarningsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final earningsAsync = ref.watch(earningsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Earnings')),
      body: earningsAsync.when(
        data: (earnings) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Card(child: Container(
                width: double.infinity, padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Theme.of(context).colorScheme.primary, Theme.of(context).colorScheme.primary.withOpacity(0.7)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Total Earnings', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text('Rp ${earnings.totalEarnings}', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(children: [
                    _MiniStat(label: 'This Week', value: 'Rp ${earnings.thisWeek}'),
                    const SizedBox(width: 24),
                    _MiniStat(label: 'This Month', value: 'Rp ${earnings.thisMonth}'),
                  ]),
                ]),
              )),
              const SizedBox(height: 24),
              const Text('Recent Transactions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              if (earnings.recentTransactions == null || earnings.recentTransactions!.isEmpty)
                Center(child: Column(children: [
                  Icon(Icons.receipt_long, size: 48, color: Colors.grey[300]),
                  const SizedBox(height: 8), Text('No transactions yet', style: TextStyle(color: Colors.grey)),
                ]))
              else ...earnings.recentTransactions!.map((t) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: t.status == 'completed' ? Colors.green[50] : Colors.grey[100],
                    child: Icon(Icons.receipt, color: t.status == 'completed' ? Colors.green : Colors.grey),
                  ),
                  title: Text(t.customerName, style: const TextStyle(fontWeight: FontWeight.w500)),
                  subtitle: Text(t.service, style: const TextStyle(fontSize: 12)),
                  trailing: Text('Rp ${t.amount}', style: TextStyle(color: t.status == 'completed' ? Colors.green : Colors.orange, fontWeight: FontWeight.bold)),
                ),
              )),
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load earnings')),
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
