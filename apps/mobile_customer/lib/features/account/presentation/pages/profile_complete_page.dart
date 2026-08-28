import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
      appBar: AppBar(title: const Text('Complete Profile'), automaticallyImplyLeading: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const Icon(Icons.person_add_alt_1, size: 80, color: Colors.blueGrey),
            const SizedBox(height: 16),
            const Text('Complete your profile', textAlign: TextAlign.center, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('We need a bit more info to finish your booking experience',
                textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 32),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person_outlined), border: OutlineInputBorder()),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone Number', prefixIcon: Icon(Icons.phone_outlined), border: OutlineInputBorder()),
              validator: (v) => (v == null || v.isEmpty) ? 'Please enter your phone number' : null,
            ),
            const SizedBox(height: 24),
            if (authState.error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                child: Text(authState.error!, style: const TextStyle(color: Colors.red)),
              ),
            if (authState.error != null) const SizedBox(height: 12),
            FilledButton(
              onPressed: _isSaving ? null : _handleSave,
              child: _isSaving
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Save & Continue'),
            ),
            const SizedBox(height: 12),
            TextButton(onPressed: () => ref.read(authProvider.notifier).logout().then((_) => context.go('/login')), child: const Text('Logout')),
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile completed'), backgroundColor: Colors.green));
      if (!mounted) return;
      context.go('/discovery');
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ref.read(authProvider).error ?? 'Failed to update profile'), backgroundColor: Colors.red));
    }
  }
}
