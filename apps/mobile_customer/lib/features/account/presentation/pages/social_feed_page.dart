import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class FeedPost {
  final String id;
  final String providerName;
  final String type;
  final String title;
  final String body;
  final int likes;
  final int comments;
  final bool isLiked;
  final DateTime createdAt;

  FeedPost({
    required this.id,
    required this.providerName,
    required this.type,
    required this.title,
    required this.body,
    this.likes = 0,
    this.comments = 0,
    this.isLiked = false,
    required this.createdAt,
  });
}

final feedProvider = Provider<List<FeedPost>>((ref) {
  return [
    FeedPost(
      id: '1',
      providerName: 'Barbershop Central',
      type: 'PROMO',
      title: 'Diskon 20% untuk Potong Rambut!',
      body: 'Hanya minggu ini! Potong rambut jadi Rp 40.000 dari Rp 50.000.',
      likes: 24,
      comments: 8,
      createdAt: DateTime.now(),
    ),
    FeedPost(
      id: '2',
      providerName: 'Beauty Salon',
      type: 'GALLERY',
      title: 'Hasil Creambath Terbaru',
      body: 'Hasil creambath dari pelanggan kami. Rambut sehat berkilau!',
      likes: 15,
      comments: 3,
      isLiked: true,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    FeedPost(
      id: '3',
      providerName: 'Spa & Wellness',
      type: 'REVIEW',
      title: 'Review dari Siti',
      body: 'Pelayanan sangat memuaskan! Tempatnya bersih dan stafnya ramah.',
      likes: 32,
      comments: 12,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
  ];
});

final trendingProvider = Provider<List<Map<String, dynamic>>>((ref) {
  return [
    {'name': 'Barbershop Central', 'followers': 450, 'bookings': 120},
    {'name': 'Beauty Salon', 'followers': 380, 'bookings': 98},
    {'name': 'Spa & Wellness', 'followers': 320, 'bookings': 85},
  ];
});

class SocialFeedPage extends ConsumerWidget {
  const SocialFeedPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final posts = ref.watch(feedProvider);
    final trending = ref.watch(trendingProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Feed')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Create Post
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.deepPurple[100],
                    child: const Text('U', style: TextStyle(color: Colors.deepPurple)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Bagikan pengalaman Anda...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Colors.grey[100],
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Trending
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🔥 Trending', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ...trending.asMap().entries.map((entry) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: Colors.grey[200],
                      child: Text('${entry.key + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    title: Text(entry.value['name'] as String),
                    subtitle: Text('${entry.value['followers']} followers'),
                    trailing: Text('${entry.value['bookings']} booking',
                        style: const TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold)),
                  )),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Feed Posts
          ...posts.map((post) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.deepPurple[100],
                        child: Text(post.providerName[0], style: const TextStyle(color: Colors.deepPurple)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(post.providerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text(
                              '${post.createdAt.day}/${post.createdAt.month} • ${post.type}',
                              style: TextStyle(color: Colors.grey[500], fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getTypeColor(post.type).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(post.type, style: TextStyle(
                          color: _getTypeColor(post.type),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        )),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(post.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(post.body, style: TextStyle(color: Colors.grey[600])),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      Icon(post.isLiked ? Icons.favorite : Icons.favorite_border,
                          color: post.isLiked ? Colors.red : Colors.grey, size: 20),
                      const SizedBox(width: 4),
                      Text('${post.likes}', style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(width: 16),
                      Icon(Icons.comment_outlined, color: Colors.grey, size: 20),
                      const SizedBox(width: 4),
                      Text('${post.comments}', style: TextStyle(color: Colors.grey[600])),
                      const Spacer(),
                      Icon(Icons.share, color: Colors.grey, size: 20),
                    ],
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'PROMO': return Colors.red;
      case 'GALLERY': return Colors.purple;
      case 'REVIEW': return Colors.amber;
      default: return Colors.grey;
    }
  }
}
