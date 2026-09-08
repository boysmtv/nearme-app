import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final staffFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  try {
    final res = await ApiService().getStaffCheckins();
    final data = res.data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    if (data is List) return data;
    return [];
  } catch (_) {
    return [];
  }
});

class StaffCheckInPage extends ConsumerWidget {
  const StaffCheckInPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staffAsync = ref.watch(staffFutureProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Absensi Staf')),
      body: staffAsync.when(
        data: (staffList) {
          if (staffList.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.people, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('Belum ada staf', style: TextStyle(color: Colors.grey[500])),
                ],
              ),
            );
          }

          final checkedInCount = staffList.where((s) {
            final m = s as Map;
            return m['isActive'] == true;
          }).length;

          return Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.deepPurple.withOpacity(0.05),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _StatBox(label: 'Total Staf', value: '${staffList.length}', color: Colors.deepPurple),
                    _StatBox(label: 'Aktif', value: '$checkedInCount', color: Colors.green),
                    _StatBox(label: 'Non-aktif', value: '${staffList.length - checkedInCount}', color: Colors.orange),
                  ],
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () async => ref.invalidate(staffFutureProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: staffList.length,
                    itemBuilder: (context, index) {
                      final s = staffList[index] as Map;
                      final isActive = s['isActive'] == true;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isActive ? Colors.green[100] : Colors.grey[200],
                            child: Text(
                              (s['displayName']?.toString() ?? s['name']?.toString() ?? '?')[0],
                              style: TextStyle(color: isActive ? Colors.green[700] : Colors.grey[600]),
                            ),
                          ),
                          title: Text(s['displayName']?.toString() ?? s['name']?.toString() ?? '-',
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(s['specialties']?.toString() ?? s['role']?.toString() ?? '-',
                                  style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                              if (isActive)
                                const Text('Sedang bertugas', style: TextStyle(color: Colors.green, fontSize: 11)),
                            ],
                          ),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: isActive ? Colors.green[50] : Colors.orange[50],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              isActive ? 'Aktif' : 'Non-aktif',
                              style: TextStyle(
                                color: isActive ? Colors.green[700] : Colors.orange[700],
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal memuat: $e')),
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
