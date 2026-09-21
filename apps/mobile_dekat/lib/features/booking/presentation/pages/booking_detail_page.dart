import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../booking/domain/entities/booking_entity.dart';
import '../../../booking/presentation/viewmodel/booking_viewmodel.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

const _monthNames = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];
const _dayNames = ['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

String _fmtDateTime(DateTime d) =>
    '${_dayNames[d.weekday % 7]}, ${d.day} ${_monthNames[d.month]} ${d.year} '
    '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
String _fmtDate(DateTime d) => '${d.day} ${_monthNames[d.month]} ${d.year}';

String formatRupiah(int amount) {
  return 'Rp ${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
}

class _StatusTheme {
  final Color color;
  final Color bg;
  final String label;
  final IconData icon;
  const _StatusTheme(this.color, this.bg, this.label, this.icon);
}

_StatusTheme _statusTheme(String status) {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return const _StatusTheme(Color(0xFF2196F3), Color(0xFFE8F4FF),
          'Dikonfirmasi', Icons.check_circle_rounded);
    case 'COMPLETED':
      return const _StatusTheme(Color(0xFF4CAF50), Color(0xFFE6F7EE),
          'Selesai', Icons.verified_rounded);
    case 'CANCELLED':
      return const _StatusTheme(Color(0xFFF44336), Color(0xFFFFEBEE),
          'Dibatalkan', Icons.cancel_rounded);
    case 'PENDING':
    case 'PENDING_PAYMENT':
      return const _StatusTheme(Color(0xFFFF9800), Color(0xFFFFF3E0),
          'Menunggu Pembayaran', Icons.hourglass_top_rounded);
    default:
      return const _StatusTheme(Color(0xFF9C27B0), Color(0xFFF3E5F5),
          'Diproses', Icons.info_rounded);
  }
}

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

  Future<void> _downloadIcs(BookingEntity booking) async {
    setState(() => _icsLoading = true);
    try {
      final res = await ApiService().getBookingIcs(widget.bookingId);
      final content = res.data as String;
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/${booking.bookingCode}.ics');
      await file.writeAsString(content);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Tersimpan: ${file.path.split('/').last}'),
          backgroundColor: Colors.green,
        ));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Kalender gagal: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _icsLoading = false);
    }
  }

  Future<void> _openGoogleCalendar(BookingEntity booking) async {
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

  Future<void> _reschedule(BookingEntity booking) async {
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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Detail Booking',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: bookingAsync.when(
        data: (booking) {
          final theme = _statusTheme(booking.status);
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero status
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [theme.color, theme.color.withValues(alpha: 0.75)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: theme.color.withValues(alpha: 0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(theme.icon, color: Colors.white, size: 22),
                          const SizedBox(width: 8),
                          Text(theme.label,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 16)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          booking.bookingCode.isEmpty
                              ? booking.id
                              : booking.bookingCode,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      if (booking.startsAt != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          '${_fmtDate(booking.startsAt!)} • '
                          '${booking.startsAt!.hour.toString().padLeft(2, '0')}:${booking.startsAt!.minute.toString().padLeft(2, '0')}'
                          '${booking.endsAt != null ? ' - ${booking.endsAt!.hour.toString().padLeft(2, '0')}:${booking.endsAt!.minute.toString().padLeft(2, '0')}' : ''}',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.9),
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _Card(
                  title: 'Jadwal',
                  icon: Icons.calendar_month_rounded,
                  child: Column(
                    children: [
                      _InfoRow(
                          label: 'Mulai',
                          value: booking.startsAt != null
                              ? _fmtDateTime(booking.startsAt!)
                              : '-'),
                      _InfoRow(
                          label: 'Selesai',
                          value: booking.endsAt != null
                              ? _fmtDateTime(booking.endsAt!)
                              : '-'),
                      if (booking.cancelDeadline != null)
                        _InfoRow(
                            label: 'Batas Batal',
                            value: _fmtDateTime(booking.cancelDeadline!)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _Card(
                  title: 'Pembayaran',
                  icon: Icons.wallet_rounded,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total',
                              style: TextStyle(fontWeight: FontWeight.w800)),
                          Text(formatRupiah(booking.total),
                              style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                  color: DEKATColors.primary)),
                        ],
                      ),
                      if (booking.discount > 0)
                        _InfoRow(
                            label: 'Diskon',
                            value: '- ${formatRupiah(booking.discount)}'),
                      if (booking.tax > 0)
                        _InfoRow(
                            label: 'Pajak',
                            value: formatRupiah(booking.tax)),
                      if (booking.fee > 0)
                        _InfoRow(
                            label: 'Biaya',
                            value: formatRupiah(booking.fee)),
                      const Divider(height: 20),
                      _InfoRow(
                          label: 'Deposit',
                          value: booking.depositRequired
                              ? '${formatRupiah(booking.depositAmount)} (Wajib)'
                              : 'Tidak ada'),
                      const SizedBox(height: 8),
                      _InfoRow(
                          label: 'Kebijakan',
                          value: _policyLabel(booking.cancelPolicy)),
                      _InfoRow(
                          label: 'Reschedule',
                          value:
                              '${booking.rescheduleCount}/${booking.maxReschedule} gratis'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _Card(
                  title: 'PIN Check-in',
                  icon: Icons.lock_rounded,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tunjukkan PIN 6-digit ini ke staf saat tiba di lokasi.',
                          style: TextStyle(
                              color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(height: 10),
                      if ((booking.confirmationPin ?? '').isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border:
                                Border.all(color: Colors.amber.shade200),
                          ),
                          child: Row(children: [
                            const Icon(Icons.lock_outline,
                                size: 22, color: Colors.amber),
                            const SizedBox(width: 10),
                            Text(booking.confirmationPin!,
                                style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 6)),
                            const Spacer(),
                            Icon(
                                booking.pinVerified == true
                                    ? Icons.verified_rounded
                                    : Icons.hourglass_empty_rounded,
                                color: booking.pinVerified == true
                                    ? Colors.green
                                    : Colors.orange,
                                size: 20),
                            const SizedBox(width: 4),
                            Text(
                                booking.pinVerified == true
                                    ? 'Terverifikasi'
                                    : 'Belum',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: booking.pinVerified == true
                                        ? Colors.green
                                        : Colors.orange)),
                          ]),
                        ),
                      const SizedBox(height: 10),
                      Row(children: [
                        Expanded(
                            child: TextField(
                                controller: _pinController,
                                keyboardType: TextInputType.number,
                                maxLength: 6,
                                decoration: InputDecoration(
                                  hintText: 'PIN 6 digit',
                                  counterText: '',
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(
                                      borderRadius:
                                          BorderRadius.circular(12)),
                                ))),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: _verifying ? null : _verifyPin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DEKATColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 18, vertical: 14),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: _verifying
                              ? const SizedBox(
                                  height: 16,
                                  width: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white))
                              : const Text('Verifikasi',
                                  style:
                                      TextStyle(fontWeight: FontWeight.w700)),
                        ),
                      ]),
                      if (_pinMsg != null)
                        Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(_pinMsg!,
                                style: TextStyle(
                                    color: _pinMsg!.contains('terverifikasi')
                                        ? Colors.green
                                        : Colors.red,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600))),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _Card(
                  title: 'Kalender & Chat',
                  icon: Icons.event_available_rounded,
                  child: Column(
                    children: [
                      Row(children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _icsLoading
                                ? null
                                : () => _downloadIcs(booking),
                            icon: _icsLoading
                                ? const SizedBox(
                                    height: 14,
                                    width: 14,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2))
                                : const Icon(Icons.calendar_today_rounded,
                                    size: 16),
                            label: const Text('File .ics'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _openGoogleCalendar(booking),
                            icon: const Icon(Icons.link_rounded, size: 16),
                            label: const Text('Google'),
                          ),
                        ),
                      ]),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.chat_bubble_rounded, size: 16),
                          label: const Text('Chat dengan Provider'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DEKATColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: () async {
                            try {
                              final res = await ApiService()
                                  .getBookingChat(widget.bookingId);
                              final chatId =
                                  (res.data['data']['id'] ?? res.data['id'])
                                      as String;
                              if (context.mounted) {
                                context.push('/chat/$chatId');
                              }
                            } catch (e) {
                              try {
                                final res = await ApiService().createChat({
                                  'bookingId': widget.bookingId,
                                  'subject':
                                      'Booking ${booking.bookingCode}'
                                });
                                final chatId =
                                    (res.data['data']['id'] ?? res.data['id'])
                                        as String;
                                if (context.mounted) {
                                  context.push('/chat/$chatId');
                                }
                              } catch (e2) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content:
                                              Text('Chat gagal: $e2')));
                                }
                              }
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _Card(
                  title: 'Ubah Jadwal',
                  icon: Icons.edit_calendar_rounded,
                  trailing:
                      'Reschedule ${booking.rescheduleCount}/${booking.maxReschedule} gratis',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () async {
                              final picked = await showDatePicker(
                                  context: context,
                                  initialDate: DateTime.now()
                                      .add(const Duration(days: 1)),
                                  firstDate: DateTime.now(),
                                  lastDate: DateTime.now()
                                      .add(const Duration(days: 30)));
                              if (picked != null) {
                                setState(() => _rescheduleDate = picked);
                              }
                            },
                            child: Text(_rescheduleDate == null
                                ? 'Pilih Tanggal'
                                : '${_rescheduleDate!.day}/${_rescheduleDate!.month}/${_rescheduleDate!.year}'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () async {
                              final picked = await showTimePicker(
                                  context: context,
                                  initialTime: const TimeOfDay(
                                      hour: 9, minute: 0));
                              if (picked != null) {
                                setState(() => _rescheduleTime = picked);
                              }
                            },
                            child: Text(_rescheduleTime == null
                                ? 'Pilih Jam'
                                : _rescheduleTime!.format(context)),
                          ),
                        ),
                      ]),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isRescheduling
                              ? null
                              : () => _reschedule(booking),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DEKATColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                          child: _isRescheduling
                              ? const SizedBox(
                                  height: 16,
                                  width: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white))
                              : const Text('Kirim Reschedule',
                                  style:
                                      TextStyle(fontWeight: FontWeight.w700)),
                        ),
                      ),
                      if (_rescheduleMsg != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(_rescheduleMsg!,
                              style: TextStyle(
                                  color: _rescheduleMsg!.contains('berhasil')
                                      ? Colors.green
                                      : Colors.red,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const ShimmerProviderDetail(),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline_rounded,
                  size: 48, color: Colors.grey[300]),
              const SizedBox(height: 12),
              const Text('Gagal memuat booking',
                  style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              ElevatedButton(
                  onPressed: () =>
                      ref.invalidate(bookingDetailProvider2(widget.bookingId)),
                  child: const Text('Coba Lagi')),
            ],
          ),
        ),
      ),
      bottomNavigationBar: bookingAsync.maybeWhen(
        data: (booking) => booking.canCancel
            ? Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 12,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => _showCancelDialog(context, ref),
                      style: OutlinedButton.styleFrom(
                        padding:
                            const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: Colors.red),
                        foregroundColor: Colors.red,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Batalkan Booking',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ),
              )
            : null,
        orElse: () => null,
      ),
    );
  }

  void _showCancelDialog(BuildContext context, WidgetRef ref) {
    showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              title: const Text('Batalkan Booking?',
                  style: TextStyle(fontWeight: FontWeight.w800)),
              content: const Text(
                  'Yakin ingin membatalkan? Pembatalan melewati batas = no refund.'),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Tidak')),
                TextButton(
                    onPressed: () async {
                      Navigator.pop(ctx);
                      try {
                        final actorId =
                            await SecureStorageService.read(
                                StorageKeys.userId);
                        await ApiService().dio.post(
                              '/bookings/${widget.bookingId}/cancel',
                              queryParameters: {
                                'reason': 'Dibatalkan customer'
                              },
                              options: Options(
                                  headers: {'X-Actor-Id': actorId}),
                            );
                        ref.invalidate(
                            bookingDetailProvider2(widget.bookingId));
                        if (context.mounted) context.go('/bookings');
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text('Batal gagal: $e'),
                              backgroundColor: Colors.red));
                        }
                      }
                    },
                    style:
                        TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const Text('Ya, Batalkan',
                        style: TextStyle(fontWeight: FontWeight.w700))),
              ],
            ));
  }

  String _policyLabel(String? policy) {
    switch (policy) {
      case '24h_full_refund':
        return 'Refund penuh bila batal >24 jam';
      default:
        return policy ?? 'Refund penuh bila batal >24 jam';
    }
  }
}

class _Card extends StatelessWidget {
  final String title;
  final IconData icon;
  final String? trailing;
  final Widget child;
  const _Card(
      {required this.title,
      required this.icon,
      this.trailing,
      required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: DEKATColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon,
                    size: 16, color: DEKATColors.primary),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 14)),
              ),
              if (trailing != null)
                Text(trailing!,
                    style: TextStyle(
                        color: Colors.grey[500], fontSize: 11)),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  const _InfoRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(width: 12),
          Flexible(
            child: Text(value,
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
