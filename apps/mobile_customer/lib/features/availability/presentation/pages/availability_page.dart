import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final selectedDateProvider = StateProvider<DateTime>((ref) => DateTime.now());
final selectedTimeSlotProvider = StateProvider<String?>((ref) => null);

final availabilityProvider = FutureProvider.autoDispose.family<List<TimeSlot>, Map<String, String>>((ref, params) async {
  try {
    final response = await ApiService().getProviderAvailability(params['providerId']!, params['date']!);
    final data = response.data['data'] as List;
    return data.map((e) => TimeSlot.fromJson(e)).toList();
  } catch (e) {
    return List.generate(15, (i) {
      final hour = 9 + (i ~/ 2);
      final minute = i % 2 == 0 ? '00' : '30';
      return TimeSlot(time: '${hour.toString().padLeft(2, '0')}:$minute', isAvailable: i % 3 != 0);
    });
  }
});

class AvailabilityPage extends ConsumerStatefulWidget {
  final String providerId;
  const AvailabilityPage({super.key, required this.providerId});

  @override
  ConsumerState<AvailabilityPage> createState() => _AvailabilityPageState();
}

class _AvailabilityPageState extends ConsumerState<AvailabilityPage> {
  DateTime _focusedDate = DateTime.now();
  CalendarFormat _calendarFormat = CalendarFormat.month;

  @override
  Widget build(BuildContext context) {
    final selectedDate = ref.watch(selectedDateProvider);
    final selectedTimeSlot = ref.watch(selectedTimeSlotProvider);
    final dateStr = '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}';
    final slotsAsync = ref.watch(availabilityProvider({'providerId': widget.providerId, 'date': dateStr}));

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
              todayDecoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withOpacity(0.3), shape: BoxShape.circle),
              selectedDecoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, shape: BoxShape.circle),
            ),
            headerStyle: const HeaderStyle(formatButtonVisible: false, titleCentered: true),
          ),
          const Divider(),
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
              data: (slots) => GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4, childAspectRatio: 2, crossAxisSpacing: 8, mainAxisSpacing: 8),
                itemCount: slots.length,
                itemBuilder: (context, index) {
                  final slot = slots[index];
                  final isSelected = selectedTimeSlot == slot.time;
                  return OutlinedButton(
                    onPressed: slot.isAvailable
                        ? () => ref.read(selectedTimeSlotProvider.notifier).state = slot.time
                        : null,
                    style: OutlinedButton.styleFrom(
                      backgroundColor: isSelected ? Theme.of(context).colorScheme.primary : Colors.white,
                      foregroundColor: isSelected ? Colors.white : Colors.black87,
                      side: BorderSide(color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: Text(slot.time),
                  );
                },
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Center(child: Text('Failed to load slots')),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: selectedTimeSlot != null
                ? () => context.push('/booking/new?providerId=${widget.providerId}')
                : null,
            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
            child: const Text('Continue'),
          ),
        ),
      ),
    );
  }
}
