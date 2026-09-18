import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../provider_profile/domain/entities/provider_entity.dart';
import '../../../provider_profile/data/repositories/provider_repository_impl.dart';
import '../../../../shared/widgets/shimmer_loading.dart';
import '../../../../core/di/providers.dart';

final searchQueryProvider = StateProvider<String>((ref) => '');
final searchResultsProvider = FutureProvider.autoDispose<List<ProviderEntity>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  final repo = ProviderRepositoryImpl(ref.read(apiServiceProvider));
  if (query.isEmpty) {
    final result = await repo.getProviders();
    return result.fold((l) => throw Exception(l.message), (r) => r);
  }
  final result = await repo.searchProviders(query);
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final recentSearchesProvider = StateNotifierProvider<RecentSearchesNotifier, List<String>>((ref) {
  return RecentSearchesNotifier();
});

class RecentSearchesNotifier extends StateNotifier<List<String>> {
  RecentSearchesNotifier() : super(const []);
  void add(String query) {
    if (query.trim().isEmpty) return;
    state = [query, ...state.where((s) => s != query)].take(10).toList();
  }
  void remove(String query) => state = state.where((s) => s != query).toList();
  void clear() => state = [];
}

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});
  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  Timer? _debounce;

  /// Debounce 400ms: tanpa ini setiap keystroke memicu rebuild provider +
  /// 1 HTTP request (spam API + hasil balapan). Timer adalah pemakaian
  /// Timer yang valid — bukan polling data, melainkan penunda aksi user.
  void _onSearchChanged(String v) {
    setState(() {}); // refresh suffix icon clear secara instan (sync, murah)
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      ref.read(searchQueryProvider.notifier).state = v;
    });
  }

  @override
  void initState() { super.initState(); }
  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  String _formatPrice(num? price) {
    if (price == null) return '';
    final v = price.toDouble().toStringAsFixed(0);
    return v.replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }

  Widget _providerCard(BuildContext context, ProviderEntity p) {
    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => context.push('/provider/${p.slug}'),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: p.imageUrl != null
                        ? CachedNetworkImage(
                            imageUrl: p.imageUrl!,
                            width: 72,
                            height: 72,
                            fit: BoxFit.cover,
                            memCacheWidth: 144,
                            memCacheHeight: 144,
                            placeholder: (_, __) => Container(width: 72, height: 72, color: Colors.grey[200]),
                            errorWidget: (_, __, ___) => Container(
                              width: 72,
                              height: 72,
                              color: DEKATColors.primary.withValues(alpha: 0.08),
                              child: const Icon(Icons.storefront_rounded, color: DEKATColors.primary, size: 28),
                            ),
                          )
                        : Container(
                            width: 72,
                            height: 72,
                            color: DEKATColors.primary.withValues(alpha: 0.08),
                            child: const Icon(Icons.storefront_rounded, color: DEKATColors.primary, size: 28),
                          ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                p.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: DEKATColors.textPrimary),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.amber.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.star_rounded, size: 14, color: Colors.amber[700]),
                                  const SizedBox(width: 2),
                                  Text(
                                    p.rating.toStringAsFixed(1),
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: DEKATColors.textPrimary),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                              child: Text((p.category ?? 'Umum').toUpperCase(), style: const TextStyle(color: DEKATColors.primary, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.3)),
                            ),
                            if (p.city != null) ...[
                              const SizedBox(width: 6),
                              Icon(Icons.location_on_outlined, size: 12, color: Colors.grey[500]),
                              const SizedBox(width: 2),
                              Expanded(child: Text(p.city!, style: TextStyle(color: Colors.grey[600], fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                            ],
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.rate_review_outlined, size: 13, color: Colors.grey[500]),
                            const SizedBox(width: 4),
                            Text('${p.reviewCount} ulasan', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                            const Spacer(),
                            if (p.minPrice != null && p.minPrice! > 0)
                              Text('Mulai Rp ${_formatPrice(p.minPrice)}', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [DEKATColors.primary, DEKATColors.primary.withValues(alpha: 0.75)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Cari Layanan', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(
            'Temukan barbershop, salon, dan kecantikan favoritmu',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13),
          ),
          const SizedBox(height: 14),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 12, offset: const Offset(0, 4))],
            ),
            child: TextField(
              controller: _searchController, focusNode: _focusNode,
              decoration: InputDecoration(
                hintText: 'Cari layanan atau tempat...',
                hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded, color: DEKATColors.primary),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear_rounded), onPressed: () { _searchController.clear(); ref.read(searchQueryProvider.notifier).state = ''; setState(() {}); })
                    : null,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                filled: true, fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onChanged: _onSearchChanged,
              onSubmitted: (v) { if (v.isNotEmpty) ref.read(recentSearchesProvider.notifier).add(v); },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSection(List<String> recentSearches) {
    return Expanded(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Terakhir Dicari', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: DEKATColors.textPrimary)),
                TextButton(onPressed: () => ref.read(recentSearchesProvider.notifier).clear(), child: const Text('Hapus Semua')),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final q in recentSearches)
                  RepaintBoundary(
                    child: InputChip(
                      avatar: const Icon(Icons.history_rounded, size: 16, color: DEKATColors.primary),
                      label: Text(q, style: const TextStyle(fontSize: 13)),
                      deleteIcon: const Icon(Icons.close_rounded, size: 16),
                      onDeleted: () => ref.read(recentSearchesProvider.notifier).remove(q),
                      onPressed: () { _searchController.text = q; ref.read(searchQueryProvider.notifier).state = q; setState(() {}); },
                      backgroundColor: Colors.white,
                      side: BorderSide(color: Colors.grey.shade200),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState({required IconData icon, required String title, required String subtitle}) {
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
              child: Icon(icon, size: 40, color: DEKATColors.primary),
            ),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: DEKATColors.textPrimary), textAlign: TextAlign.center),
            const SizedBox(height: 6),
            Text(subtitle, style: TextStyle(fontSize: 13, color: Colors.grey[500]), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState({required String message, required VoidCallback onRetry}) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.08), shape: BoxShape.circle),
              child: const Icon(Icons.cloud_off_outlined, size: 40, color: Colors.red),
            ),
            const SizedBox(height: 16),
            Text(message, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: DEKATColors.textPrimary), textAlign: TextAlign.center),
            const SizedBox(height: 4),
            TextButton(
              onPressed: onRetry,
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsBranch() {
    final searchResults = ref.watch(searchResultsProvider);
    final isSearching = _searchController.text.isNotEmpty;
    return Expanded(
      child: searchResults.when(
        data: (results) {
          if (results.isEmpty) {
            return _buildEmptyState(
              icon: Icons.search_off_rounded,
              title: isSearching ? 'Hasil tidak ditemukan' : 'Belum ada penyedia layanan',
              subtitle: isSearching ? 'Coba kata kunci lain atau jelajahi semua layanan' : 'Coba lagi nanti',
            );
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: Text(
                  '${results.length} tempat ditemukan',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: DEKATColors.textPrimary),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  itemCount: results.length,
                  itemBuilder: (context, index) => _providerCard(context, results[index]),
                ),
              ),
            ],
          );
        },
        loading: () => const ShimmerCardList(),
        error: (e, _) => _buildErrorState(
          message: isSearching ? 'Gagal mencari layanan' : 'Gagal memuat penyedia layanan',
          onRetry: () => ref.invalidate(searchResultsProvider),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final recentSearches = ref.watch(recentSearchesProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: SafeArea(
        child: Column(
          children: [
            _buildSearchHeader(),
            if (_searchController.text.isEmpty && recentSearches.isNotEmpty)
              _buildRecentSection(recentSearches)
            else
              _buildResultsBranch(),
          ],
        ),
      ),
    );
  }
}
