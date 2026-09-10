import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final feedFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  try {
    final res = await ApiService().getSocialFeed();
    final data = res.data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    if (data is List) return data;
    return [];
  } catch (_) {
    return [];
  }
});

final trendingFutureProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  try {
    final res = await ApiService().getTrendingProviders();
    final data = res.data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    if (data is List) return data;
    return [];
  } catch (_) {
    return [];
  }
});

class SocialFeedPage extends ConsumerStatefulWidget {
  const SocialFeedPage({super.key});

  @override
  ConsumerState<SocialFeedPage> createState() => _SocialFeedPageState();
}

class _SocialFeedPageState extends ConsumerState<SocialFeedPage> {
  final _postController = TextEditingController();

  @override
  void dispose() {
    _postController.dispose();
    super.dispose();
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'PROMO': return Colors.red;
      case 'GALLERY': return Colors.purple;
      case 'REVIEW': return Colors.amber;
      default: return Colors.grey;
    }
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'PROMO': return 'Promo';
      case 'GALLERY': return 'Galeri';
      case 'REVIEW': return 'Ulasan';
      default: return type;
    }
  }

  @override
  Widget build(BuildContext context) {
    final feedAsync = ref.watch(feedFutureProvider);
    final trendingAsync = ref.watch(trendingFutureProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Feed')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(feedFutureProvider);
          ref.invalidate(trendingFutureProvider);
        },
        child: ListView(
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
                        controller: _postController,
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
            trendingAsync.when(
              data: (trending) {
                if (trending.isEmpty) return const SizedBox.shrink();
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Trending', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        ...trending.asMap().entries.map((entry) {
                          final t = entry.value as Map;
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: CircleAvatar(
                              backgroundColor: Colors.grey[200],
                              child: Text('${entry.key + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ),
                            title: Text(t['name']?.toString() ?? ''),
                            subtitle: Text('${t['followers'] ?? 0} followers'),
                            trailing: Text('${t['bookings'] ?? 0} booking',
                                style: const TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold)),
                          );
                        }),
                      ],
                    ),
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 16),

            // Feed Posts
            feedAsync.when(
              data: (posts) {
                if (posts.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        children: [
                          Icon(Icons.rss_feed, size: 64, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          Text('Belum ada postingan', style: TextStyle(color: Colors.grey[500])),
                        ],
                      ),
                    ),
                  );
                }
                return Column(
                  children: posts.map((post) {
                    final p = post as Map;
                    return Card(
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
                                  child: Text(
                                    (p['providerName']?.toString() ?? '?')[0],
                                    style: const TextStyle(color: Colors.deepPurple),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(p['providerName']?.toString() ?? '',
                                          style: const TextStyle(fontWeight: FontWeight.bold)),
                                      Text(
                                        '${p['createdAt']?.toString().substring(0, 10) ?? '-'} - ${_getTypeLabel(p['type']?.toString() ?? '')}',
                                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _getTypeColor(p['type']?.toString() ?? '').withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(_getTypeLabel(p['type']?.toString() ?? ''),
                                      style: TextStyle(
                                        color: _getTypeColor(p['type']?.toString() ?? ''),
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
                                Text(p['title']?.toString() ?? '',
                                    style: const TextStyle(fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(p['body']?.toString() ?? '',
                                    style: TextStyle(color: Colors.grey[600])),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                GestureDetector(
                                  onTap: () async {
                                    try {
                                      await ApiService().likePost(p['id'].toString());
                                      ref.invalidate(feedFutureProvider);
                                    } catch (e) {
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal like: $e')));
                                      }
                                    }
                                  },
                                  child: Row(
                                    children: [
                                      Icon(
                                        p['isLiked'] == true ? Icons.favorite : Icons.favorite_border,
                                        color: p['isLiked'] == true ? Colors.red : Colors.grey,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 4),
                                      Text('${p['likes'] ?? 0}', style: TextStyle(color: Colors.grey[600])),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Icon(Icons.comment_outlined, color: Colors.grey, size: 20),
                                const SizedBox(width: 4),
                                Text('${p['comments'] ?? 0}', style: TextStyle(color: Colors.grey[600])),
                                const Spacer(),
                                Icon(Icons.share, color: Colors.grey, size: 20),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                );
              },
              loading: () => const Center(child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(),
              )),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Text('Gagal memuat feed: $e', style: TextStyle(color: Colors.red)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
