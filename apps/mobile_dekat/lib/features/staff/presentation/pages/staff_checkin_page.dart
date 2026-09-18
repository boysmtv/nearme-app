import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Absensi Staf'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
      ),
      body: staffAsync.when(
        data: (staffList) {
          if (staffList.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: DEKATColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.people, size: 44, color: DEKATColors.primary),
                    ),
                    const SizedBox(height: 20),
                    const Text('Belum ada staf',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Text('Data absensi akan muncul di sini',
                        style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                  ],
                ),
              ),
            );
          }

          final checkedInCount = staffList.where((s) {
            final m = s as Map;
            return m['isActive'] == true;
          }).length;

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _StatBox(label: 'Total Staf', value: '${staffList.length}', color: DEKATColors.primary),
                      Container(width: 1, height: 40, color: Colors.grey.shade200),
                      _StatBox(label: 'Aktif', value: '$checkedInCount', color: Colors.green),
                      Container(width: 1, height: 40, color: Colors.grey.shade200),
                      _StatBox(label: 'Non-aktif', value: '${staffList.length - checkedInCount}', color: Colors.orange),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: Row(
                  children: [
                    Text('Daftar kehadiran hari ini',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800])),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: checkedInCount > 0 ? Colors.green : Colors.grey,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '$checkedInCount bertugas',
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.green[700]),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () async => ref.invalidate(staffFutureProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    itemCount: staffList.length,
                    itemBuilder: (context, index) {
                      final s = staffList[index] as Map;
                      final isActive = s['isActive'] == true;
                      final name = s['displayName']?.toString() ?? s['name']?.toString() ?? '-';
                      final role = s['specialties']?.toString() ?? s['role']?.toString() ?? '-';
                      final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';
                      return RepaintBoundary(
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Stack(
                                  children: [
                                    Container(
                                      width: 52,
                                      height: 52,
                                      decoration: BoxDecoration(
                                        color: isActive
                                            ? Colors.green.withValues(alpha: 0.12)
                                            : DEKATColors.primary.withValues(alpha: 0.1),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: Text(
                                          initial,
                                          style: TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            color: isActive
                                                ? Colors.green[700]
                                                : DEKATColors.primary,
                                          ),
                                        ),
                                      ),
                                    ),
                                    Positioned(
                                      right: 0,
                                      bottom: 0,
                                      child: Container(
                                        width: 14,
                                        height: 14,
                                        decoration: BoxDecoration(
                                          color: isActive ? Colors.green : Colors.grey[400],
                                          shape: BoxShape.circle,
                                          border: Border.all(color: Colors.white, width: 2),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(name,
                                          style: const TextStyle(
                                              fontWeight: FontWeight.bold, fontSize: 14)),
                                      const SizedBox(height: 2),
                                      Text(role,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                              color: Colors.grey[600], fontSize: 12)),
                                      if (isActive)
                                        const Padding(
                                          padding: EdgeInsets.only(top: 2),
                                          child: Text('Sedang bertugas',
                                              style: TextStyle(
                                                  color: Colors.green,
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w500)),
                                        ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: isActive ? Colors.green[50] : Colors.orange[50],
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: isActive
                                          ? Colors.green.shade200
                                          : Colors.orange.shade200,
                                    ),
                                  ),
                                  child: Text(
                                    isActive ? 'Aktif' : 'Non-aktif',
                                    style: TextStyle(
                                      color: isActive
                                          ? Colors.green[700]
                                          : Colors.orange[700],
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
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
        const SizedBox(height: 2),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }
}
