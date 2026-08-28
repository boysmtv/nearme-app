import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:mobile_customer/core/router/app_router.dart';

class ProfileCompletePage extends ConsumerStatefulWidget {
  const ProfileCompletePage({super.key});
  @override
  ConsumerState<ProfileCompletePage> createState() => _ProfileCompletePageState();
}

class _ProfileCompletePageState extends ConsumerState<ProfileCompletePage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, automaticallyImplyLeading: false, title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.person_add_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('Complete Profile', style: TextStyle(fontWeight: FontWeight.w800))]), centerTitle: true),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 600), curve: Curves.elasticOut, builder: (c,v,ch)=> Transform.scale(scale: 0.8+0.2*v, child: ch), child: Container(width: 86, height: 86, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight), shape: BoxShape.circle, boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.24), blurRadius: 20, offset: const Offset(0, 8))]), child: const Icon(Icons.person_add_alt_1_rounded, size: 42, color: Colors.white))),
            const SizedBox(height: 18),
            TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Column(children: [
              const Text('Complete your profile ✨', textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
              const SizedBox(height: 8),
              Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08))), child: Text('We need a bit more info to finish your booking experience', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500))),
            ])),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
              child: Column(children: [
                TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(labelText: 'Full Name', hintText: 'e.g. Budi Santoso', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.person_rounded, color: DEKATColors.primary, size: 18)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none), filled: true, fillColor: DEKATColors.backgroundLight),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(labelText: 'Phone Number', hintText: '+62 8xx xxxx xxxx', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.successLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.phone_rounded, color: DEKATColors.success, size: 18)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none), filled: true, fillColor: DEKATColors.backgroundLight),
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter your phone number' : null,
                ),
              ]),
            ),
            const SizedBox(height: 16),
            if (authState.error != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.18))),
                child: Row(children: [const Icon(Icons.error_rounded, color: DEKATColors.error, size: 16), const SizedBox(width: 8), Expanded(child: Text(authState.error!, style: const TextStyle(color: DEKATColors.error, fontSize: 12, fontWeight: FontWeight.w600)))]),
              ),
            if (authState.error != null) const SizedBox(height: 14),
            Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.26), blurRadius: 12, offset: const Offset(0, 4))]), child: FilledButton(onPressed: _isSaving ? null : _handleSave, style: FilledButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: _isSaving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.check_circle_rounded, color: Colors.white, size: 18), SizedBox(width: 8), Text('Save & Continue ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))]))),
            const SizedBox(height: 12),
            TextButton(onPressed: () => ref.read(authProvider.notifier).logout().then((_) => context.go('/login')), style: TextButton.styleFrom(foregroundColor: Colors.grey[600]), child: const Text('Logout', style: TextStyle(fontWeight: FontWeight.w600))),
          ]),
        ),
      ),
    );
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    final success = await ref.read(authProvider.notifier).updateProfileRemote(
          name: _nameController.text.trim(),
          phone: _phoneController.text.trim(),
          email: ref.read(authProvider).user?.email,
        );
    if (!mounted) return;
    setState(() => _isSaving = false);
    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile completed ✨'), backgroundColor: DEKATColors.success));
      if (!mounted) return;
      context.go('/discovery');
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ref.read(authProvider).error ?? 'Failed to update profile'), backgroundColor: DEKATColors.error));
    }
  }
}
