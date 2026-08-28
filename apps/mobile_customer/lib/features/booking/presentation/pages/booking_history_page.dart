import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

enum BookingFilter { all, pending, confirmed, completed, cancelled }

final bookingFilterProvider = StateProvider<BookingFilter>((ref) => BookingFilter.all);

final bookingsProvider = FutureProvider.autoDispose<List<BookingRow>>((ref) async {
  final filter = ref.watch(bookingFilterProvider);
  final params = <String, dynamic>{'page': 1, 'limit': 50};
  if (filter != BookingFilter.all) params['status'] = filter.name.toUpperCase();
  final response = await ApiService().getBookings(params: params);
  return parsePaginated(response.data['data'], BookingRow.fromJson).items;
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
                selectedColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
                checkmarkColor: Theme.of(context).colorScheme.primary,
              ));
            }).toList()),
          ),
          Expanded(child: bookingsAsync.when(
            data: (bookings) {
              if (bookings.isEmpty) {
                return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.calendar_today, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No bookings found', style: TextStyle(color: Colors.grey[500])),
                ]));
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: bookings.length,
                itemBuilder: (context, index) {
                  final b = bookings[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(b.bookingCode.isEmpty ? b.id : b.bookingCode, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(b.startsAt != null
                          ? '${_fmtDate(b.startsAt!)} ${_fmtTime(b.startsAt!)}'
                          : '-'),
                      trailing: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.end, children: [
                        _StatusChip(status: b.status),
                        const SizedBox(height: 4),
                        Text(formatRupiah(b.total), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700])),
                      ]),
                      onTap: () => context.push('/booking/${b.id}'),
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Failed to load bookings'),
                  TextButton(onPressed: () => ref.invalidate(bookingsProvider), child: const Text('Retry')),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }

  String _fmtDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
  String _fmtTime(DateTime d) => '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});
  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status.toUpperCase()) {
      case 'PENDING':
        color = Colors.orange;
        break;
      case 'HELD':
        color = Colors.deepPurple;
        break;
      case 'CONFIRMED':
        color = Colors.blue;
        break;
      case 'COMPLETED':
        color = Colors.green;
        break;
      case 'CANCELLED':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
      child: Text(status.isNotEmpty ? status[0].toUpperCase() + status.substring(1).toLowerCase() : '-',
          style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w500)),
    );
  }
}
