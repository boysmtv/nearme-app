import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final adminTenantsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final res = await ApiService().getAdminTenants(params: {'page': 1, 'limit': 50});
  final data = res.data['data'];
  final list = data is Map<String, dynamic> ? data['data'] : data;
  if (list is List) return list.cast<Map<String, dynamic>>();
  throw Exception('Data tenant tidak tersedia');
});

class AdminTenantsPage extends ConsumerWidget {
  const AdminTenantsPage({super.key});

  Future<void> _decide(
    WidgetRef ref,
    BuildContext context,
    String id,
    bool approve,
  ) async {
    try {
      if (approve) {
        await ApiService().approveAdminTenant(id);
      } else {
        await ApiService().rejectAdminTenant(id);
      }
      ref.invalidate(adminTenantsProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(approve ? 'Tenant disetujui' : 'Tenant ditolak'),
            backgroundColor: Colors.green,
          ),
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
    final tenantsAsync = ref.watch(adminTenantsProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Tenant / Provider',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: tenantsAsync.when(
        data: (tenants) {
          if (tenants.isEmpty) {
            return const Center(child: Text('Belum ada tenant'));
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: tenants.length,
            itemBuilder: (context, i) {
              final t = tenants[i];
              final id = '${t['id'] ?? ''}';
              final name = '${t['name'] ?? t['businessName'] ?? '-'}';
              final status = '${t['status'] ?? t['verificationStatus'] ?? 'PENDING'}';
              final pending = status.toUpperCase().contains('PENDING') ||
                  status.toUpperCase().contains('REVIEW');
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: DEKATColors.primary
                                  .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(Icons.store_rounded,
                                color: DEKATColors.primary),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(name,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 14)),
                                Text(status,
                                    style: TextStyle(
                                        color: pending
                                            ? Colors.orange
                                            : Colors.green,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      if (pending) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () =>
                                    _decide(ref, context, id, false),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.red,
                                  side: const BorderSide(color: Colors.red),
                                ),
                                child: const Text('Tolak'),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () =>
                                    _decide(ref, context, id, true),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: DEKATColors.primary,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                ),
                                child: const Text('Setujui'),
                              ),
                            ),
                          ],
                        ),
                      ],
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
              const Text('Gagal memuat tenant'),
              TextButton(
                onPressed: () => ref.invalidate(adminTenantsProvider),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
