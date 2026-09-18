import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

final couponsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ApiService().getCoupons();
    final data = (res.data['data'] ?? []) as List;
    return data.cast<Map<String, dynamic>>();
  } catch (e) {
    return [];
  }
});

final campaignsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ApiService().getCampaigns();
    final data = (res.data['data'] ?? []) as List;
    return data.cast<Map<String, dynamic>>();
  } catch (e) {
    return [];
  }
});

class PromotionsPage extends ConsumerStatefulWidget {
  const PromotionsPage({super.key});

  @override
  ConsumerState<PromotionsPage> createState() => _PromotionsPageState();
}

class _PromotionsPageState extends ConsumerState<PromotionsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Promosi',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1D26),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: DEKATColors.primary,
          unselectedLabelColor: Colors.grey,
          indicatorColor: DEKATColors.primary,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Kupon'),
            Tab(text: 'Kampanye'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCouponsTab(),
          _buildCampaignsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        onPressed: () {
          if (_tabController.index == 0) {
            _showCreateCouponDialog();
          } else {
            _showCreateCampaignDialog();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildCouponsTab() {
    final couponsAsync = ref.watch(couponsProvider);
    return couponsAsync.when(
      data: (coupons) {
        if (coupons.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Icon(Icons.local_offer_outlined,
                      size: 48, color: Colors.grey[300]),
                ),
                const SizedBox(height: 16),
                const Text('Belum ada kupon',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('Buat kupon diskon untuk menarik pelanggan',
                    style: TextStyle(fontSize: 13, color: Colors.grey[500])),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () => _showCreateCouponDialog(),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Buat Kupon'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DEKATColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () async { ref.invalidate(couponsProvider); },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: coupons.length,
            itemBuilder: (context, index) {
              final coupon = coupons[index];
              final isActive = coupon['active'] ?? true;
              final discountType = coupon['discountType'] ?? 'FLAT';
              final discountValue = coupon['discountValue'] ?? 0;
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isActive
                              ? DEKATColors.primary.withValues(alpha: 0.06)
                              : Colors.grey.shade50,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(16),
                            topRight: Radius.circular(16),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: isActive
                                    ? DEKATColors.primary
                                    : Colors.grey.shade300,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.local_offer,
                                  color: Colors.white, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    coupon['code'] ?? '',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        letterSpacing: 1.2),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    discountType == 'PERCENTAGE'
                                        ? 'Diskon ${discountValue.toString()}%'
                                        : 'Diskon Rp ${discountValue.toString()}',
                                    style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: DEKATColors.primary),
                                  ),
                                ],
                              ),
                            ),
                            _StatusBadge(
                                label: isActive ? 'Aktif' : 'Nonaktif',
                                active: isActive),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (coupon['minOrder'] != null &&
                                coupon['minOrder'] > 0)
                              _MetaRow(
                                  icon: Icons.shopping_cart_outlined,
                                  text:
                                      'Min. order: Rp ${coupon['minOrder']}'),
                            if (coupon['maxDiscount'] != null &&
                                coupon['maxDiscount'] > 0)
                              _MetaRow(
                                  icon: Icons.savings_outlined,
                                  text:
                                      'Maks. diskon: Rp ${coupon['maxDiscount']}'),
                            if (coupon['expiresAt'] != null)
                              _MetaRow(
                                  icon: Icons.event_outlined,
                                  text:
                                      'Berlaku hingga: ${coupon['expiresAt']}'),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                TextButton.icon(
                                  icon: const Icon(Icons.delete_outline,
                                      size: 18, color: Colors.red),
                                  label: const Text('Hapus',
                                      style: TextStyle(color: Colors.red)),
                                  onPressed: () =>
                                      _deleteCoupon(coupon['id']),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildCampaignsTab() {
    final campaignsAsync = ref.watch(campaignsProvider);
    return campaignsAsync.when(
      data: (campaigns) {
        if (campaigns.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Icon(Icons.campaign_outlined,
                      size: 48, color: Colors.grey[300]),
                ),
                const SizedBox(height: 16),
                const Text('Belum ada kampanye',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('Buat kampanye untuk mempromosikan layanan Anda',
                    style: TextStyle(fontSize: 13, color: Colors.grey[500])),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () => _showCreateCampaignDialog(),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Buat Kampanye'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DEKATColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () async { ref.invalidate(campaignsProvider); },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: campaigns.length,
            itemBuilder: (context, index) {
              final campaign = campaigns[index];
              final status = campaign['status'] ?? 'DRAFT';
              final isActive = status == 'ACTIVE';
              return RepaintBoundary(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isActive
                                  ? Colors.green.withValues(alpha: 0.12)
                                  : DEKATColors.primary
                                      .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(Icons.campaign,
                                color: isActive
                                    ? Colors.green.shade700
                                    : DEKATColors.primary,
                                size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              campaign['name'] ?? '',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600, fontSize: 15),
                            ),
                          ),
                          _StatusBadge(
                              label: _campaignStatusLabel(status),
                              active: isActive),
                        ],
                      ),
                      if (campaign['description'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Text(campaign['description'].toString(),
                              style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 13,
                                  height: 1.5)),
                        ),
                      if (campaign['startDate'] != null ||
                          campaign['endDate'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Row(
                            children: [
                              Icon(Icons.date_range_outlined,
                                  size: 14, color: Colors.grey[400]),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  '${campaign['startDate'] ?? '?'} — ${campaign['endDate'] ?? '?'}',
                                  style: TextStyle(
                                      color: Colors.grey[500], fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (status != 'ACTIVE')
                            ElevatedButton.icon(
                              icon: const Icon(Icons.play_arrow, size: 16),
                              label: const Text('Aktifkan'),
                              onPressed: () =>
                                  _activateCampaign(campaign['id']),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          if (status == 'ACTIVE')
                            OutlinedButton.icon(
                              icon: const Icon(Icons.pause, size: 16),
                              label: const Text('Jeda'),
                              onPressed: () =>
                                  _pauseCampaign(campaign['id']),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.orange.shade700,
                                side: BorderSide(
                                    color: Colors.orange.shade300),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  String _campaignStatusLabel(String status) {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif';
      case 'PAUSED':
        return 'Dijeda';
      case 'DRAFT':
        return 'Draf';
      case 'ENDED':
        return 'Berakhir';
      default:
        return status;
    }
  }

  void _showCreateCouponDialog() {
    final codeCtrl = TextEditingController();
    final discountTypeCtrl = TextEditingController(text: 'FLAT');
    final discountValueCtrl = TextEditingController();
    final minOrderCtrl = TextEditingController();
    final maxDiscountCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Buat Kupon'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Kode Kupon', hintText: 'DISKON10'), textCapitalization: TextCapitalization.characters),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: 'FLAT',
                items: const [
                  DropdownMenuItem(value: 'FLAT', child: Text('Flat (Rp)')),
                  DropdownMenuItem(value: 'PERCENTAGE', child: Text('Persen (%)')),
                ],
                onChanged: (v) => discountTypeCtrl.text = v!,
                decoration: const InputDecoration(labelText: 'Tipe Diskon'),
              ),
              const SizedBox(height: 8),
              TextField(controller: discountValueCtrl, decoration: const InputDecoration(labelText: 'Nilai Diskon'), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: minOrderCtrl, decoration: const InputDecoration(labelText: 'Min. Order (opsional)'), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: maxDiscountCtrl, decoration: const InputDecoration(labelText: 'Maks. Diskon (opsional)'), keyboardType: TextInputType.number),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ApiService().createCoupon({
                  'code': codeCtrl.text.toUpperCase(),
                  'discountType': discountTypeCtrl.text,
                  'discountValue': int.tryParse(discountValueCtrl.text) ?? 0,
                  if (minOrderCtrl.text.isNotEmpty) 'minOrder': int.tryParse(minOrderCtrl.text) ?? 0,
                  if (maxDiscountCtrl.text.isNotEmpty) 'maxDiscount': int.tryParse(maxDiscountCtrl.text) ?? 0,
                  'active': true,
                });
                Navigator.pop(context);
                ref.invalidate(couponsProvider);
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DEKATColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _showCreateCampaignDialog() {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final startDateCtrl = TextEditingController();
    final endDateCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Buat Kampanye'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nama Kampanye')),
              const SizedBox(height: 8),
              TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Deskripsi'), maxLines: 2),
              const SizedBox(height: 8),
              TextField(controller: startDateCtrl, decoration: const InputDecoration(labelText: 'Tanggal Mulai', hintText: '2026-01-01'), keyboardType: TextInputType.datetime),
              const SizedBox(height: 8),
              TextField(controller: endDateCtrl, decoration: const InputDecoration(labelText: 'Tanggal Selesai', hintText: '2026-01-31'), keyboardType: TextInputType.datetime),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ApiService().createCampaign({
                  'name': nameCtrl.text,
                  'description': descCtrl.text,
                  'startDate': startDateCtrl.text.isNotEmpty ? startDateCtrl.text : null,
                  'endDate': endDateCtrl.text.isNotEmpty ? endDateCtrl.text : null,
                });
                Navigator.pop(context);
                ref.invalidate(campaignsProvider);
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DEKATColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteCoupon(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Hapus Kupon?'),
        content: const Text('Kupon yang dihapus tidak dapat dikembalikan.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hapus', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ApiService().deleteCoupon(id);
      ref.invalidate(couponsProvider);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal hapus: $e')));
    }
  }

  Future<void> _activateCampaign(String id) async {
    try {
      await ApiService().activateCampaign(id);
      ref.invalidate(campaignsProvider);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    }
  }

  Future<void> _pauseCampaign(String id) async {
    try {
      await ApiService().pauseCampaign(id);
      ref.invalidate(campaignsProvider);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    }
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final bool active;
  const _StatusBadge({required this.label, required this.active});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: active ? Colors.green.shade50 : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: active ? Colors.green.shade200 : Colors.grey.shade300),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: active ? Colors.green : Colors.grey,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: active ? Colors.green.shade700 : Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _MetaRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.grey[400]),
          const SizedBox(width: 6),
          Expanded(
            child: Text(text,
                style: TextStyle(color: Colors.grey[500], fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
