import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
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
      appBar: AppBar(title: const Text('Payment')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Card(color: Theme.of(context).colorScheme.primary, child: Padding(padding: const EdgeInsets.all(24), child: Center(child: Column(children: [
            Text('Total Amount', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 16)),
            const SizedBox(height: 8),
            Text(formatRupiah(widget.amount), style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
          ])))),
          const SizedBox(height: 24),
          Text('Select Payment Method', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _PaymentMethodCard(title: 'E-Wallet', subtitle: 'GoPay, OVO, Dana', icon: Icons.account_balance_wallet, isSelected: _selectedMethod == 'ewallet', onTap: () => setState(() => _selectedMethod = 'ewallet')),
          const SizedBox(height: 8),
          _PaymentMethodCard(title: 'Bank Transfer', subtitle: 'BCA, Mandiri, BRI', icon: Icons.account_balance, isSelected: _selectedMethod == 'bank', onTap: () => setState(() => _selectedMethod = 'bank')),
          const SizedBox(height: 8),
          _PaymentMethodCard(title: 'Credit Card', subtitle: 'Visa, Mastercard', icon: Icons.credit_card, isSelected: _selectedMethod == 'card', onTap: () => setState(() => _selectedMethod = 'card')),
          const SizedBox(height: 8),
          _PaymentMethodCard(title: 'Cash', subtitle: 'Pay at the venue', icon: Icons.money, isSelected: _selectedMethod == 'cash', onTap: () => setState(() => _selectedMethod = 'cash')),
          const SizedBox(height: 24),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Payment Summary', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _SummaryRow(label: 'Booking', value: widget.bookingId),
            _SummaryRow(label: 'Amount', value: formatRupiah(widget.amount)),
            _SummaryRow(label: 'Tax', value: formatRupiah(0)),
            const Divider(),
            _SummaryRow(label: 'Total', value: formatRupiah(widget.amount), isBold: true),
          ]))),
        ]),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(child: ElevatedButton(
          onPressed: _isProcessing ? null : _handlePayment,
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
          child: _isProcessing ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Pay Now'),
        )),
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
          backgroundColor: Colors.red,
        ));
        setState(() => _isProcessing = false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Payment failed: $e'),
          backgroundColor: Colors.red,
        ));
        setState(() => _isProcessing = false);
      }
    }
  }
}

class _PaymentMethodCard extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;
  const _PaymentMethodCard({required this.title, required this.subtitle, required this.icon, required this.isSelected, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Card(
      color: isSelected ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.1) : null,
      child: ListTile(leading: Icon(icon), title: Text(title), subtitle: Text(subtitle),
        trailing: Radio<String>(value: title.toLowerCase(), groupValue: isSelected ? title.toLowerCase() : '', onChanged: (_) => onTap(), activeColor: Theme.of(context).colorScheme.primary),
        onTap: onTap),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label, value;
  final bool isBold;
  const _SummaryRow({required this.label, required this.value, this.isBold = false});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label), Flexible(child: Text(value, overflow: TextOverflow.ellipsis, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: isBold ? 18 : 14))),
    ]));
  }
}
