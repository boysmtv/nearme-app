import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final staffProvider = FutureProvider.autoDispose<List<Staff>>((ref) async {
  try {
    final response = await ApiService().getStaff();
    final data = response.data['data'] as List;
    return data.map((e) => Staff.fromJson(e)).toList();
  } catch (e) { return []; }
});

class StaffListPage extends ConsumerWidget {
  const StaffListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staffAsync = ref.watch(staffProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Staff')),
      body: staffAsync.when(
        data: (staffList) {
          if (staffList.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.people_outline, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('No staff members', style: TextStyle(color: Colors.grey[500])),
            const SizedBox(height: 8),
            Text('Add staff to manage bookings', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
          ]));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: staffList.length,
            itemBuilder: (context, index) {
              final s = staffList[index];
              final isActive = s.status == 'active';
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                    child: Icon(Icons.person, color: Theme.of(context).colorScheme.primary),
                  ),
                  title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(s.role ?? '-'),
                  trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                    if (s.rating != null) ...[
                      const Icon(Icons.star, size: 14, color: Colors.amber),
                      const SizedBox(width: 2),
                      Text(s.rating!.toStringAsFixed(1), style: const TextStyle(fontSize: 12)),
                      const SizedBox(width: 8),
                    ],
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isActive ? Colors.green[50] : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(isActive ? 'Active' : 'Inactive',
                          style: TextStyle(fontSize: 12, color: isActive ? Colors.green : Colors.grey, fontWeight: FontWeight.w500)),
                    ),
                  ]),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddStaffDialog(context, ref),
        child: const Icon(Icons.person_add),
      ),
    );
  }

  void _showAddStaffDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final roleController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Staff'),
        content: Form(key: formKey, child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextFormField(
            controller: nameController,
            decoration: const InputDecoration(labelText: 'Name', prefixIcon: Icon(Icons.person_outline)),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: roleController,
            decoration: const InputDecoration(labelText: 'Role', prefixIcon: Icon(Icons.work_outline)),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                try {
                  await ApiService().addStaff({'name': nameController.text, 'role': roleController.text});
                  ref.invalidate(staffProvider);
                  if (context.mounted) Navigator.pop(context);
                } catch (_) {}
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}
