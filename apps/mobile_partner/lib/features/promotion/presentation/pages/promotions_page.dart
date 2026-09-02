import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/dekat_colors.dart';

class PromotionsPage extends ConsumerStatefulWidget {
  const PromotionsPage({super.key});

  @override
  ConsumerState<PromotionsPage> createState() => _PromotionsPageState();
}

class _PromotionsPageState extends ConsumerState<PromotionsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _coupons = [];
  List<dynamic> _campaigns = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      // TODO: Call APIs GET /provider/coupons and GET /provider/campaigns
      await Future.delayed(const Duration(seconds: 1));
      setState(() {
        _coupons = [];
        _campaigns = [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
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
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildCouponsList(),
                _buildCampaignsList(),
              ],
            ),
    );
  }

  Widget _buildCouponsList() {
    if (_coupons.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_offer_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('No coupons yet'),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () => _showCreateCouponDialog(),
              child: const Text('Create Coupon'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _coupons.length,
      itemBuilder: (context, index) {
        final coupon = _coupons[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: Icon(Icons.local_offer, color: DEKATColors.primary),
            title: Text(coupon['code'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace')),
            subtitle: Text('${coupon['discountType']} • ${coupon['discountValue']}'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: (coupon['active'] ?? true) ? Colors.green[100] : Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                (coupon['active'] ?? true) ? 'Active' : 'Inactive',
                style: TextStyle(fontSize: 12, color: (coupon['active'] ?? true) ? Colors.green : Colors.grey),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildCampaignsList() {
    if (_campaigns.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.campaign_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('No campaigns yet'),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () => _showCreateCampaignDialog(),
              child: const Text('Create Campaign'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _campaigns.length,
      itemBuilder: (context, index) {
        final campaign = _campaigns[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: Icon(Icons.campaign, color: DEKATColors.primary),
            title: Text(campaign['name'] ?? ''),
            subtitle: Text(campaign['type'] ?? ''),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: campaign['status'] == 'ACTIVE' ? Colors.green[100] : Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(campaign['status'] ?? '', style: const TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showCreateCouponDialog() {
    // TODO: Show create coupon dialog
  }

  void _showCreateCampaignDialog() {
    // TODO: Show create campaign dialog
  }
}
