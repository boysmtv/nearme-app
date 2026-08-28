import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

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
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: DEKATColors.softViolet.last.withValues(alpha: 0.6)),
        boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 6)), BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight)),
              child: Row(children: [
                Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.9), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.receipt_long_rounded, color: DEKATColors.primary, size: 18)),
                const SizedBox(width: 10),
                Expanded(child: Text(serviceName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white))),
                const Icon(Icons.auto_awesome_rounded, color: Colors.white70, size: 16),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _PriceRow(label: 'Service Price', value: basePrice, icon: Icons.spa_rounded, iconBg: DEKATColors.softViolet.last, iconColor: DEKATColors.primary),
                if (discount != null && discount! > 0) _PriceRow(label: 'Discount', value: -discount!, color: DEKATColors.success, icon: Icons.local_offer_rounded, iconBg: DEKATColors.successLight, iconColor: DEKATColors.success),
                if (platformFee != null && platformFee! > 0) _PriceRow(label: 'Platform Fee', value: platformFee!, icon: Icons.layers_rounded, iconBg: DEKATColors.softSky.last, iconColor: DEKATColors.info),
                if (tax != null && tax! > 0) _PriceRow(label: 'Tax', value: tax!, icon: Icons.receipt_rounded, iconBg: DEKATColors.softPeach.last, iconColor: const Color(0xFFFF9F43)),
                const SizedBox(height: 8),
                Container(height: 1, decoration: BoxDecoration(gradient: LinearGradient(colors: [DEKATColors.softViolet.first.withValues(alpha: 0.18), DEKATColors.softPink.first.withValues(alpha: 0.18)]))),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: [DEKATColors.primaryLight, Color(0xFFF0E8FF)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.12))),
                  child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Row(children: [Container(padding: const EdgeInsets.all(6), decoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet), shape: BoxShape.circle), child: const Icon(Icons.payments_rounded, color: Colors.white, size: 14)), const SizedBox(width: 8), const Text('Total', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: DEKATColors.textPrimary))]),
                    Text('Rp $_total', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: DEKATColors.primary)),
                  ]),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final int value;
  final Color? color;
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  const _PriceRow({required this.label, required this.value, this.color, required this.icon, required this.iconBg, required this.iconColor});

  @override
  Widget build(BuildContext context) {
    final displayValue = value < 0 ? '- Rp ${value.abs()}' : 'Rp $value';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Row(children: [Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 12, color: iconColor)), const SizedBox(width: 8), Text(label, style: TextStyle(color: Colors.grey[700], fontSize: 13, fontWeight: FontWeight.w500))]),
        Text(displayValue, style: TextStyle(fontWeight: FontWeight.w700, color: color ?? DEKATColors.textPrimary, fontSize: 13)),
      ]),
    );
  }
}
