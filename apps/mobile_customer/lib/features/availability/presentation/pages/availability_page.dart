import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../domain/entities/slot_entity.dart';
import '../../../provider_profile/domain/entities/service_entity.dart';
import '../../../provider_profile/domain/entities/staff_entity.dart';
import '../viewmodel/availability_viewmodel.dart';
import '../../../../shared/utils/format_rupiah.dart';

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
  String? _selectedStaffId;

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
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Pilih Tanggal', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text('Slot tersedia 30 hari ke depan', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                ]),
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
                  todayDecoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.15), shape: BoxShape.circle, border: Border.all(color: DEKATColors.primary.withValues(alpha:0.3))),
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

  void _showServicePicker(List<ServiceEntity> services) {
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
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Pilih Layanan', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text('${services.length} layanan tersedia', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                ]),
                IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded, size: 20)),
              ]),
              const SizedBox(height: 8),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: services.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (c, i) {
                    final s = services[i];
                    final isSelected = s.id == _selectedServiceId;
                    return RepaintBoundary(
                      child: InkWell(
                        onTap: () {
                          setState(() => _selectedServiceId = s.id);
                          ref.read(selectedTimeSlotProvider.notifier).state = null;
                          Navigator.pop(ctx);
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? DEKATColors.primary.withValues(alpha:0.06) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isSelected ? DEKATColors.primary.withValues(alpha:0.35) : Colors.grey.shade200),
                          ),
                          child: Row(children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: isSelected ? DEKATColors.primary : DEKATColors.primary.withValues(alpha:0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(Icons.spa_rounded, color: isSelected ? Colors.white : DEKATColors.primary, size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(s.name, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isSelected ? DEKATColors.primary : Colors.black87)),
                                const SizedBox(height: 4),
                                Row(children: [
                                  Icon(Icons.schedule_rounded, size: 12, color: Colors.grey.shade500),
                                  const SizedBox(width: 4),
                                  Text('${s.durationMinutes} mnt', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                                  const SizedBox(width: 8),
                                  Container(width: 3, height: 3, decoration: BoxDecoration(color: Colors.grey.shade400, shape: BoxShape.circle)),
                                  const SizedBox(width: 8),
                                  Text(formatRupiah(s.price), style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 13)),
                                ]),
                                if (s.description != null && s.description!.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(s.description!, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
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
                                border: Border.all(color: isSelected ? DEKATColors.primary : Colors.grey.shade300),
                              ),
                              child: Icon(isSelected ? Icons.check_rounded : Icons.chevron_right_rounded, size: 16, color: isSelected ? Colors.white : Colors.grey.shade500),
                            ),
                          ]),
                        ),
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

  void _showStaffPicker(List<StaffEntity> staffList) {
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
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Pilih Staf', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text('Opsional — slot menyesuaikan staf', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                ]),
                IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded, size: 20)),
              ]),
              const SizedBox(height: 8),
              // Option: Any staff (no filter)
              RepaintBoundary(
                child: InkWell(
                  onTap: () {
                    setState(() => _selectedStaffId = null);
                    ref.read(selectedTimeSlotProvider.notifier).state = null;
                    Navigator.pop(ctx);
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      color: _selectedStaffId == null ? DEKATColors.primary.withValues(alpha:0.06) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _selectedStaffId == null ? DEKATColors.primary.withValues(alpha:0.35) : Colors.grey.shade200),
                    ),
                    child: Row(children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: _selectedStaffId == null ? DEKATColors.primary : Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.groups_rounded, color: _selectedStaffId == null ? Colors.white : Colors.grey.shade600, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Semua Staf', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: _selectedStaffId == null ? DEKATColors.primary : Colors.black87)),
                          const SizedBox(height: 2),
                          Text('Tampilkan semua slot tersedia', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                        ]),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: _selectedStaffId == null ? DEKATColors.primary : Colors.white,
                          shape: BoxShape.circle,
                          border: Border.all(color: _selectedStaffId == null ? DEKATColors.primary : Colors.grey.shade300),
                        ),
                        child: Icon(_selectedStaffId == null ? Icons.check_rounded : Icons.circle_outlined, size: 16, color: _selectedStaffId == null ? Colors.white : Colors.grey.shade400),
                      ),
                    ]),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: staffList.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (c, i) {
                    final s = staffList[i];
                    final staffId = s.id;
                    final name = s.displayName ?? s.name;
                    final specialties = s.specialties;
                    final rating = s.rating;
                    final reviewCount = s.reviewCount;
                    final isSelected = staffId == _selectedStaffId;
                    return RepaintBoundary(
                      child: InkWell(
                        onTap: () {
                          setState(() => _selectedStaffId = staffId);
                          ref.read(selectedTimeSlotProvider.notifier).state = null;
                          Navigator.pop(ctx);
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? DEKATColors.primary.withValues(alpha:0.06) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isSelected ? DEKATColors.primary.withValues(alpha:0.35) : Colors.grey.shade200),
                          ),
                          child: Row(children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: isSelected ? DEKATColors.primary : DEKATColors.primary.withValues(alpha:0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'S',
                                    style: TextStyle(color: isSelected ? Colors.white : DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 18)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(name, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isSelected ? DEKATColors.primary : Colors.black87)),
                                const SizedBox(height: 4),
                                Row(children: [
                                  if (rating > 0) ...[
                                    Icon(Icons.star_rounded, size: 14, color: Colors.amber.shade600),
                                    const SizedBox(width: 2),
                                    Text('${rating.toStringAsFixed(1)} ($reviewCount)', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                                    const SizedBox(width: 8),
                                  ],
                                  if (specialties.isNotEmpty)
                                    Expanded(child: Text(specialties.take(2).join(' • '), maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey.shade500, fontSize: 11))),
                                ]),
                              ]),
                            ),
                            const SizedBox(width: 12),
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: isSelected ? DEKATColors.primary : Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(color: isSelected ? DEKATColors.primary : Colors.grey.shade300),
                              ),
                              child: Icon(isSelected ? Icons.check_rounded : Icons.circle_outlined, size: 16, color: isSelected ? Colors.white : Colors.grey.shade400),
                            ),
                          ]),
                        ),
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

  List<SlotEntity> _filterByPeriod(List<SlotEntity> slots, int startHour, int endHour) {
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
    final cacheKey = '${widget.providerId}|$dateStr|${_selectedStaffId ?? ''}';
    final slotsAsync = ref.watch(availabilityProvider(cacheKey));
    final servicesAsync = ref.watch(bookingServicesProvider(widget.providerId));
    final staffAsync = ref.watch(providerStaffProvider(widget.providerId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Pilih Tanggal & Waktu', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
      ),
      body: Column(
        children: [
          // Langkah + tanggal
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: RepaintBoundary(
              child: InkWell(
                onTap: () => _showDatePicker(context, selectedDate),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.calendar_month_rounded, color: DEKATColors.primary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(20)),
                              child: const Text('1', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 10)),
                            ),
                            const SizedBox(width: 6),
                            Text('Tanggal Kunjungan', style: TextStyle(color: Colors.grey.shade600, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
                          ]),
                          const SizedBox(height: 3),
                          Text(_formatLong(selectedDate), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                        ]),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(20)),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.edit_calendar_rounded, size: 14, color: DEKATColors.primary),
                          const SizedBox(width: 4),
                          Text(isSameDay(selectedDate, DateTime.now()) ? 'Hari Ini' : 'Ganti', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                        ]),
                      ),
                      const SizedBox(width: 8),
                      Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey.shade500),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Service Selector
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: servicesAsync.when(
              data: (services) {
                final selected = services.where((s) => s.id == _selectedServiceId).firstOrNull;
                return RepaintBoundary(
                  child: InkWell(
                    onTap: () => _showServicePicker(services),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: selected != null ? DEKATColors.primary.withValues(alpha:0.35) : Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: DEKATColors.primary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.spa_rounded, color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Row(children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(20)),
                                  child: const Text('2', style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 10)),
                                ),
                                const SizedBox(width: 6),
                                Text('LAYANAN', style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8)),
                              ]),
                              const SizedBox(height: 3),
                              Text(
                                selected != null ? selected.name : 'Pilih layanan...',
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: selected != null ? Colors.black87 : Colors.grey.shade500),
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (selected != null) ...[
                                const SizedBox(height: 4),
                                Row(children: [
                                  Icon(Icons.schedule_rounded, size: 12, color: Colors.grey.shade500),
                                  const SizedBox(width: 4),
                                  Text('${selected.durationMinutes} mnt', style: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontWeight: FontWeight.w500)),
                                  const SizedBox(width: 8),
                                  Container(width: 3, height: 3, decoration: BoxDecoration(color: Colors.grey.shade400, shape: BoxShape.circle)),
                                  const SizedBox(width: 8),
                                  Text(formatRupiah(selected.price), style: const TextStyle(color: DEKATColors.primary, fontSize: 12, fontWeight: FontWeight.w800)),
                                ]),
                              ],
                            ]),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.grey.shade100, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)),
                            child: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey.shade700, size: 18),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
              loading: () => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                child: const Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: DEKATColors.primary))),
              ),
              error: (e, _) => Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red.shade100)),
                child: Row(children: [
                  Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle), child: Icon(Icons.error_outline_rounded, color: Colors.red.shade400, size: 18)),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('Gagal memuat layanan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
                  TextButton(onPressed: () => ref.invalidate(bookingServicesProvider(widget.providerId)), child: const Text('Coba Lagi')),
                ]),
              ),
            ),
          ),
          // Staff Selector
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
            child: staffAsync.when(
              data: (staffList) {
                if (staffList.isEmpty) return const SizedBox.shrink();
                final selectedName = staffList
                    .where((s) => s.id == _selectedStaffId)
                    .map((s) => s.displayName ?? s.name)
                    .firstOrNull;
                return RepaintBoundary(
                  child: InkWell(
                    onTap: () => _showStaffPicker(staffList),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: _selectedStaffId != null ? DEKATColors.primary.withValues(alpha:0.35) : Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.purple.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.purple.shade100),
                            ),
                            child: Icon(Icons.person_rounded, color: Colors.purple.shade400, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Row(children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(color: Colors.purple.shade50, borderRadius: BorderRadius.circular(20)),
                                  child: Text('3', style: TextStyle(color: Colors.purple.shade400, fontWeight: FontWeight.w800, fontSize: 10)),
                                ),
                                const SizedBox(width: 6),
                                Text('STAF (OPSIONAL)', style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8)),
                              ]),
                              const SizedBox(height: 3),
                              Text(
                                _selectedStaffId == null ? 'Semua staf' : (selectedName ?? 'Pilih staf...'),
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: _selectedStaffId != null ? Colors.black87 : Colors.grey.shade500),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ]),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.grey.shade100, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)),
                            child: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey.shade700, size: 18),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),
          // Separator
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Row(children: [
              Expanded(child: Divider(color: Colors.grey.shade200, thickness: 1)),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.shade200)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.schedule_rounded, size: 12, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text('Langkah 4 — Atur Jam', style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w700, fontSize: 11, letterSpacing: 0.5)),
                ]),
              ),
              Expanded(child: Divider(color: Colors.grey.shade200, thickness: 1)),
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
                  Text('Jam Tersedia', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, fontSize: 15)),
                ]),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha:0.15))),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.calendar_today_rounded, size: 12, color: DEKATColors.primary),
                    const SizedBox(width: 4),
                    Text(isSameDay(selectedDate, DateTime.now()) ? 'Hari Ini' : '${selectedDate.day}/${selectedDate.month}/${selectedDate.year}', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
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
                      Container(padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)), child: Icon(Icons.schedule_rounded, size: 36, color: Colors.grey.shade400)),
                      const SizedBox(height: 12),
                      Text('Tidak ada slot tersedia', style: TextStyle(color: Colors.grey.shade700, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text('Coba tanggal atau staf lain', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                    ]),
                  );
                }
                // Group by period for more attractive layout
                final morning = _filterByPeriod(slots, 9, 12);
                final afternoon = _filterByPeriod(slots, 12, 15);
                final evening = _filterByPeriod(slots, 15, 24);
                Widget section(String title, IconData icon, List<SlotEntity> list) {
                  if (list.isEmpty) return const SizedBox.shrink();
                  final availableCount = list.where((s) => s.available).length;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: Row(children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey.shade200)),
                            child: Icon(icon, size: 14, color: Colors.grey.shade600),
                          ),
                          const SizedBox(width: 8),
                          Text(title, style: TextStyle(color: Colors.grey.shade700, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 0.3)),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.08), borderRadius: BorderRadius.circular(20)),
                            child: Text('$availableCount tersedia', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 10)),
                          ),
                          const SizedBox(width: 8),
                          Expanded(child: Divider(color: Colors.grey.shade200)),
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
                            return RepaintBoundary(
                              child: GestureDetector(
                                onTap: isAvailable ? () => ref.read(selectedTimeSlotProvider.notifier).state = slot.time : null,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: !isAvailable
                                        ? Colors.grey.shade100
                                        : isSelected
                                            ? DEKATColors.primary
                                            : Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: !isAvailable ? Colors.grey.shade200 : isSelected ? DEKATColors.primary : Colors.grey.shade300, width: isSelected ? 1.5 : 1),
                                  ),
                                  child: Text(slot.time,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: !isAvailable ? Colors.grey.shade400 : isSelected ? Colors.white : Colors.grey.shade800,
                                        decoration: !isAvailable ? TextDecoration.lineThrough : null,
                                      )),
                                ),
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
                    section('Pagi', Icons.wb_sunny_outlined, morning),
                    section('Siang', Icons.wb_sunny_rounded, afternoon),
                    section('Sore & Malam', Icons.nights_stay_outlined, evening),
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
                          return RepaintBoundary(
                            child: GestureDetector(
                              onTap: slot.available ? () => ref.read(selectedTimeSlotProvider.notifier).state = slot.time : null,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: !slot.available ? Colors.grey.shade100 : isSelected ? DEKATColors.primary : Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: !slot.available ? Colors.grey.shade200 : isSelected ? DEKATColors.primary : Colors.grey.shade300),
                                ),
                                child: Center(child: Text(slot.time, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: !slot.available ? Colors.grey.shade400 : isSelected ? Colors.white : Colors.grey.shade800))),
                              ),
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
                  children: List.generate(8, (i) => Container(width: 92, height: 38, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(12)))),
                ),
              ),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle), child: Icon(Icons.wifi_off_rounded, color: Colors.red.shade300)),
                      const SizedBox(height: 12),
                      const Text('Gagal memuat slot', style: TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('$e', style: TextStyle(color: Colors.grey.shade500, fontSize: 12), textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        onPressed: () => ref.invalidate(availabilityProvider(cacheKey)),
                        icon: const Icon(Icons.refresh_rounded, size: 16),
                        label: const Text('Coba Lagi'),
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
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha:0.06), blurRadius: 16, offset: const Offset(0, -4))],
          border: Border(top: BorderSide(color: Colors.grey.shade100)),
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
                      '${widget.locationId != null ? '&locationId=${widget.locationId}' : ''}'
                      '${_selectedStaffId != null ? '&staffId=$_selectedStaffId' : ''}')
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: DEKATColors.primary,
                disabledBackgroundColor: Colors.grey.shade200,
                disabledForegroundColor: Colors.grey.shade500,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: selectedTimeSlot != null && _selectedServiceId != null ? 4 : 0,
                shadowColor: DEKATColors.primary.withValues(alpha:0.4),
              ),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text(_selectedServiceId == null ? 'Pilih Layanan untuk Lanjut' : selectedTimeSlot == null ? 'Pilih Jam untuk Lanjut' : 'Lanjut', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                if (_selectedServiceId != null) ...[const SizedBox(width: 8), const Icon(Icons.arrow_forward_rounded, size: 18)],
              ]),
            ),
          ),
        ),
      ),
    );
  }
}
