import 'package:flutter/material.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class SlotPicker extends StatelessWidget {
  final List<TimeSlot> slots;
  final TimeSlot? selectedSlot;
  final ValueChanged<TimeSlot> onSlotSelected;
  const SlotPicker({super.key, required this.slots, this.selectedSlot, required this.onSlotSelected});

  @override
  Widget build(BuildContext context) {
    if (slots.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            Icon(Icons.schedule, size: 48, color: Colors.grey[300]),
            const SizedBox(height: 8),
            Text('No available slots', style: TextStyle(color: Colors.grey[500])),
          ]),
        ),
      );
    }

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: slots.map((slot) {
        final isSelected = selectedSlot?.time == slot.time;
        final isAvailable = slot.isAvailable;
        return ChoiceChip(
          label: Text(slot.time, style: TextStyle(
            color: isSelected ? Colors.white : isAvailable ? null : Colors.grey,
            fontWeight: FontWeight.w500,
          )),
          selected: isSelected,
          onSelected: isAvailable ? (_) => onSlotSelected(slot) : null,
          selectedColor: Theme.of(context).colorScheme.primary,
          backgroundColor: isAvailable ? Colors.grey[100] : Colors.grey[50],
          disabledColor: Colors.grey[50],
        );
      }).toList(),
    );
  }
}
