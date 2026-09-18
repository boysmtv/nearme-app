import 'package:flutter/material.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class BookingCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback? onTap;
  const BookingCard({super.key, required this.booking, this.onTap});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    String statusLabel;
    switch (booking.status) {
      case 'pending':
        statusColor = Colors.orange;
        statusLabel = 'Pending';
        break;
      case 'confirmed':
        statusColor = Colors.blue;
        statusLabel = 'Confirmed';
        break;
      case 'completed':
        statusColor = Colors.green;
        statusLabel = 'Completed';
        break;
      case 'cancelled':
        statusColor = Colors.red;
        statusLabel = 'Cancelled';
        break;
      default:
        statusColor = Colors.grey;
        statusLabel = booking.status[0].toUpperCase() + booking.status.substring(1);
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('#${booking.id}', style: TextStyle(fontSize: 12, color: Colors.grey[500])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(statusLabel, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w500)),
              ),
            ]),
            const SizedBox(height: 8),
            Text(booking.service?.name ?? 'Service', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Row(children: [
              Icon(Icons.calendar_today, size: 14, color: Colors.grey[500]),
              const SizedBox(width: 4),
              Text(booking.date.toString().substring(0, 10), style: TextStyle(color: Colors.grey[600], fontSize: 13)),
              const SizedBox(width: 16),
              Icon(Icons.access_time, size: 14, color: Colors.grey[500]),
              const SizedBox(width: 4),
              Text(booking.time, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
            ]),
            const SizedBox(height: 8),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Rp ${booking.amount}', style: TextStyle(fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
            ]),
          ]),
        ),
      ),
    );
  }
}
