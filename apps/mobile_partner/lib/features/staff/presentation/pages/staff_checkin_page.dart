import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class StaffMember {
  final String id;
  final String name;
  final String role;
  final bool isCheckedIn;
  final DateTime? checkInTime;

  StaffMember({
    required this.id,
    required this.name,
    required this.role,
    this.isCheckedIn = false,
    this.checkInTime,
  });
}

final staffProvider = StateProvider<List<StaffMember>>((ref) {
  return [
    StaffMember(id: '1', name: 'Andi', role: 'Senior Barber', isCheckedIn: true, checkInTime: DateTime.now().subtract(const Duration(hours: 2))),
    StaffMember(id: '2', name: 'Budi', role: 'Barber', isCheckedIn: true, checkInTime: DateTime.now().subtract(const Duration(hours: 1))),
    StaffMember(id: '3', name: 'Rudi', role: 'Junior Barber'),
    StaffMember(id: '4', name: 'Sari', role: 'Stylist'),
  ];
});

class StaffCheckInPage extends ConsumerWidget {
  const StaffCheckInPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staff = ref.watch(staffProvider);
    final checkedInCount = staff.where((s) => s.isCheckedIn).length;

    return Scaffold(
      appBar: AppBar(title: const Text('Absensi Staf')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.deepPurple.withOpacity(0.05),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _StatBox(label: 'Total Staf', value: '${staff.length}', color: Colors.deepPurple),
                _StatBox(label: 'Hadir', value: '$checkedInCount', color: Colors.green),
                _StatBox(label: 'Belum Hadir', value: '${staff.length - checkedInCount}', color: Colors.orange),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: staff.length,
              itemBuilder: (context, index) {
                final member = staff[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: member.isCheckedIn ? Colors.green[100] : Colors.grey[200],
                      child: Text(member.name[0], style: TextStyle(
                        color: member.isCheckedIn ? Colors.green[700] : Colors.grey[600],
                      )),
                    ),
                    title: Text(member.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(member.role, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        if (member.isCheckedIn && member.checkInTime != null)
                          Text(
                            'Check-in: ${member.checkInTime!.hour}:${member.checkInTime!.minute.toString().padLeft(2, '0')}',
                            style: const TextStyle(color: Colors.green, fontSize: 11),
                          ),
                      ],
                    ),
                    trailing: member.isCheckedIn
                        ? OutlinedButton(
                            onPressed: () {
                              ref.read(staffProvider.notifier).state = staff.map((s) =>
                                s.id == member.id ? StaffMember(id: s.id, name: s.name, role: s.role) : s
                              ).toList();
                            },
                            style: OutlinedButton.styleFrom(foregroundColor: Colors.orange),
                            child: const Text('Check Out'),
                          )
                        : ElevatedButton(
                            onPressed: () {
                              ref.read(staffProvider.notifier).state = staff.map((s) =>
                                s.id == member.id ? StaffMember(
                                  id: s.id, name: s.name, role: s.role,
                                  isCheckedIn: true, checkInTime: DateTime.now(),
                                ) : s
                              ).toList();
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                            child: const Text('Check In'),
                          ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatBox({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: TextStyle(fontSize: 12, color: color)),
      ],
    );
  }
}
