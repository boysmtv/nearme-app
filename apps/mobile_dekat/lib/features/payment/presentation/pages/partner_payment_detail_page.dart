import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final paymentDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, id) async {
  final res = await ApiService().getPayment(id);
  final data = res.data['data'];
  if (data is Map<String, dynamic>) return data;
  throw Exception('Payment not found');
});

class PartnerPaymentDetailPage extends ConsumerWidget {
  final String paymentId;

  const PartnerPaymentDetailPage({super.key, required this.paymentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(paymentDetailProvider(paymentId));
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Detail Pembayaran',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1D26),
        elevation: 0,
      ),
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
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                      vertical: 24, horizontal: 16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isCompleted
                          ? [Colors.green.shade500, Colors.green.shade300]
                          : [
                              DEKATColors.primary,
                              const Color(0xFF9D97FF)
                            ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isCompleted
                              ? Icons.check_circle_outline
                              : Icons.hourglass_empty_outlined,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(formatRupiah(amount),
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          )),
                      const SizedBox(height: 4),
                      Text('Pembayaran #$txnId',
                          style: const TextStyle(
                              color: Colors.white70, fontSize: 12)),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          isCompleted ? 'Berhasil' : status,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
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
                      const Text('Detail Transaksi',
                          style: TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 15)),
                      const SizedBox(height: 12),
                      _DetailRow(
                          label: 'Metode Pembayaran',
                          value: paymentMethod,
                          icon: Icons.payment_outlined),
                      const Divider(height: 20),
                      _DetailRow(
                          label: 'Status',
                          value: isCompleted ? 'Berhasil' : status,
                          icon: Icons.info_outline,
                          valueColor: isCompleted
                              ? Colors.green.shade700
                              : Colors.orange.shade700),
                      const Divider(height: 20),
                      _DetailRow(
                          label: 'ID Transaksi',
                          value: txnId,
                          icon: Icons.receipt_long_outlined),
                      const Divider(height: 20),
                      _DetailRow(
                          label: 'Waktu Transaksi',
                          value: createdAt,
                          icon: Icons.schedule_outlined),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: DEKATColors.primary.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color:
                            DEKATColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.shield_outlined,
                          size: 20, color: DEKATColors.primary),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Transaksi ini diproses dengan aman melalui payment gateway terverifikasi.',
                          style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              height: 1.5),
                        ),
                      ),
                    ],
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
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: const Icon(Icons.error_outline,
                    size: 40, color: Colors.red),
              ),
              const SizedBox(height: 12),
              Text('Gagal memuat: $e',
                  style: const TextStyle(color: Colors.red)),
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
  final IconData icon;
  final Color? valueColor;

  const _DetailRow(
      {required this.label,
      required this.value,
      required this.icon,
      this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Icon(icon, size: 18, color: Colors.grey[600]),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: TextStyle(color: Colors.grey[500], fontSize: 12)),
              const SizedBox(height: 2),
              Text(value,
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: valueColor)),
            ],
          ),
        ),
      ],
    );
  }
}

String formatRupiah(num amount) {
  final value = amount.round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  return 'Rp $value';
}
