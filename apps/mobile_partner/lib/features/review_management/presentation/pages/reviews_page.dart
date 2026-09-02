import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/dekat_colors.dart';

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
      // TODO: Call API GET /provider/reviews
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reviews'),
        backgroundColor: DEKATColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _reviews.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.reviews_outlined, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 16),
                      const Text('No reviews yet'),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadReviews,
                  child: ListView.builder(
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
                              const SizedBox(height: 4),
                              Text(review['body'] ?? '', style: TextStyle(color: Colors.grey[600])),
                              if (review['response'] == null) ...[
                                const SizedBox(height: 8),
                                TextButton.icon(
                                  onPressed: () => _showRespondDialog(review['id']),
                                  icon: const Icon(Icons.reply, size: 16),
                                  label: const Text('Respond'),
                                ),
                              ] else ...[
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
                                      const Text('Your Response:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
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
                  ),
                ),
    );
  }

  void _showRespondDialog(String reviewId) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Respond to Review'),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Write your response...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              // TODO: Call API POST /provider/reviews/$reviewId/respond
              Navigator.pop(context);
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }
}
