import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../domain/entities/booking_entity.dart';
import '../../../../shared/utils/format_rupiah.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

final bookingConfirmationProvider =
    FutureProvider.autoDispose.family<BookingEntity, String>((ref, id) async {
  final response = await ApiService().getBooking(id);
  return BookingEntity.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingConfirmationPage extends ConsumerWidget {
  final String bookingId;
  const BookingConfirmationPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(bookingConfirmationProvider(bookingId));
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Booking Berhasil', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(child: bookingAsync.when(
        data: (booking) {
          final code = booking.bookingCode.isEmpty ? booking.id : booking.bookingCode;
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            child: Column(children: [
              // Success hero
              RepaintBoundary(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                  child: Column(children: [
                    Container(
                      width: 84,
                      height: 84,
                      decoration: BoxDecoration(color: Colors.green.shade50, shape: BoxShape.circle, border: Border.all(color: Colors.green.shade100, width: 2)),
                      child: Icon(Icons.check_rounded, size: 44, color: Colors.green.shade600),
                    ),
                    const SizedBox(height: 14),
                    const Text('Booking Berhasil!', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20)),
                    const SizedBox(height: 6),
                    Text('Pesananmu sudah dikonfirmasi.\nTunjukkan kode booking saat datang.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 13, height: 1.5)),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.green.shade100)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.verified_rounded, size: 14, color: Colors.green.shade700),
                        const SizedBox(width: 4),
                        Text(booking.status, style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.w800, fontSize: 12)),
                      ]),
                    ),
                  ]),
                ),
              ),
              const SizedBox(height: 12),
              // Booking code hero
              RepaintBoundary(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: DEKATColors.primary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(children: [
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(Icons.confirmation_number_rounded, size: 14, color: Colors.white.withValues(alpha:0.85)),
                      const SizedBox(width: 6),
                      Text('KODE BOOKING', style: TextStyle(color: Colors.white.withValues(alpha:0.85), fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                    ]),
                    const SizedBox(height: 8),
                    Text(code, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 26, letterSpacing: 1.5)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha:0.15), borderRadius: BorderRadius.circular(20)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.calendar_today_rounded, size: 12, color: Colors.white),
                        const SizedBox(width: 6),
                        Text(booking.startsAt != null ? _fmt(booking.startsAt!) : '-', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                      ]),
                    ),
                  ]),
                ),
              ),
              const SizedBox(height: 12),
              // Detail card
              RepaintBoundary(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Detail Booking', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                    const SizedBox(height: 12),
                    _DetailRow(icon: Icons.confirmation_number_rounded, label: 'Kode Booking', value: code),
                    Divider(color: Colors.grey.shade100, height: 20),
                    _DetailRow(icon: Icons.info_outline_rounded, label: 'Status', value: booking.status),
                    Divider(color: Colors.grey.shade100, height: 20),
                    _DetailRow(icon: Icons.calendar_today_rounded, label: 'Tanggal & Waktu', value: booking.startsAt != null ? _fmt(booking.startsAt!) : '-'),
                    Divider(color: Colors.grey.shade100, height: 20),
                    _DetailRow(icon: Icons.payments_rounded, label: 'Total', value: formatRupiah(booking.total)),
                  ]),
                ),
              ),
              const SizedBox(height: 12),
              // Next steps
              RepaintBoundary(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.list_alt_rounded, size: 16, color: DEKATColors.primary)),
                      const SizedBox(width: 10),
                      const Text('Langkah Selanjutnya', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                    ]),
                    const SizedBox(height: 12),
                    _NextStep(number: '1', text: 'Datang 10 menit lebih awal dari jadwal'),
                    const SizedBox(height: 8),
                    _NextStep(number: '2', text: 'Tunjukkan kode booking ke staf'),
                    const SizedBox(height: 8),
                    _NextStep(number: '3', text: 'Selesaikan pembayaran sesuai metode'),
                  ]),
                ),
              ),
            ]),
          );
        },
        loading: () => const Padding(
          padding: EdgeInsets.all(16),
          child: ShimmerProviderDetail(),
        ),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle), child: Icon(Icons.error_outline_rounded, size: 32, color: Colors.red.shade400)),
                const SizedBox(height: 12),
                const Text('Gagal memuat booking', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 6),
                Text('Failed to load booking: $e', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () => ref.invalidate(bookingConfirmationProvider(bookingId)),
                    icon: const Icon(Icons.refresh_rounded, size: 16),
                    label: const Text('Coba Lagi'),
                    style: FilledButton.styleFrom(backgroundColor: DEKATColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  ),
                ),
              ]),
            ),
          ),
        ),
      )),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        decoration: BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Colors.grey.shade100)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha:0.06), blurRadius: 16, offset: const Offset(0, -4))]),
        child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () => context.go('/bookings'),
              style: ElevatedButton.styleFrom(backgroundColor: DEKATColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), elevation: 4, shadowColor: DEKATColors.primary.withValues(alpha:0.4)),
              child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.receipt_long_rounded, size: 18), SizedBox(width: 8), Text('Lihat Booking Saya', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15))]),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: TextButton(onPressed: () => context.go('/discovery'), style: TextButton.styleFrom(foregroundColor: DEKATColors.primary, padding: const EdgeInsets.symmetric(vertical: 12)), child: const Text('Kembali ke Beranda', style: TextStyle(fontWeight: FontWeight.w700))),
          ),
        ])),
      ),
    );
  }

  String _fmt(DateTime d) =>
      '${d.day}/${d.month}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

class _NextStep extends StatelessWidget {
  final String number;
  final String text;
  const _NextStep({required this.number, required this.text});
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), shape: BoxShape.circle),
        child: Center(child: Text(number, style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 12))),
      ),
      const SizedBox(width: 10),
      Expanded(child: Text(text, style: TextStyle(color: Colors.grey.shade700, fontSize: 13))),
    ]);
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _DetailRow({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 16, color: Colors.grey.shade600)),
      const SizedBox(width: 12),
      Expanded(child: Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13))),
      const SizedBox(width: 12),
      Flexible(child: Text(value, textAlign: TextAlign.right, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13))),
    ]);
  }
}
