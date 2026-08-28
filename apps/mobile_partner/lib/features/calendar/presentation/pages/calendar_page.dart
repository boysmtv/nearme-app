import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final calendarBookingsProvider =
    FutureProvider.autoDispose.family<List<PartnerBookingRow>, DateTime>((ref, date) async {
  final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  final response = await ApiService().getPartnerBookings(params: {'date': dateStr, 'page': 1, 'limit': 50});
  return parsePaginated(response.data['data'], PartnerBookingRow.fromJson).items;
});

class CalendarPage extends ConsumerStatefulWidget {
  const CalendarPage({super.key});
  @override
  ConsumerState<CalendarPage> createState() => _CalendarPageState();
}

class _CalendarPageState extends ConsumerState<CalendarPage> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  Widget build(BuildContext context) {
    final selectedDay = _selectedDay ?? DateTime.now();
    final bookingsAsync = ref.watch(calendarBookingsProvider(selectedDay));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendar'),
        actions: [
          IconButton(icon: const Icon(Icons.today), onPressed: () => setState(() { _focusedDay = DateTime.now(); _selectedDay = DateTime.now(); })),
        ],
      ),
      body: Column(children: [
        TableCalendar(
          firstDay: DateTime.now().subtract(const Duration(days: 30)),
          lastDay: DateTime.now().add(const Duration(days: 90)),
          focusedDay: _focusedDay,
          calendarFormat: _calendarFormat,
          selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
          onDaySelected: (s, f) => setState(() { _selectedDay = s; _focusedDay = f; }),
          onFormatChanged: (f) => setState(() => _calendarFormat = f),
          calendarStyle: CalendarStyle(
            outsideDaysVisible: false,
            todayDecoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3), shape: BoxShape.circle),
            selectedDecoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, shape: BoxShape.circle),
            markerDecoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
            markerSize: 8, markersMaxCount: 3,
          ),
          headerStyle: const HeaderStyle(formatButtonVisible: true, titleCentered: true),
        ),
        const Divider(),
        Expanded(child: bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) {
              return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.event_available, size: 80, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text('No bookings for this day', style: TextStyle(color: Colors.grey)),
              ]));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              itemBuilder: (context, index) {
                final b = bookings[index];
                final status = b.status.toUpperCase();
                final color = switch (status) {
                  'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => Colors.green,
                  'CANCELLED' || 'NO_SHOW' => Colors.red,
                  'COMPLETED' => Colors.blue,
                  _ => Colors.orange,
                };
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: color.withValues(alpha: 0.1),
                      child: Icon(Icons.person, color: color),
                    ),
                    title: Text(b.customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${b.serviceName.isEmpty ? "Service" : b.serviceName} - ${b.time}'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(status.isNotEmpty ? status[0] + status.substring(1).toLowerCase() : '-',
                          style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500)),
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
                Text('Failed to load bookings'),
                TextButton(
                  onPressed: () => ref.invalidate(calendarBookingsProvider(selectedDay)),
                  child: const Text('Coba lagi'),
                ),
              ],
            ),
          ),
        )),
      ]),
    );
  }
}
