import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

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
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal update: $e')));
      }
    }
  }

  Future<void> _delete(String id) async {
    try {
      await ApiService().deleteRecurringBooking(id);
      ref.invalidate(recurringBookingsFutureProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal hapus: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(recurringBookingsFutureProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Booking Berulang', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Container(
              decoration: const BoxDecoration(color: DEKATColors.primary, shape: BoxShape.circle),
              child: IconButton(
                icon: const Icon(Icons.add_rounded, color: Colors.white, size: 20),
                onPressed: () => _showAddDialog(context),
              ),
            ),
          ),
        ],
      ),
      body: bookingsAsync.when(
        data: (bookings) {
          if (bookings.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)),
                      child: Icon(Icons.repeat_rounded, size: 44, color: Colors.grey.shade400),
                    ),
                    const SizedBox(height: 16),
                    const Text('Belum ada booking berulang', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    const SizedBox(height: 6),
                    Text('Atur jadwal rutin favoritmu —\notomatis terjadwal tiap minggu/bulan.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade500, fontSize: 13, height: 1.5)),
                    const SizedBox(height: 20),
                    FilledButton.icon(
                      onPressed: () => _showAddDialog(context),
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Tambah Booking Berulang', style: TextStyle(fontWeight: FontWeight.w700)),
                      style: FilledButton.styleFrom(backgroundColor: DEKATColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14)),
                    ),
                  ],
                ),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: bookings.length,
            itemBuilder: (context, index) {
              final b = bookings[index] as Map;
              final isActive = b['isActive'] == true;
              final serviceName = b['serviceName']?.toString() ?? '-';
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isActive ? DEKATColors.primary.withValues(alpha:0.25) : Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              color: isActive ? DEKATColors.primary : Colors.grey.shade200,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(serviceName.isNotEmpty ? serviceName[0].toUpperCase() : 'B',
                                  style: TextStyle(color: isActive ? Colors.white : Colors.grey.shade600, fontWeight: FontWeight.w800, fontSize: 18)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(serviceName,
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                const SizedBox(height: 2),
                                Row(children: [
                                  Icon(Icons.store_rounded, size: 12, color: Colors.grey.shade500),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(b['providerName']?.toString() ?? '-',
                                        maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                                  ),
                                ]),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                            Switch(
                              value: isActive,
                              onChanged: (_) => _toggleActive(b['id'].toString(), isActive),
                              activeThumbColor: DEKATColors.primary,
                            ),
                            Text(isActive ? 'Aktif' : 'Nonaktif', style: TextStyle(color: isActive ? DEKATColors.primary : Colors.grey.shade500, fontSize: 10, fontWeight: FontWeight.w800)),
                          ]),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _FreqBadge(label: _freqLabel(b['frequency']?.toString() ?? '')),
                          _InfoChip(icon: Icons.calendar_today_rounded, label: _dayLabel(b['dayOfWeek']?.toString() ?? '')),
                          _InfoChip(icon: Icons.access_time_rounded, label: b['time']?.toString() ?? '-'),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(color: const Color(0xFFF8F9FF), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.grey.shade200)),
                        child: Row(children: [
                          Icon(Icons.event_repeat_rounded, size: 14, color: Colors.grey.shade600),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Booking berikutnya: ${b['nextBooking']?.toString().substring(0, 10) ?? '-'}',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                            ),
                          ),
                        ]),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _delete(b['id'].toString()),
                              icon: const Icon(Icons.delete_outline_rounded, size: 16),
                              style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: BorderSide(color: Colors.red.shade100), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                              label: const Text('Hapus', style: TextStyle(fontWeight: FontWeight.w700)),
                            ),
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
        loading: () => const ShimmerBookingList(),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: Colors.grey.shade200)), child: Icon(Icons.wifi_off_rounded, size: 28, color: Colors.grey.shade400)),
              const SizedBox(height: 12),
              Text('Gagal memuat: $e', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
            ]),
          ),
        ),
      ),
    );
  }

  void _showAddDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16, right: 16, top: 12,
        ),
        child: StatefulBuilder(
          builder: (context, setModalState) => SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 16),
                Row(children: [
                  Container(padding: const EdgeInsets.all(9), decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.repeat_rounded, size: 18, color: DEKATColors.primary)),
                  const SizedBox(width: 10),
                  const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Tambah Booking Berulang', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    SizedBox(height: 2),
                    Text('Jadwal rutin otomatis sesuai frekuensi', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ])),
                ]),
                const SizedBox(height: 16),
                TextField(
                  controller: _serviceController,
                  decoration: InputDecoration(
                    labelText: 'Nama Layanan',
                    hintText: 'Contoh: Potong Rambut',
                    prefixIcon: const Icon(Icons.spa_rounded, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _providerController,
                  decoration: InputDecoration(
                    labelText: 'Nama Provider',
                    hintText: 'Contoh: Barbershop Central',
                    prefixIcon: const Icon(Icons.store_rounded, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _selectedFrequency,
                  decoration: InputDecoration(
                    labelText: 'Frekuensi',
                    prefixIcon: const Icon(Icons.repeat_rounded, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'weekly', child: Text('Mingguan')),
                    DropdownMenuItem(value: 'biweekly', child: Text('2 Mingguan')),
                    DropdownMenuItem(value: 'monthly', child: Text('Bulanan')),
                  ],
                  onChanged: (v) => setModalState(() => _selectedFrequency = v ?? 'weekly'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _selectedDay,
                  decoration: InputDecoration(
                    labelText: 'Hari',
                    prefixIcon: const Icon(Icons.calendar_today_rounded, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  ),
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
                Container(
                  decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade400), borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14),
                    leading: const Icon(Icons.access_time_rounded, color: DEKATColors.primary),
                    title: const Text('Waktu', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    subtitle: Text('${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: DEKATColors.primary)),
                    trailing: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(20)), child: const Text('Ubah', style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 12))),
                    onTap: () async {
                      final time = await showTimePicker(context: context, initialTime: _selectedTime);
                      if (time != null) setModalState(() => _selectedTime = time);
                    },
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _create,
                    style: ElevatedButton.styleFrom(backgroundColor: DEKATColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    child: const Text('Simpan', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FreqBadge extends StatelessWidget {
  final String label;
  const _FreqBadge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: DEKATColors.primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.repeat_rounded, size: 13, color: Colors.white),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w800)),
        ],
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: DEKATColors.primary.withValues(alpha:0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: DEKATColors.primary.withValues(alpha:0.15)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: DEKATColors.primary),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: DEKATColors.primary, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
