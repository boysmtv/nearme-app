import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final bookingConfirmationProvider =
    FutureProvider.autoDispose.family<BookingRow, String>((ref, id) async {
  final response = await ApiService().getBooking(id);
  return BookingRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingConfirmationPage extends ConsumerWidget {
  final String bookingId;
  const BookingConfirmationPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(bookingConfirmationProvider(bookingId));
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(child: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
        child: bookingAsync.when(
          data: (booking) => SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 600), curve: Curves.elasticOut, builder: (c,v,ch)=> Transform.scale(scale: 0.7+0.3*v, child: ch), child: Container(width: 110, height: 110, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint, begin: Alignment.topLeft, end: Alignment.bottomRight), shape: BoxShape.circle, boxShadow: [BoxShadow(color: DEKATColors.success.withValues(alpha: 0.26), blurRadius: 20, offset: const Offset(0, 8))]), child: const Icon(Icons.check_rounded, size: 56, color: Colors.white))),
              const SizedBox(height: 20),
              TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Column(children: [
                Text('Booking Confirmed! 🎉', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.4)),
                const SizedBox(height: 8),
                Text('Your booking has been successfully confirmed.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
              ])),
              const SizedBox(height: 24),
              Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.successLight), boxShadow: [BoxShadow(color: DEKATColors.success.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 6))]),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: Column(children: [
                    Container(width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softMint, begin: Alignment.topLeft, end: Alignment.bottomRight)), child: Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.receipt_long_rounded, color: DEKATColors.success, size: 16)), const SizedBox(width: 8), const Text('Detail Booking', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)), const Spacer(), const Icon(Icons.verified_rounded, color: Colors.white, size: 18)])),
                    Padding(padding: const EdgeInsets.all(16), child: Column(children: [
                      _DetailRow(icon: Icons.confirmation_number_rounded, label: 'Booking Code', value: booking.bookingCode.isEmpty ? booking.id.substring(0, 8) : booking.bookingCode, iconBg: DEKATColors.softViolet.last, iconColor: DEKATColors.primary),
                      Divider(color: Colors.grey[100]),
                      _DetailRow(icon: Icons.info_rounded, label: 'Status', value: booking.status, iconBg: DEKATColors.softSky.last, iconColor: DEKATColors.info),
                      Divider(color: Colors.grey[100]),
                      _DetailRow(icon: Icons.calendar_month_rounded, label: 'Date & Time', value: booking.startsAt != null ? _fmt(booking.startsAt!) : '-', iconBg: DEKATColors.softPeach.last, iconColor: const Color(0xFFFF9F43)),
                      Divider(color: Colors.grey[100]),
                      _DetailRow(icon: Icons.payments_rounded, label: 'Total', value: formatRupiah(booking.total), iconBg: DEKATColors.successLight, iconColor: DEKATColors.success, valueColor: DEKATColors.primary),
                    ])),
                  ]),
                ),
              ),
              const SizedBox(height: 16),
              Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFFC9B6FF), Color(0xFF8B8CFF)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.all(Radius.circular(12))), child: Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.lightbulb_rounded, color: Color(0xFF9B7CFF), size: 14)), const SizedBox(width: 8), Expanded(child: Text('Tunjukkan kode booking saat datang ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12, shadows: [Shadow(color: Colors.black, blurRadius: 2)])))]),
              ),
            ]),
          ),
          loading: () => const CircularProgressIndicator(color: DEKATColors.primary),
          error: (e, _) => Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12))),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.error_outline_rounded, size: 28, color: DEKATColors.error)),
              const SizedBox(height: 12),
              Text('Failed to load booking', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('$e', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
              const SizedBox(height: 12),
              FilledButton.icon(onPressed: () => ref.invalidate(bookingConfirmationProvider(bookingId)), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry')),
            ]),
          ),
        ),
      ))),
      bottomNavigationBar: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: const BorderRadius.vertical(top: Radius.circular(20)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, -4))]), child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.24), blurRadius: 12, offset: const Offset(0, 4))]), child: ElevatedButton(onPressed: () => context.go('/bookings'), style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.calendar_today_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('View My Bookings ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]))),
        const SizedBox(height: 8),
        TextButton(onPressed: () => context.go('/discovery'), style: TextButton.styleFrom(foregroundColor: DEKATColors.primary), child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w600))),
      ]))),
    );
  }

  String _fmt(DateTime d) =>
      '${d.day}/${d.month}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color iconBg;
  final Color iconColor;
  final Color? valueColor;
  const _DetailRow({required this.icon, required this.label, required this.value, required this.iconBg, required this.iconColor, this.valueColor});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 7), child: Row(children: [
      Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(9)), child: Icon(icon, size: 16, color: iconColor)), const SizedBox(width: 12), Expanded(child: Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))),
      Flexible(child: Text(value, overflow: TextOverflow.ellipsis, textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: valueColor ?? DEKATColors.textPrimary))),
    ]));
  }
}
