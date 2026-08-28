import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final bookingConfirmationProvider =
    FutureProvider.autoDispose.family<BookingRow, String>((ref, id) async {
  final response = await ApiService().getBooking(id);
  return BookingRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingConfirmationPage extends ConsumerWidget {
  final String bookingId;
  const BookingConfirmationPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(bookingConfirmationProvider(bookingId));
    return Scaffold(
      body: SafeArea(child: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
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
              _DetailRow(icon: Icons.confirmation_number, label: 'Booking Code', value: booking.bookingCode.isEmpty ? booking.id : booking.bookingCode),
              const Divider(),
              _DetailRow(icon: Icons.info_outline, label: 'Status', value: booking.status),
              const Divider(),
              _DetailRow(icon: Icons.calendar_today, label: 'Date & Time', value: booking.startsAt != null ? _fmt(booking.startsAt!) : '-'),
              const Divider(),
              _DetailRow(icon: Icons.payments, label: 'Total', value: formatRupiah(booking.total)),
            ]))),
            const SizedBox(height: 24),
          ]),
          loading: () => const CircularProgressIndicator(),
          error: (e, _) => Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Failed to load booking: $e', textAlign: TextAlign.center),
            TextButton(onPressed: () => ref.invalidate(bookingConfirmationProvider(bookingId)), child: const Text('Retry')),
          ]),
        ),
      ))),
      bottomNavigationBar: Container(padding: const EdgeInsets.all(16), child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        ElevatedButton(onPressed: () => context.go('/bookings'), style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)), child: const Text('View My Bookings')),
        const SizedBox(height: 8),
        TextButton(onPressed: () => context.go('/discovery'), child: const Text('Back to Home')),
      ]))),
    );
  }

  String _fmt(DateTime d) =>
      '${d.day}/${d.month}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _DetailRow({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Row(children: [
      Icon(icon, size: 20, color: Colors.grey[600]), const SizedBox(width: 12), Expanded(child: Text(label)),
      Flexible(child: Text(value, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
    ]));
  }
}
