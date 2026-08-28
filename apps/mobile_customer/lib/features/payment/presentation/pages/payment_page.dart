import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

class PaymentPage extends ConsumerStatefulWidget {
  final String bookingId;
  final String? tenantId;
  final num amount;
  final String currency;
  const PaymentPage({
    super.key,
    required this.bookingId,
    this.tenantId,
    required this.amount,
    required this.currency,
  });

  @override
  ConsumerState<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends ConsumerState<PaymentPage> {
  String _selectedMethod = 'ewallet';
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.payments_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('Payment', style: TextStyle(fontWeight: FontWeight.w800))]),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 12*(1-v)), child: ch)), child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF8B8CFF), Color(0xFFFF8E9E)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.24), blurRadius: 18, offset: const Offset(0, 6))]),
            child: Column(children: [
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withValues(alpha: 0.3))), child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 12), const SizedBox(width: 6), Text('Total Amount • ${widget.currency}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600))])),
              const SizedBox(height: 12),
              Text(formatRupiah(widget.amount), style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
              const SizedBox(height: 8),
              Container(height: 1, width: 60, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(Icons.lock_rounded, color: Colors.white70, size: 12), const SizedBox(width: 4), Text('Secure payment • 256-bit encrypted', style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 11, fontWeight: FontWeight.w500))]),
            ]),
          )),
          const SizedBox(height: 20),
          Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), Text('Select Payment Method', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)), const SizedBox(width: 8), Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3), decoration: BoxDecoration(color: DEKATColors.successLight, borderRadius: BorderRadius.circular(20)), child: Row(children: [const Icon(Icons.verified_user_rounded, size: 10, color: DEKATColors.success), const SizedBox(width: 4), Text('Secure', style: TextStyle(color: DEKATColors.success, fontSize: 11, fontWeight: FontWeight.w700))]))]),
          const SizedBox(height: 12),
          _PaymentMethodCard(title: 'E-Wallet', subtitle: 'GoPay, OVO, Dana • Instant', icon: Icons.account_balance_wallet_rounded, gradient: DEKATColors.softViolet, isSelected: _selectedMethod == 'ewallet', onTap: () => setState(() => _selectedMethod = 'ewallet')),
          const SizedBox(height: 10),
          _PaymentMethodCard(title: 'Bank Transfer', subtitle: 'BCA, Mandiri, BRI • 1-2 jam', icon: Icons.account_balance_rounded, gradient: DEKATColors.softSky, isSelected: _selectedMethod == 'bank', onTap: () => setState(() => _selectedMethod = 'bank')),
          const SizedBox(height: 10),
          _PaymentMethodCard(title: 'Credit Card', subtitle: 'Visa, Mastercard • Instant', icon: Icons.credit_card_rounded, gradient: DEKATColors.softPeach, isSelected: _selectedMethod == 'card', onTap: () => setState(() => _selectedMethod = 'card')),
          const SizedBox(height: 10),
          _PaymentMethodCard(title: 'Cash', subtitle: 'Pay at the venue • Tunai', icon: Icons.payments_rounded, gradient: DEKATColors.softMint, isSelected: _selectedMethod == 'cash', onTap: () => setState(() => _selectedMethod = 'cash')),
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.softViolet.last.withValues(alpha: 0.5)), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.06), blurRadius: 14)]),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Column(children: [
                Container(width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softLavender)), child: Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.receipt_long_rounded, color: Color(0xFF9B7CFF), size: 16)), const SizedBox(width: 8), const Text('Ringkasan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13))])),
                Padding(padding: const EdgeInsets.all(14), child: Column(children: [
                  _SummaryRow(label: 'Booking', value: widget.bookingId.length > 12 ? widget.bookingId.substring(0, 12) : widget.bookingId, icon: Icons.confirmation_number_rounded),
                  _SummaryRow(label: 'Amount', value: formatRupiah(widget.amount), icon: Icons.payments_rounded),
                  _SummaryRow(label: 'Tax', value: formatRupiah(0), icon: Icons.receipt_rounded),
                  const SizedBox(height: 8),
                  Container(height: 1, decoration: BoxDecoration(gradient: LinearGradient(colors: [DEKATColors.primary.withValues(alpha: 0.12), DEKATColors.secondary.withValues(alpha: 0.12)]))),
                  const SizedBox(height: 10),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), decoration: BoxDecoration(gradient: const LinearGradient(colors: [DEKATColors.primaryLight, Color(0xFFF0E8FF)]), borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.12))), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Row(children: [Container(padding: const EdgeInsets.all(6), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet), shape: BoxShape.circle), child: const Icon(Icons.payments_rounded, color: Colors.white, size: 14)), const SizedBox(width: 8), const Text('Total', style: TextStyle(fontWeight: FontWeight.w800))]), Text(formatRupiah(widget.amount), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: DEKATColors.primary))])),
                ])),
              ]),
            ),
          ),
          const SizedBox(height: 100),
        ]),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: const BorderRadius.vertical(top: Radius.circular(20)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.07), blurRadius: 16, offset: const Offset(0, -4))]),
        child: SafeArea(child: Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.26), blurRadius: 12, offset: const Offset(0, 4))]), child: ElevatedButton(onPressed: _isProcessing ? null : _handlePayment, style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: _isProcessing ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Row(mainAxisAlignment: MainAxisAlignment.center, children: [Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)), child: const Icon(Icons.lock_rounded, color: Colors.white, size: 14)), const SizedBox(width: 8), const Text('Pay Now • Bayar Sekarang ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))])))),
      ),
    );
  }

  Future<void> _handlePayment() async {
    setState(() => _isProcessing = true);
    try {
      await ApiService().dio.post(
            '/bookings/${widget.bookingId}/payment-intents',
            data: {
              'tenantId': widget.tenantId,
              'amount': widget.amount,
              'currency': widget.currency,
              'method': _selectedMethod,
            },
          );
      if (mounted) {
        context.push('/payment/success'
            '?bookingId=${widget.bookingId}'
            '&amount=${widget.amount}'
            '&currency=${Uri.encodeComponent(widget.currency)}'
            '&method=$_selectedMethod');
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Payment failed: ${e.error ?? e.message}'),
          backgroundColor: DEKATColors.error,
        ));
        setState(() => _isProcessing = false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Payment failed: $e'),
          backgroundColor: DEKATColors.error,
        ));
        setState(() => _isProcessing = false);
      }
    }
  }
}

class _PaymentMethodCard extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  final List<Color> gradient;
  final bool isSelected;
  final VoidCallback onTap;
  const _PaymentMethodCard({required this.title, required this.subtitle, required this.icon, required this.gradient, required this.isSelected, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? gradient.first : Colors.grey[200]!, width: isSelected ? 1.6 : 1),
          boxShadow: isSelected ? [BoxShadow(color: gradient.first.withValues(alpha: 0.16), blurRadius: 14, offset: const Offset(0, 4))] : [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)],
        ),
        child: Row(children: [
          Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(gradient: LinearGradient(colors: isSelected ? gradient : [Colors.grey[100]!, Colors.grey[50]!]), borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: isSelected ? Colors.white : Colors.grey[600], size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: isSelected ? gradient.first : DEKATColors.textPrimary)), const SizedBox(height: 2), Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 11, fontWeight: FontWeight.w500))])),
          AnimatedContainer(duration: const Duration(milliseconds: 200), width: 22, height: 22, decoration: BoxDecoration(shape: BoxShape.circle, gradient: isSelected ? LinearGradient(colors: gradient) : null, color: isSelected ? null : Colors.white, border: Border.all(color: isSelected ? Colors.transparent : Colors.grey[300]!), boxShadow: isSelected ? [BoxShadow(color: gradient.first.withValues(alpha: 0.3), blurRadius: 6)] : null), child: isSelected ? const Icon(Icons.check_rounded, color: Colors.white, size: 14) : null),
        ]),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label, value;
  final IconData icon;
  const _SummaryRow({required this.label, required this.value, required this.icon});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 5), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Row(children: [Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(7)), child: Icon(icon, size: 12, color: Colors.grey[600])), const SizedBox(width: 8), Text(label, style: TextStyle(color: Colors.grey[700], fontSize: 13, fontWeight: FontWeight.w500))]),
      Flexible(child: Text(value, overflow: TextOverflow.ellipsis, textAlign: TextAlign.right, style: TextStyle(fontWeight: value == label ? FontWeight.w700 : FontWeight.w600, fontSize: 13, color: label == 'Total' ? DEKATColors.primary : DEKATColors.textPrimary))),
    ]));
  }
}
