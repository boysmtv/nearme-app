import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../shared/models/rows.dart';
import '../../../../shared/widgets/main_scaffold.dart';

final staffProvider = FutureProvider.autoDispose<List<PartnerStaffRow>>((ref) async {
  final response = await ApiService().getStaff();
  return ((response.data['data'] ?? []) as List)
      .map((e) => PartnerStaffRow.fromJson(e as Map<String, dynamic>))
      .toList();
});

final staffPortfolioProvider = FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>((ref, staffId) async {
  final resp = await ApiService().getStaffPortfolio(staffId);
  final data = resp.data['data'] as List?;
  if (data == null) return [];
  return data.cast<Map<String, dynamic>>();
});

class StaffListPage extends ConsumerWidget {
  const StaffListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staffAsync = ref.watch(staffProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () => partnerScaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Staf'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
      ),
      body: staffAsync.when(
        data: (staffList) {
          if (staffList.isEmpty) {
            return Center(
                child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: DEKATColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.people_outline, size: 44, color: DEKATColors.primary),
                ),
                const SizedBox(height: 20),
                const Text('Belum ada staf',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Text('Tambahkan staf untuk mengelola booking',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey[500], fontSize: 13)),
              ]),
            ));
          }
          final activeCount = staffList.where((s) => s.isActive).length;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: DEKATColors.primary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                          child: _StaffHeaderStat(
                              value: '${staffList.length}', label: 'Total Staf')),
                      Container(
                          width: 1,
                          height: 36,
                          color: Colors.white.withValues(alpha: 0.3)),
                      Expanded(
                          child: _StaffHeaderStat(
                              value: '$activeCount', label: 'Aktif')),
                      Container(
                          width: 1,
                          height: 36,
                          color: Colors.white.withValues(alpha: 0.3)),
                      Expanded(
                          child: _StaffHeaderStat(
                              value: '${staffList.length - activeCount}',
                              label: 'Nonaktif')),
                    ],
                  ),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
                  itemCount: staffList.length,
                  itemBuilder: (context, index) {
                    final s = staffList[index];
                    final isActive = s.isActive;
                    final portfolioAsync = ref.watch(staffPortfolioProvider(s.id));
                    final avatarUrl = s.avatarUrl;
                    return RepaintBoundary(
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (avatarUrl != null && avatarUrl.isNotEmpty)
                                    ClipOval(
                                      child: CachedNetworkImage(
                                        imageUrl: avatarUrl,
                                        width: 56,
                                        height: 56,
                                        fit: BoxFit.cover,
                                        memCacheWidth: 112,
                                        memCacheHeight: 112,
                                        placeholder: (_, __) => Container(
                                            width: 56,
                                            height: 56,
                                            color: Colors.grey[200]),
                                        errorWidget: (_, __, ___) => Container(
                                          width: 56,
                                          height: 56,
                                          color: DEKATColors.primary.withValues(alpha: 0.1),
                                          child: Icon(Icons.person,
                                              color: DEKATColors.primary, size: 28),
                                        ),
                                      ),
                                    )
                                  else
                                    Container(
                                      width: 56,
                                      height: 56,
                                      decoration: BoxDecoration(
                                        color: DEKATColors.primary.withValues(
                                            alpha: isActive ? 0.1 : 0.05),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: Text(
                                          s.displayName.isNotEmpty
                                              ? s.displayName[0].toUpperCase()
                                              : '?',
                                          style: TextStyle(
                                            fontSize: 22,
                                            fontWeight: FontWeight.bold,
                                            color: isActive
                                                ? DEKATColors.primary
                                                : Colors.grey,
                                          ),
                                        ),
                                      ),
                                    ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(s.displayName,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15)),
                                        const SizedBox(height: 2),
                                        Row(
                                          children: [
                                            Icon(Icons.badge_outlined,
                                                size: 13, color: Colors.grey[500]),
                                            const SizedBox(width: 4),
                                            Expanded(
                                              child: Text(s.title ?? '-',
                                                  style: TextStyle(
                                                      color: Colors.grey[600],
                                                      fontSize: 12)),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: isActive
                                                ? Colors.green[50]
                                                : Colors.grey[100],
                                            borderRadius: BorderRadius.circular(20),
                                            border: Border.all(
                                                color: isActive
                                                    ? Colors.green.shade200
                                                    : Colors.grey.shade300),
                                          ),
                                          child: Text(
                                              isActive ? 'Aktif' : 'Nonaktif',
                                              style: TextStyle(
                                                  fontSize: 11,
                                                  color: isActive
                                                      ? Colors.green[700]
                                                      : Colors.grey[600],
                                                  fontWeight: FontWeight.w600)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  PopupMenuButton<String>(
                                    icon: Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: Colors.grey[100],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(Icons.more_vert, size: 18),
                                    ),
                                    onSelected: (action) async {
                                      try {
                                        if (action == 'deactivate') {
                                          await ApiService().deleteStaff(s.id);
                                        } else if (action == 'activate') {
                                          await ApiService().updateStaff(s.id, {});
                                        } else if (action == 'schedule') {
                                          if (context.mounted) _showScheduleDialog(context, ref, s.id);
                                          return;
                                        } else if (action == 'portfolio') {
                                          if (context.mounted) _pickAndUploadPortfolio(context, ref, s.id);
                                          return;
                                        } else if (action == 'specialties') {
                                          if (context.mounted) _editSpecialtiesDialog(context, ref, s);
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
                                      const PopupMenuItem(value: 'schedule', child: Text('Ubah Jadwal')),
                                      const PopupMenuItem(value: 'portfolio', child: Text('Unggah Portfolio')),
                                      const PopupMenuItem(value: 'specialties', child: Text('Ubah Keahlian')),
                                      if (isActive)
                                        const PopupMenuItem(value: 'deactivate', child: Text('Nonaktifkan'))
                                      else
                                        const PopupMenuItem(value: 'activate', child: Text('Aktifkan')),
                                    ],
                                  ),
                                ],
                              ),
                              if (s.specialties != null && s.specialties!.isNotEmpty) ...[
                                const SizedBox(height: 10),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: s.specialties!
                                      .map((sp) => Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 10, vertical: 5),
                                            decoration: BoxDecoration(
                                              color: DEKATColors.primary
                                                  .withValues(alpha: 0.08),
                                              borderRadius: BorderRadius.circular(20),
                                            ),
                                            child: Text(sp,
                                                style: TextStyle(
                                                    fontSize: 11,
                                                    color: DEKATColors.primary,
                                                    fontWeight: FontWeight.w500)),
                                          ))
                                      .toList(),
                                ),
                              ],
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8F9FF),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.grey.shade200),
                                ),
                                child: Row(children: [
                                  Icon(Icons.calendar_month_outlined,
                                      size: 16, color: DEKATColors.primary),
                                  const SizedBox(width: 8),
                                  const Expanded(
                                    child: Text('Jadwal mingguan',
                                        style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600)),
                                  ),
                                  TextButton(
                                    style: TextButton.styleFrom(
                                      visualDensity: VisualDensity.compact,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8),
                                    ),
                                    onPressed: () =>
                                        _showScheduleDialog(context, ref, s.id),
                                    child: const Text('Ubah',
                                        style: TextStyle(fontSize: 12)),
                                  ),
                                ]),
                              ),
                              const SizedBox(height: 10),
                              Row(children: [
                                Icon(Icons.photo_library_outlined,
                                    size: 14, color: Colors.grey[500]),
                                const SizedBox(width: 4),
                                Text('Portfolio',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.grey[600])),
                                const Spacer(),
                                TextButton.icon(
                                  style: TextButton.styleFrom(
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  onPressed: () => _pickAndUploadPortfolio(
                                      context, ref, s.id),
                                  icon: const Icon(Icons.add_a_photo, size: 14),
                                  label: const Text('Unggah',
                                      style: TextStyle(fontSize: 12)),
                                ),
                              ]),
                              portfolioAsync.when(
                                data: (photos) {
                                  if (photos.isEmpty) {
                                    return Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12),
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                            color: Colors.grey.shade200),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'Belum ada foto portfolio',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                            color: Colors.grey[500],
                                            fontSize: 11),
                                      ),
                                    );
                                  }
                                  return SizedBox(
                                    height: 70,
                                    child: ListView.separated(
                                      scrollDirection: Axis.horizontal,
                                      itemCount: photos.length,
                                      separatorBuilder: (_, __) =>
                                          const SizedBox(width: 6),
                                      itemBuilder: (context, idx) {
                                        final p = photos[idx];
                                        final url = p['url'] as String? ?? '';
                                        return Stack(children: [
                                          ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(8),
                                            child: url.isNotEmpty
                                                ? CachedNetworkImage(imageUrl: url, width: 70, height: 70, fit: BoxFit.cover, memCacheWidth: 140, memCacheHeight: 140, placeholder: (_, __) => Container(width: 70, height: 70, color: Colors.grey[200]), errorWidget: (_, __, ___) => Container(width: 70, height: 70, color: Colors.grey[200], child: const Icon(Icons.broken_image, size: 20, color: Colors.grey)))
                                                : Container(width: 70, height: 70, color: Colors.grey[200], child: const Icon(Icons.image, color: Colors.grey)),
                                          ),
                                          Positioned(
                                            top: 2,
                                            right: 2,
                                            child: GestureDetector(
                                              onTap: () async {
                                                try {
                                                  await ApiService().deleteMedia(p['id'] as String);
                                                  ref.invalidate(staffPortfolioProvider(s.id));
                                                } catch (e) {
                                                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
                                                }
                                              },
                                              child: Container(decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.all(2), child: const Icon(Icons.close, size: 12, color: Colors.white)),
                                            ),
                                          ),
                                        ]);
                                      },
                                    ),
                                  );
                                },
                                loading: () => const SizedBox(height: 30, child: Center(child: CircularProgressIndicator(strokeWidth: 1.5))),
                                error: (e, _) => Text('Gagal load portfolio: $e', style: const TextStyle(fontSize: 11, color: Colors.red)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddStaffDialog(context, ref),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add),
        label: const Text('Tambah Staf'),
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Tambah Staf'),
        content: Form(key: formKey, child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextFormField(
            controller: nameController,
            decoration: const InputDecoration(labelText: 'Nama', prefixIcon: Icon(Icons.person_outline)),
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
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
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
            child: const Text('Tambah'),
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Ubah Jadwal'),
          content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
            ...schedule.asMap().entries.map((e) {
              final idx = e.key;
              final sc = e.value;
              return Container(
                  constraints: const BoxConstraints(minHeight: 44),
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(children: [
                SizedBox(width: 60, child: Text(dayNames[sc['dayOfWeek'] as int], style: const TextStyle(fontSize: 13))),
                Checkbox(value: !(sc['isOff'] as bool), onChanged: (v)=> setState(()=> schedule[idx]['isOff'] = !(v??false))),
                if (!(sc['isOff'] as bool)) ...[
                  SizedBox(width: 70, child: TextFormField(initialValue: sc['startTime'] as String, onChanged: (v)=> schedule[idx]['startTime']=v, style: const TextStyle(fontSize: 12), decoration: const InputDecoration(isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)))),
                  const Text(' - '),
                  SizedBox(width: 70, child: TextFormField(initialValue: sc['endTime'] as String, onChanged: (v)=> schedule[idx]['endTime']=v, style: const TextStyle(fontSize: 12), decoration: const InputDecoration(isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)))),
                ] else const Text('Libur', style: TextStyle(fontSize: 12, color: Colors.grey)),
              ]));
            }),
          ])),
          actions: [
            TextButton(onPressed: ()=> Navigator.pop(ctx), child: const Text('Batal')),
            TextButton(onPressed: saving ? null : () async {
              setState(()=> saving=true);
              try {
                await ApiService().saveStaffSchedule(staffId, schedule);
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

  Future<void> _pickAndUploadPortfolio(BuildContext context, WidgetRef ref, String staffId) async {
    final picker = ImagePicker();
    // maxWidth/maxHeight penting: imageQuality saja tidak mengecilkan dimensi.
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1280,
      maxHeight: 1280,
      imageQuality: 85,
    );
    if (picked == null) return;
    try {
      await ApiService().uploadMedia(picked.path, 'staff', staffId);
      ref.invalidate(staffPortfolioProvider(staffId));
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Portfolio uploaded'), backgroundColor: Colors.green));
    } catch (e) {
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e'), backgroundColor: Colors.red));
    }
  }

  void _editSpecialtiesDialog(BuildContext context, WidgetRef ref, PartnerStaffRow staff) {
    final ctrl = TextEditingController(text: (staff.specialties ?? []).join(', '));
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Ubah Keahlian - ${staff.displayName}'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(labelText: 'Keahlian (pisahkan koma)', hintText: 'Fade, Undercut, Coloring'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
          TextButton(
            onPressed: () async {
              final val = ctrl.text.trim();
              try {
                await ApiService().updateStaff(staff.id, {'specialties': val});
                ref.invalidate(staffProvider);
                if (ctx.mounted) Navigator.pop(ctx);
                if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Specialties updated'), backgroundColor: Colors.green));
              } catch (e) {
                if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red));
              }
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }
}

class _StaffHeaderStat extends StatelessWidget {
  final String value;
  final String label;
  const _StaffHeaderStat({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.85))),
      ],
    );
  }
}
