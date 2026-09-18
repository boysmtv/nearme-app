import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final adminUsersProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final res = await ApiService().getAdminUsers(params: {'page': 1, 'limit': 50});
  final data = res.data['data'];
  final list = data is Map<String, dynamic> ? data['data'] : data;
  if (list is List) return list.cast<Map<String, dynamic>>();
  throw Exception('Data user tidak tersedia');
});

class AdminUsersPage extends ConsumerWidget {
  const AdminUsersPage({super.key});

  Future<void> _setStatus(WidgetRef ref, BuildContext context, String id, String status) async {
    try {
      await ApiService().updateAdminUserStatus(id, status);
      ref.invalidate(adminUsersProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status user → $status'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(adminUsersProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Pengguna',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: usersAsync.when(
        data: (users) {
          if (users.isEmpty) {
            return const Center(child: Text('Belum ada pengguna'));
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: users.length,
            itemBuilder: (context, i) {
              final u = users[i];
              final id = '${u['id'] ?? ''}';
              final name = '${u['name'] ?? '-'}';
              final email = '${u['email'] ?? ''}';
              final role = '${u['role'] ?? 'ROLE_CUSTOMER'}'.replaceAll('ROLE_', '');
              final status = '${u['status'] ?? 'ACTIVE'}';
              final suspended = status == 'SUSPENDED';
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: DEKATColors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            name.isNotEmpty ? name[0].toUpperCase() : '?',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              color: DEKATColors.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(name,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w800, fontSize: 14)),
                            Text(email,
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 12)),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                _Pill(role, DEKATColors.primary),
                                const SizedBox(width: 6),
                                _Pill(
                                  suspended ? 'Suspended' : 'Aktif',
                                  suspended ? Colors.red : Colors.green,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () => _setStatus(
                          ref,
                          context,
                          id,
                          suspended ? 'ACTIVE' : 'SUSPENDED',
                        ),
                        child: Text(
                          suspended ? 'Aktifkan' : 'Suspend',
                          style: TextStyle(
                            color: suspended ? Colors.green : Colors.red,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Gagal memuat pengguna'),
              TextButton(
                onPressed: () => ref.invalidate(adminUsersProvider),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final String text;
  final Color color;
  const _Pill(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
            color: color, fontSize: 10, fontWeight: FontWeight.w800),
      ),
    );
  }
}
