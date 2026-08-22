import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PaymentSuccessPage extends ConsumerWidget {
  final String bookingId;
  const PaymentSuccessPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SafeArea(child: Center(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(width: 120, height: 120, decoration: BoxDecoration(color: Colors.green[50], shape: BoxShape.circle),
            child: Icon(Icons.check_circle, size: 80, color: Colors.green[500])),
          const SizedBox(height: 24),
          Text('Payment Successful!', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Your payment has been processed successfully.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 32),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
            _ReceiptRow(label: 'Booking ID', value: '#'),
            const Divider(),
            _ReceiptRow(label: 'Amount Paid', value: 'Rp 75.000'),
            const Divider(),
            _ReceiptRow(label: 'Payment Method', value: 'E-Wallet'),
            const Divider(),
            _ReceiptRow(label: 'Transaction ID', value: 'TXN'),
          ]))),
        ]),
      )),
      bottomNavigationBar: Container(padding: const EdgeInsets.all(16), child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        ElevatedButton(onPressed: () => context.go('/bookings'), style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)), child: const Text('View Booking')),
        const SizedBox(height: 8),
        TextButton(onPressed: () => context.go('/discovery'), child: const Text('Back to Home')),
      ]))),
    );
  }
}

class _ReceiptRow extends StatelessWidget {
  final String label, value;
  const _ReceiptRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: Colors.grey[600])), Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
    ]));
  }
}