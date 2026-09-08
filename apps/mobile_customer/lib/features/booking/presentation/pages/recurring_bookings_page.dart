import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class RecurringBooking {
  final String id;
  final String serviceName;
  final String providerName;
  final String frequency;
  final String dayOfWeek;
  final String time;
  final bool isActive;
  final DateTime nextBooking;

  RecurringBooking({
    required this.id,
    required this.serviceName,
    required this.providerName,
    required this.frequency,
    required this.dayOfWeek,
    required this.time,
    this.isActive = true,
    required this.nextBooking,
  });
}

final recurringBookingsProvider = Provider<List<RecurringBooking>>((ref) {
  return [
    RecurringBooking(
      id: '1',
      serviceName: 'Potong Rambut',
      providerName: 'Barbershop Central',
      frequency: 'Mingguan',
      dayOfWeek: 'Senin',
      time: '10:00',
      nextBooking: DateTime.now().add(const Duration(days: 3)),
    ),
    RecurringBooking(
      id: '2',
      serviceName: 'Creambath',
      providerName: 'Beauty Salon',
      frequency: '2 Mingguan',
      dayOfWeek: 'Sabtu',
      time: '14:00',
      nextBooking: DateTime.now().add(const Duration(days: 5)),
    ),
  ];
});

class RecurringBookingsPage extends ConsumerWidget {
  const RecurringBookingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookings = ref.watch(recurringBookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Berulang'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddDialog(context),
          ),
        ],
      ),
      body: bookings.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.repeat, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('Belum ada booking berulang',
                      style: TextStyle(color: Colors.grey[500])),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => _showAddDialog(context),
                    child: const Text('Tambah Booking Berulang'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              itemBuilder: (context, index) {
                final booking = bookings[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(booking.serviceName,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 4),
                                  Text(booking.providerName,
                                      style: TextStyle(color: Colors.grey[600])),
                                ],
                              ),
                            ),
                            Switch(
                              value: booking.isActive,
                              onChanged: (v) {},
                              activeColor: Colors.deepPurple,
                            ),
                          ],
                        ),
                        const Divider(),
                        Row(
                          children: [
                            _InfoChip(icon: Icons.repeat, label: booking.frequency),
                            const SizedBox(width: 8),
                            _InfoChip(icon: Icons.calendar_today, label: booking.dayOfWeek),
                            const SizedBox(width: 8),
                            _InfoChip(icon: Icons.access_time, label: booking.time),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Booking berikutnya: ${booking.nextBooking.day}/${booking.nextBooking.month}/${booking.nextBooking.year}',
                          style: TextStyle(color: Colors.grey[500], fontSize: 12),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            OutlinedButton(
                              onPressed: () {},
                              child: const Text('Edit'),
                            ),
                            const SizedBox(width: 8),
                            OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                              child: const Text('Hapus'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  void _showAddDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Tambah Booking Berulang',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Layanan'),
              items: const [
                DropdownMenuItem(value: 'haircut', child: Text('Potong Rambut')),
                DropdownMenuItem(value: 'creambath', child: Text('Creambath')),
                DropdownMenuItem(value: 'coloring', child: Text('Hair Color')),
              ],
              onChanged: (v) {},
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Frekuensi'),
              items: const [
                DropdownMenuItem(value: 'weekly', child: Text('Mingguan')),
                DropdownMenuItem(value: 'biweekly', child: Text('2 Mingguan')),
                DropdownMenuItem(value: 'monthly', child: Text('Bulanan')),
              ],
              onChanged: (v) {},
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Hari'),
              items: const [
                DropdownMenuItem(value: 'monday', child: Text('Senin')),
                DropdownMenuItem(value: 'tuesday', child: Text('Selasa')),
                DropdownMenuItem(value: 'wednesday', child: Text('Rabu')),
                DropdownMenuItem(value: 'thursday', child: Text('Kamis')),
                DropdownMenuItem(value: 'friday', child: Text('Jumat')),
                DropdownMenuItem(value: 'saturday', child: Text('Sabtu')),
                DropdownMenuItem(value: 'sunday', child: Text('Minggu')),
              ],
              onChanged: (v) {},
            ),
            const SizedBox(height: 12),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Waktu'),
              onTap: () async {
                final time = await showTimePicker(
                  context: context,
                  initialTime: TimeOfDay.now(),
                );
              },
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Simpan'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.deepPurple.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.deepPurple),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.deepPurple)),
        ],
      ),
    );
  }
}
