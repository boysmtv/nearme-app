import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../shared/models/rows.dart';

final calendarBookingsProvider = FutureProvider.autoDispose.family<List<PartnerBookingRow>, DateTime>((ref, date) async {
  final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  final response = await ApiService().getPartnerBookings(params: {'date': dateStr, 'page': 1, 'limit': 50});
  return parsePaginated(response.data['data'], PartnerBookingRow.fromJson).items;
});

class CalendarPage extends ConsumerStatefulWidget {
  const CalendarPage({super.key});
  @override
  ConsumerState<CalendarPage> createState() => _CalendarPageState();
}

class _CalendarPageState extends ConsumerState<CalendarPage> with TickerProviderStateMixin {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  Color _statusColor(String s) {
    return switch (s) {
      'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => const Color(0xFF5AA9E6),
      'CANCELLED' || 'NO_SHOW' => const Color(0xFFFF8B8B),
      'COMPLETED' => const Color(0xFF7ED8A6),
      _ => const Color(0xFFFFB86A),
    };
  }

  List<Color> _statusGradient(String s) {
    return switch (s) {
      'CONFIRMED' || 'CHECKED_IN' || 'IN_SERVICE' => DEKATColors.softSky,
      'CANCELLED' || 'NO_SHOW' => DEKATColors.softPink,
      'COMPLETED' => DEKATColors.softMint,
      _ => DEKATColors.softPeach,
    };
  }

  @override
  Widget build(BuildContext context) {
    final selectedDay = _selectedDay ?? DateTime.now();
    final bookingsAsync = ref.watch(calendarBookingsProvider(selectedDay));
    final displayDate = selectedDay;

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: Column(children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.22), blurRadius: 10, offset: const Offset(0, 4))]),
                child: const Icon(Icons.calendar_month_rounded, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Kalender', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                  Text('${_monthName(displayDate.month)} ${displayDate.year} • ${_weekdayName(displayDate.weekday)}, ${displayDate.day}',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: DEKATColors.textSecondary)),
                ]),
              ),
              Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[200]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)]),
                child: IconButton(icon: const Icon(Icons.today_rounded, size: 20), color: DEKATColors.primary, onPressed: () => setState(() { _focusedDay = DateTime.now(); _selectedDay = DateTime.now(); }), tooltip: 'Hari ini'),
              ),
            ]),
          ),
          // Calendar card
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 18, offset: const Offset(0, 6))],
                border: Border.all(color: Colors.grey[100]!),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: TableCalendar(
                  firstDay: DateTime.now().subtract(const Duration(days: 30)),
                  lastDay: DateTime.now().add(const Duration(days: 90)),
                  focusedDay: _focusedDay,
                  calendarFormat: _calendarFormat,
                  availableCalendarFormats: const {CalendarFormat.month: 'Bulan', CalendarFormat.week: 'Minggu', CalendarFormat.twoWeeks: '2 Minggu'},
                  selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                  onDaySelected: (s, f) => setState(() { _selectedDay = s; _focusedDay = f; }),
                  onFormatChanged: (f) => setState(() => _calendarFormat = f),
                  onPageChanged: (f) => _focusedDay = f,
                  headerStyle: HeaderStyle(
                    formatButtonVisible: true,
                    titleCentered: true,
                    titleTextStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: DEKATColors.textPrimary),
                    formatButtonDecoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.18))),
                    formatButtonTextStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: DEKATColors.primary),
                    leftChevronIcon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.chevron_left_rounded, size: 18, color: Colors.grey[700])),
                    rightChevronIcon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.chevron_right_rounded, size: 18, color: Colors.grey[700])),
                  ),
                  daysOfWeekStyle: DaysOfWeekStyle(
                    weekdayStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[600]),
                    weekendStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[600]),
                  ),
                  calendarStyle: CalendarStyle(
                    outsideDaysVisible: false,
                    cellMargin: const EdgeInsets.all(4),
                    todayDecoration: BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softLavender.map((c) => c.withValues(alpha: 0.95)).toList()), shape: BoxShape.circle, border: Border.all(color: DEKATColors.softLavender[0].withValues(alpha: 0.5))),
                    todayTextStyle: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF6C5CE7)),
                    selectedDecoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet), shape: BoxShape.circle, boxShadow: [BoxShadow(color: Color(0x408B8CFF), blurRadius: 8, offset: Offset(0, 3))]),
                    selectedTextStyle: const TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
                    markerDecoration: const BoxDecoration(color: DEKATColors.secondary, shape: BoxShape.circle),
                    markerSize: 6,
                    markersMaxCount: 3,
                    defaultTextStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    weekendTextStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Date pill + count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: bookingsAsync.when(
              data: (bookings) => Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!)),
                  child: Row(children: [
                    Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.event_rounded, size: 14, color: DEKATColors.primary)),
                    const SizedBox(width: 8),
                    Text('${displayDate.day} ${_shortMonth(displayDate.month)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(width: 6),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: DEKATColors.softViolet[1], borderRadius: BorderRadius.circular(10)), child: Text('${bookings.length} booking', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: DEKATColors.primary))),
                  ]),
                ),
                const Spacer(),
                if (bookings.isNotEmpty)
                  Text('${bookings.where((b) => b.status.toUpperCase() == 'CONFIRMED').length} confirmed', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey[600])),
              ]),
              loading: () => const SizedBox(height: 30),
              error: (_, __) => const SizedBox(),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: bookingsAsync.when(
              data: (bookings) {
                if (bookings.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFE8E8FF), Color(0xFFFAF9FF)]), shape: BoxShape.circle, border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.12))),
                          child: Icon(Icons.event_available_rounded, size: 40, color: DEKATColors.primary.withValues(alpha: 0.7)),
                        ),
                        const SizedBox(height: 16),
                        const Text('Tidak ada booking hari ini', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: DEKATColors.textPrimary)),
                        const SizedBox(height: 6),
                        Text('Hari yang tenang — waktunya promosi atau istirahat ✨', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      ]),
                    ),
                  );
                }
                return ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  itemCount: bookings.length,
                  itemBuilder: (context, index) {
                    final b = bookings[index];
                    final status = b.status.toUpperCase();
                    final grad = _statusGradient(status);
                    final col = _statusColor(status);
                    return TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: 1),
                      duration: Duration(milliseconds: 280 + index * 60),
                      curve: Curves.easeOutCubic,
                      builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 12 * (1 - v)), child: child)),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey[100]!),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12, offset: const Offset(0, 4))],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () => context.push('/booking/${b.id}'),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(children: [
                                Hero(
                                  tag: 'booking-${b.id}',
                                  child: Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(12)),
                                    child: Icon(Icons.person_rounded, color: col, size: 22),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Text(b.customerName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                                    const SizedBox(height: 3),
                                    Row(children: [
                                      Container(padding: const EdgeInsets.all(3), decoration: BoxDecoration(color: grad[1], borderRadius: BorderRadius.circular(6)), child: Icon(Icons.spa_rounded, size: 10, color: grad[0])),
                                      const SizedBox(width: 6),
                                      Expanded(child: Text(b.serviceName.isEmpty ? "Layanan" : b.serviceName, style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                    ]),
                                    const SizedBox(height: 4),
                                    Row(children: [
                                      Icon(Icons.access_time_rounded, size: 12, color: Colors.grey[400]),
                                      const SizedBox(width: 4),
                                      Text(b.time.isEmpty ? '-' : b.time, style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                                      if (b.amount > 0) ...[
                                        const SizedBox(width: 10),
                                        Container(width: 3, height: 3, decoration: BoxDecoration(color: Colors.grey[300], shape: BoxShape.circle)),
                                        const SizedBox(width: 10),
                                        Text(formatRupiah(b.amount), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: DEKATColors.primary)),
                                      ],
                                    ]),
                                  ]),
                                ),
                                const SizedBox(width: 8),
                                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                    decoration: BoxDecoration(color: grad[1], borderRadius: BorderRadius.circular(20), border: Border.all(color: grad[0].withValues(alpha: 0.18))),
                                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                                      Container(width: 6, height: 6, decoration: BoxDecoration(color: col, shape: BoxShape.circle)),
                                      const SizedBox(width: 6),
                                      Text(status.isNotEmpty ? status[0] + status.substring(1).toLowerCase() : '-', style: TextStyle(fontSize: 11, color: col, fontWeight: FontWeight.w700)),
                                    ]),
                                  ),
                                  const SizedBox(height: 8),
                                  Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.chevron_right_rounded, size: 14, color: Colors.grey[500])),
                                ]),
                              ]),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 4,
                itemBuilder: (_, __) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[100]!, child: Container(height: 72, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
                ),
              ),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: DEKATColors.errorLight, shape: BoxShape.circle), child: const Icon(Icons.wifi_off_rounded, color: DEKATColors.error)),
                      const SizedBox(height: 12),
                      const Text('Gagal memuat booking', style: TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(height: 12),
                      FilledButton.icon(onPressed: () => ref.invalidate(calendarBookingsProvider(selectedDay)), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba lagi')),
                    ]),
                  ),
                ),
              ),
            ),
          ),
        ]),
      ),
    );
  }

  String _monthName(int m) => const ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][m];
  String _shortMonth(int m) => const ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][m];
  String _weekdayName(int w) => const ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][w];
}
