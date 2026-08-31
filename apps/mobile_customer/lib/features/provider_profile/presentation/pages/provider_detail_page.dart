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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providerAsync = ref.watch(providerDetailProvider(providerSlug));
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: providerAsync.when(
        data: (provider) {
          final servicesAsync = ref.watch(providerServicesProvider(provider.id));
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 280,
                pinned: true,
                backgroundColor: Colors.white,
                surfaceTintColor: Colors.white,
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [DEKATColors.primary.withOpacity(0.15), DEKATColors.primary.withOpacity(0.05)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                        ),
                        child: provider.imageUrl != null && provider.imageUrl!.isNotEmpty
                            ? Image.network(provider.imageUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.store_rounded, size: 80, color: Colors.grey))
                            : const Center(child: Icon(Icons.store_rounded, size: 72, color: Colors.grey)),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [Colors.transparent, Colors.black.withOpacity(0.55)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                        ),
                      ),
                      Positioned(
                        bottom: 16,
                        left: 16,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 16, offset: const Offset(0, 6))]),
                          child: Row(children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.12), borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withOpacity(0.15))),
                              child: const Icon(Icons.store_rounded, color: DEKATColors.primary, size: 28),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(provider.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 2),
                                Row(children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                    child: Text((provider.category ?? 'Umum').toUpperCase(), style: const TextStyle(color: DEKATColors.primary, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(Icons.star_rounded, size: 14, color: Colors.amber[600]),
                                  const SizedBox(width: 2),
                                  Text('${provider.rating.toStringAsFixed(1)}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                                  Text(' (${provider.reviewCount})', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                ]),
                                if (provider.city != null) ...[
                                  const SizedBox(height: 4),
                                  Row(children: [
                                    Icon(Icons.location_on_rounded, size: 12, color: Colors.grey[500]),
                                    const SizedBox(width: 4),
                                    Expanded(child: Text('${provider.city}${provider.address != null ? ' • ${provider.address}' : ''}', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600], fontSize: 11))),
                                  ]),
                                ],
                              ]),
                            ),
                          ]),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    if (provider.description != null) ...[
                      Row(children: [
                        Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                        const SizedBox(width: 8),
                        const Text('Tentang', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                      ]),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[200]!)),
                        child: Text(provider.description!, style: TextStyle(color: Colors.grey[700], height: 1.5, fontSize: 13)),
                      ),
                      const SizedBox(height: 16),
                    ],
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Row(children: [
                        Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                        const SizedBox(width: 8),
                        Text('Layanan (${ref.watch(providerServicesProvider(provider.id)).valueOrNull?.length ?? '-'})', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                      ]),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.08), borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withOpacity(0.15))),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.verified_rounded, size: 12, color: DEKATColors.primary),
                          const SizedBox(width: 4),
                          Text('${provider.reviewCount} ulasan', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 11)),
                        ]),
                      ),
                    ]),
                  ]),
                ),
              ),
              servicesAsync.when(
                data: (services) {
                  if (services.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(children: [
                          Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.spa_outlined, size: 36, color: Colors.grey[400])),
                          const SizedBox(height: 12),
                          Text('Belum ada layanan', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600)),
                        ]),
                      ),
                    );
                  }
                  return SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final s = services[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey[200]!),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
                            ),
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                borderRadius: BorderRadius.circular(16),
                                onTap: () => context.push('/provider/${provider.id}/availability?serviceId=${s.id}${provider.firstLocationId != null ? '&locationId=${provider.firstLocationId}' : ''}'),
                                child: Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Row(children: [
                                    Container(
                                      width: 56,
                                      height: 56,
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(colors: [DEKATColors.primary.withOpacity(0.15), DEKATColors.primary.withOpacity(0.08)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: DEKATColors.primary.withOpacity(0.12)),
                                      ),
                                      child: const Icon(Icons.spa_rounded, color: DEKATColors.primary, size: 24),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                        Text(s.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                                        const SizedBox(height: 4),
                                        Row(children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(6)),
                                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                                              Icon(Icons.schedule_rounded, size: 11, color: Colors.grey[600]),
                                              const SizedBox(width: 4),
                                              Text('${s.durationMinutes} min', style: TextStyle(color: Colors.grey[700], fontSize: 11, fontWeight: FontWeight.w600)),
                                            ]),
                                          ),
                                          const SizedBox(width: 6),
                                          if (s.description != null && s.description!.isNotEmpty)
                                            Expanded(child: Text(s.description!, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[500], fontSize: 11))),
                                        ]),
                                      ]),
                                    ),
                                    const SizedBox(width: 12),
                                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                      Text(formatRupiah(s.price), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: DEKATColors.primary)),
                                      const SizedBox(height: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(20)),
                                        child: const Row(mainAxisSize: MainAxisSize.min, children: [
                                          Text('Pilih', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 11)),
                                          SizedBox(width: 4),
                                          Icon(Icons.arrow_forward_rounded, size: 12, color: Colors.white),
                                        ]),
                                      ),
                                    ]),
                                  ]),
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: services.length,
                      ),
                    ),
                  );
                },
                loading: () => SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (_, __) => Container(
                        height: 84,
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[100]!)),
                        child: Row(children: [
                          Container(width: 56, height: 56, margin: const EdgeInsets.all(14), decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(12))),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
                            Container(width: 120, height: 12, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(6))),
                            const SizedBox(height: 8),
                            Container(width: 80, height: 8, decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(4))),
                          ])),
                        ]),
                      ),
                      childCount: 3,
                    ),
                  ),
                ),
                error: (e, _) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red[100]!)),
                      child: Row(children: [
                        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.red[50], shape: BoxShape.circle), child: Icon(Icons.error_outline_rounded, color: Colors.red[400])),
                        const SizedBox(width: 12),
                        const Expanded(child: Text('Gagal memuat layanan', style: TextStyle(fontWeight: FontWeight.w600))),
                        TextButton(onPressed: () => ref.invalidate(providerServicesProvider(provider.id)), child: const Text('Retry')),
                      ]),
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Error: $e'),
              TextButton(
                onPressed: () => ref.invalidate(providerDetailProvider(providerSlug)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
