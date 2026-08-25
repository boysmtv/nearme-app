import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

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
      appBar: AppBar(title: const Text('Bookings')),
      body: Column(children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(children: BookingFilter.values.map((f) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(f.name[0].toUpperCase() + f.name.substring(1)),
              selected: currentFilter == f,
              onSelected: (_) => ref.read(partnerBookingFilterProvider.notifier).state = f,
              selectedColor: Theme.of(context).colorScheme.primary.withOpacity(0.2),
              checkmarkColor: Theme.of(context).colorScheme.primary,
            ),
          )).toList()),
        ),
        Expanded(child: bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.book_outlined, size: 64, color: Colors.grey[300]),
              const SizedBox(height: 16), Text('No bookings found', style: TextStyle(color: Colors.grey[500])),
            ]));
            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
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
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(b.bookingCode.isEmpty ? b.id : b.bookingCode, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${b.serviceName.isEmpty ? "Service" : b.serviceName} - ${b.customerName}'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: Text(status.isNotEmpty ? status[0] + status.substring(1).toLowerCase() : '-',
                          style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w500)),
                    ),
                    onTap: () => context.push('/booking/${b.id}'),
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
                Text('Failed to load'),
                TextButton(onPressed: () => ref.invalidate(partnerBookingsProvider), child: const Text('Coba lagi')),
              ],
            ),
          ),
        )),
      ]),
    );
  }
}
