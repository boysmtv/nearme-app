import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final settingsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  try {
    final res = await ApiService().getSettings();
    return (res.data['data'] as Map<String, dynamic>?) ?? {};
  } catch (_) {
    return {};
  }
});

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  bool _dirty = false;
  bool _autoConfirm = false;
  bool _depositRequired = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  void _markDirty() {
    if (!_dirty) setState(() => _dirty = true);
  }

  @override
  Widget build(BuildContext context) {
    final settingsAsync = ref.watch(settingsProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Pengaturan',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('Kelola profil & preferensi bisnis',
                style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                    fontWeight: FontWeight.w400)),
          ],
        ),
        actions: [
          if (_dirty)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: TextButton(
                onPressed: _save,
                style: TextButton.styleFrom(
                  backgroundColor:
                      DEKATColors.primary.withValues(alpha: 0.1),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Simpan',
                    style: TextStyle(
                        color: DEKATColors.primary,
                        fontWeight: FontWeight.w800)),
              ),
            ),
        ],
      ),
      body: settingsAsync.when(
        data: (settings) {
          if (_nameCtrl.text.isEmpty && settings.isNotEmpty) {
            _nameCtrl.text = settings['name'] ?? '';
            _descCtrl.text = settings['description'] ?? '';
            _phoneCtrl.text = settings['phone'] ?? '';
            _emailCtrl.text = settings['email'] ?? '';
            _addressCtrl.text = settings['address'] ?? '';
            _autoConfirm = settings['autoConfirm'] ?? false;
            _depositRequired = settings['depositRequired'] ?? false;
          }
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            children: [
              RepaintBoundary(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [DEKATColors.primary, Color(0xFF8B7CFF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          _nameCtrl.text.isNotEmpty
                              ? _nameCtrl.text[0].toUpperCase()
                              : 'B',
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 22),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _nameCtrl.text.isNotEmpty
                                  ? _nameCtrl.text
                                  : 'Bisnis Anda',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _emailCtrl.text.isNotEmpty
                                  ? _emailCtrl.text
                                  : 'Lengkapi profil bisnis di bawah',
                              style: TextStyle(
                                  color: Colors.white
                                      .withValues(alpha: 0.85),
                                  fontSize: 12),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              _sectionLabel(Icons.store_rounded, 'Profil Bisnis'),
              const SizedBox(height: 8),
              RepaintBoundary(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: _nameCtrl,
                        decoration: InputDecoration(
                          labelText: 'Nama Bisnis',
                          prefixIcon: const Icon(Icons.store_outlined,
                              color: DEKATColors.primary),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _descCtrl,
                        decoration: InputDecoration(
                          labelText: 'Deskripsi',
                          prefixIcon: const Icon(Icons.description_outlined,
                              color: DEKATColors.primary),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        maxLines: 3,
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _phoneCtrl,
                        decoration: InputDecoration(
                          labelText: 'Telepon',
                          prefixIcon: const Icon(Icons.phone_outlined,
                              color: DEKATColors.primary),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        keyboardType: TextInputType.phone,
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _emailCtrl,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          prefixIcon: const Icon(Icons.email_outlined,
                              color: DEKATColors.primary),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _addressCtrl,
                        decoration: InputDecoration(
                          labelText: 'Alamat',
                          prefixIcon: const Icon(Icons.location_on_outlined,
                              color: DEKATColors.primary),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        maxLines: 2,
                        onChanged: (_) => _markDirty(),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              _sectionLabel(Icons.tune_rounded, 'Preferensi Booking'),
              const SizedBox(height: 8),
              RepaintBoundary(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: SwitchListTile(
                    secondary: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: DEKATColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.verified_outlined,
                          color: DEKATColors.primary, size: 22),
                    ),
                    title: const Text('Konfirmasi otomatis',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: const Text('Konfirmasi otomatis tanpa review',
                        style: TextStyle(fontSize: 12)),
                    value: _autoConfirm,
                    activeThumbColor: DEKATColors.primary,
                    onChanged: (v) {
                      setState(() {
                        _autoConfirm = v;
                        _dirty = true;
                      });
                    },
                  ),
                ),
              ),
              const SizedBox(height: 10),
              RepaintBoundary(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: SwitchListTile(
                    secondary: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE6F7EE),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.payments_outlined,
                          color: Color(0xFF4CAF50), size: 22),
                    ),
                    title: const Text('Wajib deposit',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: const Text('Wajibkan deposit saat booking',
                        style: TextStyle(fontSize: 12)),
                    value: _depositRequired,
                    activeThumbColor: DEKATColors.primary,
                    onChanged: (v) {
                      setState(() {
                        _depositRequired = v;
                        _dirty = true;
                      });
                    },
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(
            child: CircularProgressIndicator(color: DEKATColors.primary)),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: RepaintBoundary(
              child: Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.settings_outlined,
                        size: 40, color: Colors.grey[300]),
                    const SizedBox(height: 12),
                    const Text('Gagal memuat pengaturan',
                        style: TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text('Error: $e',
                        style:
                            TextStyle(color: Colors.grey[600], fontSize: 12),
                        textAlign: TextAlign.center),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _sectionLabel(IconData icon, String title) {
    return Row(
      children: [
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: DEKATColors.primary.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: DEKATColors.primary, size: 16),
        ),
        const SizedBox(width: 8),
        Text(title,
            style: const TextStyle(
                fontWeight: FontWeight.w800, fontSize: 14)),
      ],
    );
  }

  Future<void> _save() async {
    try {
      await ApiService().updateSettings({
        'name': _nameCtrl.text,
        'description': _descCtrl.text,
        'phone': _phoneCtrl.text,
        'email': _emailCtrl.text,
        'address': _addressCtrl.text,
        'autoConfirm': _autoConfirm,
        'depositRequired': _depositRequired,
      });
      ref.invalidate(settingsProvider);
      setState(() => _dirty = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengaturan tersimpan'), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red));
    }
  }
}
