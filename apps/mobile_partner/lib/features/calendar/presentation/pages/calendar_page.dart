import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';
import '../../../../shared/widgets/main_scaffold.dart';

final calendarBookingsProvider =
    FutureProvider.autoDispose.family<List<PartnerBookingRow>, DateTime>((ref, date) async {
  final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  final response = await ApiService().getPartnerBookings(params: {'date': dateStr, 'page': 1, 'limit': 50});
  return parsePaginated(response.data['data'], PartnerBookingRow.fromJson).items;
});

final partnerStatsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final response = await ApiService().getPartnerDashboardStats();
  return response.data['data'] as Map<String, dynamic>? ?? {};
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
    final statsAsync = ref.watch(partnerStatsProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => partnerScaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Calendar'),
        actions: [
          IconButton(icon: const Icon(Icons.today), onPressed: () => setState(() { _focusedDay = DateTime.now(); _selectedDay = DateTime.now(); })),
        ],
      ),
      body: Column(children: [
        // Dashboard Stats
        statsAsync.when(
          data: (stats) => Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _StatCard(
                  icon: Icons.calendar_today,
                  label: 'Hari Ini',
                  value: '${stats['todayBookings'] ?? 0}',
                  color: Colors.blue,
                ),
                const SizedBox(width: 8),
                _StatCard(
                  icon: Icons.attach_money,
                  label: 'Minggu Ini',
                  value: _formatPrice(stats['weekRevenue'] ?? 0),
                  color: Colors.green,
                ),
                const SizedBox(width: 8),
                _StatCard(
                  icon: Icons.people,
                  label: 'Pelanggan',
                  value: '${stats['totalCustomers'] ?? 0}',
                  color: Colors.purple,
                ),
              ],
            ),
          ),
          loading: () => const SizedBox(height: 80),
          error: (_, __) => const SizedBox(height: 80),
        ),
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

String _formatPrice(dynamic amount) {
  final value = (amount is num) ? amount.toInt() : 0;
  if (value >= 1000000) {
    return '${(value / 1000000).toStringAsFixed(1)}jt';
  } else if (value >= 1000) {
    return '${(value / 1000).toStringAsFixed(0)}rb';
  }
  return '$value';
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: color.withValues(alpha: 0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
