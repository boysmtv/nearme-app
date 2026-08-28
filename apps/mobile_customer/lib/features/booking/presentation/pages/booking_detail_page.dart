import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import '../../../../shared/models/rows.dart';

final bookingDetailProvider2 = FutureProvider.autoDispose.family<BookingRow, String>((ref, id) async {
  final response = await ApiService().getBooking(id);
  return BookingRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingDetailPage extends ConsumerStatefulWidget {
  final String bookingId;
  const BookingDetailPage({super.key, required this.bookingId});

  @override
  ConsumerState<BookingDetailPage> createState() => _BookingDetailPageState();
}

class _BookingDetailPageState extends ConsumerState<BookingDetailPage> {
  final _pinController = TextEditingController();
  bool _verifying = false;
  String? _pinMsg;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _verifyPin() async {
    final pin = _pinController.text.trim();
    if (pin.length != 6) {
      setState(() => _pinMsg = 'PIN harus 6 digit');
      return;
    }
    setState(() { _verifying = true; _pinMsg = null; });
    try {
      await ApiService().dio.post('/bookings/${widget.bookingId}/verify-pin', data: {'pin': pin});
      setState(() => _pinMsg = 'PIN terverifikasi!');
      ref.invalidate(bookingDetailProvider2(widget.bookingId));
    } catch (e) {
      setState(() => _pinMsg = 'Gagal: $e');
    } finally {
      setState(() => _verifying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingAsync = ref.watch(bookingDetailProvider2(widget.bookingId));
    return Scaffold(
      appBar: AppBar(title: const Text('Booking Details')),
      body: bookingAsync.when(
        data: (booking) {
          final status = booking.status.toUpperCase();
          final statusColor = switch (status) {
            'CONFIRMED' => Colors.blue,
            'COMPLETED' => Colors.green,
            'CANCELLED' => Colors.red,
            _ => Colors.orange,
          };
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(width: double.infinity, padding: const EdgeInsets.all(16), decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ), child: Row(children: [
                Icon(Icons.info_outline, color: statusColor),
                const SizedBox(width: 12),
                Text(booking.bookingCode.isEmpty ? booking.id : '${booking.status} · ${booking.bookingCode}',
                    style: TextStyle(fontWeight: FontWeight.bold, color: statusColor)),
              ])),
              const SizedBox(height: 24),
              _Section(title: 'Schedule', children: [
                _InfoRow(label: 'Start', value: booking.startsAt != null ? _fmtDateTime(booking.startsAt!) : '-'),
                _InfoRow(label: 'End', value: booking.endsAt != null ? _fmtDateTime(booking.endsAt!) : '-'),
                _InfoRow(label: 'Created', value: booking.createdAt != null ? _fmtDate(booking.createdAt!) : '-'),
              ]),
              const SizedBox(height: 16),
              _Section(title: 'Payment', children: [
                _InfoRow(label: 'Currency', value: booking.currency),
                _InfoRow(label: 'Subtotal', value: formatRupiah(booking.subtotal)),
                if (booking.discount > 0) _InfoRow(label: 'Discount', value: '- ${formatRupiah(booking.discount)}'),
                if (booking.tax > 0) _InfoRow(label: 'Tax', value: formatRupiah(booking.tax)),
                if (booking.fee > 0) _InfoRow(label: 'Fee', value: formatRupiah(booking.fee)),
                _InfoRow(label: 'Total', value: formatRupiah(booking.total)),
              ]),
              const SizedBox(height: 16),
              _Section(title: 'PIN Verifikasi', children: [
                const Text('Tunjukkan PIN 6-digit ke staf saat check-in. POST /bookings/{id}/verify-pin', style: TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 8),
                if ((booking.confirmationPin ?? '').isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.amber.shade200)),
                    child: Row(children: [
                      const Icon(Icons.lock_outline, size: 18, color: Colors.amber),
                      const SizedBox(width: 8),
                      Text(booking.confirmationPin!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 4)),
                      const Spacer(),
                      Icon(booking.pinVerified == true ? Icons.verified : Icons.hourglass_empty, color: booking.pinVerified == true ? Colors.green : Colors.orange, size: 18),
                      const SizedBox(width: 4),
                      Text(booking.pinVerified == true ? 'Terverifikasi' : 'Belum', style: TextStyle(fontSize: 12, color: booking.pinVerified == true ? Colors.green : Colors.orange)),
                    ]),
                  ),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(child: TextField(controller: _pinController, keyboardType: TextInputType.number, maxLength: 6, decoration: const InputDecoration(hintText: '6-digit PIN', counterText: '', border: OutlineInputBorder()))),
                  const SizedBox(width: 8),
                  ElevatedButton(onPressed: _verifying ? null : _verifyPin, child: _verifying ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Verifikasi')),
                ]),
                if (_pinMsg != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_pinMsg!, style: TextStyle(color: _pinMsg!.contains('terverifikasi') ? Colors.green : Colors.red, fontSize: 12))),
              ]),
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Failed to load booking: $e'),
              TextButton(onPressed: () => ref.invalidate(bookingDetailProvider2(widget.bookingId)), child: const Text('Retry')),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: SafeArea(child: OutlinedButton(onPressed: () => _showCancelDialog(context, ref), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), side: const BorderSide(color: Colors.red), foregroundColor: Colors.red), child: const Text('Cancel Booking'))),
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
          try {
            final actorId = await SecureStorageService.read(StorageKeys.userId);
            await ApiService().dio.post(
                  '/bookings/${widget.bookingId}/cancel',
                  queryParameters: {'reason': 'Cancelled by customer'},
                  options: Options(headers: {'X-Actor-Id': actorId}),
                );
            ref.invalidate(bookingDetailProvider2(widget.bookingId));
            if (context.mounted) context.go('/bookings');
          } catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Cancel failed: $e'), backgroundColor: Colors.red));
            }
          }
        }, style: TextButton.styleFrom(foregroundColor: Colors.red), child: const Text('Yes, Cancel')),
      ],
    ));
  }

  String _fmtDateTime(DateTime d) =>
      '${d.day}/${d.month}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  String _fmtDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
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
      Text(label, style: TextStyle(color: Colors.grey[600])), Flexible(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w500))),
    ]));
  }
}
