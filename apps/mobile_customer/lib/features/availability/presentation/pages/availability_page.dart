import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final selectedDateProvider = StateProvider<DateTime>((ref) => DateTime.now());
final selectedTimeSlotProvider = StateProvider<String?>((ref) => null);

final availabilityProvider =
    FutureProvider.autoDispose.family<List<SlotRow>, Map<String, String>>((ref, params) async {
  final response = await ApiService().getProviderAvailability(params['providerId']!, params['date']!);
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
  DateTime _focusedDate = DateTime.now();
  CalendarFormat _calendarFormat = CalendarFormat.month;
  String? _selectedServiceId;

  @override
  void initState() {
    super.initState();
    _selectedServiceId = widget.initialServiceId;
  }

  @override
  Widget build(BuildContext context) {
    final selectedDate = ref.watch(selectedDateProvider);
    final selectedTimeSlot = ref.watch(selectedTimeSlotProvider);
    final dateStr =
        '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}';
    final slotsAsync = ref.watch(availabilityProvider({'providerId': widget.providerId, 'date': dateStr}));
    final servicesAsync = ref.watch(bookingServicesProvider(widget.providerId));

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.calendar_month_rounded, color: Colors.white, size: 18)),
          const SizedBox(width: 10),
          const Text('Pilih Jadwal', style: TextStyle(fontWeight: FontWeight.w800)),
        ]),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.07), blurRadius: 16, offset: const Offset(0, 6))]),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: TableCalendar(
                firstDay: DateTime.now(),
                lastDay: DateTime.now().add(const Duration(days: 30)),
                focusedDay: _focusedDate,
                calendarFormat: _calendarFormat,
                selectedDayPredicate: (day) => isSameDay(selectedDate, day),
                onDaySelected: (selectedDay, focusedDay) {
                  ref.read(selectedDateProvider.notifier).state = selectedDay;
                  ref.read(selectedTimeSlotProvider.notifier).state = null;
                  setState(() => _focusedDate = focusedDay);
                },
                onFormatChanged: (format) => setState(() => _calendarFormat = format),
                calendarStyle: CalendarStyle(
                  outsideDaysVisible: false,
                  todayDecoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), shape: BoxShape.circle, boxShadow: [BoxShadow(color: DEKATColors.info.withValues(alpha: 0.2), blurRadius: 8)]),
                  selectedDecoration: const BoxDecoration(gradient: LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight), shape: BoxShape.circle),
                  selectedTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                  todayTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                  defaultTextStyle: const TextStyle(fontWeight: FontWeight.w500),
                ),
                headerStyle: HeaderStyle(
                  formatButtonVisible: false,
                  titleCentered: true,
                  titleTextStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: DEKATColors.textPrimary),
                  leftChevronIcon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.chevron_left_rounded, size: 16, color: DEKATColors.primary)),
                  rightChevronIcon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.chevron_right_rounded, size: 16, color: DEKATColors.primary)),
                ),
                daysOfWeekStyle: DaysOfWeekStyle(weekdayStyle: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w600, fontSize: 12), weekendStyle: TextStyle(color: DEKATColors.secondary, fontWeight: FontWeight.w600, fontSize: 12)),
              ),
            ),
          ),
          servicesAsync.when(
            data: (services) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]),
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedServiceId,
                  decoration: InputDecoration(
                    labelText: 'Pilih Layanan',
                    prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(6), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.spa_rounded, color: Colors.white, size: 16)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    filled: true, fillColor: Colors.white,
                  ),
                  dropdownColor: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  items: services
                      .map((s) => DropdownMenuItem<String>(value: s.id, child: Text('${s.name} • ${formatRupiah(s.price)}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedServiceId = v),
                ),
              ),
            ),
            loading: () => Container(margin: const EdgeInsets.symmetric(horizontal: 16), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)), child: const Center(child: CircularProgressIndicator(color: DEKATColors.primary))),
            error: (e, _) => Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.18))),
              child: Row(children: [
                const Icon(Icons.error_outline_rounded, color: DEKATColors.error, size: 18),
                const SizedBox(width: 8),
                const Expanded(child: Text('Gagal memuat layanan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
                TextButton(onPressed: () => ref.invalidate(bookingServicesProvider(widget.providerId)), child: const Text('Retry')),
              ]),
            ),
          ),
          const SizedBox(height: 14),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), Text('Jam Tersedia', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)), const SizedBox(width: 8), Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(20)), child: Text(isSameDay(selectedDate, DateTime.now()) ? 'Hari ini ✨' : '${selectedDate.day}/${selectedDate.month}', style: const TextStyle(color: DEKATColors.primary, fontSize: 11, fontWeight: FontWeight.w700)))]),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: slotsAsync.when(
              data: (slots) {
                if (slots.isEmpty) {
                  return Center(child: Container(
                    margin: const EdgeInsets.all(24),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.softPeach.last.withValues(alpha: 0.5))),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.schedule_rounded, size: 28, color: Colors.white)),
                      const SizedBox(height: 10),
                      Text('Tidak ada slot kosong', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text('Coba tanggal lain ya', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                    ]),
                  ));
                }
                return GridView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: 2.4, crossAxisSpacing: 8, mainAxisSpacing: 8),
                  itemCount: slots.length,
                  itemBuilder: (context, index) {
                    final slot = slots[index];
                    final isSelected = selectedTimeSlot == slot.time;
                    return TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: Duration(milliseconds: 280 + index * 18), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Transform.scale(scale: 0.94+0.06*v, child: Opacity(opacity: v, child: ch)), child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      decoration: BoxDecoration(
                        gradient: isSelected ? const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight) : null,
                        color: isSelected ? null : slot.available ? Colors.white : Colors.grey[100],
                        borderRadius: BorderRadius.circular(13),
                        border: Border.all(color: isSelected ? DEKATColors.primary : slot.available ? DEKATColors.primary.withValues(alpha: 0.18) : Colors.grey[200]!, width: isSelected ? 1.4 : 1),
                        boxShadow: isSelected ? [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.22), blurRadius: 10, offset: const Offset(0, 4))] : slot.available ? [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6, offset: const Offset(0, 2))] : null,
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(13),
                          onTap: slot.available ? () => ref.read(selectedTimeSlotProvider.notifier).state = slot.time : null,
                          child: Center(
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(isSelected ? Icons.check_circle_rounded : Icons.access_time_rounded, size: 13, color: isSelected ? Colors.white : slot.available ? DEKATColors.primary : Colors.grey[400]),
                              const SizedBox(width: 4),
                              Text(slot.time, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : slot.available ? DEKATColors.textPrimary : Colors.grey[400])),
                            ]),
                          ),
                        ),
                      ),
                    ));
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.wifi_off_rounded, color: DEKATColors.error)),
                    const SizedBox(height: 10),
                    const Text('Gagal memuat slot', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    FilledButton.icon(onPressed: () => ref.invalidate(availabilityProvider({'providerId': widget.providerId, 'date': dateStr})), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry')),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.07), blurRadius: 16, offset: const Offset(0, -4))],
          border: Border(top: BorderSide(color: DEKATColors.primary.withValues(alpha: 0.07))),
        ),
        child: SafeArea(
          child: Container(
            decoration: BoxDecoration(gradient: (selectedTimeSlot != null && _selectedServiceId != null) ? const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight) : null, color: (selectedTimeSlot != null && _selectedServiceId != null) ? null : Colors.grey[200], borderRadius: BorderRadius.circular(14), boxShadow: (selectedTimeSlot != null && _selectedServiceId != null) ? [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.26), blurRadius: 12, offset: const Offset(0, 4))] : null),
            child: ElevatedButton(
              onPressed: selectedTimeSlot != null && _selectedServiceId != null
                  ? () => context.push('/booking/new'
                      '?providerId=${widget.providerId}'
                      '&serviceId=$_selectedServiceId'
                      '&date=$dateStr'
                      '&time=${Uri.encodeComponent(selectedTimeSlot!)}'
                      '${widget.locationId != null ? '&locationId=${widget.locationId}' : ''}')
                  : null,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.transparent, shadowColor: Colors.transparent, disabledBackgroundColor: Colors.transparent, disabledForegroundColor: Colors.grey[500], shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(_selectedServiceId == null ? Icons.spa_rounded : Icons.arrow_forward_rounded, size: 18, color: Colors.white), const SizedBox(width: 8), Text(_selectedServiceId == null ? 'Pilih Layanan Dulu ✨' : 'Lanjutkan', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]),
            ),
          ),
        ),
      ),
    );
  }
}
