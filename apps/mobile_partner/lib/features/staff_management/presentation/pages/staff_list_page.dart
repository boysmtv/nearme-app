import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../shared/models/rows.dart';

final staffProvider = FutureProvider.autoDispose<List<PartnerStaffRow>>((ref) async {
  final response = await ApiService().getStaff();
  return ((response.data['data'] ?? []) as List).map((e) => PartnerStaffRow.fromJson(e as Map<String, dynamic>)).toList();
});

class StaffListPage extends ConsumerWidget {
  const StaffListPage({super.key});

  List<Color> _avatarGradient(int idx, bool active) {
    if (!active) return [Colors.grey[300]!, Colors.grey[100]!];
    final palettes = [DEKATColors.softViolet, DEKATColors.softSky, DEKATColors.softMint, DEKATColors.softPeach, DEKATColors.softLavender, DEKATColors.softPink];
    return palettes[idx % palettes.length];
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staffAsync = ref.watch(staffProvider);

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Row(children: [
              Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softLavender), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: const Color(0xFF9A7BFF).withValues(alpha: 0.22), blurRadius: 10, offset: const Offset(0, 4))]), child: const Icon(Icons.people_rounded, color: Color(0xFF7B61FF), size: 20)),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Staff', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                Text('Kelola tim & jadwal kerja', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500)),
              ])),
              staffAsync.maybeWhen(
                data: (list) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!)),
                  child: Row(children: [
                    Container(width: 7, height: 7, decoration: const BoxDecoration(color: Color(0xFF7ED8A6), shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    Text('${list.where((s) => s.isActive).length} aktif', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ]),
                ),
                orElse: () => const SizedBox(),
              ),
            ]),
          ),
          Expanded(
            child: staffAsync.when(
              data: (staffList) {
                if (staffList.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Container(
                          width: 88, height: 88,
                          decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFF0E8FF), Color(0xFFFAF9FF)]), shape: BoxShape.circle, border: Border.all(color: DEKATColors.softLavender[0].withValues(alpha: 0.25))),
                          child: Icon(Icons.people_outline_rounded, size: 38, color: DEKATColors.softLavender[0].withValues(alpha: 0.9)),
                        ),
                        const SizedBox(height: 16),
                        const Text('Belum ada staff', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                        const SizedBox(height: 6),
                        Text('Tambahkan staff untuk kelola booking lebih efisien ✨', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                        const SizedBox(height: 18),
                        DecoratedBox(
                          decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.22), blurRadius: 10, offset: const Offset(0, 4))]),
                          child: ElevatedButton.icon(onPressed: () => _showAddStaffDialog(context, ref), icon: const Icon(Icons.person_add_rounded, size: 18), label: const Text('Tambah Staff'), style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)))),
                        ),
                      ]),
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(staffProvider),
                  color: DEKATColors.primary,
                  child: ListView.builder(
                    physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
                    itemCount: staffList.length,
                    itemBuilder: (context, index) {
                      final s = staffList[index];
                      final isActive = s.isActive;
                      final grad = _avatarGradient(index, isActive);
                      final initials = s.displayName.isNotEmpty ? s.displayName.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase() : '?';
                      return TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: 1),
                        duration: Duration(milliseconds: 260 + (index % 6) * 45),
                        curve: Curves.easeOutCubic,
                        builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10 * (1 - v)), child: child)),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12, offset: const Offset(0, 4))]),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            leading: Hero(
                              tag: 'staff-${s.id}',
                              child: Container(
                                width: 48, height: 48,
                                decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(14), boxShadow: isActive ? [BoxShadow(color: grad[0].withValues(alpha: 0.22), blurRadius: 8, offset: const Offset(0, 3))] : null),
                                child: Center(child: s.avatarUrl != null && s.avatarUrl!.isNotEmpty ? ClipRRect(borderRadius: BorderRadius.circular(14), child: Image.network(s.avatarUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Text(initials, style: TextStyle(fontWeight: FontWeight.w800, color: isActive ? Colors.white : Colors.grey[600], fontSize: 14)))) : Text(initials, style: TextStyle(fontWeight: FontWeight.w800, color: isActive ? Colors.white : Colors.grey[600], fontSize: 14))),
                              ),
                            ),
                            title: Text(s.displayName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 3),
                              child: Row(children: [
                                Container(padding: const EdgeInsets.all(3), decoration: BoxDecoration(color: grad[1], borderRadius: BorderRadius.circular(6)), child: Icon(Icons.work_outline_rounded, size: 10, color: grad[0])),
                                const SizedBox(width: 6),
                                Expanded(child: Text(s.title ?? 'Staff', style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis)),
                              ]),
                            ),
                            trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                decoration: BoxDecoration(color: isActive ? const Color(0xFFE6F7EE) : Colors.grey[100], borderRadius: BorderRadius.circular(20), border: Border.all(color: isActive ? const Color(0xFF7ED8A6).withValues(alpha: 0.4) : Colors.grey[300]!)),
                                child: Row(mainAxisSize: MainAxisSize.min, children: [
                                  Container(width: 6, height: 6, decoration: BoxDecoration(color: isActive ? const Color(0xFF4CAF7D) : Colors.grey, shape: BoxShape.circle)),
                                  const SizedBox(width: 6),
                                  Text(isActive ? 'Active' : 'Inactive', style: TextStyle(fontSize: 11, color: isActive ? const Color(0xFF2E7D5B) : Colors.grey[600], fontWeight: FontWeight.w700)),
                                ]),
                              ),
                              const SizedBox(width: 4),
                              PopupMenuButton<String>(
                                icon: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.more_horiz_rounded, size: 16, color: Colors.grey[600])),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: DEKATColors.error, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))));
                                    }
                                  }
                                },
                                itemBuilder: (_) => [
                                  const PopupMenuItem(value: 'schedule', child: Row(children: [Icon(Icons.schedule_rounded, size: 16), SizedBox(width: 8), Text('Edit Schedule')])),
                                  if (isActive) const PopupMenuItem(value: 'deactivate', child: Row(children: [Icon(Icons.block_rounded, size: 16, color: DEKATColors.error), SizedBox(width: 8), Text('Deactivate', style: TextStyle(color: DEKATColors.error))] )) else const PopupMenuItem(value: 'activate', child: Row(children: [Icon(Icons.check_circle_rounded, size: 16, color: Color(0xFF4CAF7D)), SizedBox(width: 8), Text('Activate')])),
                                ],
                              ),
                            ]),
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 4,
                itemBuilder: (_, __) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Shimmer.fromColors(baseColor: Colors.grey[200]!, highlightColor: Colors.grey[50]!, child: Container(height: 68, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
                ),
              ),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Container(padding: const EdgeInsets.all(12), decoration: const BoxDecoration(color: DEKATColors.errorLight, shape: BoxShape.circle), child: const Icon(Icons.cloud_off_rounded, color: DEKATColors.error)),
                      const SizedBox(height: 12),
                      const Text('Gagal memuat staff', style: TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(height: 14),
                      FilledButton.icon(onPressed: () => ref.invalidate(staffProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba lagi')),
                    ]),
                  ),
                ),
              ),
            ),
          ),
        ]),
      ),
      floatingActionButton: DecoratedBox(
        decoration: BoxDecoration(gradient: const LinearGradient(colors: [DEKATColors.primary, Color(0xFFA48BFF)]), borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.28), blurRadius: 12, offset: const Offset(0, 6))]),
        child: FloatingActionButton.extended(
          backgroundColor: Colors.transparent,
          elevation: 0,
          onPressed: () => _showAddStaffDialog(context, ref),
          icon: const Icon(Icons.person_add_rounded, color: Colors.white),
          label: const Text('Add Staff', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }

  void _showAddStaffDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.person_add_rounded, size: 18, color: Colors.white)),
          const SizedBox(width: 10),
          const Text('Add Staff', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        ]),
        content: Form(
          key: formKey,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextFormField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'Name',
                hintText: 'Andi Saputra',
                prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softViolet[1], borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.person_rounded, size: 16, color: DEKATColors.primary)),
              ),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'Email',
                hintText: 'andi@dekat.id',
                prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softSky[1], borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.email_rounded, size: 16, color: Color(0xFF5AA9E6))),
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Required';
                if (!v.contains('@') || !v.contains('.')) return 'Invalid email';
                return null;
              },
            ),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          DecoratedBox(
            decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(12)),
            child: ElevatedButton(
              onPressed: () async {
                if (formKey.currentState!.validate()) {
                  try {
                    await ApiService().addStaff({'displayName': nameController.text.trim(), 'email': emailController.text.trim()});
                    ref.invalidate(staffProvider);
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Row(children: [Icon(Icons.check_circle_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('Staff berhasil ditambahkan 🎉')]), backgroundColor: const Color(0xFF4CAF7D), behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))));
                  } catch (e) {
                    if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Failed to add staff: $e'), backgroundColor: DEKATColors.error));
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Add', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  void _showScheduleDialog(BuildContext context, WidgetRef ref, String staffId) {
    final dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    List<Map<String, dynamic>> schedule = List.generate(7, (i) => {'dayOfWeek': i, 'startTime': '09:00', 'endTime': '17:00', 'isOff': i == 6});
    bool saving = false;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (context, setState) {
        return AlertDialog(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.schedule_rounded, size: 18, color: Color(0xFF5AA9E6))),
            const SizedBox(width: 10),
            const Text('Edit Schedule', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          ]),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(color: DEKATColors.softPeach[1], borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.softPeach[0].withValues(alpha: 0.22))),
                child: Row(children: [Icon(Icons.info_rounded, size: 14, color: DEKATColors.softPeach[0]), const SizedBox(width: 7), Expanded(child: Text('Atur jam kerja per hari', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey[800])))]),
              ),
              const SizedBox(height: 12),
              ...schedule.asMap().entries.map((e) {
                final idx = e.key;
                final sc = e.value;
                final isOff = sc['isOff'] as bool;
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(color: isOff ? Colors.grey[50] : Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: isOff ? Colors.grey[200]! : DEKATColors.primary.withValues(alpha: 0.12))),
                  child: Row(children: [
                    SizedBox(width: 56, child: Text(dayNames[sc['dayOfWeek'] as int], style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: isOff ? Colors.grey[500] : DEKATColors.textPrimary))),
                    Transform.scale(
                      scale: 0.9,
                      child: Switch(value: !(sc['isOff'] as bool), onChanged: (v) => setState(() => schedule[idx]['isOff'] = !(v)), activeColor: DEKATColors.primary),
                    ),
                    if (!(sc['isOff'] as bool)) ...[
                      Expanded(child: TextFormField(initialValue: sc['startTime'] as String, onChanged: (v) => schedule[idx]['startTime'] = v, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600), textAlign: TextAlign.center, decoration: InputDecoration(isDense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8), filled: true, fillColor: DEKATColors.softViolet[1], border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none)))),
                      Padding(padding: const EdgeInsets.symmetric(horizontal: 6), child: Text('—', style: TextStyle(color: Colors.grey[400]))),
                      Expanded(child: TextFormField(initialValue: sc['endTime'] as String, onChanged: (v) => schedule[idx]['endTime'] = v, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600), textAlign: TextAlign.center, decoration: InputDecoration(isDense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8), filled: true, fillColor: DEKATColors.softViolet[1], border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none)))),
                    ] else
                      Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(20)), child: Text('Libur', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[600]))),
                  ]),
                );
              }),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
            DecoratedBox(
              decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(12)),
              child: ElevatedButton(
                onPressed: saving
                    ? null
                    : () async {
                        setState(() => saving = true);
                        try {
                          await ApiService().dio.post('/provider/staff/$staffId/schedule', data: schedule);
                          if (ctx.mounted) Navigator.pop(ctx);
                          if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Row(children: [Icon(Icons.check_circle_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('Jadwal tersimpan 🎉')]), backgroundColor: const Color(0xFF4CAF7D), behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))));
                        } catch (e) {
                          if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: DEKATColors.error));
                        } finally {
                          if (ctx.mounted) setState(() => saving = false);
                        }
                      },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: Text(saving ? 'Menyimpan...' : 'Simpan', style: const TextStyle(color: Color(0xFF2E5A8A), fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        );
      }),
    );
  }
}
