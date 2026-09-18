import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final customersProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ApiService().getCustomers();
    final data = res.data['data'];
    if (data is Map && data['content'] is List) return (data['content'] as List).cast<Map<String, dynamic>>();
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  } catch (_) {
    return [];
  }
});

class CustomersPage extends ConsumerWidget {
  const CustomersPage({super.key});

  String _formatRupiah(dynamic value) {
    final amount = (value as num?)?.toInt() ?? 0;
    final text = amount.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
    return 'Rp $text';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customersAsync = ref.watch(customersProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Pelanggan'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
      ),
      body: customersAsync.when(
        data: (customers) {
          if (customers.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: DEKATColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.people_outline, size: 44, color: DEKATColors.primary),
                    ),
                    const SizedBox(height: 20),
                    const Text('Belum ada pelanggan',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Text('Pelanggan yang pernah memesan akan tampil di sini',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                  ],
                ),
              ),
            );
          }
          final totalBookings =
              customers.fold<int>(0, (sum, c) => sum + (((c['totalBookings'] as num?)?.toInt() ?? 0)));
          final totalRevenue =
              customers.fold<int>(0, (sum, c) => sum + (((c['totalSpent'] as num?)?.toInt() ?? 0)));
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: DEKATColors.primary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                          child: _CustomerHeaderStat(
                              value: '${customers.length}', label: 'Pelanggan')),
                      Container(
                          width: 1,
                          height: 36,
                          color: Colors.white.withValues(alpha: 0.3)),
                      Expanded(
                          child: _CustomerHeaderStat(
                              value: '$totalBookings', label: 'Booking')),
                      Container(
                          width: 1,
                          height: 36,
                          color: Colors.white.withValues(alpha: 0.3)),
                      Expanded(
                          child: _CustomerHeaderStat(
                              value: _formatRupiah(totalRevenue),
                              label: 'Pendapatan')),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: Row(
                  children: [
                    Text('Semua pelanggan',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800])),
                    const Spacer(),
                    Text('${customers.length} orang',
                        style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  itemCount: customers.length,
                  itemBuilder: (context, index) {
                    final c = customers[index];
                    final name = c['name'] ?? c['email'] ?? 'Pelanggan';
                    final email = c['email'] ?? '';
                    final totalBookings = c['totalBookings'] ?? 0;
                    final totalSpent = c['totalSpent'] ?? 0;
                    final initial = name.toString().isNotEmpty
                        ? name.toString().substring(0, 1).toUpperCase()
                        : '?';
                    return RepaintBoundary(
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Container(
                                width: 52,
                                height: 52,
                                decoration: BoxDecoration(
                                  color: DEKATColors.primary.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(initial,
                                      style: TextStyle(
                                          color: DEKATColors.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 20)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(name.toString(),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w600, fontSize: 14)),
                                    const SizedBox(height: 2),
                                    Text(email.toString(),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                            fontSize: 12, color: Colors.grey[500])),
                                    const SizedBox(height: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF8F9FF),
                                        borderRadius: BorderRadius.circular(8),
                                        border:
                                            Border.all(color: Colors.grey.shade200),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.calendar_month_outlined,
                                              size: 12, color: Colors.grey[600]),
                                          const SizedBox(width: 4),
                                          Text('$totalBookings booking',
                                              style: TextStyle(
                                                  fontSize: 11,
                                                  color: Colors.grey[700])),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text('Total belanja',
                                      style: TextStyle(
                                          fontSize: 10, color: Colors.grey[500])),
                                  const SizedBox(height: 2),
                                  Text(_formatRupiah(totalSpent),
                                      style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: DEKATColors.primary)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _CustomerHeaderStat extends StatelessWidget {
  final String value;
  final String label;
  const _CustomerHeaderStat({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.85))),
      ],
    );
  }
}
