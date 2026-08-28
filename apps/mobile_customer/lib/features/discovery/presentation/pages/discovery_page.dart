import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
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

  // soft gradients cycle
  static const _gradients = [
    DEKATColors.softViolet,
    DEKATColors.softPink,
    DEKATColors.softMint,
    DEKATColors.softPeach,
    DEKATColors.softSky,
    DEKATColors.softLavender,
  ];
  static const _iconColors = [
    Color(0xFF7A7CFF),
    Color(0xFFFF6B8A),
    Color(0xFF2ECC8A),
    Color(0xFFFF9F43),
    Color(0xFF4AA8FF),
    Color(0xFF9B7CFF),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providersAsync = ref.watch(discoveryProvider);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: RefreshIndicator(
          color: DEKATColors.primary,
          backgroundColor: Colors.white,
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
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFFE8E8FF), Color(0xFFFFE8EC), Color(0xFFFAF9FF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
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
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight),
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.2), blurRadius: 10, offset: const Offset(0, 4))],
                                  ),
                                  child: const Icon(Icons.spa_rounded, color: Colors.white, size: 22),
                                ),
                                const SizedBox(width: 10),
                                Text('Discover', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.6, color: DEKATColors.textPrimary)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text('Temukan layanan terbaik di sekitarmu ✨', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600], fontWeight: FontWeight.w500)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      GestureDetector(
                        onTap: () => context.push('/search'),
                        child: Hero(
                          tag: 'search-bar',
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.10)),
                              boxShadow: [BoxShadow(color: DEKATColors.primary.withValues(alpha: 0.06), blurRadius: 18, offset: const Offset(0, 6))],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(7),
                                  decoration: BoxDecoration(color: DEKATColors.secondaryLight, borderRadius: BorderRadius.circular(10)),
                                  child: const Icon(Icons.search_rounded, color: DEKATColors.secondary, size: 18),
                                ),
                                const SizedBox(width: 12),
                                Text('Cari layanan, salon, spa...', style: TextStyle(color: Colors.grey[500], fontSize: 14, fontWeight: FontWeight.w500)),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.all(7),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topLeft, end: Alignment.bottomRight),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(Icons.tune_rounded, color: Colors.white, size: 16),
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
                child: Container(
                  color: DEKATColors.backgroundLight,
                  padding: const EdgeInsets.only(top: 12, bottom: 6),
                  child: SizedBox(
                    height: 102,
                    child: categoriesAsync.when(
                      data: (categories) => ListView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: categories.length,
                        itemBuilder: (context, index) {
                          final cat = categories[index];
                          final grad = _gradients[index % _gradients.length];
                          final iconColor = _iconColors[index % _iconColors.length];
                          return TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0, end: 1),
                            duration: Duration(milliseconds: 320 + index * 55),
                            curve: Curves.easeOutBack,
                            builder: (context, value, child) => Opacity(
                              opacity: value,
                              child: Transform.scale(scale: 0.92 + 0.08 * value, child: child),
                            ),
                            child: _CategoryItem(
                              icon: _iconForCategory(cat.name),
                              label: cat.name,
                              gradient: grad,
                              iconColor: iconColor,
                              onTap: () => context.push('/search?category=${cat.name}'),
                            ),
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
              ),
              SliverToBoxAdapter(
                child: Container(
                  color: DEKATColors.backgroundLight,
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet, begin: Alignment.topCenter, end: Alignment.bottomCenter), borderRadius: BorderRadius.circular(4))),
                          const SizedBox(width: 8),
                          Text('Rekomendasi', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                          const SizedBox(width: 6),
                          Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: DEKATColors.warningLight, borderRadius: BorderRadius.circular(6)), child: const Icon(Icons.auto_awesome_rounded, size: 12, color: Color(0xFFFF9F43))),
                        ],
                      ),
                      TextButton(
                        onPressed: () => context.push('/providers'),
                        style: TextButton.styleFrom(visualDensity: VisualDensity.compact, foregroundColor: DEKATColors.primary),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('Lihat Semua', style: TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(width: 4),
                            Container(padding: const EdgeInsets.all(3), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(6)), child: const Icon(Icons.arrow_forward_rounded, size: 12, color: DEKATColors.primary)),
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
                      child: Container(
                        margin: const EdgeInsets.all(16),
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Colors.white, Color(0xFFF8F7FF)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.08)),
                        ),
                        child: Column(
                          children: [
                            Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.storefront_rounded, size: 36, color: Color(0xFF4AA8FF))),
                            const SizedBox(height: 12),
                            Text('Belum ada provider', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
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
                        final grad = _gradients[index % _gradients.length];
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
                            gradient: grad,
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
                  child: Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12)),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 14, offset: const Offset(0, 4))],
                    ),
                    child: Column(
                      children: [
                        Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.wifi_off_rounded, size: 28, color: DEKATColors.error)),
                        const SizedBox(height: 10),
                        Text('Gagal memuat', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        Text(e.toString().replaceAll('Exception: ', ''), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                        const SizedBox(height: 12),
                        FilledButton.icon(onPressed: () => ref.invalidate(discoveryProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba Lagi')),
                      ],
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
    if (n.contains('nail')) return Icons.brush_rounded;
    if (n.contains('kecantikan') || n.contains('beauty')) return Icons.brush_rounded;
    if (n.contains('kesehatan') || n.contains('health')) return Icons.favorite_rounded;
    if (n.contains('olahraga') || n.contains('fitness') || n.contains('gym')) return Icons.fitness_center_rounded;
    if (n.contains('massage') || n.contains('pijat')) return Icons.spa_rounded;
    return Icons.apps_rounded;
  }
}

class _CategoryItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final List<Color> gradient;
  final Color iconColor;
  final VoidCallback onTap;
  const _CategoryItem({required this.icon, required this.label, required this.gradient, required this.iconColor, required this.onTap});
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
          padding: const EdgeInsets.only(right: 12),
          child: Column(
            children: [
              Container(
                width: 66,
                height: 66,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: widget.gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [BoxShadow(color: widget.gradient.first.withValues(alpha: 0.28), blurRadius: 10, offset: const Offset(0, 4))],
                  border: Border.all(color: Colors.white.withValues(alpha: 0.8), width: 1.2),
                ),
                child: Icon(widget.icon, color: Colors.white, size: 28, shadows: [Shadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 4)]),
              ),
              const SizedBox(height: 7),
              SizedBox(
                width: 78,
                child: Text(widget.label, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w700, fontSize: 11, color: DEKATColors.textPrimary)),
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
  final List<Color> gradient;
  final VoidCallback onTap;
  const _FeaturedCard({required this.name, required this.category, required this.rating, required this.distance, this.imageUrl, required this.gradient, required this.onTap});
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
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(color: widget.gradient.first.withValues(alpha: _pressed ? 0.08 : 0.14), blurRadius: _pressed ? 8 : 16, offset: const Offset(0, 6)),
              BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2)),
            ],
            border: Border.all(color: widget.gradient.last.withValues(alpha: 0.5)),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
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
                          width: 74,
                          height: 74,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: widget.gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [BoxShadow(color: widget.gradient.first.withValues(alpha: 0.22), blurRadius: 8, offset: const Offset(0, 3))],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(14),
                            child: widget.imageUrl != null && widget.imageUrl!.isNotEmpty
                                ? Image.network(widget.imageUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.storefront_rounded, color: Colors.white, size: 32))
                                : const Icon(Icons.storefront_rounded, color: Colors.white, size: 30),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, color: DEKATColors.textPrimary)),
                            const SizedBox(height: 3),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                              decoration: BoxDecoration(color: widget.gradient.last, borderRadius: BorderRadius.circular(8)),
                              child: Text(widget.category, style: TextStyle(color: widget.gradient.first.withValues(alpha: 0.95), fontSize: 11, fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Container(padding: const EdgeInsets.all(3), decoration: BoxDecoration(color: const Color(0xFFFFF4D6), borderRadius: BorderRadius.circular(6)), child: Icon(Icons.star_rounded, size: 12, color: Colors.amber[700])),
                                const SizedBox(width: 4),
                                Text(widget.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                                if (widget.distance.isNotEmpty) ...[
                                  const SizedBox(width: 10),
                                  Container(padding: const EdgeInsets.all(3), decoration: BoxDecoration(color: DEKATColors.softSky.last, borderRadius: BorderRadius.circular(6)), child: Icon(Icons.location_on_rounded, size: 10, color: DEKATColors.info)),
                                  const SizedBox(width: 4),
                                  Expanded(child: Text(widget.distance, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600], fontSize: 11, fontWeight: FontWeight.w500))),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: _pressed ? widget.gradient : [Colors.grey[100]!, Colors.grey[50]!], begin: Alignment.topLeft, end: Alignment.bottomRight),
                          shape: BoxShape.circle,
                          boxShadow: _pressed ? [BoxShadow(color: widget.gradient.first.withValues(alpha: 0.2), blurRadius: 6)] : null,
                        ),
                        child: Icon(Icons.chevron_right_rounded, size: 18, color: _pressed ? Colors.white : Colors.grey[500]),
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
