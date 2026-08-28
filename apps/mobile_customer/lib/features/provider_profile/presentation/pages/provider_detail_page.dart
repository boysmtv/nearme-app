import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

class ProviderDetail {
  final String id;
  final String slug;
  final String name;
  final String? category;
  final String? imageUrl;
  final double rating;
  final int reviewCount;
  final String? city;
  final String? address;
  final String? description;
  final List<Map<String, dynamic>> locations;

  const ProviderDetail({
    required this.id,
    required this.slug,
    required this.name,
    this.category,
    this.imageUrl,
    required this.rating,
    required this.reviewCount,
    this.city,
    this.address,
    this.description,
    required this.locations,
  });

  String? get firstLocationId =>
      locations.isNotEmpty ? locations.first['id'] as String? : null;
}

final providerDetailProvider =
    FutureProvider.autoDispose.family<ProviderDetail, String>((ref, slug) async {
  final response = await ApiService().getProvider(slug);
  final data = response.data['data'] as Map<String, dynamic>;
  return ProviderDetail(
    id: data['id'] as String,
    slug: (data['slug'] ?? slug) as String,
    name: data['name'] as String,
    category: data['category'] as String?,
    imageUrl: data['imageUrl'] as String?,
    rating: (data['rating'] as num?)?.toDouble() ?? 0,
    reviewCount: (data['reviewCount'] as num?)?.toInt() ?? 0,
    city: data['city'] as String?,
    address: data['address'] as String?,
    description: data['description'] as String?,
    locations: ((data['locations'] ?? []) as List).cast<Map<String, dynamic>>(),
  );
});

final providerServicesProvider =
    FutureProvider.autoDispose.family<List<ServiceRow>, String>((ref, providerId) async {
  final response = await ApiService().getProviderServices(providerId);
  return ((response.data['data'] ?? []) as List)
      .map((e) => ServiceRow.fromJson(e as Map<String, dynamic>))
      .toList();
});

class ProviderDetailPage extends ConsumerWidget {
  final String providerSlug;
  const ProviderDetailPage({super.key, required this.providerSlug});

  static const _grads = [
    DEKATColors.softViolet,
    DEKATColors.softPink,
    DEKATColors.softMint,
    DEKATColors.softPeach,
    DEKATColors.softSky,
    DEKATColors.softLavender,
  ];

  List<Color> _gradForIndex(int i) => _grads[i % _grads.length];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providerAsync = ref.watch(providerDetailProvider(providerSlug));
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: providerAsync.when(
        data: (provider) {
          final servicesAsync = ref.watch(providerServicesProvider(provider.id));
          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverAppBar(
                expandedHeight: 260,
                pinned: true,
                backgroundColor: DEKATColors.primary,
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(colors: [Color(0xFF8B8CFF), Color(0xFFFF8E9E), Color(0xFFFFD67E)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.black.withValues(alpha: 0.06), Colors.black.withValues(alpha: 0.22)], begin: Alignment.topCenter, end: Alignment.bottomCenter)),
                      ),
                      Center(
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          const SizedBox(height: 30),
                          Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.92), borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 16)]),
                            child: const Icon(Icons.storefront_rounded, size: 48, color: DEKATColors.primary),
                          ),
                          const SizedBox(height: 12),
                          Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.88), borderRadius: BorderRadius.circular(20)), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.auto_awesome_rounded, size: 12, color: DEKATColors.primary), const SizedBox(width: 4), Text(provider.category ?? 'General', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: DEKATColors.primary))])),
                        ]),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Container(
                  color: DEKATColors.backgroundLight,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 400), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(provider.name, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.4)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha: 0.1)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky), borderRadius: BorderRadius.circular(7)), child: const Icon(Icons.location_on_rounded, size: 12, color: Colors.white)),
                            const SizedBox(width: 7),
                            Flexible(child: Text('${provider.category ?? "General"}${provider.address != null ? " • ${provider.address}" : ""}', style: TextStyle(color: Colors.grey[700], fontSize: 12, fontWeight: FontWeight.w500))),
                          ]),
                        ),
                      ])),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFFFF4D6), Color(0xFFFFE8EC)]), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFFFD67E).withValues(alpha: 0.4))),
                        child: Row(children: [
                          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(9)), child: Icon(Icons.star_rounded, size: 18, color: Colors.amber[700])),
                          const SizedBox(width: 8),
                          Text('${provider.rating.toStringAsFixed(1)}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                          const SizedBox(width: 6),
                          Text('(${provider.reviewCount} reviews)', style: TextStyle(color: Colors.grey[700], fontSize: 13, fontWeight: FontWeight.w500)),
                          const Spacer(),
                          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: Row(children: [const Icon(Icons.favorite_rounded, size: 12, color: DEKATColors.secondary), const SizedBox(width: 4), Text('Favorite', style: TextStyle(color: Colors.grey[700], fontSize: 11, fontWeight: FontWeight.w600))])),
                        ]),
                      ),
                      if (provider.description != null) ...[
                        const SizedBox(height: 18),
                        Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softMint), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), const Text('About', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800))]),
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: DEKATColors.successLight), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)]),
                          child: Text(provider.description!, style: TextStyle(color: Colors.grey[700], height: 1.5, fontSize: 13)),
                        ),
                      ],
                      const SizedBox(height: 20),
                      Row(children: [Container(width: 4, height: 18, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softViolet), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), const Text('Services', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)), const SizedBox(width: 8), Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(20)), child: servicesAsync.maybeWhen(data: (s)=> Text('${s.length} layanan', style: const TextStyle(color: DEKATColors.primary, fontSize: 11, fontWeight: FontWeight.w700)), orElse: ()=> const SizedBox()))]),
                    ],
                  ),
                ),
              ),
              servicesAsync.when(
                data: (services) => SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final s = services[index];
                      final grad = _gradForIndex(index);
                      IconData icon;
                      final n = s.name.toLowerCase();
                      if (n.contains('hair') || n.contains('cut')) icon = Icons.content_cut_rounded;
                      else if (n.contains('spa') || n.contains('massage')) icon = Icons.spa_rounded;
                      else if (n.contains('nail')) icon = Icons.brush_rounded;
                      else if (n.contains('facial')) icon = Icons.face_retouching_natural_rounded;
                      else icon = Icons.auto_awesome_rounded;
                      return TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: Duration(milliseconds: 300+index*45), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 10*(1-v)), child: ch)), child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: grad.last.withValues(alpha: 0.6)), boxShadow: [BoxShadow(color: grad.first.withValues(alpha: 0.12), blurRadius: 14, offset: const Offset(0, 4))]),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(14),
                          leading: Container(
                            width: 56, height: 56,
                            decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(13)),
                            child: Icon(icon, color: Colors.white, size: 24),
                          ),
                          title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          subtitle: Container(margin: const EdgeInsets.only(top: 4), padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: grad.last, borderRadius: BorderRadius.circular(6)), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.schedule_rounded, size: 11, color: grad.first), const SizedBox(width: 4), Text('${s.durationMinutes} min', style: TextStyle(color: grad.first, fontSize: 11, fontWeight: FontWeight.w600))])),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(10)),
                            child: Text(formatRupiah(s.price), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: Colors.white)),
                          ),
                          onTap: () => context.push(
                            '/provider/${provider.id}/availability?serviceId=${s.id}${provider.firstLocationId != null ? '&locationId=${provider.firstLocationId}' : ''}',
                          ),
                        ),
                      ));
                    },
                    childCount: services.length,
                  ),
                ),
                loading: () => const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator(color: DEKATColors.primary)))),
                error: (e, _) => SliverToBoxAdapter(
                  child: Center(
                    child: Container(margin: const EdgeInsets.all(16), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12))), child: TextButton(onPressed: () => ref.invalidate(providerServicesProvider(provider.id)), child: const Text('Failed to load services - Retry'))),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
        error: (e, _) => Center(
          child: Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: DEKATColors.error.withValues(alpha: 0.12))),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.error_outline_rounded, color: DEKATColors.error)),
                const SizedBox(height: 12),
                Text('Error: $e', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                const SizedBox(height: 12),
                FilledButton.icon(onPressed: () => ref.invalidate(providerDetailProvider(providerSlug)), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Retry')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
