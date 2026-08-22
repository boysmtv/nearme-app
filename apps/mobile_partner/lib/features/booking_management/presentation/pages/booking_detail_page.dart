import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final partnerBookingDetailProvider = FutureProvider.autoDispose.family<Booking?, String>((ref, id) async {
  try {
    final response = await ApiService().getBooking(id);
    return Booking.fromJson(response.data['data']);
  } catch (e) { return null; }
});

class BookingDetailPage extends ConsumerWidget {
  final String bookingId;
  const BookingDetailPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(partnerBookingDetailProvider(bookingId));

    return Scaffold(
      appBar: AppBar(title: const Text('Booking Details'), actions: [
        IconButton(icon: const Icon(Icons.phone), onPressed: () {}),
      ]),
      body: bookingAsync.when(
        data: (booking) {
          if (booking == null) return const Center(child: Text('Booking not found'));
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(
                width: double.infinity, padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: booking.status == 'pending' ? Colors.orange[50] : Colors.blue[50],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(children: [
                  Icon(booking.status == 'pending' ? Icons.pending_actions : Icons.info_outline,
                      color: booking.status == 'pending' ? Colors.orange[700] : Colors.blue[700]),
                  const SizedBox(width: 12),
                  Text(booking.status[0].toUpperCase() + booking.status.substring(1),
                      style: TextStyle(fontWeight: FontWeight.bold, color: booking.status == 'pending' ? Colors.orange[700] : Colors.blue[700])),
                ]),
              ),
              const SizedBox(height: 24),
              Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Customer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _InfoRow(icon: Icons.person, label: 'Name', value: booking.customerId),
                _InfoRow(icon: Icons.spa, label: 'Service', value: booking.service?.name ?? '-'),
                _InfoRow(icon: Icons.access_time, label: 'Duration', value: '${booking.service?.durationMinutes ?? 0} min'),
              ]))),
              const SizedBox(height: 16),
              Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Schedule', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _InfoRow(icon: Icons.calendar_today, label: 'Date', value: booking.date.toString().substring(0, 10)),
                _InfoRow(icon: Icons.access_time, label: 'Time', value: booking.time),
              ]))),
              const SizedBox(height: 16),
              Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _InfoRow(icon: Icons.payments, label: 'Amount', value: 'Rp ${booking.amount}'),
              ]))),
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load')),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(child: bookingAsync.when(
          data: (booking) {
            if (booking?.status != 'pending') return const SizedBox();
            return Row(children: [
              Expanded(child: OutlinedButton(
                onPressed: () async { try { await ApiService().declineBooking(bookingId); if (context.mounted) context.go('/bookings'); } catch (_) {} },
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), side: const BorderSide(color: Colors.red), foregroundColor: Colors.red),
                child: const Text('Decline'),
              )),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(
                onPressed: () async { try { await ApiService().acceptBooking(bookingId); if (context.mounted) context.go('/bookings'); } catch (_) {} },
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
      Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
    ]));
  }
}
