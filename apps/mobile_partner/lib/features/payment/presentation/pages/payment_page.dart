import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final paymentDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, id) async {
  final res = await ApiService().getPayment(id);
  final data = res.data['data'];
  if (data is Map<String, dynamic>) return data;
  throw Exception('Payment not found');
});

class PaymentPage extends ConsumerWidget {
  final String paymentId;

  const PaymentPage({super.key, required this.paymentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(paymentDetailProvider(paymentId));
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Pembayaran')),
      body: detailAsync.when(
        data: (data) {
          final amount = (data['amount'] ?? data['totalAmount'] ?? 0) as num;
          final status = (data['status'] ?? 'UNKNOWN').toString();
          final paymentMethod = (data['paymentMethod'] ?? data['gatewayProvider'] ?? '-').toString();
          final txnId = (data['id'] ?? paymentId).toString();
          final createdAt = (data['createdAt'] ?? '-').toString();
          final isCompleted = status.toUpperCase() == 'CAPTURED' || status.toUpperCase() == 'SETTLEMENT' || status.toUpperCase() == 'SUCCESS';

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Text('Pembayaran #$txnId',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(formatRupiah(amount),
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.primary,
                            )),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: isCompleted ? Colors.green[50] : Colors.orange[50],
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(status, style: TextStyle(color: isCompleted ? Colors.green : Colors.orange)),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Detail Transaksi',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        _DetailRow(label: 'Metode Pembayaran', value: paymentMethod),
                        _DetailRow(label: 'Status', value: status),
                        _DetailRow(label: 'Transaction ID', value: txnId),
                        _DetailRow(label: 'Waktu', value: createdAt),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Gagal memuat: $e', style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(paymentDetailProvider(paymentId)),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Flexible(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}

String formatRupiah(num amount) {
  final value = amount.round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  return 'Rp $value';
}
