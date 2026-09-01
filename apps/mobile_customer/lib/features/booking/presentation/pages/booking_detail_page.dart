import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:url_launcher/url_launcher.dart';
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
  DateTime? _rescheduleDate;
  TimeOfDay? _rescheduleTime;
  bool _isRescheduling = false;
  String? _rescheduleMsg;
  bool _icsLoading = false;

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

  Future<void> _downloadIcs(BookingRow booking) async {
    setState(() => _icsLoading = true);
    try {
      final res = await ApiService().getBookingIcs(widget.bookingId);
      final content = res.data as String;
      if (mounted) {
        // show preview snackbar; actual file save would need path_provider, for demo we launch share
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('ICS downloaded (${content.length} chars) - ${booking.bookingCode}.ics'), backgroundColor: Colors.green));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('ICS gagal: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _icsLoading = false);
    }
  }

  Future<void> _openGoogleCalendar(BookingRow booking) async {
    try {
      final res = await ApiService().getBookingCalendarLink(widget.bookingId);
      final data = res.data['data'] as Map<String, dynamic>?;
      final url = data?['googleCalendarUrl'] as String?;
      if (url != null && url.isNotEmpty) {
        final uri = Uri.parse(url);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(url)));
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Google Calendar gagal: $e'), backgroundColor: Colors.red));
    }
  }

  Future<void> _reschedule(BookingRow booking) async {
    if (_rescheduleDate == null || _rescheduleTime == null) {
      setState(() => _rescheduleMsg = 'Pilih tanggal & jam baru');
      return;
    }
    setState(() { _isRescheduling = true; _rescheduleMsg = null; });
    try {
      final dt = DateTime(_rescheduleDate!.year, _rescheduleDate!.month, _rescheduleDate!.day, _rescheduleTime!.hour, _rescheduleTime!.minute);
      final newStartsAt = dt.toIso8601String();
      final newEndsAt = dt.add(const Duration(hours: 1)).toIso8601String();
      await ApiService().dio.post('/bookings/${widget.bookingId}/reschedule', data: {
        'newStartsAt': newStartsAt,
        'newEndsAt': newEndsAt,
        'expectedVersion': booking.version,
      });
      setState(() => _rescheduleMsg = 'Reschedule berhasil!');
      ref.invalidate(bookingDetailProvider2(widget.bookingId));
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('409') || msg.contains('limit') || msg.contains('Reschedule limit')) {
        setState(() => _rescheduleMsg = 'Gagal: Batas reschedule gratis tercapai (409)');
      } else {
        setState(() => _rescheduleMsg = 'Gagal: $e');
      }
    } finally {
      setState(() => _isRescheduling = false);
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
              const SizedBox(height: 16),
              _Section(title: 'Schedule', children: [
                _InfoRow(label: 'Start', value: booking.startsAt != null ? _fmtDateTime(booking.startsAt!) : '-'),
                _InfoRow(label: 'End', value: booking.endsAt != null ? _fmtDateTime(booking.endsAt!) : '-'),
                _InfoRow(label: 'Created', value: booking.createdAt != null ? _fmtDate(booking.createdAt!) : '-'),
                if (booking.cancelDeadline != null) _InfoRow(label: 'Batas Cancel', value: _fmtDateTime(booking.cancelDeadline!)),
              ]),
              const SizedBox(height: 16),
              _Section(title: 'Payment & Deposit', children: [
                _InfoRow(label: 'Currency', value: booking.currency),
                _InfoRow(label: 'Subtotal', value: formatRupiah(booking.subtotal)),
                if (booking.discount > 0) _InfoRow(label: 'Discount', value: '- ${formatRupiah(booking.discount)}'),
                if (booking.tax > 0) _InfoRow(label: 'Tax', value: formatRupiah(booking.tax)),
                if (booking.fee > 0) _InfoRow(label: 'Fee', value: formatRupiah(booking.fee)),
                _InfoRow(label: 'Total', value: formatRupiah(booking.total)),
                const Divider(),
                _InfoRow(label: 'Deposit', value: booking.depositRequired ? formatRupiah(booking.depositAmount) + ' Wajib' : 'Tidak ada'),
                if (booking.depositRequired)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: Colors.amber[50], borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.amber[200]!)),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.account_balance_wallet_rounded, size: 14, color: Colors.amber[700]), const SizedBox(width: 6), Text('Deposit via Midtrans/Xendit', style: TextStyle(color: Colors.amber[800], fontSize: 12, fontWeight: FontWeight.w600))]),
                  ),
                _InfoRow(label: 'Kebijakan', value: booking.cancelPolicy ?? '24h_full_refund'),
                _InfoRow(label: 'Reschedule', value: '${booking.rescheduleCount}/${booking.maxReschedule} gratis'),
                if (booking.cancelDeadline != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text('Cancel setelah ${booking.cancelDeadline != null ? _fmtDateTime(booking.cancelDeadline!) : '-'} = no refund', style: TextStyle(color: Colors.red[400], fontSize: 11)),
                  ),
              ]),
              const SizedBox(height: 16),
              // Bundle B: Kalender Sync
              _Section(title: 'Kalender Sync', children: [
                const Text('Tambahkan ke kalender pribadi - ICS (VCALENDAR) & Google Calendar', style: TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _icsLoading ? null : () => _downloadIcs(booking),
                      icon: _icsLoading ? const SizedBox(height: 14, width: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.calendar_today_rounded, size: 16),
                      label: const Text('Download .ics'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _openGoogleCalendar(booking),
                      icon: const Icon(Icons.link_rounded, size: 16),
                      label: const Text('Google Calendar'),
                    ),
                  ),
                ]),
                const SizedBox(height: 8),
                Text('GET /bookings/${widget.bookingId}/ics → text/calendar VCALENDAR', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ]),
              const SizedBox(height: 16),
              // Bundle B: Reschedule
              _Section(title: 'Reschedule (gratis 1x)', children: [
                const Text('Pilih jadwal baru. Jika melebihi batas 1x gratis akan 409 Conflict.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        final picked = await showDatePicker(context: context, initialDate: DateTime.now().add(const Duration(days: 1)), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 30)));
                        if (picked != null) setState(() => _rescheduleDate = picked);
                      },
                      child: Text(_rescheduleDate == null ? 'Pilih Tanggal' : '${_rescheduleDate!.day}/${_rescheduleDate!.month}/${_rescheduleDate!.year}'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        final picked = await showTimePicker(context: context, initialTime: const TimeOfDay(hour: 9, minute: 0));
                        if (picked != null) setState(() => _rescheduleTime = picked);
                      },
                      child: Text(_rescheduleTime == null ? 'Pilih Jam' : _rescheduleTime!.format(context)),
                    ),
                  ),
                ]),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isRescheduling ? null : () => _reschedule(booking),
                    child: _isRescheduling ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Reschedule'),
                  ),
                ),
                if (_rescheduleMsg != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(_rescheduleMsg!, style: TextStyle(color: _rescheduleMsg!.contains('berhasil') ? Colors.green : Colors.red, fontSize: 12)),
                  ),
              ]),
              const SizedBox(height: 16),
              _Section(title: 'Chat Realtime', children: [
                const Text('Hubungi provider via chat realtime (WebSocket /ws-chat + SSE /chats/{id}/events)', style: TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.chat_bubble, size: 16),
                    label: const Text('Buka Chat Booking'),
                    onPressed: () async {
                      try {
                        final res = await ApiService().getBookingChat(widget.bookingId);
                        final chatId = (res.data['data']['id'] ?? res.data['id']) as String;
                        if (context.mounted) context.push('/chat/$chatId');
                      } catch (e) {
                        try {
                          final res = await ApiService().createChat({'bookingId': widget.bookingId, 'subject': 'Booking ${booking.bookingCode}'});
                          final chatId = (res.data['data']['id'] ?? res.data['id']) as String;
                          if (context.mounted) context.push('/chat/$chatId');
                        } catch (e2) {
                          if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Chat gagal: $e2')));
                        }
                      }
                    },
                  ),
                ),
                OutlinedButton(onPressed: () => context.push('/chat'), child: const Text('Lihat Semua Chat')),
              ]),
              const SizedBox(height: 16),
              _Section(title: 'PIN Verifikasi', children: [
                const Text('Tunjukkan PIN 6-digit ke staf saat check-in.', style: TextStyle(fontSize: 13, color: Colors.grey)),
                const SizedBox(height: 8),
                if ((booking.confirmationPin ?? '').isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.amber.shade200)),
                    child: Row(children: [
                      const Icon(Icons.lock_outline, size: 20, color: Colors.amber),
                      const SizedBox(width: 8),
                      Text(booking.confirmationPin!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 4)),
                      const Spacer(),
                      Icon(booking.pinVerified == true ? Icons.verified : Icons.hourglass_empty, color: booking.pinVerified == true ? Colors.green : Colors.orange, size: 20),
                      const SizedBox(width: 4),
                      Text(booking.pinVerified == true ? 'Terverifikasi' : 'Belum', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: booking.pinVerified == true ? Colors.green : Colors.orange)),
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
      content: const Text('Are you sure you want to cancel this booking? (Cancel after deadline = no refund)'),
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
    return Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
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
