import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

class LoyaltyPage extends ConsumerStatefulWidget {
  const LoyaltyPage({super.key});

  @override
  ConsumerState<LoyaltyPage> createState() => _LoyaltyPageState();
}

class _LoyaltyPageState extends ConsumerState<LoyaltyPage> {
  int _points = 0;
  List<dynamic> _history = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadLoyalty();
  }

  Future<void> _loadLoyalty() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService().getCustomerProfile();
      final data = response.data['data'];
      if (!mounted) return;
      setState(() {
        _points = data['loyaltyPoints'] ?? 0;
        _history = data['loyaltyHistory'] is List ? data['loyaltyHistory'] : [];
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Poin Loyalty'),
        backgroundColor: Colors.white,
        foregroundColor: DEKATColors.textPrimary,
        elevation: 0,
      ),
      body: _loading
          ? const ShimmerCardList()
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _HeroCard(points: _points),
                  const SizedBox(height: 20),
                  const _SectionTitle(
                    title: 'Tukar Poin',
                    subtitle: 'Tukarkan poin dengan promo menarik',
                  ),
                  const SizedBox(height: 12),
                  _RedeemGrid(points: _points),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      const _SectionTitle(
                        title: 'Riwayat Poin',
                        subtitle: 'Semua perolehan dan penukaran poin',
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: DEKATColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${_history.length}',
                          style: const TextStyle(
                            color: DEKATColors.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (_history.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.stars_outlined,
                              size: 56, color: Colors.grey[300]),
                          const SizedBox(height: 12),
                          const Text(
                            'Belum ada riwayat poin',
                            style: TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Selesaikan booking untuk mengumpulkan poin',
                            style: TextStyle(
                                color: Colors.grey[500], fontSize: 13),
                          ),
                        ],
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _history.length,
                      itemBuilder: (context, index) {
                        final h = _history[index];
                        return RepaintBoundary(
                          child: _HistoryCard(entry: h),
                        );
                      },
                    ),
                ],
              ),
            ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  final int points;

  const _HeroCard({required this.points});

  @override
  Widget build(BuildContext context) {
    final tier = _tierForPoints(points);
    final threshold = _nextTierThreshold(points);
    final base = _tierBase(points);
    final isMaxed = points >= 5000;
    final progress = isMaxed
        ? 1.0
        : ((points - base) / (threshold - base)).clamp(0.0, 1.0);
    final remaining = isMaxed ? 0 : threshold - points;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            DEKATColors.primary,
            DEKATColors.primary.withValues(alpha: 0.8)
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -30,
            top: -30,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.08),
              ),
            ),
          ),
          Positioned(
            right: 30,
            bottom: -50,
            child: Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.08),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.stars,
                        color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'Poin Saya',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.workspace_premium,
                            color: Colors.amber, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          tier,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    _formatPoints(points),
                    style: const TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(bottom: 8, left: 6),
                    child: Text('poin',
                        style:
                            TextStyle(color: Colors.white70, fontSize: 14)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: Colors.white.withValues(alpha: 0.25),
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(Colors.amber),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isMaxed
                    ? 'Anda mencapai tier tertinggi. Pertahankan!'
                    : '$remaining poin lagi menuju ${_tierForPoints(threshold)}',
                style:
                    const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RedeemGrid extends StatelessWidget {
  final int points;

  const _RedeemGrid({required this.points});

  static const _options = [
    {
      'title': 'Potongan Rp10rb',
      'cost': 500,
      'icon': Icons.percent_rounded,
    },
    {
      'title': 'Potongan Rp25rb',
      'cost': 1000,
      'icon': Icons.local_offer_outlined,
    },
    {
      'title': 'Voucher Rp50rb',
      'cost': 2000,
      'icon': Icons.card_giftcard_outlined,
    },
    {
      'title': 'Perawatan Gratis',
      'cost': 5000,
      'icon': Icons.spa_outlined,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.05,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _options.length,
      itemBuilder: (context, index) {
        final opt = _options[index];
        final cost = opt['cost'] as int;
        final affordable = points >= cost;
        return RepaintBoundary(
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                      'Tukarkan "${opt['title']}" saat pembayaran — tunjukkan halaman ini ke kasir.'),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: affordable
                          ? DEKATColors.primary.withValues(alpha: 0.1)
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      opt['icon'] as IconData,
                      color: affordable
                          ? DEKATColors.primary
                          : Colors.grey[400],
                      size: 24,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    opt['title'] as String,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: affordable
                          ? Colors.amber.withValues(alpha: 0.15)
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${_formatPoints(cost)} poin',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: affordable
                            ? Colors.amber[800]
                            : Colors.grey[500],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final dynamic entry;

  const _HistoryCard({required this.entry});

  @override
  Widget build(BuildContext context) {
    final isEarn = entry['type'] == 'EARN';
    final rawPoints = entry['points'];
    final pts = rawPoints is num ? rawPoints.toInt() : 0;
    final positive = pts > 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isEarn ? Colors.green : Colors.red)
                  .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isEarn
                  ? Icons.add_circle_outline
                  : Icons.remove_circle_outline,
              color: isEarn ? Colors.green : Colors.red,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry['description']?.toString() ?? 'Poin',
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  isEarn ? 'Poin masuk' : 'Poin keluar',
                  style:
                      TextStyle(color: Colors.grey[500], fontSize: 12),
                ),
              ],
            ),
          ),
          Text(
            '${positive ? '+' : ''}$pts',
            style: TextStyle(
              color: positive ? Colors.green : Colors.red,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionTitle({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: TextStyle(color: Colors.grey[500], fontSize: 13),
        ),
      ],
    );
  }
}

String _tierForPoints(int points) {
  if (points >= 5000) return 'Platinum';
  if (points >= 1500) return 'Emas';
  if (points >= 500) return 'Perak';
  return 'Perunggu';
}

int _nextTierThreshold(int points) {
  if (points < 500) return 500;
  if (points < 1500) return 1500;
  if (points < 5000) return 5000;
  return 5000;
}

int _tierBase(int points) {
  if (points < 500) return 0;
  if (points < 1500) return 500;
  if (points < 5000) return 1500;
  return 5000;
}

String _formatPoints(int value) {
  final digits = value.toString();
  final buffer = StringBuffer();
  var count = 0;
  for (var i = digits.length - 1; i >= 0; i--) {
    buffer.write(digits[i]);
    count++;
    if (count % 3 == 0 && i != 0) buffer.write('.');
  }
  return buffer.toString().split('').reversed.join();
}
