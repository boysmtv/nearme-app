import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final staffProvider = FutureProvider.autoDispose<List<PartnerStaffRow>>((ref) async {
  final response = await ApiService().getStaff();
  return ((response.data['data'] ?? []) as List)
      .map((e) => PartnerStaffRow.fromJson(e as Map<String, dynamic>))
      .toList();
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
          if (staffList.isEmpty) {
            return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.people_outline, size: 64, color: Colors.grey[300]),
              const SizedBox(height: 16),
              Text('No staff members', style: TextStyle(color: Colors.grey[500])),
              const SizedBox(height: 8),
              Text('Add staff to manage bookings', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
            ]));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: staffList.length,
            itemBuilder: (context, index) {
              final s = staffList[index];
              final isActive = s.isActive;
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: isActive ? 0.1 : 0.05),
                    child: Icon(Icons.person, color: isActive ? Theme.of(context).colorScheme.primary : Colors.grey),
                  ),
                  title: Text(s.displayName, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(s.title ?? '-'),
                  trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isActive ? Colors.green[50] : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(isActive ? 'Active' : 'Inactive',
                          style: TextStyle(fontSize: 12, color: isActive ? Colors.green : Colors.grey, fontWeight: FontWeight.w500)),
                    ),
                    PopupMenuButton<String>(
                      onSelected: (action) async {
                        try {
                          if (action == 'deactivate') {
                            await ApiService().dio.delete('/provider/staff/${s.id}');
                          } else if (action == 'activate') {
                            await ApiService().updateStaff(s.id, {});
                          } else if (action == 'schedule') {
                            if (context.mounted) _showScheduleDialog(context, ref, s.id);
                            return;
                          }
                          ref.invalidate(staffProvider);
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red),
                            );
                          }
                        }
                      },
                      itemBuilder: (_) => [
                        const PopupMenuItem(value: 'schedule', child: Text('Edit Schedule')),
                        if (isActive)
                          const PopupMenuItem(value: 'deactivate', child: Text('Deactivate'))
                        else
                          const PopupMenuItem(value: 'activate', child: Text('Activate')),
                      ],
                    ),
                  ]),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Failed to load'),
              TextButton(onPressed: () => ref.invalidate(staffProvider), child: const Text('Coba lagi')),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddStaffDialog(context, ref),
        child: const Icon(Icons.person_add),
      ),
    );
  }

  void _showAddStaffDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Staff'),
        content: Form(key: formKey, child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextFormField(
            controller: nameController,
            decoration: const InputDecoration(labelText: 'Name', prefixIcon: Icon(Icons.person_outline)),
            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Required';
              if (!v.contains('@') || !v.contains('.')) return 'Invalid email';
              return null;
            },
          ),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                try {
                  await ApiService().addStaff({
                    'displayName': nameController.text.trim(),
                    'email': emailController.text.trim(),
                  });
                  ref.invalidate(staffProvider);
                  if (context.mounted) Navigator.pop(context);
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to add staff: $e'), backgroundColor: Colors.red),
                    );
                  }
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showScheduleDialog(BuildContext context, WidgetRef ref, String staffId) {
    // Simple schedule editor: Mon-Sun 09:00-17:00, POST /provider/staff/{id}/schedule
    final dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    List<Map<String, dynamic>> schedule = List.generate(7, (i) => {'dayOfWeek': i, 'startTime': '09:00', 'endTime': '17:00', 'isOff': i==6});
    bool saving = false;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (context, setState) {
        return AlertDialog(
          title: const Text('Edit Schedule'),
          content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('POST /provider/staff/{id}/schedule', style: TextStyle(fontSize: 10, color: Colors.grey)),
            const SizedBox(height: 8),
            ...schedule.asMap().entries.map((e) {
              final idx = e.key;
              final sc = e.value;
              return Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(children: [
                SizedBox(width: 60, child: Text(dayNames[sc['dayOfWeek'] as int], style: const TextStyle(fontSize: 12))),
                Checkbox(value: !(sc['isOff'] as bool), onChanged: (v)=> setState(()=> schedule[idx]['isOff'] = !(v??false))),
                if (!(sc['isOff'] as bool)) ...[
                  SizedBox(width: 70, child: TextFormField(initialValue: sc['startTime'] as String, onChanged: (v)=> schedule[idx]['startTime']=v, decoration: const InputDecoration(isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)))),
                  const Text(' - '),
                  SizedBox(width: 70, child: TextFormField(initialValue: sc['endTime'] as String, onChanged: (v)=> schedule[idx]['endTime']=v, decoration: const InputDecoration(isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)))),
                ] else const Text('Libur', style: TextStyle(fontSize: 12, color: Colors.grey)),
              ]));
            }),
          ])),
          actions: [
            TextButton(onPressed: ()=> Navigator.pop(ctx), child: const Text('Batal')),
            TextButton(onPressed: saving ? null : () async {
              setState(()=> saving=true);
              try {
                await ApiService().dio.post('/provider/staff/$staffId/schedule', data: schedule);
                if (ctx.mounted) Navigator.pop(ctx);
                if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Jadwal tersimpan'), backgroundColor: Colors.green));
              } catch (e) {
                if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red));
              } finally { if (ctx.mounted) setState(()=> saving=false); }
            }, child: Text(saving ? 'Menyimpan...' : 'Simpan')),
          ],
        );
      }),
    );
  }
}
