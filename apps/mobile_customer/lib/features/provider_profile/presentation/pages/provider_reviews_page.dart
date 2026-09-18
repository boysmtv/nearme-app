import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

class ProviderReviewsPage extends ConsumerStatefulWidget {
  final String providerId;
  const ProviderReviewsPage({super.key, required this.providerId});

  @override
  ConsumerState<ProviderReviewsPage> createState() => _ProviderReviewsPageState();
}

class _ProviderReviewsPageState extends ConsumerState<ProviderReviewsPage> {
  List<dynamic> _reviews = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService().getProviderReviews(widget.providerId);
      final data = response.data['data'];
      if (!mounted) return;
      setState(() {
        _reviews = data is List ? data : [];
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  double _ratingOf(dynamic review) {
    return (review['rating'] as num?)?.toDouble() ?? 0;
  }

  String? _formatDate(dynamic review) {
    final raw = review['createdAt'] ?? review['created_at'] ?? review['date'];
    if (raw == null) return null;
    final dt = raw is DateTime ? raw : DateTime.tryParse(raw.toString());
    if (dt == null) return null;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
  }

  Widget _buildSummaryHeader() {
    final total = _reviews.length;
    double sum = 0;
    final counts = <int, int>{5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    for (final review in _reviews) {
      final rating = _ratingOf(review);
      sum += rating;
      final star = rating.round().clamp(1, 5);
      counts[star] = (counts[star] ?? 0) + 1;
    }
    final avg = total == 0 ? 0.0 : sum / total;

    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            Column(
              children: [
                Text(
                  avg.toStringAsFixed(1),
                  style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: DEKATColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(
                    5,
                    (i) => Icon(
                      i < avg ? Icons.star_rounded : Icons.star_outline_rounded,
                      size: 16,
                      color: Colors.amber[700],
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text('$total ulasan', style: TextStyle(fontSize: 12, color: Colors.grey[500])),
              ],
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                children: [
                  for (var star = 5; star >= 1; star--)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 12,
                            child: Text('$star', style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                          ),
                          const SizedBox(width: 6),
                          Icon(Icons.star_rounded, size: 12, color: Colors.amber[700]),
                          const SizedBox(width: 6),
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: Container(
                                height: 6,
                                color: Colors.grey.shade200,
                                alignment: Alignment.centerLeft,
                                child: FractionallySizedBox(
                                  widthFactor: total == 0 ? 0 : (counts[star] ?? 0) / total,
                                  child: Container(
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: DEKATColors.primary,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          SizedBox(
                            width: 20,
                            child: Text('${counts[star] ?? 0}', style: TextStyle(fontSize: 11, color: Colors.grey[500]), textAlign: TextAlign.right),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(dynamic review) {
    final name = (review['customerName'] ?? 'Pelanggan').toString();
    final date = _formatDate(review);
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'P';
    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: DEKATColors.primary.withValues(alpha: 0.1),
                  child: Text(initial, style: const TextStyle(fontWeight: FontWeight.bold, color: DEKATColors.primary, fontSize: 16)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: DEKATColors.textPrimary)),
                      if (date != null) ...[
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Icon(Icons.calendar_today_outlined, size: 11, color: Colors.grey[500]),
                            const SizedBox(width: 4),
                            Text(date, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                if (review['verifiedBooking'] == true)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_rounded, size: 12, color: Colors.green),
                        SizedBox(width: 4),
                        Text('Terverifikasi', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.green)),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                ...List.generate(5, (i) => Icon(
                  i < (review['rating'] ?? 0) ? Icons.star_rounded : Icons.star_outline_rounded,
                  size: 16,
                  color: Colors.amber[700],
                )),
                const SizedBox(width: 6),
                Text(
                  _ratingOf(review).toStringAsFixed(1),
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey[600]),
                ),
              ],
            ),
            if (review['title'] != null) ...[
              const SizedBox(height: 8),
              Text(review['title'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: DEKATColors.textPrimary)),
            ],
            if (review['body'] != null) ...[
              const SizedBox(height: 4),
              Text(review['body'], style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.5)),
            ],
            if (review['response'] != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: DEKATColors.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.storefront_rounded, size: 14, color: DEKATColors.primary),
                        SizedBox(width: 6),
                        Text('Tanggapan Penyedia', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: DEKATColors.primary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(review['response'], style: TextStyle(fontSize: 13, color: Colors.grey[700], height: 1.5)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const ShimmerCardList();
    if (_reviews.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha: 0.08), shape: BoxShape.circle),
                child: const Icon(Icons.reviews_outlined, size: 40, color: DEKATColors.primary),
              ),
              const SizedBox(height: 16),
              const Text('Belum ada ulasan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: DEKATColors.textPrimary), textAlign: TextAlign.center),
              const SizedBox(height: 6),
              Text('Jadilah yang pertama membagikan pengalamanmu', style: TextStyle(fontSize: 13, color: Colors.grey[500]), textAlign: TextAlign.center),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        _buildSummaryHeader(),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            itemCount: _reviews.length,
            itemBuilder: (context, index) => _buildReviewCard(_reviews[index]),
          ),
        ),
      ],
    );
  }
}
