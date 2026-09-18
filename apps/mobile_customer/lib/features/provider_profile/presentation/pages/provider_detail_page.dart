import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../domain/entities/provider_entity.dart';
import '../../domain/entities/service_entity.dart';
import '../../../../shared/utils/format_rupiah.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

final providerDetailProvider =
    FutureProvider.autoDispose.family<ProviderEntity, String>((ref, slug) async {
  final response = await ApiService().getProvider(slug);
  final data = response.data['data'] as Map<String, dynamic>;
  return ProviderEntity.fromJson(data);
});

final providerServicesProvider =
    FutureProvider.autoDispose.family<List<ServiceEntity>, String>((ref, providerId) async {
  final response = await ApiService().getProviderServices(providerId);
  return ((response.data['data'] ?? []) as List)
      .map((e) => ServiceEntity.fromJson(e as Map<String, dynamic>))
      .toList();
});

final providerGalleryProvider =
    FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>((ref, providerId) async {
  final response = await ApiService().getProviderMedia(providerId);
  final data = response.data['data'] as List?;
  if (data == null) return [];
  return data.cast<Map<String, dynamic>>();
});

final providerStaffWithPortfolioProvider =
    FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>((ref, providerId) async {
  final response = await ApiService().getProviderStaff(providerId);
  final data = response.data['data'] as List?;
  if (data == null) return [];
  return data.cast<Map<String, dynamic>>();
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
          return Column(
            children: [
              Expanded(
                child: CustomScrollView(
                  key: const PageStorageKey<String>('provider_detail_scroll'),
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
                                gradient: LinearGradient(colors: [DEKATColors.primary.withValues(alpha:0.15), DEKATColors.primary.withValues(alpha:0.05)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                              ),
                              child: provider.imageUrl != null && provider.imageUrl!.isNotEmpty
                                  ? CachedNetworkImage(imageUrl: provider.imageUrl!, fit: BoxFit.cover, memCacheWidth: 800, memCacheHeight: 560, placeholder: (_, __) => Container(color: Colors.grey[200]), errorWidget: (_, __, ___) => const Icon(Icons.store_rounded, size: 80, color: Colors.grey))
                                  : const Center(child: Icon(Icons.store_rounded, size: 72, color: Colors.grey)),
                            ),
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [Colors.transparent, Colors.black.withValues(alpha:0.55)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                              ),
                            ),
                            Positioned(
                              bottom: 16,
                              left: 16,
                              right: 16,
                              child: RepaintBoundary(
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha:0.12), blurRadius: 16, offset: const Offset(0, 6))]),
                                  child: Row(children: [
                                    Container(
                                      width: 56,
                                      height: 56,
                                      decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.12), borderRadius: BorderRadius.circular(12), border: Border.all(color: DEKATColors.primary.withValues(alpha:0.15))),
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
                                            decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.1), borderRadius: BorderRadius.circular(6)),
                                            child: Text((provider.category ?? 'Umum').toUpperCase(), style: const TextStyle(color: DEKATColors.primary, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                                          ),
                                          const SizedBox(width: 6),
                                          Icon(Icons.star_rounded, size: 14, color: Colors.amber[600]),
                                          const SizedBox(width: 2),
                                          Text(provider.rating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
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
                            ),
                          ],
                        ),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          RepaintBoundary(
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                              child: Row(children: [
                                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                    Text(provider.rating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 28)),
                                    Text(' / 5.0', style: TextStyle(color: Colors.grey[500], fontSize: 13, fontWeight: FontWeight.w600)),
                                  ]),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: List.generate(
                                      5,
                                      (i) => Icon(
                                        i < provider.rating.round() ? Icons.star_rounded : Icons.star_outline_rounded,
                                        size: 16,
                                        color: Colors.amber[600],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text('${provider.reviewCount} ulasan pelanggan', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                ]),
                                const Spacer(),
                                TextButton(
                                  onPressed: () => context.push('/provider/${provider.id}/reviews'),
                                  style: TextButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: DEKATColors.primary.withValues(alpha: 0.3))),
                                  ),
                                  child: const Row(mainAxisSize: MainAxisSize.min, children: [
                                    Text('Lihat Semua', style: TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                                    SizedBox(width: 4),
                                    Icon(Icons.arrow_forward_rounded, size: 14, color: DEKATColors.primary),
                                  ]),
                                ),
                              ]),
                            ),
                          ),
                          const SizedBox(height: 16),
                          if (provider.description != null) ...[
                            Row(children: [
                              Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                              const SizedBox(width: 8),
                              const Text('Tentang', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                            ]),
                            const SizedBox(height: 8),
                            RepaintBoundary(
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                                child: Text(provider.description!, style: TextStyle(color: Colors.grey[700], height: 1.5, fontSize: 13)),
                              ),
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
                              decoration: BoxDecoration(color: DEKATColors.primary.withValues(alpha:0.08), borderRadius: BorderRadius.circular(20), border: Border.all(color: DEKATColors.primary.withValues(alpha:0.15))),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                const Icon(Icons.verified_rounded, size: 12, color: DEKATColors.primary),
                                const SizedBox(width: 4),
                                Text('${provider.reviewCount} ulasan', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w700, fontSize: 11)),
                              ]),
                            ),
                          ]),
                          const SizedBox(height: 16),
                          // Gallery grid
                          Consumer(builder: (context, ref2, _) {
                            final galleryAsync = ref.watch(providerGalleryProvider(provider.id));
                            return galleryAsync.when(
                              data: (gallery) {
                                if (gallery.isEmpty) {
                                  return RepaintBoundary(
                                    child: Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                                      child: Row(children: [
                                        Icon(Icons.photo_library_outlined, color: Colors.grey[400]),
                                        const SizedBox(width: 8),
                                        Text('Belum ada foto galeri', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                      ]),
                                    ),
                                  );
                                }
                                return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Row(children: [
                                    Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                                    const SizedBox(width: 8),
                                    const Text('Galeri', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                    const Spacer(),
                                    Text('${gallery.length} foto', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                  ]),
                                  const SizedBox(height: 8),
                                  GridView.builder(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 1),
                                    itemCount: gallery.length > 6 ? 6 : gallery.length,
                                    itemBuilder: (context, idx) {
                                      final item = gallery[idx];
                                      final url = item['url'] as String? ?? '';
                                      return RepaintBoundary(
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(12),
                                          child: url.isNotEmpty
                                              ? CachedNetworkImage(imageUrl: url, fit: BoxFit.cover, memCacheWidth: 240, memCacheHeight: 240, placeholder: (_, __) => Container(color: Colors.grey[200]), errorWidget: (_, __, ___) => Container(color: Colors.grey[200], child: const Icon(Icons.broken_image, color: Colors.grey)))
                                              : Container(color: Colors.grey[200], child: const Icon(Icons.image, color: Colors.grey)),
                                        ),
                                      );
                                    },
                                  ),
                                ]);
                              },
                              loading: () => const SizedBox(height: 120, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
                              error: (_, __) => Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)), child: const Text('Gagal memuat galeri', style: TextStyle(fontSize: 12))),
                            );
                          }),
                          const SizedBox(height: 16),
                          // Staff with favorites & portfolio
                          Consumer(builder: (context, ref2, _) {
                            final staffAsync = ref.watch(providerStaffWithPortfolioProvider(provider.id));
                            return staffAsync.when(
                              data: (staffList) {
                                if (staffList.isEmpty) return const SizedBox.shrink();
                                return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Row(children: [
                                    Container(width: 4, height: 18, decoration: BoxDecoration(color: DEKATColors.primary, borderRadius: BorderRadius.circular(4))),
                                    const SizedBox(width: 8),
                                    Text('Staf (${staffList.length})', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                  ]),
                                  const SizedBox(height: 8),
                                  ...staffList.map((s) {
                                    final specialties = (s['specialties'] as List?)?.cast<String>() ?? [];
                                    final portfolio = (s['portfolio'] as List?)?.cast<Map<String, dynamic>>() ?? [];
                                    final staffId = s['id'] as String;
                                    return RepaintBoundary(
                                      child: Container(
                                        margin: const EdgeInsets.only(bottom: 8),
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                          Row(children: [
                                            CircleAvatar(backgroundColor: DEKATColors.primary.withValues(alpha:0.12), child: Text((s['name'] as String? ?? '?').substring(0, 1).toUpperCase(), style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800))),
                                            const SizedBox(width: 10),
                                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                              Text(s['name'] as String? ?? '-', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                              if (s['title'] != null) Text(s['title'] as String, style: TextStyle(color: Colors.grey[600], fontSize: 11)),
                                              if (specialties.isNotEmpty) Wrap(spacing: 4, children: specialties.map((sp) => Chip(label: Text(sp, style: const TextStyle(fontSize: 10)), visualDensity: VisualDensity.compact, padding: EdgeInsets.zero)).toList()),
                                            ])),
                                            IconButton(
                                              icon: const Icon(Icons.favorite_border, size: 20),
                                              color: Colors.grey[400],
                                              onPressed: () async {
                                                try {
                                                  await ApiService().addFavorite(staffId);
                                                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ditambahkan ke favorit'), backgroundColor: Colors.green));
                                                } catch (e) {
                                                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal favorit: $e'), backgroundColor: Colors.red));
                                                }
                                              },
                                            ),
                                          ]),
                                          if (portfolio.isNotEmpty) ...[
                                            const SizedBox(height: 8),
                                            SizedBox(
                                              height: 60,
                                              child: ListView.separated(
                                                scrollDirection: Axis.horizontal,
                                                itemCount: portfolio.length > 5 ? 5 : portfolio.length,
                                                separatorBuilder: (_, __) => const SizedBox(width: 6),
                                                itemBuilder: (context, idx) {
                                                  final p = portfolio[idx];
                                                  final url = p['url'] as String? ?? '';
                                                  return RepaintBoundary(
                                                    child: ClipRRect(
                                                      borderRadius: BorderRadius.circular(8),
                                                      child: url.isNotEmpty
                                                          ? CachedNetworkImage(imageUrl: url, width: 60, height: 60, fit: BoxFit.cover, memCacheWidth: 120, memCacheHeight: 120, placeholder: (_, __) => Container(width: 60, height: 60, color: Colors.grey[200]), errorWidget: (_, __, ___) => Container(width: 60, height: 60, color: Colors.grey[200]))
                                                          : Container(width: 60, height: 60, color: Colors.grey[200]),
                                                    ),
                                                  );
                                                },
                                              ),
                                            ),
                                          ],
                                        ]),
                                      ),
                                    );
                                  }),
                                ]);
                              },
                              loading: () => const SizedBox(height: 60, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
                              error: (_, __) => const SizedBox.shrink(),
                            );
                          }),
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
                                return RepaintBoundary(
                                  child: Container(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: Colors.grey.shade200),
                                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha:0.04), blurRadius: 10, offset: const Offset(0, 4))],
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
                                                gradient: LinearGradient(colors: [DEKATColors.primary.withValues(alpha:0.15), DEKATColors.primary.withValues(alpha:0.08)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                                                borderRadius: BorderRadius.circular(12),
                                                border: Border.all(color: DEKATColors.primary.withValues(alpha:0.12)),
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
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
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
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red[100]!)),
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
                ),
              ),
              _StickyBookingBar(provider: provider),
            ],
          );
        },
        loading: () => const ShimmerProviderDetail(),
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

class _StickyBookingBar extends ConsumerWidget {
  final ProviderEntity provider;
  const _StickyBookingBar({required this.provider});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final servicesAsync = ref.watch(providerServicesProvider(provider.id));
    final services = servicesAsync.valueOrNull ?? [];
    final String? target = services.isNotEmpty
        ? '/provider/${provider.id}/availability?serviceId=${services.first.id}${provider.firstLocationId != null ? '&locationId=${provider.firstLocationId}' : ''}'
        : null;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -4))],
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: SafeArea(
        top: false,
        child: Row(children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Mulai dari', style: TextStyle(color: Colors.grey[600], fontSize: 11)),
              const SizedBox(height: 2),
              Text(
                provider.minPrice != null ? formatRupiah(provider.minPrice!) : 'Lihat layanan',
                style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.w800, fontSize: 16),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ]),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: target == null ? null : () => context.push(target),
            style: ElevatedButton.styleFrom(
              backgroundColor: DEKATColors.primary,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey.shade300,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Text('Pesan Sekarang', style: TextStyle(fontWeight: FontWeight.w700)),
              SizedBox(width: 8),
              Icon(Icons.arrow_forward_rounded, size: 16),
            ]),
          ),
        ]),
      ),
    );
  }
}
