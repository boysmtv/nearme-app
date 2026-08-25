import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
      body: SafeArea(child: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(width: 120, height: 120, decoration: BoxDecoration(color: Colors.green[50], shape: BoxShape.circle),
            child: Icon(Icons.check_circle, size: 80, color: Colors.green[500])),
          const SizedBox(height: 24),
          Text('Payment Successful!', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Your payment has been processed successfully.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 32),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
            _ReceiptRow(label: 'Booking ID', value: bookingId.isEmpty ? '-' : bookingId),
            if (bookingCode != null && bookingCode!.isNotEmpty) ...[
              const Divider(),
              _ReceiptRow(label: 'Booking Code', value: bookingCode!),
            ],
            const Divider(),
            _ReceiptRow(label: 'Amount Paid', value: formatRupiah(amount)),
            const Divider(),
            _ReceiptRow(label: 'Payment Method', value: method ?? '-'),
          ]))),
        ]        ),
      ))),
      bottomNavigationBar: Container(padding: const EdgeInsets.all(16), child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        ElevatedButton(
          onPressed: () => bookingId.isEmpty ? context.go('/bookings') : context.go('/booking/$bookingId'),
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
          child: const Text('View Booking'),
        ),
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
      Text(label, style: TextStyle(color: Colors.grey[600])), Flexible(child: Text(value, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w500))),
    ]));
  }
}
