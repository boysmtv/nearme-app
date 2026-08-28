import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

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
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(child: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 700), curve: Curves.elasticOut, builder: (c,v,ch)=> Transform.scale(scale: 0.6+0.4*v, child: Opacity(opacity: v.clamp(0,1), child: ch)), child: Container(width: 120, height: 120, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint, begin: Alignment.topLeft, end: Alignment.bottomRight), shape: BoxShape.circle, boxShadow: [BoxShadow(color: DEKATColors.success.withValues(alpha: 0.28), blurRadius: 24, offset: const Offset(0, 8))]), child: const Icon(Icons.check_rounded, size: 64, color: Colors.white))),
            const SizedBox(height: 20),
            TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Column(children: [
              Text('Payment Successful! 🎉', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.4)),
              const SizedBox(height: 8),
              Text('Your payment has been processed successfully.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
              const SizedBox(height: 6),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5), decoration: BoxDecoration(gradient: const LinearGradient(colors: [DEKATColors.successLight, Color(0xFFE8F2FF)]), borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.success.withValues(alpha: 0.14))), child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.verified_rounded, size: 12, color: DEKATColors.success), const SizedBox(width: 5), Text('Secure • Encrypted', style: TextStyle(color: DEKATColors.success, fontSize: 11, fontWeight: FontWeight.w700))])),
            ])),
            const SizedBox(height: 24),
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.successLight), boxShadow: [BoxShadow(color: DEKATColors.success.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 6))]),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: Column(children: [
                  Container(width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softMint)), child: Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.receipt_long_rounded, color: DEKATColors.success, size: 16)), const SizedBox(width: 8), const Text('Receipt', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)), const Spacer(), Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: const Text('PAID ✨', style: TextStyle(color: DEKATColors.success, fontWeight: FontWeight.w800, fontSize: 11)))])),
                  Padding(padding: const EdgeInsets.all(16), child: Column(children: [
                    _ReceiptRow(label: 'Booking ID', value: bookingId.isEmpty ? '-' : (bookingId.length > 14 ? bookingId.substring(0, 14) : bookingId), icon: Icons.confirmation_number_rounded, bg: DEKATColors.softViolet.last, fg: DEKATColors.primary),
                    if (bookingCode != null && bookingCode!.isNotEmpty) ...[
                      Divider(color: Colors.grey[100]),
                      _ReceiptRow(label: 'Booking Code', value: bookingCode!, icon: Icons.qr_code_rounded, bg: DEKATColors.softSky.last, fg: DEKATColors.info),
                    ],
                    Divider(color: Colors.grey[100]),
                    _ReceiptRow(label: 'Amount Paid', value: formatRupiah(amount), icon: Icons.payments_rounded, bg: DEKATColors.successLight, fg: DEKATColors.success, valueColor: DEKATColors.primary),
                    Divider(color: Colors.grey[100]),
                    _ReceiptRow(label: 'Payment Method', value: method != null && method!.isNotEmpty ? method![0].toUpperCase()+method!.substring(1) : '-', icon: Icons.account_balance_wallet_rounded, bg: DEKATColors.softPeach.last, fg: const Color(0xFFFF9F43)),
                  ])),
                ]),
              ),
            ),
            const SizedBox(height: 16),
            Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]), child: Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.info_rounded, color: DEKATColors.primary, size: 14)), const SizedBox(width: 8), const Expanded(child: Text('E-receipt sent to your email 📧', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: DEKATColors.textPrimary)))])),
          ]),
        ),
      ))),
      bottomNavigationBar: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: const BorderRadius.vertical(top: Radius.circular(20)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, -4))]), child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.24), blurRadius: 12, offset: const Offset(0, 4))]), child: ElevatedButton(onPressed: () => bookingId.isEmpty ? context.go('/bookings') : context.go('/booking/$bookingId'), style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.receipt_long_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('View Booking ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]))),
        const SizedBox(height: 8),
        TextButton(onPressed: () => context.go('/discovery'), style: TextButton.styleFrom(foregroundColor: DEKATColors.primary), child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w600))),
      ]))),
    );
  }
}

class _ReceiptRow extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color bg, fg;
  final Color? valueColor;
  const _ReceiptRow({required this.label, required this.value, required this.icon, required this.bg, required this.fg, this.valueColor});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 14, color: fg)), const SizedBox(width: 8), Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))]), Flexible(child: Text(value, overflow: TextOverflow.ellipsis, textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: valueColor ?? DEKATColors.textPrimary))),
    ]));
  }
}
