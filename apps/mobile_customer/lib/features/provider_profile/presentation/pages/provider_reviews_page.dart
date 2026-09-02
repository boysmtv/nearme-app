import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/dekat_colors.dart';

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
      // TODO: Call API GET /public/providers/${widget.providerId}/reviews
      await Future.delayed(const Duration(seconds: 1));
      setState(() {
        _reviews = [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_reviews.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.reviews_outlined, size: 48, color: Colors.grey[300]),
            const SizedBox(height: 12),
            Text('No reviews yet', style: TextStyle(color: Colors.grey[500])),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _reviews.length,
      itemBuilder: (context, index) {
        final review = _reviews[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(review['customerName'] ?? 'Customer',
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    if (review['verifiedBooking'] == true)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.green[100],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('Verified', style: TextStyle(fontSize: 10, color: Colors.green)),
                      ),
                    const Spacer(),
                    ...List.generate(5, (i) => Icon(
                      i < (review['rating'] ?? 0) ? Icons.star : Icons.star_border,
                      size: 16,
                      color: Colors.amber,
                    )),
                  ],
                ),
                if (review['title'] != null) ...[
                  const SizedBox(height: 8),
                  Text(review['title'], style: const TextStyle(fontWeight: FontWeight.w500)),
                ],
                if (review['body'] != null) ...[
                  const SizedBox(height: 4),
                  Text(review['body'], style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                ],
                if (review['response'] != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Provider Response:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 4),
                        Text(review['response'], style: TextStyle(fontSize: 13, color: Colors.grey[700])),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}