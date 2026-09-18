import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_dekat/core/auth/auth_provider.dart';

class ProfileCompletePage extends ConsumerStatefulWidget {
  const ProfileCompletePage({super.key});
  @override
  ConsumerState<ProfileCompletePage> createState() =>
      _ProfileCompletePageState();
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
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
          title: const Text('Lengkapi Profil'),
          centerTitle: true,
          automaticallyImplyLeading: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Form(
          key: _formKey,
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            RepaintBoundary(child: _buildWelcomeCard()),
            const SizedBox(height: 16),
            RepaintBoundary(child: _buildStepsCard()),
            const SizedBox(height: 16),
            RepaintBoundary(child: _buildFormCard(authState.error)),
            const SizedBox(height: 20),
            RepaintBoundary(
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: DEKATColors.primary,
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: _isSaving ? null : _handleSave,
                child: _isSaving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Text('Simpan & Lanjutkan',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 4),
            TextButton(
                onPressed: () async {
                  final nav = GoRouter.of(context);
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) nav.go('/login');
                },
                child: const Text('Keluar')),
          ]),
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [DEKATColors.primary, Color(0xFF4A44C6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withValues(alpha: 0.2),
            border: Border.all(
                color: Colors.white.withValues(alpha: 0.6), width: 2),
          ),
          child: const Icon(Icons.person_add_alt_1_rounded,
              size: 36, color: Colors.white),
        ),
        const SizedBox(height: 12),
        const Text('Selamat Datang di DEKAT!',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white)),
        const SizedBox(height: 6),
        Text('Satu langkah lagi untuk pengalaman booking terbaik',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white.withValues(alpha: 0.85),
                fontSize: 13)),
      ]),
    );
  }

  Widget _buildStepsCard() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: const Row(children: [
        Expanded(
            child: _StepItem(
                icon: Icons.check_circle_rounded,
                label: 'Daftar',
                state: _StepState.done)),
        _StepConnector(done: true),
        Expanded(
            child: _StepItem(
                icon: Icons.edit_note_rounded,
                label: 'Lengkapi Profil',
                state: _StepState.current)),
        _StepConnector(done: false),
        Expanded(
            child: _StepItem(
                icon: Icons.calendar_month_rounded,
                label: 'Mulai Booking',
                state: _StepState.todo)),
      ]),
    );
  }

  Widget _buildFormCard(String? error) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child:
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const _SectionLabel(title: 'Data Diri'),
        const SizedBox(height: 12),
        TextFormField(
          controller: _nameController,
          decoration: _fieldDecoration(
              label: 'Nama Lengkap', icon: Icons.person_outlined),
          validator: (v) => (v == null || v.trim().isEmpty)
              ? 'Nama tidak boleh kosong'
              : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: _fieldDecoration(
              label: 'Nomor Telepon', icon: Icons.phone_outlined),
          validator: (v) => (v == null || v.isEmpty)
              ? 'Nomor telepon tidak boleh kosong'
              : null,
        ),
        if (error != null) ...[
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8)),
            child: Text(error, style: const TextStyle(color: Colors.red)),
          ),
        ],
      ]),
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
          phone: _phoneController.text.trim(),
          email: ref.read(authProvider).user?.email,
        );
    if (!mounted) return;
    setState(() => _isSaving = false);
    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Profil berhasil dilengkapi'),
          backgroundColor: Colors.green));
      if (!mounted) return;
      context.go('/discovery');
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(ref.read(authProvider).error ??
              'Gagal memperbarui profil'),
          backgroundColor: Colors.red));
    }
  }
}

enum _StepState { done, current, todo }

class _StepItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final _StepState state;
  const _StepItem(
      {required this.icon, required this.label, required this.state});

  @override
  Widget build(BuildContext context) {
    final Color color;
    final Color bg;
    final FontWeight weight;
    switch (state) {
      case _StepState.done:
        color = Colors.green;
        bg = Colors.green.withValues(alpha: 0.1);
        weight = FontWeight.w600;
      case _StepState.current:
        color = DEKATColors.primary;
        bg = DEKATColors.primary.withValues(alpha: 0.1);
        weight = FontWeight.bold;
      case _StepState.todo:
        color = Colors.grey.shade400;
        bg = Colors.grey.shade100;
        weight = FontWeight.normal;
    }
    return Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(shape: BoxShape.circle, color: bg),
        child: Icon(icon, color: color, size: 24),
      ),
      const SizedBox(height: 6),
      Text(label,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 11, color: color, fontWeight: weight)),
    ]);
  }
}

class _StepConnector extends StatelessWidget {
  final bool done;
  const _StepConnector({required this.done});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 24, left: 4, right: 4),
        decoration: BoxDecoration(
          color: done ? Colors.green : Colors.grey.shade300,
          borderRadius: BorderRadius.circular(1),
        ),
      ),
    );
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
