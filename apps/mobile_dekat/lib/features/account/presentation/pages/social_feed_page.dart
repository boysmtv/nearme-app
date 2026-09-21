import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

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
  bool _posting = false;

  @override
  void dispose() {
    _postController.dispose();
    super.dispose();
  }

  Future<void> _submitPost() async {
    final text = _postController.text.trim();
    if (text.isEmpty) return;
    setState(() => _posting = true);
    try {
      await ApiService().createSocialPost({'title': text.length > 50 ? text.substring(0, 50) : text, 'body': text, 'type': 'UPDATE'});
      _postController.clear();
      ref.invalidate(feedFutureProvider);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Postingan berhasil dibuat')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal posting: $e')));
    } finally {
      if (mounted) setState(() => _posting = false);
    }
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

  String? _postImageUrl(Map p) {
    final u = p['imageUrl'] ?? p['image'];
    if (u == null) return null;
    final s = u.toString();
    return s.isEmpty ? null : s;
  }

  @override
  Widget build(BuildContext context) {
    final feedAsync = ref.watch(feedFutureProvider);
    final trendingAsync = ref.watch(trendingFutureProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(title: const Text('Feed')),
      body: RefreshIndicator(
        color: DEKATColors.primary,
        onRefresh: () async {
          ref.invalidate(feedFutureProvider);
          ref.invalidate(trendingFutureProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Create Post
            RepaintBoundary(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: DEKATColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Text(
                          'U',
                          style: TextStyle(
                            color: DEKATColors.primary,
                            fontWeight: FontWeight.w800,
                            fontSize: 18,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _postController,
                        decoration: InputDecoration(
                          hintText: 'Bagikan pengalaman Anda...',
                          hintStyle: TextStyle(color: Colors.grey[400], fontSize: 13),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: const Color(0xFFF1F2F6),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          suffixIcon: _posting
                              ? const Padding(padding: EdgeInsets.all(12), child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)))
                              : IconButton(
                                  icon: const Icon(Icons.send_rounded, color: DEKATColors.primary, size: 20),
                                  onPressed: _submitPost,
                                ),
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
                return RepaintBoundary(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.local_fire_department_rounded, size: 18, color: Colors.deepOrange),
                            SizedBox(width: 6),
                            Text('Trending Saat Ini', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Provider paling populer minggu ini',
                          style: TextStyle(color: Colors.grey[500], fontSize: 12),
                        ),
                        const SizedBox(height: 8),
                        ...trending.asMap().entries.map((entry) {
                          final t = entry.value as Map;
                          final rank = entry.key + 1;
                          return RepaintBoundary(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(
                                children: [
                                  Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: rank <= 3
                                          ? DEKATColors.primary.withValues(alpha: 0.1)
                                          : Colors.grey[100],
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Center(
                                      child: Text(
                                        '$rank',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 15,
                                          color: rank <= 3 ? DEKATColors.primary : Colors.grey[600],
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          t['name']?.toString() ?? '',
                                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 2),
                                        Row(
                                          children: [
                                            Icon(Icons.group_outlined, size: 12, color: Colors.grey[500]),
                                            const SizedBox(width: 3),
                                            Text(
                                              '${t['followers'] ?? 0} pengikut',
                                              style: TextStyle(color: Colors.grey[500], fontSize: 11),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: DEKATColors.primary.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      '${t['bookings'] ?? 0} booking',
                                      style: const TextStyle(
                                        color: DEKATColors.primary,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
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
                          Container(
                            width: 96,
                            height: 96,
                            decoration: BoxDecoration(
                              color: DEKATColors.primary.withValues(alpha: 0.08),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.rss_feed_rounded,
                              size: 44,
                              color: DEKATColors.primary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Belum ada postingan',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Ikuti provider favorit untuk melihat update terbaru',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey[500], fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return Column(
                  children: posts.map((post) {
                    final p = post as Map;
                    return RepaintBoundary(
                      child: _buildPostCard(p),
                    );
                  }).toList(),
                );
              },
              loading: () => const ShimmerCardList(),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.cloud_off_outlined, size: 48, color: Colors.grey[300]),
                      const SizedBox(height: 12),
                      Text('Gagal memuat feed: $e',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.red, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPostCard(Map p) {
    final type = p['type']?.toString() ?? '';
    final typeColor = _getTypeColor(type);
    final imageUrl = _postImageUrl(p);
    final isLiked = p['isLiked'] == true;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: DEKATColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      (p['providerName']?.toString() ?? '?')[0].toUpperCase(),
                      style: const TextStyle(
                        color: DEKATColors.primary,
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p['providerName']?.toString() ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${p['createdAt']?.toString().substring(0, 10) ?? '-'} • ${_getTypeLabel(type)}',
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: typeColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: typeColor.withValues(alpha: 0.25)),
                  ),
                  child: Text(
                    _getTypeLabel(type),
                    style: TextStyle(
                      color: typeColor,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (imageUrl != null)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.zero, bottom: Radius.zero),
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                width: double.infinity,
                height: 200,
                memCacheWidth: 800,
                memCacheHeight: 400,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  width: double.infinity,
                  height: 200,
                  color: Colors.grey.shade200,
                ),
                errorWidget: (context, url, error) => Container(
                  width: double.infinity,
                  height: 200,
                  color: Colors.grey.shade100,
                  child: Icon(Icons.image_not_supported_outlined, color: Colors.grey[400], size: 40),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  p['title']?.toString() ?? '',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  p['body']?.toString() ?? '',
                  style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.5),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: Row(
              children: [
                InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () async {
                    try {
                      await ApiService().likePost(p['id'].toString());
                      ref.invalidate(feedFutureProvider);
                    } catch (e) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal like: $e')));
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isLiked ? Colors.red.withValues(alpha: 0.08) : Colors.grey[100],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          color: isLiked ? Colors.red : Colors.grey[600],
                          size: 18,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${p['likes'] ?? 0}',
                          style: TextStyle(
                            color: isLiked ? Colors.red : Colors.grey[600],
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Komentar akan segera tersedia'), behavior: SnackBarBehavior.floating),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.chat_bubble_outline_rounded, color: Colors.grey[600], size: 16),
                        const SizedBox(width: 4),
                        Text(
                          '${p['comments'] ?? 0}',
                          style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w700, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () {
                    final title = p['title']?.toString() ?? '';
                    final body = p['body']?.toString() ?? '';
                    Share.share('$title\n\n$body\n\n— DEKAT Platform');
                  },
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.share_outlined, color: Colors.grey[600], size: 16),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
