import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final bookingDetailProvider = FutureProvider.autoDispose.family<Booking?, String>((ref, id) async {
  try {
    final response = await ApiService().getBooking(id);
    return Booking.fromJson(response.data['data']);
  } catch (e) { return null; }
});

class BookingConfirmationPage extends ConsumerWidget {
  final String bookingId;
  const BookingConfirmationPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(bookingDetailProvider(bookingId));
    return Scaffold(
      body: SafeArea(child: Center(
        padding: const EdgeInsets.all(24),
        child: bookingAsync.when(
          data: (booking) => Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(width: 120, height: 120, decoration: BoxDecoration(color: Colors.green[50], shape: BoxShape.circle),
              child: Icon(Icons.check_circle, size: 80, color: Colors.green[500])),
            const SizedBox(height: 24),
            Text('Booking Confirmed!', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Your booking has been successfully confirmed.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 32),
            Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
              _DetailRow(icon: Icons.confirmation_number, label: 'Booking ID', value: '#'),
              const Divider(),
              _DetailRow(icon: Icons.store, label: 'Provider', value: booking?.provider?.name ?? '-'),
              const Divider(),
              _DetailRow(icon: Icons.spa, label: 'Service', value: booking?.service?.name ?? '-'),
              const Divider(),
              _DetailRow(icon: Icons.calendar_today, label: 'Date & Time', value: ' '),
            ]))),
            const SizedBox(height: 24),
            Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(12)),
              child: Row(children: [Icon(Icons.info_outline, color: Colors.blue[700]), const SizedBox(width: 8),
                Expanded(child: Text('A confirmation has been sent to your email.', style: TextStyle(color: Colors.blue[700])))])),
          ]),
          loading: () => const CircularProgressIndicator(),
          error: (_, __) => Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.check_circle, size: 80, color: Colors.green),
            const SizedBox(height: 24),
            Text('Booking # Confirmed!', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
          ]),
        ),
      )),
      bottomNavigationBar: Container(padding: const EdgeInsets.all(16), child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        ElevatedButton(onPressed: () => context.go('/bookings'), style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)), child: const Text('View My Bookings')),
        const SizedBox(height: 8),
        TextButton(onPressed: () => context.go('/discovery'), child: const Text('Back to Home')),
      ]))),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _DetailRow({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Row(children: [
      Icon(icon, size: 20, color: Colors.grey[600]), const SizedBox(width: 12), Expanded(child: Text(label)),
      Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
    ]));
  }
}