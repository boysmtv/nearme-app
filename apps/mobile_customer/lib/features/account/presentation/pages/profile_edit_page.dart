import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:mobile_customer/core/router/app_router.dart';

class ProfileEditPage extends ConsumerStatefulWidget {
  const ProfileEditPage({super.key});
  @override
  ConsumerState<ProfileEditPage> createState() => _ProfileEditPageState();
}

class _ProfileEditPageState extends ConsumerState<ProfileEditPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(mainAxisSize: MainAxisSize.min, children: [Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.edit_rounded, color: Colors.white, size: 18)), const SizedBox(width: 10), const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.w800))]),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.22), blurRadius: 8)]),
            child: TextButton(
              onPressed: _isSaving ? null : _handleSave,
              style: TextButton.styleFrom(foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: _isSaving
                  ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Save', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(children: [
            TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutBack, builder: (c,v,ch)=> Transform.scale(scale: 0.9+0.1*v, child: ch), child: Stack(alignment: Alignment.bottomRight, children: [
              Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), shape: BoxShape.circle, boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.2), blurRadius: 16)]), child: CircleAvatar(radius: 56, backgroundColor: Colors.white, child: CircleAvatar(radius: 52, backgroundColor: DEKATColors.primaryLight, child: const Icon(Icons.person_rounded, size: 48, color: DEKATColors.primary)))),
              Container(padding: const EdgeInsets.all(7), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)), child: const Icon(Icons.camera_alt_rounded, size: 16, color: Colors.white)),
            ])),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14)]),
              child: Column(children: [
                TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(labelText: 'Full Name', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.person_rounded, color: DEKATColors.primary, size: 18)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none), filled: true, fillColor: DEKATColors.backgroundLight),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(labelText: 'Email', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.softSky.last, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.email_rounded, color: DEKATColors.info, size: 18)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none), filled: true, fillColor: DEKATColors.backgroundLight),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Please enter your email';
                    if (!v.contains('@') || !v.contains('.')) return 'Please enter a valid email';
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(labelText: 'Phone Number', prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(7), decoration: BoxDecoration(color: DEKATColors.successLight, borderRadius: BorderRadius.circular(9)), child: const Icon(Icons.phone_rounded, color: DEKATColors.success, size: 18)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none), filled: true, fillColor: DEKATColors.backgroundLight),
                  validator: (v) => (v == null || v.isEmpty) ? 'Please enter your phone number' : null,
                ),
              ]),
            ),
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
          email: _emailController.text.trim(),
          phone: _phoneController.text.trim(),
        );
    if (!mounted) return;
    setState(() => _isSaving = false);
    if (success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated ✨'), backgroundColor: DEKATColors.success));
        context.pop();
      }
    } else {
      final err = ref.read(authProvider).error ?? 'Failed to update profile';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err), backgroundColor: DEKATColors.error));
      }
    }
  }
}
