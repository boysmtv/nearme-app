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
      appBar: AppBar(
        title: const Text('Pengaturan'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        actions: [
          if (_dirty)
            TextButton(
              onPressed: _save,
              child: const Text('Simpan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Profil Bisnis', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _nameCtrl,
                        decoration: const InputDecoration(labelText: 'Nama Bisnis', border: OutlineInputBorder()),
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _descCtrl,
                        decoration: const InputDecoration(labelText: 'Deskripsi', border: OutlineInputBorder()),
                        maxLines: 3,
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _phoneCtrl,
                        decoration: const InputDecoration(labelText: 'Telepon', border: OutlineInputBorder()),
                        keyboardType: TextInputType.phone,
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _emailCtrl,
                        decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                        keyboardType: TextInputType.emailAddress,
                        onChanged: (_) => _markDirty(),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _addressCtrl,
                        decoration: const InputDecoration(labelText: 'Alamat', border: OutlineInputBorder()),
                        maxLines: 2,
                        onChanged: (_) => _markDirty(),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: SwitchListTile(
                  title: const Text('Auto-confirm bookings'),
                  subtitle: const Text('Konfirmasi otomatis tanpa review'),
                  value: _autoConfirm,
                  onChanged: (v) {
                    setState(() {
                      _autoConfirm = v;
                      _dirty = true;
                    });
                  },
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: SwitchListTile(
                  title: const Text('Deposit required'),
                  subtitle: const Text('Wajibkan deposit saat booking'),
                  value: _depositRequired,
                  onChanged: (v) {
                    setState(() {
                      _depositRequired = v;
                      _dirty = true;
                    });
                  },
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
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
