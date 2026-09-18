import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

class ReviewsPage extends ConsumerStatefulWidget {
  const ReviewsPage({super.key});

  @override
  ConsumerState<ReviewsPage> createState() => _ReviewsPageState();
}

class _ReviewsPageState extends ConsumerState<ReviewsPage> {
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
      final response = await ApiService().getPartnerReviews();
      final data = response.data['data'];
      setState(() {
        _reviews = data is List ? data : [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  double get _avgRating {
    if (_reviews.isEmpty) return 0;
    var sum = 0.0;
    var count = 0;
    for (final r in _reviews) {
      final rating = (r['rating'] as num?)?.toDouble();
      if (rating != null) {
        sum += rating;
        count++;
      }
    }
    return count == 0 ? 0 : sum / count;
  }

  int _countForStar(int star) {
    var count = 0;
    for (final r in _reviews) {
      if (((r['rating'] as num?)?.toInt() ?? 0) == star) count++;
    }
    return count;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Ulasan Pelanggan',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1D26),
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _reviews.isEmpty
              ? Center(
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
                        child: Icon(Icons.reviews_outlined,
                            size: 48, color: Colors.grey[300]),
                      ),
                      const SizedBox(height: 16),
                      const Text('Belum ada ulasan',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('Ulasan dari pelanggan akan tampil di sini',
                          style: TextStyle(
                              fontSize: 13, color: Colors.grey[500])),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadReviews,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _buildSummaryCard(),
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.only(left: 4, bottom: 8),
                        child: Text(
                          '${_reviews.length} Ulasan',
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[600]),
                        ),
                      ),
                      ...List.generate(
                          _reviews.length, (i) => _buildReviewCard(_reviews[i])),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSummaryCard() {
    final avg = _avgRating;
    final total = _reviews.length;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Column(
            children: [
              Text(
                avg.toStringAsFixed(1),
                style: const TextStyle(
                    fontSize: 44,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1D26)),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(
                  5,
                  (i) => Icon(
                    i < avg.round() ? Icons.star : Icons.star_border,
                    size: 18,
                    color: Colors.amber,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text('$total ulasan',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500])),
            ],
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              children: List.generate(5, (i) {
                final star = 5 - i;
                final count = _countForStar(star);
                final ratio = total == 0 ? 0.0 : count / total;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    children: [
                      Text('$star',
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey[600])),
                      const SizedBox(width: 4),
                      const Icon(Icons.star,
                          size: 12, color: Colors.amber),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: ratio,
                            minHeight: 8,
                            color: DEKATColors.primary,
                            backgroundColor: Colors.grey.shade100,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 24,
                        child: Text('$count',
                            textAlign: TextAlign.end,
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey[600])),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(dynamic review) {
    final name = (review['customerName'] ?? 'Pelanggan').toString();
    final rating = (review['rating'] as num?)?.toInt() ?? 0;
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
                CircleAvatar(
                  radius: 20,
                  backgroundColor:
                      DEKATColors.primary.withValues(alpha: 0.1),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: DEKATColors.primary),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name,
                          style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 14)),
                      const SizedBox(height: 2),
                      Row(
                        children: List.generate(
                          5,
                          (i) => Icon(
                            i < rating ? Icons.star : Icons.star_border,
                            size: 14,
                            color: Colors.amber,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: rating >= 4
                        ? Colors.green.shade50
                        : rating == 3
                            ? Colors.amber.shade50
                            : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: rating >= 4
                          ? Colors.green.shade200
                          : rating == 3
                              ? Colors.amber.shade200
                              : Colors.red.shade200,
                    ),
                  ),
                  child: Text(
                    '$rating/5',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: rating >= 4
                          ? Colors.green.shade700
                          : rating == 3
                              ? Colors.amber.shade800
                              : Colors.red.shade700,
                    ),
                  ),
                ),
              ],
            ),
            if (review['title'] != null) ...[
              const SizedBox(height: 12),
              Text(review['title'].toString(),
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14)),
            ],
            const SizedBox(height: 4),
            Text((review['body'] ?? '').toString(),
                style: TextStyle(
                    color: Colors.grey[600], fontSize: 13, height: 1.5)),
            if (review['response'] == null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _showRespondDialog(review['id']),
                  icon: const Icon(Icons.reply, size: 16),
                  label: const Text('Balas Ulasan'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: DEKATColors.primary,
                    side: const BorderSide(color: DEKATColors.primary),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ] else ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: DEKATColors.primary.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color:
                          DEKATColors.primary.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.storefront,
                            size: 14, color: DEKATColors.primary),
                        SizedBox(width: 6),
                        Text('Balasan Anda',
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: DEKATColors.primary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(review['response'].toString(),
                        style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[700],
                            height: 1.5)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showRespondDialog(String reviewId) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Balas Ulasan'),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(
              hintText: 'Tulis balasan Anda...',
              border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal')),
          ElevatedButton(
            onPressed: () async {
              if (controller.text.trim().isEmpty) return;
              try {
                await ApiService().respondToReview(
                    reviewId, {'response': controller.text.trim()});
                Navigator.pop(context);
                _loadReviews();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed: $e')));
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DEKATColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Kirim'),
          ),
        ],
      ),
    );
  }
}
