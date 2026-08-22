import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

enum BookingFilter { all, upcoming, completed, cancelled }

final bookingFilterProvider = StateProvider<BookingFilter>((ref) => BookingFilter.all);

final bookingsProvider = FutureProvider.autoDispose<List<Booking>>((ref) async {
  final filter = ref.watch(bookingFilterProvider);
  try {
    final params = <String, dynamic>{};
    if (filter != BookingFilter.all) params['status'] = filter.name;
    final response = await ApiService().getBookings(params: params);
    final data = response.data['data'] as List;
    return data.map((e) => Booking.fromJson(e)).toList();
  } catch (e) { return []; }
});

class BookingHistoryPage extends ConsumerWidget {
  const BookingHistoryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentFilter = ref.watch(bookingFilterProvider);
    final bookingsAsync = ref.watch(bookingsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('My Bookings')),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(children: BookingFilter.values.map((f) {
              return Padding(padding: const EdgeInsets.only(right: 8), child: FilterChip(
                label: Text(f.name[0].toUpperCase() + f.name.substring(1)),
                selected: currentFilter == f,
                onSelected: (_) => ref.read(bookingFilterProvider.notifier).state = f,
                selectedColor: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                checkmarkColor: Theme.of(context).colorScheme.primary,
              ));
            }).toList()),
          ),
          Expanded(child: bookingsAsync.when(
            data: (bookings) {
              if (bookings.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.calendar_today, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text('No bookings found', style: TextStyle(color: Colors.grey[500])),
              ]));
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: bookings.length,
                itemBuilder: (context, index) {
                  final b = bookings[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      title: Text(b.service?.name ?? 'Service', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(b.provider?.name ?? 'Provider'),
                      trailing: _StatusChip(status: b.status),
                      onTap: () => context.push('/booking/'),
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => const Center(child: Text('Failed to load bookings')),
          )),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});
  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case 'confirmed': color = Colors.blue; break;
      case 'completed': color = Colors.green; break;
      case 'cancelled': color = Colors.red; break;
      default: color = Colors.orange;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
      child: Text(status[0].toUpperCase() + status.substring(1), style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500)),
    );
  }
}