import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../shared/models/rows.dart';

final partnerBookingDetailProvider = FutureProvider.autoDispose.family<PartnerBookingRow, String>((ref, id) async {
  final response = await ApiService().dio.get('/provider/bookings/$id');
  return PartnerBookingRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingDetailPage extends ConsumerWidget {
  final String bookingId;
  const BookingDetailPage({super.key, required this.bookingId});

  Color _statusColor(String s) {
    return switch (s) {
      'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => const Color(0xFF5AA9E6),
      'COMPLETED' => const Color(0xFF4CAF7D),
      'CANCELLED' || 'NO_SHOW' => DEKATColors.secondary,
      _ => const Color(0xFFE6A532),
    };
  }

  List<Color> _statusGradient(String s) {
    return switch (s) {
      'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => DEKATColors.softSky,
      'COMPLETED' => DEKATColors.softMint,
      'CANCELLED' || 'NO_SHOW' => DEKATColors.softPink,
      _ => DEKATColors.softPeach,
    };
  }

  IconData _statusIcon(String s) {
    return switch (s) {
      'CONFIRMED' || 'CHECKED_IN' => Icons.verified_rounded,
      'IN_SERVICE' => Icons.auto_awesome_rounded,
      'COMPLETED' => Icons.check_circle_rounded,
      'CANCELLED' || 'NO_SHOW' => Icons.cancel_rounded,
      _ => Icons.hourglass_top_rounded,
    };
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(partnerBookingDetailProvider(bookingId));

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: DEKATColors.backgroundLight,
        title: const Text('Detail Booking'),
        centerTitle: true,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)]),
          child: IconButton(icon: const Icon(Icons.arrow_back_rounded, size: 20), onPressed: () => Navigator.pop(context)),
        ),
      ),
      body: bookingAsync.when(
        data: (booking) {
          final status = booking.status.toUpperCase();
          final isPending = status == 'PENDING' || status == 'HELD' || status == 'PENDING_APPROVAL';
          final col = _statusColor(status);
          final grad = _statusGradient(status);
          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Hero header card
              Hero(
                tag: 'booking-$bookingId',
                child: Material(
                  color: Colors.transparent,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [BoxShadow(color: grad[0].withValues(alpha: 0.22), blurRadius: 14, offset: const Offset(0, 6))],
                      border: Border.all(color: Colors.white.withValues(alpha: 0.7)),
                    ),
                    child: Row(children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8)]),
                        child: Icon(_statusIcon(status), color: col, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.9), borderRadius: BorderRadius.circular(20)),
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              Container(width: 6, height: 6, decoration: BoxDecoration(color: col, shape: BoxShape.circle)),
                              const SizedBox(width: 6),
                              Text(status.isNotEmpty ? status[0] + status.substring(1).toLowerCase() : '-', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: col)),
                            ]),
                          ),
                          const SizedBox(height: 6),
                          Text(booking.bookingCode.isEmpty ? '#${booking.id.substring(0, 8).toUpperCase()}' : booking.bookingCode,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white, letterSpacing: -0.3)),
                          Text(isPending ? 'Menunggu konfirmasi • ketuk Terima/Tolak di bawah' : 'Booking ID: ${booking.id.substring(0, 8)}', style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.85), fontWeight: FontWeight.w500)),
                        ]),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                        child: Text(formatRupiah(booking.amount), style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: col)),
                      ),
                    ]),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Customer card
              _SectionCard(
                icon: Icons.person_rounded,
                iconGradient: DEKATColors.softViolet,
                iconColor: DEKATColors.primary,
                title: 'Pelanggan',
                children: [
                  _InfoRow(icon: Icons.badge_outlined, label: 'Nama', value: booking.customerName, softColor: DEKATColors.softViolet),
                  _InfoRow(icon: Icons.spa_rounded, label: 'Layanan', value: booking.serviceName.isEmpty ? '-' : booking.serviceName, softColor: DEKATColors.softSky),
                  _InfoRow(icon: Icons.schedule_rounded, label: 'Waktu', value: booking.time.isEmpty ? '-' : booking.time, softColor: DEKATColors.softPeach),
                ],
              ),
              const SizedBox(height: 12),
              _SectionCard(
                icon: Icons.payments_rounded,
                iconGradient: DEKATColors.softMint,
                iconColor: const Color(0xFF4CAF7D),
                title: 'Pembayaran',
                children: [
                  _InfoRow(icon: Icons.account_balance_wallet_rounded, label: 'Total', value: formatRupiah(booking.amount), softColor: DEKATColors.softMint, valueEmphasis: true),
                  _InfoRow(icon: Icons.receipt_long_rounded, label: 'Kode', value: booking.bookingCode.isEmpty ? '-' : booking.bookingCode, softColor: DEKATColors.softLavender),
                  _InfoRow(icon: Icons.verified_rounded, label: 'Status', value: status.isNotEmpty ? status[0] + status.substring(1).toLowerCase() : '-', softColor: grad, valueColor: col),
                ],
              ),
              const SizedBox(height: 16),
              // Timeline hint
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[100]!)),
                child: Row(children: [
                  Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DEKATColors.softPeach[1], borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.lightbulb_rounded, size: 16, color: Color(0xFFE6A532))),
                  const SizedBox(width: 10),
                  Expanded(child: Text(isPending ? 'Segera konfirmasi agar pelanggan tidak menunggu lama.' : 'Hubungi pelanggan jika ada perubahan jadwal.', style: TextStyle(fontSize: 12, color: Colors.grey[700], fontWeight: FontWeight.w500, height: 1.4))),
                ]),
              ),
              const SizedBox(height: 80),
            ]),
          );
        },
        loading: () => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 96, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)))),
            const SizedBox(height: 16),
            Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 140, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
            const SizedBox(height: 12),
            Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
          ],
        ),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Container(padding: const EdgeInsets.all(12), decoration: const BoxDecoration(color: DEKATColors.errorLight, shape: BoxShape.circle), child: const Icon(Icons.error_outline_rounded, color: DEKATColors.error)),
                const SizedBox(height: 12),
                const Text('Gagal memuat detail', style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                const SizedBox(height: 14),
                FilledButton.icon(onPressed: () => ref.invalidate(partnerBookingDetailProvider(bookingId)), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba lagi')),
              ]),
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, -4))], borderRadius: const BorderRadius.vertical(top: Radius.circular(18))),
        child: SafeArea(
          child: bookingAsync.when(
            data: (booking) {
              final status = booking.status.toUpperCase();
              if (status != 'PENDING' && status != 'HELD' && status != 'PENDING_APPROVAL') {
                return Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(12)),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(_statusIcon(status), size: 16, color: _statusColor(status)),
                    const SizedBox(width: 8),
                    Text('Booking sudah $status', style: TextStyle(fontWeight: FontWeight.w700, color: _statusColor(status), fontSize: 13)),
                  ]),
                );
              }
              return Row(children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _updateStatus(context, ref, 'CANCELLED'),
                    icon: const Icon(Icons.close_rounded, size: 18),
                    label: const Text('Tolak'),
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), side: const BorderSide(color: DEKATColors.error), foregroundColor: DEKATColors.error, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DecoratedBox(
                    decoration: BoxDecoration(gradient: const LinearGradient(colors: [DEKATColors.primary, Color(0xFFA48BFF)]), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 10, offset: const Offset(0, 4))]),
                    child: ElevatedButton.icon(
                      onPressed: () => _updateStatus(context, ref, 'CONFIRMED'),
                      icon: const Icon(Icons.check_rounded, size: 18),
                      label: const Text('Terima'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    ),
                  ),
                ),
              ]);
            },
            loading: () => const SizedBox(height: 48),
            error: (_, __) => const SizedBox(),
          ),
        ),
      ),
    );
  }

  Future<void> _updateStatus(BuildContext context, WidgetRef ref, String status) async {
    try {
      await ApiService().updateBookingStatus(bookingId, status);
      ref.invalidate(partnerBookingDetailProvider(bookingId));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Row(children: [Icon(status == 'CONFIRMED' ? Icons.check_circle_rounded : Icons.info_rounded, color: Colors.white, size: 18), const SizedBox(width: 8), Text(status == 'CONFIRMED' ? 'Booking diterima 🎉' : 'Booking ditolak')]),
          backgroundColor: status == 'CONFIRMED' ? const Color(0xFF4CAF7D) : DEKATColors.textPrimary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: DEKATColors.error, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))));
      }
    }
  }
}

class _SectionCard extends StatelessWidget {
  final IconData icon;
  final List<Color> iconGradient;
  final Color iconColor;
  final String title;
  final List<Widget> children;
  const _SectionCard({required this.icon, required this.iconGradient, required this.iconColor, required this.title, required this.children});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(gradient: LinearGradient(colors: iconGradient), borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 16, color: iconColor)),
          const SizedBox(width: 10),
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: -0.2)),
          const Spacer(),
          Container(width: 28, height: 4, decoration: BoxDecoration(color: iconGradient[1], borderRadius: BorderRadius.circular(4))),
        ]),
        const SizedBox(height: 14),
        ...children,
      ]),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final List<Color> softColor;
  final bool valueEmphasis;
  final Color? valueColor;
  const _InfoRow({required this.icon, required this.label, required this.value, required this.softColor, this.valueEmphasis = false, this.valueColor});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(children: [
        Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: softColor[1], borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 14, color: softColor[0])),
        const SizedBox(width: 10),
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.w600)),
        const Spacer(),
        Flexible(
          child: Text(value,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontWeight: valueEmphasis ? FontWeight.w800 : FontWeight.w600, fontSize: valueEmphasis ? 13 : 12, color: valueColor ?? DEKATColors.textPrimary)),
        ),
      ]),
    );
  }
}
