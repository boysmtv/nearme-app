import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final recurringBookingsFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  try {
    final res = await ApiService().getRecurringBookings();
    final data = res.data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    if (data is List) return data;
    return [];
  } catch (_) {
    return [];
  }
});

class RecurringBookingsPage extends ConsumerStatefulWidget {
  const RecurringBookingsPage({super.key});

  @override
  ConsumerState<RecurringBookingsPage> createState() => _RecurringBookingsPageState();
}

class _RecurringBookingsPageState extends ConsumerState<RecurringBookingsPage> {
  String _selectedFrequency = 'weekly';
  String _selectedDay = 'monday';
  TimeOfDay _selectedTime = TimeOfDay.now();
  final _serviceController = TextEditingController();
  final _providerController = TextEditingController();

  @override
  void dispose() {
    _serviceController.dispose();
    _providerController.dispose();
    super.dispose();
  }

  String _freqLabel(String f) {
    switch (f) {
      case 'weekly': return 'Mingguan';
      case 'biweekly': return '2 Mingguan';
      case 'monthly': return 'Bulanan';
      default: return f;
    }
  }

  String _dayLabel(String d) {
    switch (d) {
      case 'monday': return 'Senin';
      case 'tuesday': return 'Selasa';
      case 'wednesday': return 'Rabu';
      case 'thursday': return 'Kamis';
      case 'friday': return 'Jumat';
      case 'saturday': return 'Sabtu';
      case 'sunday': return 'Minggu';
      default: return d;
    }
  }

  Future<void> _create() async {
    final timeStr = '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}';
    try {
      await ApiService().createRecurringBooking({
        'serviceName': _serviceController.text.isNotEmpty ? _serviceController.text : 'Layanan',
        'providerName': _providerController.text.isNotEmpty ? _providerController.text : 'Provider',
        'frequency': _selectedFrequency,
        'dayOfWeek': _selectedDay,
        'time': timeStr,
      });
      ref.invalidate(recurringBookingsFutureProvider);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal membuat: $e')));
      }
    }
  }

  Future<void> _toggleActive(String id, bool current) async {
    try {
      await ApiService().updateRecurringBooking(id, {'isActive': !current});
      ref.invalidate(recurringBookingsFutureProvider);
    } catch (_) {}
  }

  Future<void> _delete(String id) async {
    try {
      await ApiService().deleteRecurringBooking(id);
      ref.invalidate(recurringBookingsFutureProvider);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(recurringBookingsFutureProvider);

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
      body: bookingsAsync.when(
        data: (bookings) {
          if (bookings.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.repeat, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('Belum ada booking berulang', style: TextStyle(color: Colors.grey[500])),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => _showAddDialog(context),
                    child: const Text('Tambah Booking Berulang'),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: bookings.length,
            itemBuilder: (context, index) {
              final b = bookings[index] as Map;
              final isActive = b['isActive'] == true;
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
                                Text(b['serviceName']?.toString() ?? '-',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                const SizedBox(height: 4),
                                Text(b['providerName']?.toString() ?? '-',
                                    style: TextStyle(color: Colors.grey[600])),
                              ],
                            ),
                          ),
                          Switch(
                            value: isActive,
                            onChanged: (_) => _toggleActive(b['id'].toString(), isActive),
                            activeColor: Colors.deepPurple,
                          ),
                        ],
                      ),
                      const Divider(),
                      Row(
                        children: [
                          _InfoChip(icon: Icons.repeat, label: _freqLabel(b['frequency']?.toString() ?? '')),
                          const SizedBox(width: 8),
                          _InfoChip(icon: Icons.calendar_today, label: _dayLabel(b['dayOfWeek']?.toString() ?? '')),
                          const SizedBox(width: 8),
                          _InfoChip(icon: Icons.access_time, label: b['time']?.toString() ?? '-'),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Booking berikutnya: ${b['nextBooking']?.toString().substring(0, 10) ?? '-'}',
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          OutlinedButton(
                            onPressed: () => _delete(b['id'].toString()),
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
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal memuat: $e')),
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
          left: 16, right: 16, top: 16,
        ),
        child: StatefulBuilder(
          builder: (context, setModalState) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tambah Booking Berulang',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 16),
              TextField(
                controller: _serviceController,
                decoration: const InputDecoration(labelText: 'Nama Layanan'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _providerController,
                decoration: const InputDecoration(labelText: 'Nama Provider'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedFrequency,
                decoration: const InputDecoration(labelText: 'Frekuensi'),
                items: const [
                  DropdownMenuItem(value: 'weekly', child: Text('Mingguan')),
                  DropdownMenuItem(value: 'biweekly', child: Text('2 Mingguan')),
                  DropdownMenuItem(value: 'monthly', child: Text('Bulanan')),
                ],
                onChanged: (v) => setModalState(() => _selectedFrequency = v ?? 'weekly'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedDay,
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
                onChanged: (v) => setModalState(() => _selectedDay = v ?? 'monday'),
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Waktu'),
                subtitle: Text('${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}'),
                trailing: const Icon(Icons.access_time),
                onTap: () async {
                  final time = await showTimePicker(context: context, initialTime: _selectedTime);
                  if (time != null) setModalState(() => _selectedTime = time);
                },
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _create,
                  child: const Text('Simpan'),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
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
