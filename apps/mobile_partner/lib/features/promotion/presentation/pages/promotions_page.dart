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
      appBar: AppBar(
        title: const Text('Promotions'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Coupons'),
            Tab(text: 'Campaigns'),
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
                Icon(Icons.local_offer_outlined, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                const Text('Belum ada coupon'),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => _showCreateCouponDialog(),
                  child: const Text('Buat Coupon'),
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
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.local_offer, color: DEKATColors.primary, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              coupon['code'] ?? '',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace', fontSize: 16),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isActive ? Colors.green[100] : Colors.grey[100],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              isActive ? 'Active' : 'Inactive',
                              style: TextStyle(fontSize: 12, color: isActive ? Colors.green : Colors.grey),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        discountType == 'PERCENTAGE'
                            ? 'Diskon ${discountValue.toString()}%'
                            : 'Diskon Rp ${discountValue.toString()}',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      if (coupon['minOrder'] != null && coupon['minOrder'] > 0)
                        Text('Min. order: Rp ${coupon['minOrder']}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      if (coupon['maxDiscount'] != null && coupon['maxDiscount'] > 0)
                        Text('Maks. diskon: Rp ${coupon['maxDiscount']}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      if (coupon['expiresAt'] != null)
                        Text('Berlaku hingga: ${coupon['expiresAt']}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                            onPressed: () => _deleteCoupon(coupon['id']),
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

  Widget _buildCampaignsTab() {
    final campaignsAsync = ref.watch(campaignsProvider);
    return campaignsAsync.when(
      data: (campaigns) {
        if (campaigns.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.campaign_outlined, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                const Text('Belum ada campaign'),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => _showCreateCampaignDialog(),
                  child: const Text('Buat Campaign'),
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
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.campaign, color: DEKATColors.primary, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              campaign['name'] ?? '',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: status == 'ACTIVE' ? Colors.green[100] : Colors.grey[100],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(status, style: const TextStyle(fontSize: 12)),
                          ),
                        ],
                      ),
                      if (campaign['description'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(campaign['description'], style: TextStyle(color: Colors.grey[600])),
                        ),
                      if (campaign['startDate'] != null || campaign['endDate'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            '${campaign['startDate'] ?? '?'} — ${campaign['endDate'] ?? '?'}',
                            style: TextStyle(color: Colors.grey[500], fontSize: 12),
                          ),
                        ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (status != 'ACTIVE')
                            TextButton(
                              onPressed: () => _activateCampaign(campaign['id']),
                              child: const Text('Activate'),
                            ),
                          if (status == 'ACTIVE')
                            TextButton(
                              onPressed: () => _pauseCampaign(campaign['id']),
                              child: const Text('Pause'),
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

  void _showCreateCouponDialog() {
    final codeCtrl = TextEditingController();
    final discountTypeCtrl = TextEditingController(text: 'FLAT');
    final discountValueCtrl = TextEditingController();
    final minOrderCtrl = TextEditingController();
    final maxDiscountCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Buat Coupon'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Kode Coupon', hintText: 'DISKON10'), textCapitalization: TextCapitalization.characters),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: 'FLAT',
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
        title: const Text('Buat Campaign'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nama Campaign')),
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
        title: const Text('Hapus Coupon?'),
        content: const Text('Coupon yang dihapus tidak dapat dikembalikan.'),
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
