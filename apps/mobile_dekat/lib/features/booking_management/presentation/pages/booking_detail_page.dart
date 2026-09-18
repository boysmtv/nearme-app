import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final partnerBookingDetailProvider =
    FutureProvider.autoDispose.family<PartnerBookingRow, String>((ref, id) async {
  final response = await ApiService().getProviderBooking(id);
  return PartnerBookingRow.fromJson(response.data['data'] as Map<String, dynamic>);
});

class BookingDetailPage extends ConsumerWidget {
  final String bookingId;
  const BookingDetailPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(partnerBookingDetailProvider(bookingId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(title: const Text('Detail Booking')),
      body: bookingAsync.when(
        data: (booking) {
          final status = booking.status.toUpperCase();
          final isPending = status == 'PENDING' || status == 'HELD' || status == 'PENDING_APPROVAL';
          final isActive = status == 'CONFIRMED' || status == 'CHECKED_IN' || status == 'IN_SERVICE';
          final color = switch (status) {
            'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => Colors.blue,
            'COMPLETED' => Colors.green,
            'CANCELLED' || 'NO_SHOW' => Colors.red,
            _ => Colors.orange,
          };
          final heroIcon = switch (status) {
            'CONFIRMED' || 'CHECKED_IN' => Icons.check_circle_rounded,
            'IN_SERVICE' => Icons.play_circle_rounded,
            'COMPLETED' => Icons.done_all_rounded,
            'CANCELLED' || 'NO_SHOW' => Icons.cancel_rounded,
            _ => Icons.pending_actions_rounded,
          };
          final initial = booking.customerName.isNotEmpty ? booking.customerName[0].toUpperCase() : '?';
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              RepaintBoundary(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: color.withValues(alpha: 0.3)),
                  ),
                  child: Row(children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                      child: Icon(isPending ? Icons.pending_actions_rounded : heroIcon, color: color, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_statusLabel(status),
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: color)),
                          const SizedBox(height: 2),
                          Text('Kode ${booking.bookingCode.isEmpty ? '-' : booking.bookingCode}',
                              style: TextStyle(color: color.withValues(alpha: 0.8), fontSize: 12)),
                        ],
                      ),
                    ),
                    Text(formatRupiah(booking.amount),
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: color)),
                  ]),
                ),
              ),
              const SizedBox(height: 12),
              RepaintBoundary(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: DEKATColors.primary.withValues(alpha: 0.12),
                            child: Text(initial, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: DEKATColors.primary)),
                          ),
                          const SizedBox(width: 10),
                          const Text('Pelanggan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _InfoRow(icon: Icons.person_rounded, label: 'Nama', value: booking.customerName),
                      _InfoRow(icon: Icons.spa_rounded, label: 'Layanan', value: booking.serviceName.isEmpty ? '-' : booking.serviceName),
                      _InfoRow(icon: Icons.access_time_rounded, label: 'Jadwal', value: booking.time.isEmpty ? '-' : booking.time),
                    ]),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              RepaintBoundary(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Pembayaran', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      _InfoRow(icon: Icons.payments_rounded, label: 'Total', value: formatRupiah(booking.amount)),
                    ]),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              RepaintBoundary(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: DEKATColors.primary.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.chat_bubble_rounded, size: 18, color: DEKATColors.primary),
                          ),
                          const SizedBox(width: 10),
                          const Text('Chat Pelanggan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Chat pelanggan realtime via WebSocket /ws-chat + SSE',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.chat_bubble, size: 16),
                          label: const Text('Buka Chat Booking'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DEKATColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: () async {
                            try {
                              final res = await ApiService().getBookingChat(booking.id);
                              final chatId = (res.data['data']['id'] ?? res.data['id']) as String;
                              if (context.mounted) context.push('/provider/chat/$chatId');
                            } catch (_) {
                              try {
                                final res = await ApiService().createChat({'bookingId': booking.id, 'subject': 'Booking ${booking.bookingCode}'});
                                final chatId = (res.data['data']['id'] ?? res.data['id']) as String;
                                if (context.mounted) context.push('/provider/chat/$chatId');
                              } catch (e) {
                                if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Chat gagal: $e')));
                              }
                            }
                          },
                        ),
                      ),
                    ]),
                  ),
                ),
              ),
              if (isActive) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline_rounded, size: 18, color: Colors.grey.shade500),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Selesaikan layanan dari tombol di bawah setelah pelanggan selesai dilayani.',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Gagal memuat'),
              TextButton(onPressed: () => ref.invalidate(partnerBookingDetailProvider(bookingId)), child: const Text('Coba Lagi')),
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
            if (status == 'PENDING' || status == 'HELD' || status == 'PENDING_APPROVAL') {
              return Row(children: [
                Expanded(child: OutlinedButton(
                  onPressed: () => _updateStatus(context, ref, 'CANCELLED'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: const BorderSide(color: Colors.red),
                    foregroundColor: Colors.red,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Tolak'),
                )),
                const SizedBox(width: 12),
                Expanded(child: ElevatedButton(
                  onPressed: () => _updateStatus(context, ref, 'CONFIRMED'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: DEKATColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Terima'),
                )),
              ]);
            }
            if (status == 'CONFIRMED' || status == 'CHECKED_IN' || status == 'IN_SERVICE') {
              return SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _updateStatus(context, ref, 'COMPLETED'),
                  icon: const Icon(Icons.done_all_rounded, size: 18),
                  label: const Text('Selesaikan Layanan'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              );
            }
            return const SizedBox();
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

String _statusLabel(String status) {
  switch (status.toUpperCase()) {
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return 'Menunggu';
    case 'HELD':
      return 'Ditahan';
    case 'CONFIRMED':
      return 'Terkonfirmasi';
    case 'CHECKED_IN':
      return 'Check-in';
    case 'IN_SERVICE':
      return 'Dilayani';
    case 'COMPLETED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    case 'NO_SHOW':
      return 'Tidak Hadir';
    default:
      return status.isEmpty ? '-' : status[0] + status.substring(1).toLowerCase();
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoRow({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(9)),
          child: Icon(icon, size: 15, color: Colors.grey.shade600),
        ),
        const SizedBox(width: 10),
        Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
        const SizedBox(width: 8),
        const Spacer(),
        Flexible(child: Text(value, overflow: TextOverflow.ellipsis, textAlign: TextAlign.end, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
      ]),
    );
  }
}
