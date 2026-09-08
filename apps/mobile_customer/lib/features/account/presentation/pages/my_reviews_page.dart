import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

class MyReviewsPage extends ConsumerStatefulWidget {
  const MyReviewsPage({super.key});

  @override
  ConsumerState<MyReviewsPage> createState() => _MyReviewsPageState();
}

class _MyReviewsPageState extends ConsumerState<MyReviewsPage> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() => _isLoading = true);
    try {
      final api = ApiService();
      final res = await api.dio.get('/bookings?status=COMPLETED');
      if (res.data['success'] == true) {
        setState(() {
          _bookings = res.data['data'] as List<dynamic>? ?? [];
        });
      }
    } catch (e) {
      debugPrint('Error loading bookings: $e');
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ulasan Saya')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _bookings.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.star_border, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text('Belum ada booking selesai', style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => context.push('/search'),
                        child: const Text('Mulai Booking'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadBookings,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _bookings.length,
                    itemBuilder: (context, index) {
                      final b = _bookings[index] as Map<String, dynamic>;
                      final hasReview = b['reviewId'] != null || b['hasReview'] == true;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          b['serviceName'] as String? ?? 'Layanan',
                                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          b['providerName'] as String? ?? 'Provider',
                                          style: TextStyle(color: Colors.grey[600], fontSize: 14),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (hasReview)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.green[50],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text('✓ Terulas', style: TextStyle(color: Colors.green, fontSize: 12)),
                                    )
                                  else
                                    TextButton(
                                      onPressed: () => context.push('/bookings/${b['id']}'),
                                      child: const Text('Tulis Ulasan'),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
