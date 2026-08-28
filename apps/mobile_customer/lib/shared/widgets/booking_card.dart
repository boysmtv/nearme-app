import 'package:flutter/material.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class BookingCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback? onTap;
  const BookingCard({super.key, required this.booking, this.onTap});

  @override
  Widget build(BuildContext context) {
    String statusLabel;
    List<Color> statusGrad;
    IconData statusIcon;
    switch (booking.status) {
      case 'pending':
        statusLabel = 'Pending';
        statusGrad = DEKATColors.softPeach;
        statusIcon = Icons.hourglass_top_rounded;
        break;
      case 'confirmed':
        statusLabel = 'Confirmed';
        statusGrad = DEKATColors.softSky;
        statusIcon = Icons.verified_rounded;
        break;
      case 'completed':
        statusLabel = 'Completed';
        statusGrad = DEKATColors.softMint;
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'cancelled':
        statusLabel = 'Cancelled';
        statusGrad = DEKATColors.softPink;
        statusIcon = Icons.cancel_rounded;
        break;
      default:
        statusLabel = booking.status[0].toUpperCase() + booking.status.substring(1);
        statusGrad = DEKATColors.softViolet;
        statusIcon = Icons.info_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusGrad.last.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: statusGrad.first.withValues(alpha: 0.12), blurRadius: 14, offset: const Offset(0, 4)), BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey[200]!)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.confirmation_number_rounded, size: 12, color: Colors.grey[600]), const SizedBox(width: 4), Text('#${booking.id.length > 8 ? booking.id.substring(0, 8) : booking.id}', style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w600))]),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(gradient: LinearGradient(colors: statusGrad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(10)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(statusIcon, size: 12, color: Colors.white), const SizedBox(width: 4), Text(statusLabel, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700))]),
                ),
              ]),
              const SizedBox(height: 12),
              Row(children: [
                Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(gradient: LinearGradient(colors: statusGrad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.spa_rounded, color: Colors.white, size: 16)),
                const SizedBox(width: 10),
                Expanded(child: Text(booking.service?.name ?? 'Service', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: DEKATColors.textPrimary))),
              ]),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(color: DEKATColors.backgroundLight, borderRadius: BorderRadius.circular(10)),
                child: Row(children: [
                  Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: DEKATColors.softViolet.last, borderRadius: BorderRadius.circular(7)), child: const Icon(Icons.calendar_today_rounded, size: 12, color: DEKATColors.primary)),
                  const SizedBox(width: 6),
                  Text(booking.date.toString().substring(0, 10), style: TextStyle(color: Colors.grey[700], fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 14),
                  Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: DEKATColors.softPeach.last, borderRadius: BorderRadius.circular(7)), child: const Icon(Icons.access_time_rounded, size: 12, color: Color(0xFFFF9F43))),
                  const SizedBox(width: 6),
                  Text(booking.time, style: TextStyle(color: Colors.grey[700], fontSize: 12, fontWeight: FontWeight.w600)),
                ]),
              ),
              const SizedBox(height: 10),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('Total', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey[600], fontSize: 12)),
                Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: Text('Rp ${booking.amount}', style: const TextStyle(fontWeight: FontWeight.w800, color: DEKATColors.primary, fontSize: 13))),
              ]),
            ]),
          ),
        ),
      ),
    );
  }
}
