import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class ServicesPage extends ConsumerStatefulWidget {
  const ServicesPage({super.key});

  @override
  ConsumerState<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends ConsumerState<ServicesPage> {
  List<dynamic> _services = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService().getProviderServicesList();
      final data = response.data['data'];
      setState(() {
        _services = data is List ? data : [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  String _formatRupiah(dynamic value) {
    final amount = (value as num?)?.toInt() ?? 0;
    final text = amount.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
    return 'Rp $text';
  }

  @override
  Widget build(BuildContext context) {
    final activeCount = _services.where((s) => (s['isActive'] ?? true) == true).length;
    final inactiveCount = _services.length - activeCount;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Layanan'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Tambah layanan',
            onPressed: () => _showCreateServiceDialog(),
          ),
        ],
      ),
      floatingActionButton: _loading || _services.isEmpty
          ? null
          : FloatingActionButton.extended(
              onPressed: () => _showCreateServiceDialog(),
              backgroundColor: DEKATColors.primary,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add),
              label: const Text('Tambah'),
            ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _services.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            color: DEKATColors.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.design_services_outlined, size: 44, color: DEKATColors.primary),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Belum ada layanan',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Tambahkan layanan agar pelanggan bisa memesan',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey[600], fontSize: 13),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: () => _showCreateServiceDialog(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DEKATColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('Tambah Layanan'),
                        ),
                      ],
                    ),
                  ),
                )
              : Column(
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
                            Expanded(child: _HeaderStat(value: '${_services.length}', label: 'Total')),
                            Container(width: 1, height: 36, color: Colors.white.withValues(alpha: 0.3)),
                            Expanded(child: _HeaderStat(value: '$activeCount', label: 'Aktif')),
                            Container(width: 1, height: 36, color: Colors.white.withValues(alpha: 0.3)),
                            Expanded(child: _HeaderStat(value: '$inactiveCount', label: 'Nonaktif')),
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: _loadServices,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
                          itemCount: _services.length,
                          itemBuilder: (context, index) {
                            final service = _services[index];
                            final isActive = service['isActive'] ?? true;
                            final name = service['name'] ?? 'Layanan';
                            final price = _formatRupiah(service['price']);
                            final duration = service['duration'] ?? service['durationMinutes'] ?? 0;
                            final description = (service['description'] as String?) ?? '';
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
                                          Container(
                                            width: 48,
                                            height: 48,
                                            decoration: BoxDecoration(
                                              color: DEKATColors.primary.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(14),
                                            ),
                                            child: Icon(Icons.spa, color: DEKATColors.primary, size: 24),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(name.toString(),
                                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                                const SizedBox(height: 2),
                                                Text(
                                                  price,
                                                  style: TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 14,
                                                      color: DEKATColors.primary),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                            decoration: BoxDecoration(
                                              color: isActive ? Colors.green[50] : Colors.grey[100],
                                              borderRadius: BorderRadius.circular(20),
                                              border: Border.all(
                                                  color: isActive ? Colors.green.shade200 : Colors.grey.shade300),
                                            ),
                                            child: Text(
                                              isActive ? 'Aktif' : 'Nonaktif',
                                              style: TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w600,
                                                  color: isActive ? Colors.green[700] : Colors.grey[600]),
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (description.isNotEmpty) ...[
                                        const SizedBox(height: 8),
                                        Text(description,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                      ],
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF8F9FF),
                                              borderRadius: BorderRadius.circular(8),
                                              border: Border.all(color: Colors.grey.shade200),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(Icons.schedule_outlined, size: 14, color: Colors.grey[600]),
                                                const SizedBox(width: 4),
                                                Text('$duration mnt',
                                                    style: TextStyle(fontSize: 12, color: Colors.grey[700])),
                                              ],
                                            ),
                                          ),
                                          const Spacer(),
                                          Text(
                                            isActive ? 'Tampilkan' : 'Sembunyikan',
                                            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                          ),
                                          Switch(
                                            value: isActive,
                                            activeThumbColor: DEKATColors.primary,
                                            onChanged: (val) => _toggleService(service['id'], val),
                                          ),
                                          Container(
                                            decoration: BoxDecoration(
                                              color: DEKATColors.primary.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: IconButton(
                                              icon: Icon(Icons.edit_outlined, size: 20, color: DEKATColors.primary),
                                              tooltip: 'Ubah layanan',
                                              onPressed: () => _showEditServiceDialog(service),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  void _showCreateServiceDialog() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final durationCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Tambah Layanan'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nama')),
            TextField(controller: priceCtrl, decoration: const InputDecoration(labelText: 'Harga (Rp)'), keyboardType: TextInputType.number),
            TextField(controller: durationCtrl, decoration: const InputDecoration(labelText: 'Durasi (menit)'), keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: DEKATColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              final navigator = Navigator.of(context);
              final messenger = ScaffoldMessenger.of(context);
              try {
                await ApiService().createService({
                  'name': nameCtrl.text,
                  'price': int.tryParse(priceCtrl.text) ?? 0,
                  'durationMinutes': int.tryParse(durationCtrl.text) ?? 30,
                });
                navigator.pop();
                _loadServices();
              } catch (e) {
                if (mounted) messenger.showSnackBar(SnackBar(content: Text('Failed: $e')));
              }
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _showEditServiceDialog(dynamic service) {
    final nameCtrl = TextEditingController(text: service['name'] ?? '');
    final priceCtrl = TextEditingController(text: (service['price'] ?? 0).toString());
    final durationCtrl = TextEditingController(text: (service['duration'] ?? service['durationMinutes'] ?? 30).toString());
    final descCtrl = TextEditingController(text: service['description'] ?? '');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Edit Layanan'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nama')),
              const SizedBox(height: 8),
              TextField(controller: priceCtrl, decoration: const InputDecoration(labelText: 'Harga'), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: durationCtrl, decoration: const InputDecoration(labelText: 'Durasi (menit)'), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Deskripsi'), maxLines: 2),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: DEKATColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              final navigator = Navigator.of(context);
              final messenger = ScaffoldMessenger.of(context);
              try {
                await ApiService().updateService(service['id'], {
                  'name': nameCtrl.text,
                  'price': int.tryParse(priceCtrl.text) ?? 0,
                  'durationMinutes': int.tryParse(durationCtrl.text) ?? 30,
                  'description': descCtrl.text,
                });
                navigator.pop();
                _loadServices();
              } catch (e) {
                if (mounted) messenger.showSnackBar(SnackBar(content: Text('Gagal: $e')));
              }
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _toggleService(String id, bool active) async {
    try {
      await ApiService().updateService(id, {'isActive': active});
      _loadServices();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }
}

class _HeaderStat extends StatelessWidget {
  final String value;
  final String label;
  const _HeaderStat({required this.value, required this.label});

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
