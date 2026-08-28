import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
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
      appBar: AppBar(title: const Text('Select Date & Time')),
      body: Column(
        children: [
          TableCalendar(
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
              todayDecoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3), shape: BoxShape.circle),
              selectedDecoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, shape: BoxShape.circle),
            ),
            headerStyle: const HeaderStyle(formatButtonVisible: false, titleCentered: true),
          ),
          const Divider(),
          servicesAsync.when(
            data: (services) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: DropdownButtonFormField<String>(
                initialValue: _selectedServiceId,
                decoration: const InputDecoration(labelText: 'Service', border: OutlineInputBorder()),
                items: services
                    .map((s) => DropdownMenuItem<String>(value: s.id, child: Text('${s.name} - ${formatRupiah(s.price)}')))
                    .toList(),
                onChanged: (v) => setState(() => _selectedServiceId = v),
              ),
            ),
            loading: () => const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator())),
            error: (e, _) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(children: [
                const Expanded(child: Text('Failed to load services')),
                TextButton(onPressed: () => ref.invalidate(bookingServicesProvider(widget.providerId)), child: const Text('Retry')),
              ]),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Available Times', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                Text(isSameDay(selectedDate, DateTime.now()) ? 'Today' : '${selectedDate.day}/${selectedDate.month}',
                    style: TextStyle(color: Colors.grey[600])),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: slotsAsync.when(
              data: (slots) {
                if (slots.isEmpty) {
                  return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.schedule, size: 48, color: Colors.grey[300]),
                    const SizedBox(height: 8),
                    Text('No available slots', style: TextStyle(color: Colors.grey[500])),
                  ]));
                }
                return GridView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: 2.4, crossAxisSpacing: 8, mainAxisSpacing: 8),
                  itemCount: slots.length,
                  itemBuilder: (context, index) {
                    final slot = slots[index];
                    final isSelected = selectedTimeSlot == slot.time;
                    return OutlinedButton(
                      onPressed: slot.available
                          ? () => ref.read(selectedTimeSlotProvider.notifier).state = slot.time
                          : null,
                      style: OutlinedButton.styleFrom(
                        backgroundColor: isSelected ? Theme.of(context).colorScheme.primary : Colors.white,
                        foregroundColor: isSelected ? Colors.white : Colors.black87,
                        side: BorderSide(color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey[300]!),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(slot.time, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Failed to load slots'),
                    TextButton(
                      onPressed: () => ref.invalidate(availabilityProvider({'providerId': widget.providerId, 'date': dateStr})),
                      child: const Text('Retry'),
                    ),
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
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: selectedTimeSlot != null && _selectedServiceId != null
                ? () => context.push('/booking/new'
                    '?providerId=${widget.providerId}'
                    '&serviceId=$_selectedServiceId'
                    '&date=$dateStr'
                    '&time=${Uri.encodeComponent(selectedTimeSlot)}'
                    '${widget.locationId != null ? '&locationId=${widget.locationId}' : ''}')
                : null,
            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
            child: Text(_selectedServiceId == null ? 'Select a Service to Continue' : 'Continue'),
          ),
        ),
      ),
    );
  }
}
