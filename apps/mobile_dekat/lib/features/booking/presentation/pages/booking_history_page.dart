import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../booking/presentation/viewmodel/booking_viewmodel.dart';

import '../../../../shared/widgets/shimmer_loading.dart';

const _monthNames = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

String _filterLabel(BookingFilter f) {
  switch (f) {
    case BookingFilter.all:
      return 'Semua';
    case BookingFilter.pending:
      return 'Menunggu';
    case BookingFilter.confirmed:
      return 'Dikonfirmasi';
    case BookingFilter.completed:
      return 'Selesai';
    case BookingFilter.cancelled:
      return 'Dibatalkan';
  }
}

class BookingHistoryPage extends ConsumerWidget {
  const BookingHistoryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentFilter = ref.watch(bookingFilterProvider);
    final bookingsAsync = ref.watch(bookingsProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Booking Saya',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: BookingFilter.values.map((f) {
                final selected = currentFilter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () =>
                        ref.read(bookingFilterProvider.notifier).state = f,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected
                            ? DEKATColors.primary
                            : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _filterLabel(f),
                        style: TextStyle(
                          color:
                              selected ? Colors.white : Colors.grey.shade700,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList()),
            ),
          ),
          Expanded(
            child: bookingsAsync.when(
              data: (bookings) {
                if (bookings.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: DEKATColors.primary
                                .withValues(alpha: 0.08),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.calendar_month_rounded,
                            size: 40,
                            color: DEKATColors.primary
                                .withValues(alpha: 0.6),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text('Belum ada booking',
                            style: TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text('Yuk cari layanan dan booking sekarang',
                            style: TextStyle(
                                color: Colors.grey[500], fontSize: 13)),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => context.go('/discovery'),
                          icon: const Icon(Icons.search_rounded, size: 16),
                          label: const Text('Cari Layanan'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DEKATColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  itemCount: bookings.length,
                  itemBuilder: (context, index) {
                    final b = bookings[index];
                    return RepaintBoundary(
                      child: _BookingCard(
                        code: b.bookingCode.isEmpty ? b.id : b.bookingCode,
                        status: b.status,
                        startsAt: b.startsAt,
                        endsAt: b.endsAt,
                        total: b.total,
                        onTap: () => context.push('/booking/${b.id}'),
                      ),
                    );
                  },
                );
              },
              loading: () => const ShimmerBookingList(),
              error: (e, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.wifi_off_rounded,
                        size: 48, color: Colors.grey[300]),
                    const SizedBox(height: 12),
                    const Text('Gagal memuat booking',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(bookingsProvider),
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final String code;
  final String status;
  final DateTime? startsAt;
  final DateTime? endsAt;
  final num total;

  const _BookingCard({
    required this.code,
    required this.status,
    required this.startsAt,
    required this.endsAt,
    required this.total,
    required this.onTap,
  });

  final VoidCallback onTap;

  Color get _statusColor {
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return Colors.orange;
      case 'HELD':
        return Colors.deepPurple;
      case 'CONFIRMED':
        return const Color(0xFF2196F3);
      case 'COMPLETED':
        return const Color(0xFF4CAF50);
      case 'CANCELLED':
        return const Color(0xFFF44336);
      default:
        return Colors.grey;
    }
  }

  String get _statusLabel {
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'Menunggu';
      case 'HELD':
        return 'Ditahan';
      case 'CONFIRMED':
        return 'Dikonfirmasi';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status.isEmpty ? '-' : status;
    }
  }

  String get _dateLine {
    if (startsAt == null) return 'Jadwal belum diatur';
    final d = startsAt!;
    var s =
        '${d.day} ${_monthNames[d.month]} ${d.year} • ${_two(d.hour)}:${_two(d.minute)}';
    if (endsAt != null) {
      s += ' - ${_two(endsAt!.hour)}:${_two(endsAt!.minute)}';
    }
    return s;
  }

  static String _two(int v) => v.toString().padLeft(2, '0');

  @override
  Widget build(BuildContext context) {
    final color = _statusColor;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                // Badge tanggal
                Container(
                  width: 56,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        startsAt?.day.toString() ?? '-',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: color,
                        ),
                      ),
                      Text(
                        startsAt != null
                            ? _monthNames[startsAt!.month]
                            : '',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: color,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              code,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _statusLabel,
                              style: TextStyle(
                                  color: color,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(_dateLine,
                          style: TextStyle(
                              color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(
                        _formatRupiah(total),
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 14),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right_rounded,
                    color: Colors.grey[300], size: 22),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatRupiah(num amount) {
    final value = amount.round().toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
    return 'Rp $value';
  }
}
