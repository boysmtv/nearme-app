import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/utils/format_rupiah.dart';

class PaymentSuccessPage extends ConsumerWidget {
  final String bookingId;
  final String? bookingCode;
  final num amount;
  final String currency;
  final String? method;
  const PaymentSuccessPage({
    super.key,
    required this.bookingId,
    this.bookingCode,
    required this.amount,
    required this.currency,
    this.method,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            const SizedBox(height: 16),
            Container(
              width: 152,
              height: 152,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.green.withValues(alpha: 0.12),
              ),
              child: Container(
                width: 116,
                height: 116,
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.green[100]!, width: 4),
                ),
                child: Icon(Icons.check_rounded, size: 64, color: Colors.green[600]),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Pembayaran Berhasil!',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Pembayaran Anda telah berhasil diproses. Detail booking tersimpan di akun Anda.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 20),
            RepaintBoundary(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: DEKATColors.primary.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.payments_rounded, color: DEKATColors.primary, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Total Dibayar', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(height: 2),
                      Text(formatRupiah(amount), style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 20)),
                    ]),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.green[100]!)),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.check_circle_rounded, size: 12, color: Colors.green[700]),
                      const SizedBox(width: 4),
                      Text('Lunas', style: TextStyle(color: Colors.green[700], fontWeight: FontWeight.w700, fontSize: 11)),
                    ]),
                  ),
                ]),
              ),
            ),
            if (bookingCode != null && bookingCode!.isNotEmpty) ...[
              const SizedBox(height: 12),
              RepaintBoundary(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: DEKATColors.primary.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.25)),
                  ),
                  child: Column(children: [
                    Text('Kode Booking', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(
                      bookingCode!,
                      style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 22, letterSpacing: 2),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text('Tunjukkan kode ini saat check-in', style: TextStyle(color: Colors.grey[600], fontSize: 11)),
                  ]),
                ),
              ),
            ],
            const SizedBox(height: 12),
            RepaintBoundary(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Detail Pembayaran', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                  const SizedBox(height: 8),
                  const Divider(height: 1),
                  _ReceiptRow(label: 'ID Booking', value: bookingId.isEmpty ? '-' : bookingId),
                  const Divider(height: 1),
                  if (bookingCode != null && bookingCode!.isNotEmpty) ...[
                    _ReceiptRow(label: 'Kode Booking', value: bookingCode!),
                    const Divider(height: 1),
                  ],
                  _ReceiptRow(label: 'Jumlah Dibayar', value: formatRupiah(amount)),
                  const Divider(height: 1),
                  _ReceiptRow(label: 'Metode Pembayaran', value: method ?? '-'),
                ]),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.15), shape: BoxShape.circle),
                  child: const Icon(Icons.info_outline_rounded, size: 18, color: Colors.amber),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Simpan bukti pembayaran ini. Riwayat lengkap tersedia di menu Booking.',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12, height: 1.5),
                  ),
                ),
              ]),
            ),
          ]),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        padding: const EdgeInsets.all(16),
        child: SafeArea(
          top: false,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => bookingId.isEmpty ? context.go('/bookings') : context.go('/booking/$bookingId'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DEKATColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Lihat Booking', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 4),
            TextButton(onPressed: () => context.go('/discovery'), child: const Text('Kembali ke Beranda')),
          ]),
        ),
      ),
    );
  }
}

class _ReceiptRow extends StatelessWidget {
  final String label, value;
  const _ReceiptRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(children: [
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            value,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.end,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
        ),
      ]),
    );
  }
}
