import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

enum BookingFilter { all, pending, confirmed, completed, cancelled }

final partnerBookingFilterProvider = StateProvider<BookingFilter>((ref) => BookingFilter.all);

final partnerBookingsProvider = FutureProvider.autoDispose<List<Booking>>((ref) async {
  final filter = ref.watch(partnerBookingFilterProvider);
  try {
    final params = <String, dynamic>{};
    if (filter != BookingFilter.all) params['status'] = filter.name;
    final response = await ApiService().getPartnerBookings(params: params);
    final data = response.data['data'] as List;
    return data.map((e) => Booking.fromJson(e)).toList();
  } catch (e) { return []; }
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
                Color statusColor;
                switch (b.status) {
                  case 'pending': statusColor = Colors.orange; break;
                  case 'confirmed': statusColor = Colors.blue; break;
                  case 'completed': statusColor = Colors.green; break;
                  default: statusColor = Colors.red;
                }
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text('#${b.id}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${b.service?.name ?? "Service"} - ${b.date.toString().substring(0, 10)}'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: Text(b.status[0].toUpperCase() + b.status.substring(1), style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w500)),
                    ),
                    onTap: () => context.push('/booking/${b.id}'),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => const Center(child: Text('Failed to load')),
        )),
      ]),
    );
  }
}
