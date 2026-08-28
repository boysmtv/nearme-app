import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final bookingDetailProvider2 = FutureProvider.autoDispose.family<BookingRow, String>((ref, id) async {
  final response = await ApiService().getBooking(id);
  return BookingRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingDetailPage extends ConsumerStatefulWidget {
  final String bookingId;
  const BookingDetailPage({super.key, required this.bookingId});

  @override
  ConsumerState<BookingDetailPage> createState() => _BookingDetailPageState();
}

class _BookingDetailPageState extends ConsumerState<BookingDetailPage> {
  final _pinController = TextEditingController();
  bool _verifying = false;
  String? _pinMsg;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _verifyPin() async {
    final pin = _pinController.text.trim();
    if (pin.length != 6) {
      setState(() => _pinMsg = 'PIN harus 6 digit');
      return;
    }
    setState(() { _verifying = true; _pinMsg = null; });
    try {
      await ApiService().dio.post('/bookings/${widget.bookingId}/verify-pin', data: {'pin': pin});
      setState(() => _pinMsg = 'PIN terverifikasi! ✨');
      ref.invalidate(bookingDetailProvider2(widget.bookingId));
    } catch (e) {
      setState(() => _pinMsg = 'Gagal: $e');
    } finally {
      setState(() => _verifying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingAsync = ref.watch(bookingDetailProvider2(widget.bookingId));
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.receipt_long_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('Booking Detail', style: TextStyle(fontWeight: FontWeight.w800))]),
        centerTitle: true,
      ),
      body: bookingAsync.when(
        data: (booking) {
          final status = booking.status.toUpperCase();
          List<Color> statusGrad;
          Color statusColor;
          IconData statusIcon;
          switch (status) {
            case 'CONFIRMED':
              statusGrad = DEKATColors.softSky; statusColor = DEKATColors.info; statusIcon = Icons.verified_rounded;
              break;
            case 'COMPLETED':
              statusGrad = DEKATColors.softMint; statusColor = DEKATColors.success; statusIcon = Icons.check_circle_rounded;
              break;
            case 'CANCELLED':
              statusGrad = DEKATColors.softPink; statusColor = DEKATColors.error; statusIcon = Icons.cancel_rounded;
              break;
            default:
              statusGrad = DEKATColors.softPeach; statusColor = const Color(0xFFFF9F43); statusIcon = Icons.hourglass_top_rounded;
          }
          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 400), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Container(width: double.infinity, padding: const EdgeInsets.all(14), decoration: BoxDecoration(gradient: LinearGradient(colors: statusGrad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: statusColor.withValues(alpha: 0.18), blurRadius: 12, offset: const Offset(0, 4))]), child: Row(children: [
                Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)), child: Icon(statusIcon, color: statusColor, size: 20)),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(booking.bookingCode.isEmpty ? booking.id.substring(0, 8).toUpperCase() : booking.bookingCode, style: const TextStyle(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 14)), const SizedBox(height: 2), Text(status, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white, fontSize: 12))])),
                Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: Text(formatRupiah(booking.total), style: TextStyle(fontWeight: FontWeight.w800, color: statusColor, fontSize: 12))),
              ]))),
              const SizedBox(height: 16),
              _Section(title: 'Schedule', icon: Icons.calendar_month_rounded, gradient: DEKATColors.softViolet, children: [
                _InfoRow(label: 'Start', value: booking.startsAt != null ? _fmtDateTime(booking.startsAt!) : '-', icon: Icons.play_circle_rounded, bg: DEKATColors.softViolet.last, fg: DEKATColors.primary),
                _InfoRow(label: 'End', value: booking.endsAt != null ? _fmtDateTime(booking.endsAt!) : '-', icon: Icons.stop_circle_rounded, bg: DEKATColors.softPeach.last, fg: const Color(0xFFFF9F43)),
                _InfoRow(label: 'Created', value: booking.createdAt != null ? _fmtDate(booking.createdAt!) : '-', icon: Icons.history_rounded, bg: DEKATColors.softSky.last, fg: DEKATColors.info),
              ]),
              const SizedBox(height: 14),
              _Section(title: 'Payment', icon: Icons.payments_rounded, gradient: DEKATColors.softMint, children: [
                _InfoRow(label: 'Currency', value: booking.currency, icon: Icons.currency_exchange_rounded, bg: DEKATColors.softMint.last, fg: DEKATColors.success),
                _InfoRow(label: 'Subtotal', value: formatRupiah(booking.subtotal), icon: Icons.receipt_rounded, bg: Colors.grey[100]!, fg: Colors.grey[700]!),
                if (booking.discount > 0) _InfoRow(label: 'Discount', value: '- ${formatRupiah(booking.discount)}', icon: Icons.local_offer_rounded, bg: DEKATColors.successLight, fg: DEKATColors.success),
                if (booking.tax > 0) _InfoRow(label: 'Tax', value: formatRupiah(booking.tax), icon: Icons.request_quote_rounded, bg: DEKATColors.softPeach.last, fg: const Color(0xFFFF9F43)),
                if (booking.fee > 0) _InfoRow(label: 'Fee', value: formatRupiah(booking.fee), icon: Icons.layers_rounded, bg: DEKATColors.softSky.last, fg: DEKATColors.info),
                const SizedBox(height: 6),
                Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), decoration: BoxDecoration(gradient: const LinearGradient(colors: [DEKATColors.primaryLight, Color(0xFFF0E8FF)]), borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.12))), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Row(children: [Container(padding: const EdgeInsets.all(5), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet), shape: BoxShape.circle), child: const Icon(Icons.payments_rounded, color: Colors.white, size: 12)), const SizedBox(width: 8), const Text('Total', style: TextStyle(fontWeight: FontWeight.w800))]), Text(formatRupiah(booking.total), style: const TextStyle(fontWeight: FontWeight.w800, color: DEKATColors.primary, fontSize: 15))])),
              ]),
              const SizedBox(height: 14),
              _Section(title: 'PIN Verifikasi', icon: Icons.lock_rounded, gradient: DEKATColors.softPeach, children: [
                Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8), decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.grey[100]!)), child: Row(children: [Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: DEKATColors.warningLight, borderRadius: BorderRadius.circular(7)), child: const Icon(Icons.lightbulb_rounded, size: 12, color: Color(0xFFFF9F43))), const SizedBox(width: 8), const Expanded(child: Text('Tunjukkan PIN 6-digit ke staf saat check-in ✨', style: TextStyle(fontSize: 12, color: DEKATColors.textPrimary, fontWeight: FontWeight.w500)))])),
                const SizedBox(height: 12),
                if ((booking.confirmationPin ?? '').isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFFFF4D6), Color(0xFFFFE8EC)]), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFFFD67E).withValues(alpha: 0.5))),
                    child: Row(children: [
                      Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.lock_rounded, size: 18, color: Color(0xFFFF9F43))),
                      const SizedBox(width: 10),
                      Text(booking.confirmationPin!, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: 5, color: DEKATColors.textPrimary)),
                      const Spacer(),
                      Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5), decoration: BoxDecoration(color: booking.pinVerified == true ? DEKATColors.success : const Color(0xFFFF9F43), borderRadius: BorderRadius.circular(20)), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(booking.pinVerified == true ? Icons.verified_rounded : Icons.hourglass_empty_rounded, color: Colors.white, size: 12), const SizedBox(width: 4), Text(booking.pinVerified == true ? 'Terverifikasi' : 'Belum', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white))])),
                    ]),
                  ),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(child: Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[200]!)), child: TextField(controller: _pinController, keyboardType: TextInputType.number, maxLength: 6, textAlign: TextAlign.center, style: const TextStyle(letterSpacing: 6, fontWeight: FontWeight.w800, fontSize: 16), decoration: InputDecoration(hintText: '• • • • • •', hintStyle: TextStyle(color: Colors.grey[400], letterSpacing: 6), counterText: '', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none), filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(vertical: 14))))),
                  const SizedBox(width: 10),
                  Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.22), blurRadius: 10)]), child: ElevatedButton(onPressed: _verifying ? null : _verifyPin, style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: _verifying ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Verifikasi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)))),
                ]),
                if (_pinMsg != null) Container(margin: const EdgeInsets.only(top: 10), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), decoration: BoxDecoration(color: _pinMsg!.contains('terverifikasi') ? DEKATColors.successLight : DEKATColors.errorLight, borderRadius: BorderRadius.circular(10), border: Border.all(color: _pinMsg!.contains('terverifikasi') ? DEKATColors.success.withValues(alpha: 0.2) : DEKATColors.error.withValues(alpha: 0.2))), child: Row(children: [Icon(_pinMsg!.contains('terverifikasi') ? Icons.check_circle_rounded : Icons.error_rounded, size: 14, color: _pinMsg!.contains('terverifikasi') ? DEKATColors.success : DEKATColors.error), const SizedBox(width: 6), Expanded(child: Text(_pinMsg!, style: TextStyle(color: _pinMsg!.contains('terverifikasi') ? DEKATColors.success : DEKATColors.error, fontSize: 12, fontWeight: FontWeight.w600)))])),
              ]),
              const SizedBox(height: 80),
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
        error: (e, _) => Center(
          child: Container(margin: const EdgeInsets.all(24), padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12))), child: Column(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.error_outline_rounded, color: DEKATColors.error)), const SizedBox(height: 10), Text('Failed to load booking: $e', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[700], fontSize: 13)), const SizedBox(height: 12), FilledButton.icon(onPressed: () => ref.invalidate(bookingDetailProvider2(widget.bookingId)), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry'))])),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: const BorderRadius.vertical(top: Radius.circular(20)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, -4))]),
        child: SafeArea(child: OutlinedButton.icon(onPressed: () => _showCancelDialog(context, ref), icon: Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(7)), child: const Icon(Icons.cancel_rounded, size: 14, color: DEKATColors.error)), label: const Text('Cancel Booking', style: TextStyle(fontWeight: FontWeight.w700)), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), side: const BorderSide(color: DEKATColors.error, width: 1.4), foregroundColor: DEKATColors.error, backgroundColor: DEKATColors.errorLight, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))))),
      ),
    );
  }

  void _showCancelDialog(BuildContext context, WidgetRef ref) {
    showDialog(context: context, builder: (ctx) => AlertDialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      title: Row(children: [Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.warning_rounded, color: DEKATColors.error, size: 20)), const SizedBox(width: 10), const Text('Cancel Booking', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16))]),
      content: const Text('Are you sure you want to cancel this booking?', style: TextStyle(fontSize: 13)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), style: TextButton.styleFrom(foregroundColor: Colors.grey[700]), child: const Text('No')),
        FilledButton(onPressed: () async {
          Navigator.pop(ctx);
          try {
            final actorId = await SecureStorageService.read(StorageKeys.userId);
            await ApiService().dio.post(
                  '/bookings/${widget.bookingId}/cancel',
                  queryParameters: {'reason': 'Cancelled by customer'},
                  options: Options(headers: {'X-Actor-Id': actorId}),
                );
            ref.invalidate(bookingDetailProvider2(widget.bookingId));
            if (context.mounted) context.go('/bookings');
          } catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Cancel failed: $e'), backgroundColor: DEKATColors.error));
            }
          }
        }, style: FilledButton.styleFrom(backgroundColor: DEKATColors.error, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))), child: const Text('Yes, Cancel')),
      ],
    ));
  }

  String _fmtDateTime(DateTime d) =>
      '${d.day}/${d.month}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  String _fmtDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
}

class _Section extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Color> gradient;
  final List<Widget> children;
  const _Section({required this.title, required this.icon, required this.gradient, required this.children});
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: gradient.last.withValues(alpha: 0.5)), boxShadow: [BoxShadow(color: gradient.first.withValues(alpha: 0.09), blurRadius: 14, offset: const Offset(0, 4))]),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10), decoration: BoxDecoration(gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight)), child: Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 16, color: gradient.first)), const SizedBox(width: 8), Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13))])),
          Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children)),
        ]),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color bg, fg;
  const _InfoRow({required this.label, required this.value, required this.icon, required this.bg, required this.fg});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 5), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 12, color: fg)), const SizedBox(width: 8), Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))]), Flexible(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
    ]));
  }
}
