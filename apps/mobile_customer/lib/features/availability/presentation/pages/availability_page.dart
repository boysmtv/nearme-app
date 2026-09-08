import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final selectedDateProvider = StateProvider<DateTime>((ref) => DateTime.now());
final selectedTimeSlotProvider = StateProvider<String?>((ref) => null);

// Use String key "providerId|date" to avoid Map identity loop (previous bug: new Map each build caused infinite refetch)
final availabilityProvider =
    FutureProvider.autoDispose.family<List<SlotRow>, String>((ref, key) async {
  final parts = key.split('|');
  final providerId = parts[0];
  final date = parts[1];
  final response = await ApiService().getProviderAvailability(providerId, date);
  return ((response.data['data'] ?? []) as List)
      .map((e) => SlotRow.fromJson(e as Map<String, dynamic>))
      .toList();
});

final bookingServicesProvider =
    FutureProvider.autoDispose.family<List<ServiceRow>, String>((ref, providerId) async {
  final response = await ApiService().getProviderServices(providerId);
  return ((response.data['data'] ?? []) as List)
      .map((e) => ServiceRow.fromJson(e as Map<String, dynamic>))
      .toList();
});

class AvailabilityPage extends ConsumerStatefulWidget {
  final String providerId;
  final String? locationId;
  final String? initialServiceId;
  const AvailabilityPage({super.key, required this.providerId, this.locationId, this.initialServiceId});

  @override
  ConsumerState<AvailabilityPage> createState() => _AvailabilityPageState();
}

class _AvailabilityPageState extends ConsumerState<AvailabilityPage> {
  String? _selectedServiceId;

  @override
  void initState() {
    super.initState();
    _selectedServiceId = widget.initialServiceId;
    // load persist tanggal jika pernah pilih sebelumnya
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final stored = await SecureStorageService.read('selected_date');
      if (stored != null) {
        final parsed = DateTime.tryParse(stored);
        if (parsed != null) {
          final now = DateTime.now();
          final today = DateTime(now.year, now.month, now.day);
          final p = DateTime(parsed.year, parsed.month, parsed.day);
          // jangan pakai tanggal lampau
          if (!p.isBefore(today)) {
            ref.read(selectedDateProvider.notifier).state = parsed;
          }
        }
      }
    });
  }

  String _dateStr(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  String _formatLong(DateTime d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    return '${days[d.weekday % 7]}, ${d.day} ${months[d.month-1]} ${d.year}';
  }

  void _showDatePicker(BuildContext context, DateTime selectedDate) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        DateTime tempFocused = selectedDate;
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Pilih Tanggal', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded, size: 20)),
              ]),
              const SizedBox(height: 8),
              TableCalendar(
                firstDay: DateTime.now(),
                lastDay: DateTime.now().add(const Duration(days: 30)),
                focusedDay: tempFocused,
                calendarFormat: CalendarFormat.month,
                availableCalendarFormats: const {CalendarFormat.month: 'Month'},
                selectedDayPredicate: (day) => isSameDay(selectedDate, day),
                onDaySelected: (selectedDay, focusedDay) async {
                  ref.read(selectedDateProvider.notifier).state = selectedDay;
                  ref.read(selectedTimeSlotProvider.notifier).state = null;
                  await SecureStorageService.write('selected_date', selectedDay.toIso8601String());
                  if (ctx.mounted) Navigator.pop(ctx);
                },
                onPageChanged: (focusedDay) => tempFocused = focusedDay,
                calendarStyle: CalendarStyle(
                  outsideDaysVisible: false,
                  todayDecoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.15), shape: BoxShape.circle, border: Border.all(color: DEKATColors.primary.withOpacity(0.3))),
                  todayTextStyle: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.bold),
                  selectedDecoration: const BoxDecoration(color: DEKATColors.primary, shape: BoxShape.circle),
                  selectedTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  weekendTextStyle: TextStyle(color: Colors.grey[700]),
                  defaultTextStyle: const TextStyle(fontWeight: FontWeight.w500),
                ),
                headerStyle: HeaderStyle(
                  formatButtonVisible: false,
                  titleCentered: true,
                  titleTextStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  leftChevronIcon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: const Icon(Icons.chevron_left_rounded, size: 18)),
                  rightChevronIcon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: const Icon(Icons.chevron_right_rounded, size: 18)),
                ),
                daysOfWeekStyle: DaysOfWeekStyle(
                  weekdayStyle: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w600, fontSize: 12),
                  weekendStyle: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w600, fontSize: 12),
                ),
              ),
              const SizedBox(height: 12),
            ]),
          ),
        );
      },
    );
  }

  void _showServicePicker(List<ServiceRow> services) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Pilih Layanan', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded, size: 20)),
              ]),
              const SizedBox(height: 8),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: services.length,
                  separatorBuilder: (_, __) => Divider(color: Colors.grey[100], height: 1, indent: 16, endIndent: 16),
                  itemBuilder: (c, i) {
                    final s = services[i];
                    final isSelected = s.id == _selectedServiceId;
                    return InkWell(
                      onTap: () {
                        setState(() => _selectedServiceId = s.id);
                        ref.read(selectedTimeSlotProvider.notifier).state = null;
                        Navigator.pop(ctx);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        decoration: BoxDecoration(
                          color: isSelected ? DEKATColors.primary.withOpacity(0.06) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isSelected ? DEKATColors.primary.withOpacity(0.3) : Colors.transparent),
                        ),
                        child: Row(children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: isSelected ? DEKATColors.primary : DEKATColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(Icons.spa_rounded, color: isSelected ? Colors.white : DEKATColors.primary, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(s.name, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isSelected ? DEKATColors.primary : Colors.black87)),
                              const SizedBox(height: 2),
                              Row(children: [
                                Icon(Icons.schedule_rounded, size: 12, color: Colors.grey[500]),
                                const SizedBox(width: 4),
                                Text('${s.durationMinutes} min', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                const SizedBox(width: 8),
                                Container(width: 3, height: 3, decoration: BoxDecoration(color: Colors.grey[400], shape: BoxShape.circle)),
                                const SizedBox(width: 8),
                                Text(formatRupiah(s.price), style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 13)),
                              ]),
                              if (s.description != null && s.description!.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(s.description!, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600], fontSize: 11)),
                              ],
                            ]),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: isSelected ? DEKATColors.primary : Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: isSelected ? DEKATColors.primary : Colors.grey[300]!),
                              boxShadow: isSelected ? [BoxShadow(color: DEKATColors.primary.withOpacity(0.3), blurRadius: 6, offset: const Offset(0, 2))] : null,
                            ),
                            child: Icon(isSelected ? Icons.check_rounded : Icons.chevron_right_rounded, size: 16, color: isSelected ? Colors.white : Colors.grey[500]),
                          ),
                        ]),
                      ),
                    );
                  },
                ),
              ),
            ]),
          ),
        );
      },
    );
  }

  List<SlotRow> _filterByPeriod(List<SlotRow> slots, int startHour, int endHour) {
    return slots.where((s) {
      final hour = int.tryParse(s.time.split(':').first) ?? 0;
      return hour >= startHour && hour < endHour;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final selectedDate = ref.watch(selectedDateProvider);
    final selectedTimeSlot = ref.watch(selectedTimeSlotProvider);
    final dateStr = _dateStr(selectedDate);
    final cacheKey = '${widget.providerId}|$dateStr';
    final slotsAsync = ref.watch(availabilityProvider(cacheKey));
    final servicesAsync = ref.watch(bookingServicesProvider(widget.providerId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Select Date & Time', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
      ),
      body: Column(
        children: [
          // Date Popup Button (compact, full month muncul sebagai bottom sheet)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: InkWell(
              onTap: () => _showDatePicker(context, selectedDate),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey[200]!),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3))],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.calendar_month_rounded, color: DEKATColors.primary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Tanggal', style: TextStyle(color: Colors.grey[600], fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
                        const SizedBox(height: 2),
                        Text(_formatLong(selectedDate), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                      ]),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.edit_calendar_rounded, size: 14, color: DEKATColors.primary),
                        const SizedBox(width: 4),
                        Text(isSameDay(selectedDate, DateTime.now()) ? 'Today' : 'Ganti', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                      ]),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey[500]),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          // Service Selector - attractive card + bottom sheet
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: servicesAsync.when(
              data: (services) {
                final selected = services.where((s) => s.id == _selectedServiceId).firstOrNull;
                return InkWell(
                  onTap: () => _showServicePicker(services),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: selected != null ? DEKATColors.primary.withOpacity(0.3) : Colors.grey[200]!),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3))],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: [DEKATColors.primary, DEKATColors.primary.withOpacity(0.8)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: DEKATColors.primary.withOpacity(0.25), blurRadius: 8, offset: const Offset(0, 3))],
                          ),
                          child: const Icon(Icons.spa_rounded, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('PILIH LAYANAN', style: TextStyle(color: Colors.grey[500], fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8)),
                            const SizedBox(height: 2),
                            Text(
                              selected != null ? selected.name : 'Pilih layanan...',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: selected != null ? Colors.black87 : Colors.grey[500]),
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (selected != null) ...[
                              const SizedBox(height: 2),
                              Row(children: [
                                Icon(Icons.schedule_rounded, size: 12, color: Colors.grey[500]),
                                const SizedBox(width: 4),
                                Text('${selected.durationMinutes} min', style: TextStyle(color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.w500)),
                                const SizedBox(width: 8),
                                Container(width: 3, height: 3, decoration: BoxDecoration(color: Colors.grey[400], shape: BoxShape.circle)),
                                const SizedBox(width: 8),
                                Text(formatRupiah(selected.price), style: const TextStyle(color: DEKATColors.primary, fontSize: 12, fontWeight: FontWeight.w800)),
                              ]),
                            ],
                          ]),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle, border: Border.all(color: Colors.grey[200]!)),
                          child: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey[700], size: 18),
                        ),
                      ],
                    ),
                  ),
                );
              },
              loading: () => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                child: const Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: DEKATColors.primary))),
              ),
              error: (e, _) => Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red[100]!)),
                child: Row(children: [
                  Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.red[50], shape: BoxShape.circle), child: Icon(Icons.error_outline_rounded, color: Colors.red[400], size: 18)),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('Gagal memuat layanan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
                  TextButton(onPressed: () => ref.invalidate(bookingServicesProvider(widget.providerId)), child: const Text('Retry')),
                ]),
              ),
            ),
          ),
          // Separator - jarak jelas ke Available Times
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Row(children: [
              Expanded(child: Divider(color: Colors.grey[200], thickness: 1)),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.auto_awesome_rounded, size: 12, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text('Atur Jadwal', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w700, fontSize: 11, letterSpacing: 0.5)),
                ]),
              ),
              Expanded(child: Divider(color: Colors.grey[200], thickness: 1)),
            ]),
          ),
          // Available Times Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                  const SizedBox(width: 8),
                  Text('Available Times', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, fontSize: 15)),
                ]),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withOpacity(0.15))),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.calendar_today_rounded, size: 12, color: DEKATColors.primary),
                    const SizedBox(width: 4),
                    Text(isSameDay(selectedDate, DateTime.now()) ? 'Today' : '${selectedDate.day}/${selectedDate.month}/${selectedDate.year}', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                  ]),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Slots
          Expanded(
            child: slotsAsync.when(
              data: (slots) {
                if (slots.isEmpty) {
                  return Center(
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.schedule_rounded, size: 36, color: Colors.grey[400])),
                      const SizedBox(height: 12),
                      Text('No available slots', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('Try another date', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                    ]),
                  );
                }
                // Group by period for more attractive layout
                final morning = _filterByPeriod(slots, 9, 12);
                final afternoon = _filterByPeriod(slots, 12, 15);
                final evening = _filterByPeriod(slots, 15, 24);
                Widget section(String title, IconData icon, List<SlotRow> list) {
                  if (list.isEmpty) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: Row(children: [
                          Icon(icon, size: 14, color: Colors.grey[600]),
                          const SizedBox(width: 6),
                          Text(title, style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 0.3)),
                          const SizedBox(width: 8),
                          Expanded(child: Divider(color: Colors.grey[200])),
                        ]),
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: list.map((slot) {
                            final isSelected = selectedTimeSlot == slot.time;
                            final isAvailable = slot.available;
                            return GestureDetector(
                              onTap: isAvailable ? () => ref.read(selectedTimeSlotProvider.notifier).state = slot.time : null,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 180),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                decoration: BoxDecoration(
                                  color: !isAvailable
                                      ? Colors.grey[100]
                                      : isSelected
                                          ? DEKATColors.primary
                                          : Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: !isAvailable ? Colors.grey[200]! : isSelected ? DEKATColors.primary : Colors.grey[300]!, width: isSelected ? 1.5 : 1),
                                  boxShadow: isSelected ? [BoxShadow(color: DEKATColors.primary.withOpacity(0.25), blurRadius: 8, offset: const Offset(0, 3))] : [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6, offset: const Offset(0, 2))],
                                ),
                                child: Text(slot.time,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: !isAvailable ? Colors.grey[400] : isSelected ? Colors.white : Colors.grey[800],
                                    )),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ]),
                  );
                }

                return ListView(
                  padding: const EdgeInsets.only(bottom: 12),
                  children: [
                    section('Morning', Icons.wb_sunny_outlined, morning),
                    section('Afternoon', Icons.wb_sunny_rounded, afternoon),
                    section('Evening', Icons.nights_stay_outlined, evening),
                    if (morning.isEmpty && afternoon.isEmpty && evening.isEmpty)
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: 2.6, crossAxisSpacing: 8, mainAxisSpacing: 8),
                        itemCount: slots.length,
                        itemBuilder: (context, index) {
                          final slot = slots[index];
                          final isSelected = selectedTimeSlot == slot.time;
                          return GestureDetector(
                            onTap: slot.available ? () => ref.read(selectedTimeSlotProvider.notifier).state = slot.time : null,
                            child: Container(
                              decoration: BoxDecoration(
                                color: !slot.available ? Colors.grey[100] : isSelected ? DEKATColors.primary : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: !slot.available ? Colors.grey[200]! : isSelected ? DEKATColors.primary : Colors.grey[300]!),
                              ),
                              child: Center(child: Text(slot.time, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: !slot.available ? Colors.grey[400] : isSelected ? Colors.white : Colors.grey[800]))),
                            ),
                          );
                        },
                      ),
                  ],
                );
              },
              loading: () => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: List.generate(8, (i) => Container(width: 92, height: 38, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(12)))),
                ),
              ),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.red[50], shape: BoxShape.circle), child: Icon(Icons.wifi_off_rounded, color: Colors.red[300])),
                      const SizedBox(height: 12),
                      const Text('Failed to load slots', style: TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('$e', style: TextStyle(color: Colors.grey[500], fontSize: 12), textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        onPressed: () => ref.invalidate(availabilityProvider(cacheKey)),
                        icon: const Icon(Icons.refresh_rounded, size: 16),
                        label: const Text('Retry'),
                        style: FilledButton.styleFrom(backgroundColor: DEKATColors.primary),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 16, offset: const Offset(0, -4))],
          border: Border(top: BorderSide(color: Colors.grey[100]!)),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: selectedTimeSlot != null && _selectedServiceId != null
                  ? () => context.push('/booking/new'
                      '?providerId=${widget.providerId}'
                      '&serviceId=$_selectedServiceId'
                      '&date=$dateStr'
                      '&time=${Uri.encodeComponent(selectedTimeSlot)}'
                      '${widget.locationId != null ? '&locationId=${widget.locationId}' : ''}')
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: DEKATColors.primary,
                disabledBackgroundColor: Colors.grey[200],
                disabledForegroundColor: Colors.grey[500],
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: selectedTimeSlot != null && _selectedServiceId != null ? 4 : 0,
                shadowColor: DEKATColors.primary.withOpacity(0.4),
              ),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text(_selectedServiceId == null ? 'Select a Service to Continue' : 'Continue', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                if (_selectedServiceId != null) ...[const SizedBox(width: 8), const Icon(Icons.arrow_forward_rounded, size: 18)],
              ]),
            ),
          ),
        ),
      ),
    );
  }
}
