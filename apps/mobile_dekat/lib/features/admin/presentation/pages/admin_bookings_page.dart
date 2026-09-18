import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final adminBookingsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final res =
      await ApiService().getAdminBookings(params: {'page': 1, 'limit': 50});
  final data = res.data['data'];
  final list = data is Map<String, dynamic> ? data['data'] : data;
  if (list is List) return list.cast<Map<String, dynamic>>();
  throw Exception('Data booking tidak tersedia');
});

Color _statusColor(String status) {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return const Color(0xFF2196F3);
    case 'COMPLETED':
      return const Color(0xFF4CAF50);
    case 'CANCELLED':
      return const Color(0xFFF44336);
    default:
      return Colors.orange;
  }
}

class AdminBookingsPage extends ConsumerWidget {
  const AdminBookingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(adminBookingsProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Semua Booking',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: bookingsAsync.when(
        data: (bookings) {
          if (bookings.isEmpty) {
            return const Center(child: Text('Belum ada booking'));
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: bookings.length,
            itemBuilder: (context, i) {
              final b = bookings[i];
              final code =
                  '${b['bookingCode'] ?? b['code'] ?? b['id'] ?? '-'}';
              final status = '${b['status'] ?? ''}';
              final color = _statusColor(status);
              final customer =
                  '${b['customerName'] ?? b['customerEmail'] ?? ''}';
              final provider =
                  '${b['providerName'] ?? b['tenantName'] ?? ''}';
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(code,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              status.isEmpty ? '-' : status,
                              style: TextStyle(
                                  color: color,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800),
                            ),
                          ),
                        ],
                      ),
                      if (customer.isNotEmpty || provider.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          [customer, provider]
                              .where((s) => s.isNotEmpty)
                              .join(' • '),
                          style: TextStyle(
                              color: Colors.grey[600], fontSize: 12),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Gagal memuat booking'),
              TextButton(
                onPressed: () => ref.invalidate(adminBookingsProvider),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
