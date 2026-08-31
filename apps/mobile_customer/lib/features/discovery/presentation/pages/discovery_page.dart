import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

final discoveryProvider = FutureProvider.autoDispose<List<ProviderRow>>((ref) async {
  final response = await ApiService().getProviders();
  return ((response.data['data'] ?? []) as List)
      .map((e) => ProviderRow.fromJson(e as Map<String, dynamic>))
      .toList();
});

final categoriesProvider = FutureProvider.autoDispose<List<Category>>((ref) async {
  final response = await ApiService().getCategories();
  return ((response.data['data'] ?? []) as List)
      .map((e) => Category.fromJson(e as Map<String, dynamic>))
      .toList();
});

class DiscoveryPage extends ConsumerWidget {
  const DiscoveryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providersAsync = ref.watch(discoveryProvider);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(discoveryProvider);
            ref.invalidate(categoriesProvider);
            await Future.wait([
              ref.read(discoveryProvider.future).catchError((_) {}),
              ref.read(categoriesProvider.future).catchError((_) {}),
            ]);
          },
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: 1),
                        duration: const Duration(milliseconds: 500),
                        curve: Curves.easeOutCubic,
                        builder: (context, value, child) => Opacity(
                          opacity: value,
                          child: Transform.translate(offset: Offset(0, 12 * (1 - value)), child: child),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Discover', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, letterSpacing: -0.5)),
                            const SizedBox(height: 4),
                            Text('Temukan layanan terbaik di sekitarmu', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600])),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      GestureDetector(
                        onTap: () => context.push('/search'),
                        child: Hero(
                          tag: 'search-bar',
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.grey[200]!),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.search_rounded, color: Colors.grey[600], size: 20),
                                const SizedBox(width: 12),
                                Text('Cari layanan, salon, spa...', style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                  child: Icon(Icons.tune_rounded, color: Theme.of(context).colorScheme.primary, size: 16),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 96,
                  child: categoriesAsync.when(
                    data: (categories) => ListView.builder(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: categories.length,
                      itemBuilder: (context, index) {
                        final cat = categories[index];
                        return TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0, end: 1),
                          duration: Duration(milliseconds: 320 + index * 55),
                          curve: Curves.easeOutBack,
                          builder: (context, value, child) => Opacity(
                            opacity: value.clamp(0.0, 1.0),
                            child: Transform.scale(scale: 0.92 + 0.08 * value.clamp(0.0, 1.0), child: child),
                          ),
                          child: _CategoryItem(icon: _iconForCategory(cat.name), label: cat.name, onTap: () => context.push('/search?category=${cat.name}')),
                        );
                      },
                    ),
                    loading: () => ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: 6,
                      itemBuilder: (_, __) => const Padding(
                        padding: EdgeInsets.only(right: 12),
                        child: _ShimmerCategory(),
                      ),
                    ),
                    error: (e, _) => Center(
                      child: TextButton.icon(
                        onPressed: () => ref.invalidate(categoriesProvider),
                        icon: const Icon(Icons.refresh_rounded, size: 16),
                        label: const Text('Muat ulang kategori'),
                      ),
                    ),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Rekomendasi', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      TextButton(
                        onPressed: () => context.push('/providers'),
                        style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('Lihat Semua'),
                            const SizedBox(width: 4),
                            Icon(Icons.arrow_forward_rounded, size: 14, color: Theme.of(context).colorScheme.primary),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              providersAsync.when(
                data: (providers) {
                  if (providers.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            Icon(Icons.store_outlined, size: 48, color: Colors.grey[300]),
                            const SizedBox(height: 12),
                            Text('Belum ada provider', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w500)),
                            const SizedBox(height: 4),
                            Text('Coba lagi nanti atau jelajahi kategori', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                          ],
                        ),
                      ),
                    );
                  }
                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final provider = providers[index];
                        return TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0, end: 1),
                          duration: Duration(milliseconds: 340 + index * 45),
                          curve: Curves.easeOutCubic,
                          builder: (context, value, child) => Opacity(
                            opacity: value,
                            child: Transform.translate(offset: Offset(0, 18 * (1 - value)), child: child),
                          ),
                          child: _FeaturedCard(
                            name: provider.name,
                            category: provider.category ?? 'Umum',
                            rating: provider.rating,
                            distance: provider.city ?? '',
                            imageUrl: provider.imageUrl,
                            onTap: () => context.push('/provider/${provider.slug}'),
                          ),
                        );
                      },
                      childCount: providers.length,
                    ),
                  );
                },
                loading: () => SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, __) => const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      child: _ShimmerCard(),
                    ),
                    childCount: 4,
                  ),
                ),
                error: (e, _) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!)),
                      child: Column(
                        children: [
                          Icon(Icons.wifi_off_rounded, size: 36, color: Colors.grey[400]),
                          const SizedBox(height: 10),
                          Text('Gagal memuat', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                          const SizedBox(height: 12),
                          FilledButton.icon(onPressed: () => ref.invalidate(discoveryProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba Lagi')),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        ),
      ),
    );
  }

  static IconData _iconForCategory(String name) {
    final n = name.toLowerCase();
    if (n.contains('barber')) return Icons.content_cut_rounded;
    if (n.contains('salon')) return Icons.face_retouching_natural_rounded;
    if (n.contains('spa')) return Icons.spa_rounded;
    if (n.contains('kecantikan')) return Icons.brush_rounded;
    if (n.contains('kesehatan')) return Icons.favorite_rounded;
    if (n.contains('olahraga')) return Icons.fitness_center_rounded;
    return Icons.apps_rounded;
  }
}

class _CategoryItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _CategoryItem({required this.icon, required this.label, required this.onTap});
  @override
  State<_CategoryItem> createState() => _CategoryItemState();
}

class _CategoryItemState extends State<_CategoryItem> with SingleTickerProviderStateMixin {
  double _scale = 1.0;
  void _onTapDown(_) => setState(() => _scale = 0.92);
  void _onTapUp(_) => setState(() => _scale = 1.0);
  void _onTapCancel() => setState(() => _scale = 1.0);
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 140),
        curve: Curves.easeOut,
        child: Padding(
          padding: const EdgeInsets.only(right: 14),
          child: Column(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12)),
                ),
                child: Icon(widget.icon, color: Theme.of(context).colorScheme.primary, size: 26),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: 72,
                child: Text(widget.label, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600, fontSize: 11)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeaturedCard extends StatefulWidget {
  final String name;
  final String category;
  final double rating;
  final String distance;
  final String? imageUrl;
  final VoidCallback onTap;
  const _FeaturedCard({required this.name, required this.category, required this.rating, required this.distance, this.imageUrl, required this.onTap});
  @override
  State<_FeaturedCard> createState() => _FeaturedCardState();
}

class _FeaturedCardState extends State<_FeaturedCard> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _pressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 140),
        curve: Curves.easeOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: _pressed ? 0.02 : 0.06), blurRadius: _pressed ? 8 : 14, offset: const Offset(0, 4)),
            ],
            border: Border.all(color: Colors.grey[100]!),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: widget.onTap,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      Hero(
                        tag: 'provider-${widget.name}',
                        child: Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: widget.imageUrl != null && widget.imageUrl!.isNotEmpty
                                ? Image.network(widget.imageUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.store_rounded, color: Colors.grey))
                                : const Icon(Icons.store_rounded, color: Colors.grey),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 3),
                            Text(widget.category, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.star_rounded, size: 14, color: Colors.amber[600]),
                                const SizedBox(width: 3),
                                Text(widget.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                if (widget.distance.isNotEmpty) ...[
                                  const SizedBox(width: 10),
                                  Icon(Icons.location_on_rounded, size: 14, color: Colors.grey[400]),
                                  const SizedBox(width: 3),
                                  Expanded(child: Text(widget.distance, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600], fontSize: 12))),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(color: _pressed ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.12) : Colors.grey[100], shape: BoxShape.circle),
                        child: Icon(Icons.chevron_right_rounded, size: 18, color: _pressed ? Theme.of(context).colorScheme.primary : Colors.grey[500]),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ShimmerCategory extends StatefulWidget {
  const _ShimmerCategory();
  @override
  State<_ShimmerCategory> createState() => _ShimmerCategoryState();
}

class _ShimmerCategoryState extends State<_ShimmerCategory> with SingleTickerProviderStateMixin {
  late AnimationController _c;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (_, __) => Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                colors: [Colors.grey[200]!, Colors.grey[100]!, Colors.grey[200]!],
                stops: [0.2, 0.5 + 0.2 * _c.value, 0.8],
                begin: Alignment(-1 - _c.value, 0),
                end: Alignment(1 + _c.value, 0),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Container(width: 48, height: 8, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(4))),
        ],
      ),
    );
  }
}

class _ShimmerCard extends StatefulWidget {
  const _ShimmerCard();
  @override
  State<_ShimmerCard> createState() => _ShimmerCardState();
}

class _ShimmerCardState extends State<_ShimmerCard> with SingleTickerProviderStateMixin {
  late AnimationController _c;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (_, __) => Container(
        height: 96,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[100]!),
        ),
        child: Row(
          children: [
            Container(width: 72, height: 72, margin: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(12))),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(width: 120, height: 12, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(6))),
                  const SizedBox(height: 8),
                  Container(width: 80, height: 8, decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(4))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
