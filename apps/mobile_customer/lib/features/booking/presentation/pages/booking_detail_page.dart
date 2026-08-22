import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final bookingDetailProvider2 = FutureProvider.autoDispose.family<Booking?, String>((ref, id) async {
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
    final bookingAsync = ref.watch(bookingDetailProvider2(bookingId));
    return Scaffold(
      appBar: AppBar(title: const Text('Booking Details')),
      body: bookingAsync.when(
        data: (booking) {
          if (booking == null) return const Center(child: Text('Booking not found'));
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(width: double.infinity, padding: const EdgeInsets.all(16), decoration: BoxDecoration(
                color: booking.status == 'confirmed' ? Colors.blue[50] : booking.status == 'completed' ? Colors.green[50] : Colors.orange[50],
                borderRadius: BorderRadius.circular(12),
              ), child: Row(children: [
                Icon(booking.status == 'confirmed' ? Icons.info_outline : Icons.check_circle, color: booking.status == 'confirmed' ? Colors.blue[700] : Colors.green[700]),
                const SizedBox(width: 12),
                Text(booking.status.toUpperCase(), style: TextStyle(fontWeight: FontWeight.bold, color: booking.status == 'confirmed' ? Colors.blue[700] : Colors.green[700])),
              ])),
              const SizedBox(height: 24),
              _Section(title: 'Service Details', children: [
                _InfoRow(label: 'Service', value: booking.service?.name ?? '-'),
                _InfoRow(label: 'Duration', value: ' min'),
                _InfoRow(label: 'Price', value: 'Rp '),
              ]),
              const SizedBox(height: 16),
              _Section(title: 'Schedule', children: [
                _InfoRow(label: 'Date', value: booking.date.toString().substring(0, 10)),
                _InfoRow(label: 'Time', value: booking.time),
              ]),
              const SizedBox(height: 16),
              _Section(title: 'Provider', children: [
                _InfoRow(label: 'Name', value: booking.provider?.name ?? '-'),
                _InfoRow(label: 'Address', value: booking.provider?.address ?? '-'),
              ]),
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load booking')),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(child: Row(children: [
          Expanded(child: OutlinedButton(onPressed: () => _showCancelDialog(context, ref), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), side: const BorderSide(color: Colors.red), foregroundColor: Colors.red), child: const Text('Cancel'))),
          const SizedBox(width: 12),
          Expanded(child: ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)), child: const Text('Contact Provider'))),
        ])),
      ),
    );
  }

  void _showCancelDialog(BuildContext context, WidgetRef ref) {
    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Cancel Booking'),
      content: const Text('Are you sure you want to cancel this booking?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('No')),
        TextButton(onPressed: () async {
          Navigator.pop(ctx);
          try { await ApiService().cancelBooking(bookingId); if (context.mounted) context.go('/bookings'); } catch (_) {}
        }, style: TextButton.styleFrom(foregroundColor: Colors.red), child: const Text('Yes, Cancel')),
      ],
    ));
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _Section({required this.title, required this.children});
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
      const SizedBox(height: 12), ...children,
    ])));
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  const _InfoRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: Colors.grey[600])), Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
    ]));
  }
}