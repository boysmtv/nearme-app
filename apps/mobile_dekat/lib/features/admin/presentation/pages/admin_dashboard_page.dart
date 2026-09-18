import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final adminStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final res = await ApiService().getAdminStats();
  final data = res.data['data'];
  if (data is Map<String, dynamic>) return data;
  throw Exception('Statistik tidak tersedia');
});

String _fmtRp(num? v) {
  final n = (v ?? 0).round().toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  return 'Rp $n';
}

class AdminDashboardPage extends ConsumerWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(adminStatsProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Dashboard Admin',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        centerTitle: true,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: statsAsync.when(
        data: (s) {
          final cards = [
            _Stat('Total User', '${s['totalUsers'] ?? 0}', Icons.people_rounded,
                const Color(0xFFE8F4FF), const Color(0xFF2196F3)),
            _Stat('Total Tenant', '${s['totalTenants'] ?? 0}', Icons.store_rounded,
                const Color(0xFFEFEDFF), DEKATColors.primary),
            _Stat('Total Booking', '${s['totalBookings'] ?? 0}',
                Icons.calendar_month_rounded, const Color(0xFFFFF3E0), const Color(0xFFFF9800)),
            _Stat('Pendapatan', _fmtRp((s['totalRevenue'] as num?)),
                Icons.payments_rounded, const Color(0xFFE6F7EE), const Color(0xFF4CAF50)),
            _Stat('Provider Aktif', '${s['activeProviders'] ?? 0}',
                Icons.verified_rounded, const Color(0xFFE0F7FA), const Color(0xFF00ACC1)),
            _Stat('Perlu Verifikasi', '${s['pendingVerifications'] ?? 0}',
                Icons.pending_actions_rounded, const Color(0xFFFFEBEE), const Color(0xFFF44336)),
          ];
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.25,
            ),
            itemCount: cards.length,
            itemBuilder: (context, i) {
              final c = cards[i];
              return RepaintBoundary(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: c.bg,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(c.icon, color: c.fg, size: 20),
                      ),
                      const SizedBox(height: 8),
                      Text(c.value,
                          style: const TextStyle(
                              fontWeight: FontWeight.w900, fontSize: 20)),
                      Text(c.label,
                          style: TextStyle(
                              color: Colors.grey[600], fontSize: 12)),
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
              const Text('Gagal memuat statistik'),
              TextButton(
                onPressed: () => ref.invalidate(adminStatsProvider),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Stat {
  final String label;
  final String value;
  final IconData icon;
  final Color bg;
  final Color fg;
  const _Stat(this.label, this.value, this.icon, this.bg, this.fg);
}
