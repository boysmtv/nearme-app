import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final partnerBookingDetailProvider =
    FutureProvider.autoDispose.family<PartnerBookingRow, String>((ref, id) async {
  final response = await ApiService().dio.get('/provider/bookings/$id');
  return PartnerBookingRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingDetailPage extends ConsumerWidget {
  final String bookingId;
  const BookingDetailPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(partnerBookingDetailProvider(bookingId));

    return Scaffold(
      appBar: AppBar(title: const Text('Booking Details')),
      body: bookingAsync.when(
        data: (booking) {
          final status = booking.status.toUpperCase();
          final isPending = status == 'PENDING' || status == 'HELD' || status == 'PENDING_APPROVAL';
          final color = switch (status) {
            'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => Colors.blue,
            'COMPLETED' => Colors.green,
            'CANCELLED' || 'NO_SHOW' => Colors.red,
            _ => Colors.orange,
          };
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(
                width: double.infinity, padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(children: [
                  Icon(isPending ? Icons.pending_actions : Icons.info_outline, color: color),
                  const SizedBox(width: 12),
                  Text(status.isNotEmpty ? status[0] + status.substring(1).toLowerCase() : '-',
                      style: TextStyle(fontWeight: FontWeight.bold, color: color)),
                  const Spacer(),
                  Text(booking.bookingCode, style: TextStyle(color: color)),
                ]),
              ),
              const SizedBox(height: 24),
              Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Customer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _InfoRow(icon: Icons.person, label: 'Name', value: booking.customerName),
                _InfoRow(icon: Icons.spa, label: 'Service', value: booking.serviceName.isEmpty ? '-' : booking.serviceName),
                _InfoRow(icon: Icons.access_time, label: 'Time', value: booking.time.isEmpty ? '-' : booking.time),
              ]))),
              const SizedBox(height: 16),
              Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _InfoRow(icon: Icons.payments, label: 'Amount', value: formatRupiah(booking.amount)),
              ]))),
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Failed to load'),
              TextButton(onPressed: () => ref.invalidate(partnerBookingDetailProvider(bookingId)), child: const Text('Coba lagi')),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(child: bookingAsync.when(
          data: (booking) {
            final status = booking.status.toUpperCase();
            if (status != 'PENDING' && status != 'HELD' && status != 'PENDING_APPROVAL') return const SizedBox();
            return Row(children: [
              Expanded(child: OutlinedButton(
                onPressed: () => _updateStatus(context, ref, 'CANCELLED'),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), side: const BorderSide(color: Colors.red), foregroundColor: Colors.red),
                child: const Text('Decline'),
              )),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(
                onPressed: () => _updateStatus(context, ref, 'CONFIRMED'),
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Accept'),
              )),
            ]);
          },
          loading: () => const SizedBox(),
          error: (_, __) => const SizedBox(),
        )),
      ),
    );
  }

  Future<void> _updateStatus(BuildContext context, WidgetRef ref, String status) async {
    try {
      await ApiService().updateBookingStatus(bookingId, status);
      ref.invalidate(partnerBookingDetailProvider(bookingId));
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoRow({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Row(children: [
      Icon(icon, size: 16, color: Colors.grey[500]), const SizedBox(width: 8),
      Text(label, style: TextStyle(color: Colors.grey[600])), const Spacer(),
      Flexible(child: Text(value, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w500))),
    ]));
  }
}
