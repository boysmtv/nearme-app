import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => partnerScaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Kalender'),
        actions: [
          IconButton(icon: const Icon(Icons.today), onPressed: () => setState(() { _focusedDay = DateTime.now(); _selectedDay = DateTime.now(); })),
        ],
      ),
      body: Column(children: [
        // Ringkasan statistik usaha
        statsAsync.when(
          data: (stats) => Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                _StatCard(
                  icon: Icons.calendar_today_rounded,
                  label: 'Hari Ini',
                  value: '${stats['todayBookings'] ?? 0}',
                  color: Colors.blue,
                ),
                const SizedBox(width: 8),
                _StatCard(
                  icon: Icons.attach_money_rounded,
                  label: 'Minggu Ini',
                  value: _formatPrice(stats['weekRevenue'] ?? 0),
                  color: Colors.green,
                ),
                const SizedBox(width: 8),
                _StatCard(
                  icon: Icons.people_rounded,
                  label: 'Pelanggan',
                  value: '${stats['totalCustomers'] ?? 0}',
                  color: DEKATColors.primary,
                ),
              ],
            ),
          ),
          loading: () => const SizedBox(height: 80),
          error: (_, __) => const SizedBox(height: 80),
        ),
        // Kartu kalender bulan
        Container(
          margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: TableCalendar(
            firstDay: DateTime.now().subtract(const Duration(days: 30)),
            lastDay: DateTime.now().add(const Duration(days: 90)),
            focusedDay: _focusedDay,
            calendarFormat: _calendarFormat,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (s, f) => setState(() { _selectedDay = s; _focusedDay = f; }),
            onFormatChanged: (f) => setState(() => _calendarFormat = f),
            daysOfWeekStyle: DaysOfWeekStyle(
              weekdayStyle: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w600, fontSize: 12),
              weekendStyle: TextStyle(color: Colors.red.shade300, fontWeight: FontWeight.w600, fontSize: 12),
            ),
            calendarStyle: CalendarStyle(
              outsideDaysVisible: false,
              todayDecoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha: 0.15), shape: BoxShape.circle),
              todayTextStyle: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.bold),
              selectedDecoration: const BoxDecoration(color: DEKATColors.primary, shape: BoxShape.circle),
              markerDecoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
              markerSize: 8,
              markersMaxCount: 3,
            ),
            headerStyle: HeaderStyle(
              formatButtonVisible: true,
              titleCentered: true,
              titleTextStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              leftChevronIcon: const Icon(Icons.chevron_left_rounded, color: DEKATColors.primary),
              rightChevronIcon: const Icon(Icons.chevron_right_rounded, color: DEKATColors.primary),
              formatButtonDecoration: BoxDecoration(
                border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.4)),
                borderRadius: BorderRadius.circular(12),
              ),
              formatButtonTextStyle: const TextStyle(color: DEKATColors.primary, fontSize: 12),
            ),
          ),
        ),
        // Judul agenda hari yang dipilih
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
          child: Row(
            children: [
              const Text('Agenda', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _formatDayId(selectedDay),
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
        Expanded(child: bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) {
              return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)),
                  child: Icon(Icons.event_available_rounded, size: 40, color: DEKATColors.primary.withValues(alpha: 0.6)),
                ),
                const SizedBox(height: 16),
                const Text('Belum ada booking hari ini', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                const SizedBox(height: 4),
                Text('Jadwal yang masuk akan tampil di sini', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
              ]));
            }
            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
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
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: color.withValues(alpha: 0.12),
                              child: Text(initial, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: color)),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(b.customerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                  const SizedBox(height: 2),
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
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    children: [
                                      Icon(Icons.access_time_rounded, size: 13, color: Colors.grey.shade500),
                                      const SizedBox(width: 4),
                                      Text(
                                        b.time.isEmpty ? '-' : b.time,
                                        style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(_statusLabel(status),
                                      style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
                                ),
                                const SizedBox(height: 4),
                                Text(formatRupiah(b.amount), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
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
                const Text('Gagal memuat booking'),
                TextButton(
                  onPressed: () => ref.invalidate(calendarBookingsProvider(selectedDay)),
                  child: const Text('Coba Lagi'),
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

String _formatDayId(DateTime d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  return '${days[d.weekday - 1]}, ${d.day} ${months[d.month - 1]} ${d.year}';
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
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
