import 'package:flutter/material.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class SlotPicker extends StatelessWidget {
  final List<TimeSlot> slots;
  final TimeSlot? selectedSlot;
  final ValueChanged<TimeSlot> onSlotSelected;
  const SlotPicker({super.key, required this.slots, this.selectedSlot, required this.onSlotSelected});

  @override
  Widget build(BuildContext context) {
    if (slots.isEmpty) {
      return Center(
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 12),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(gradient: const LinearGradient(colors: [Colors.white, Color(0xFFF8F7FF)]), borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.softViolet.last.withValues(alpha: 0.5))),
          child: Column(children: [
            Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.schedule_rounded, size: 28, color: Colors.white)),
            const SizedBox(height: 10),
            Text('No available slots', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text('Try another date ✨', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
          ]),
        ),
      );
    }

    return Wrap(
      spacing: 8,
      runSpacing: 10,
      children: slots.map((slot) {
        final isSelected = selectedSlot?.time == slot.time;
        final isAvailable = slot.isAvailable;
        return TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: 1),
          duration: const Duration(milliseconds: 280),
          curve: Curves.easeOutCubic,
          builder: (context, v, child) => Transform.scale(scale: 0.96 + 0.04 * v, child: child),
          child: ChoiceChip(
            label: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(isSelected ? Icons.check_circle_rounded : Icons.access_time_rounded, size: 14, color: isSelected ? Colors.white : isAvailable ? DEKATColors.primary : Colors.grey[400]),
              const SizedBox(width: 5),
              Text(slot.time, style: TextStyle(
                color: isSelected ? Colors.white : isAvailable ? DEKATColors.textPrimary : Colors.grey[400],
                fontWeight: FontWeight.w700, fontSize: 13,
              )),
            ]),
            selected: isSelected,
            onSelected: isAvailable ? (_) => onSlotSelected(slot) : null,
            selectedColor: DEKATColors.primary,
            backgroundColor: isAvailable ? Colors.white : Colors.grey[50],
            disabledColor: Colors.grey[100],
            side: BorderSide(color: isSelected ? DEKATColors.primary : isAvailable ? DEKATColors.primary.withValues(alpha: 0.22) : Colors.grey[200]!),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            showCheckmark: false,
            elevation: isSelected ? 4 : 0,
            shadowColor: DEKATColors.primary.withValues(alpha: 0.2),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          ),
        );
      }).toList(),
    );
  }
}
