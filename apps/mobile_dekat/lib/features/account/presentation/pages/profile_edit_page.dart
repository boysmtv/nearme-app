import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_dekat/core/auth/auth_provider.dart';

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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Ubah Profil'),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _handleSave,
            child: _isSaving
                ? const SizedBox(
                    height: 16,
                    width: 16,
                    child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Simpan'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Form(
          key: _formKey,
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                RepaintBoundary(child: _buildAvatarCard()),
                const SizedBox(height: 16),
                RepaintBoundary(child: _buildFormCard()),
                const SizedBox(height: 20),
                RepaintBoundary(child: _buildSaveButton()),
              ]),
        ),
      ),
    );
  }

  Widget _buildAvatarCard() {
    final name = _nameController.text.trim();
    final initial =
        name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'U';
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(children: [
        Container(
          width: 88,
          height: 88,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [DEKATColors.primary, Color(0xFF4A44C6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          alignment: Alignment.center,
          child: Text(initial,
              style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: Colors.white)),
        ),
        const SizedBox(height: 12),
        const Text('Foto Profil',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text('Kelola informasi akun Anda di bawah ini',
            style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ]),
    );
  }

  Widget _buildFormCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _SectionLabel(title: 'Informasi Pribadi'),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameController,
              decoration: _fieldDecoration(
                  label: 'Nama Lengkap',
                  icon: Icons.person_outlined),
              validator: (v) => (v == null || v.trim().isEmpty)
                  ? 'Nama tidak boleh kosong'
                  : null,
            ),
            const SizedBox(height: 20),
            const _SectionLabel(title: 'Kontak'),
            const SizedBox(height: 12),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: _fieldDecoration(
                  label: 'Email', icon: Icons.email_outlined),
              validator: (v) {
                if (v == null || v.isEmpty) {
                  return 'Email tidak boleh kosong';
                }
                if (!v.contains('@') || !v.contains('.')) {
                  return 'Format email tidak valid';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: _fieldDecoration(
                  label: 'Nomor Telepon',
                  icon: Icons.phone_outlined),
              validator: (v) => (v == null || v.isEmpty)
                  ? 'Nomor telepon tidak boleh kosong'
                  : null,
            ),
          ]),
    );
  }

  Widget _buildSaveButton() {
    return FilledButton(
      style: FilledButton.styleFrom(
        backgroundColor: DEKATColors.primary,
        minimumSize: const Size.fromHeight(52),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      onPressed: _isSaving ? null : _handleSave,
      child: _isSaving
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: Colors.white))
          : const Text('Simpan Perubahan',
              style:
                  TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
    );
  }

  InputDecoration _fieldDecoration(
      {required String label, required IconData icon}) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: Colors.grey[600]),
      filled: true,
      fillColor: const Color(0xFFF8F9FF),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide:
            const BorderSide(color: DEKATColors.primary, width: 1.5),
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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Profil berhasil diperbarui'),
            backgroundColor: Colors.green));
        context.pop();
      }
    } else {
      final err =
          ref.read(authProvider).error ?? 'Gagal memperbarui profil';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err), backgroundColor: Colors.red));
      }
    }
  }
}

class _SectionLabel extends StatelessWidget {
  final String title;
  const _SectionLabel({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(
        width: 4,
        height: 16,
        decoration: BoxDecoration(
          color: DEKATColors.primary,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
      const SizedBox(width: 8),
      Text(title,
          style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: DEKATColors.textPrimary)),
    ]);
  }
}
