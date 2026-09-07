import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final customersProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ApiService().getCustomers();
    final data = res.data['data'];
    if (data is Map && data['content'] is List) return (data['content'] as List).cast<Map<String, dynamic>>();
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  } catch (_) {
    return [];
  }
});

class CustomersPage extends ConsumerWidget {
  const CustomersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customersAsync = ref.watch(customersProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pelanggan'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
      ),
      body: customersAsync.when(
        data: (customers) {
          if (customers.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.people_outline, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text('Belum ada pelanggan'),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: customers.length,
            itemBuilder: (context, index) {
              final c = customers[index];
              final name = c['name'] ?? c['email'] ?? 'Pelanggan';
              final email = c['email'] ?? '';
              final totalBookings = c['totalBookings'] ?? 0;
              final totalSpent = c['totalSpent'] ?? 0;
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: DEKATColors.primary.withValues(alpha: 0.1),
                    child: Text(name.toString().substring(0, 1).toUpperCase(), style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.bold)),
                  ),
                  title: Text(name.toString(), style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(email.toString(), style: const TextStyle(fontSize: 12)),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('$totalBookings booking', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      Text('Rp ${(totalSpent as num).toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: DEKATColors.primary)),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
