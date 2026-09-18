import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

class FavoritesPage extends ConsumerStatefulWidget {
  const FavoritesPage({super.key});

  @override
  ConsumerState<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends ConsumerState<FavoritesPage> {
  List<dynamic> _favorites = [];
  bool _loading = true;
  bool _removingId = false;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService().getFavorites();
      final data = response.data['data'];
      if (!mounted) return;
      setState(() {
        _favorites = data is List ? data : [];
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
        title: const Text('Favorit Saya'),
      ),
      body: _loading
          ? const ShimmerCardList()
          : _favorites.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            color: DEKATColors.primary.withValues(alpha: 0.08),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.favorite_border_rounded,
                            size: 44,
                            color: DEKATColors.primary,
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Belum ada favorit',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Simpan staff favorit Anda agar mudah booking lagi di lain waktu',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey[500], fontSize: 13, height: 1.5),
                        ),
                        const SizedBox(height: 20),
                        FilledButton.icon(
                          onPressed: () => context.go('/search'),
                          style: FilledButton.styleFrom(
                            backgroundColor: DEKATColors.primary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          ),
                          icon: const Icon(Icons.search_rounded, size: 18),
                          label: const Text(
                            'Cari Provider',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadFavorites,
                  color: DEKATColors.primary,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Summary header
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              DEKATColors.primary,
                              DEKATColors.primary.withValues(alpha: 0.8),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: DEKATColors.primary.withValues(alpha: 0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(
                                Icons.favorite_rounded,
                                color: Colors.white,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${_favorites.length} Staff Favorit',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Staff langganan Anda tersimpan di sini',
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha: 0.85),
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      ..._favorites.asMap().entries.map((entry) {
                        final fav = entry.value;
                        return RepaintBoundary(
                          child: _buildFavoriteCard(fav),
                        );
                      }),
                    ],
                  ),
                ),
    );
  }

  Widget _buildFavoriteCard(dynamic fav) {
    final providerName = fav['providerName']?.toString();
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
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: DEKATColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  (fav['staffName'] ?? 'S')[0].toUpperCase(),
                  style: const TextStyle(
                    color: DEKATColors.primary,
                    fontWeight: FontWeight.w800,
                    fontSize: 22,
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
                    fav['staffName'] ?? 'Staff',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    fav['specialties'] ?? 'Staff provider',
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (providerName != null && providerName.isNotEmpty) ...[
                    const SizedBox(height: 5),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.storefront_outlined, size: 11, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              providerName,
                              style: TextStyle(color: Colors.grey[600], fontSize: 11, fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: _removingId
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.red),
                      )
                    : const Icon(Icons.favorite_rounded, color: Colors.red, size: 22),
                tooltip: 'Hapus dari favorit',
                onPressed: _removingId ? null : () => _removeFavorite(fav['staffId']),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _removeFavorite(String staffId) async {
    setState(() => _removingId = true);
    try {
      await ApiService().removeFavorite(staffId);
      setState(() {
        _favorites.removeWhere((f) => f['staffId'] == staffId);
        _removingId = false;
      });
    } catch (e) {
      setState(() => _removingId = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }
}
