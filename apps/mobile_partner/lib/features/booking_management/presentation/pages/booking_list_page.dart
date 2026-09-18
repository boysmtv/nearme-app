import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';
import '../../../../shared/widgets/main_scaffold.dart';

enum BookingFilter { all, pending, confirmed, completed, cancelled }

final partnerBookingFilterProvider = StateProvider<BookingFilter>((ref) => BookingFilter.all);

final partnerBookingsProvider = FutureProvider.autoDispose<List<PartnerBookingRow>>((ref) async {
  final filter = ref.watch(partnerBookingFilterProvider);
  final params = <String, dynamic>{'page': 1, 'limit': 50};
  if (filter != BookingFilter.all) params['status'] = filter.name.toUpperCase();
  final response = await ApiService().getPartnerBookings(params: params);
  return parsePaginated(response.data['data'], PartnerBookingRow.fromJson).items;
});

class BookingListPage extends ConsumerWidget {
  const BookingListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentFilter = ref.watch(partnerBookingFilterProvider);
    final bookingsAsync = ref.watch(partnerBookingsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => partnerScaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Booking'),
      ),
      body: Column(children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(children: BookingFilter.values.map((f) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(_filterLabel(f)),
              selected: currentFilter == f,
              onSelected: (_) => ref.read(partnerBookingFilterProvider.notifier).state = f,
              selectedColor: DEKATColors.primary.withValues(alpha: 0.15),
              checkmarkColor: DEKATColors.primary,
              labelStyle: TextStyle(
                color: currentFilter == f ? DEKATColors.primary : Colors.grey.shade700,
                fontWeight: currentFilter == f ? FontWeight.w600 : FontWeight.normal,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(
                  color: currentFilter == f ? DEKATColors.primary.withValues(alpha: 0.4) : Colors.grey.shade300,
                ),
              ),
              backgroundColor: Colors.white,
            ),
          )).toList()),
        ),
        Expanded(child: bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) {
              return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)),
                  child: Icon(Icons.book_outlined, size: 40, color: DEKATColors.primary.withValues(alpha: 0.6)),
                ),
                const SizedBox(height: 16),
                const Text('Belum ada booking', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                const SizedBox(height: 4),
                Text('Booking dengan status ini akan tampil di sini', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
              ]));
            }
            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
              itemCount: bookings.length,
              itemBuilder: (context, index) {
                final b = bookings[index];
                final status = b.status.toUpperCase();
                final Color statusColor = switch (status) {
                  'PENDING' || 'HELD' || 'PENDING_APPROVAL' => Colors.orange,
                  'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => Colors.blue,
                  'COMPLETED' => Colors.green,
                  _ => Colors.red,
                };
                final initial = b.customerName.isNotEmpty ? b.customerName[0].toUpperCase() : '?';
                return RepaintBoundary(
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () => context.push('/booking/${b.id}'),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    b.bookingCode.isEmpty ? b.id : b.bookingCode,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: statusColor.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(_statusLabel(status),
                                      style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w600)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 16,
                                  backgroundColor: DEKATColors.primary.withValues(alpha: 0.12),
                                  child: Text(initial, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: DEKATColors.primary)),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(b.customerName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                ),
                                Text(formatRupiah(b.amount), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: DEKATColors.primary)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.spa_rounded, size: 13, color: Colors.grey.shade500),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    b.serviceName.isEmpty ? 'Layanan' : b.serviceName,
                                    style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (b.time.isNotEmpty) ...[
                                  Icon(Icons.access_time_rounded, size: 13, color: Colors.grey.shade500),
                                  const SizedBox(width: 4),
                                  Text(b.time, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                                ],
                                const SizedBox(width: 4),
                                Icon(Icons.chevron_right_rounded, size: 18, color: Colors.grey.shade400),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Gagal memuat'),
                TextButton(onPressed: () => ref.invalidate(partnerBookingsProvider), child: const Text('Coba Lagi')),
              ],
            ),
          ),
        )),
      ]),
    );
  }
}

String _filterLabel(BookingFilter f) {
  switch (f) {
    case BookingFilter.all:
      return 'Semua';
    case BookingFilter.pending:
      return 'Menunggu';
    case BookingFilter.confirmed:
      return 'Terkonfirmasi';
    case BookingFilter.completed:
      return 'Selesai';
    case BookingFilter.cancelled:
      return 'Dibatalkan';
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
