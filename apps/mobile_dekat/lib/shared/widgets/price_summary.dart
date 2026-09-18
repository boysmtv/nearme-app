import 'package:flutter/material.dart';

class PriceSummary extends StatelessWidget {
  final String serviceName;
  final int basePrice;
  final int? discount;
  final int? platformFee;
  final int? tax;

  const PriceSummary({
    super.key,
    required this.serviceName,
    required this.basePrice,
    this.discount,
    this.platformFee,
    this.tax,
  });

  int get _total {
    int total = basePrice;
    if (discount != null) total -= discount!;
    if (platformFee != null) total += platformFee!;
    if (tax != null) total += tax!;
    return total;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(serviceName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const Divider(height: 24),
          _PriceRow(label: 'Service Price', value: basePrice),
          if (discount != null && discount! > 0) _PriceRow(label: 'Discount', value: -discount!, color: Colors.green),
          if (platformFee != null && platformFee! > 0) _PriceRow(label: 'Platform Fee', value: platformFee!),
          if (tax != null && tax! > 0) _PriceRow(label: 'Tax', value: tax!),
          const Divider(height: 24),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Text('Rp $_total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Theme.of(context).colorScheme.primary)),
          ]),
        ]),
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final int value;
  final Color? color;
  const _PriceRow({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    final displayValue = value < 0 ? '- Rp ${value.abs()}' : 'Rp $value';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(color: Colors.grey[600])),
        Text(displayValue, style: TextStyle(fontWeight: FontWeight.w500, color: color)),
      ]),
    );
  }
}
