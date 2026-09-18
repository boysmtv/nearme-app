import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/provider_entity.dart';
import '../../../../shared/widgets/shimmer_loading.dart';

final providerListProvider = FutureProvider.autoDispose<List<ProviderEntity>>((ref) async {
  final response = await ApiService().getProviders();
  return ((response.data['data'] ?? []) as List)
      .map((e) => ProviderEntity.fromJson(e as Map<String, dynamic>))
      .toList();
});

class ProviderListPage extends ConsumerWidget {
  const ProviderListPage({super.key});

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
                            width: 84,
                            height: 84,
                            fit: BoxFit.cover,
                            memCacheWidth: 168,
                            memCacheHeight: 168,
                            placeholder: (_, __) => Container(width: 84, height: 84, color: Colors.grey[200]),
                            errorWidget: (_, __, ___) => Container(
                              width: 84,
                              height: 84,
                              color: DEKATColors.primary.withValues(alpha: 0.08),
                              child: const Icon(Icons.store_rounded, size: 32, color: DEKATColors.primary),
                            ),
                          )
                        : Container(
                            width: 84,
                            height: 84,
                            color: DEKATColors.primary.withValues(alpha: 0.08),
                            child: const Icon(Icons.store_rounded, size: 32, color: DEKATColors.primary),
                          ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: DEKATColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            (p.category ?? 'Umum').toUpperCase(),
                            style: const TextStyle(color: DEKATColors.primary, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.3),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          p.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: DEKATColors.textPrimary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        if (p.city != null)
                          Row(
                            children: [
                              Icon(Icons.location_on_outlined, size: 12, color: Colors.grey[500]),
                              const SizedBox(width: 2),
                              Expanded(
                                child: Text(p.city!, style: TextStyle(color: Colors.grey[600], fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ),
                            ],
                          ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
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
                            const SizedBox(width: 6),
                            Text('(${p.reviewCount} ulasan)', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                            const Spacer(),
                            if (p.minPrice != null && p.minPrice! > 0)
                              Text(
                                'Mulai Rp ${_formatPrice(p.minPrice)}',
                                style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providersAsync = ref.watch(providerListProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Penyedia Layanan', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: DEKATColors.textPrimary,
        elevation: 0,
      ),
      body: providersAsync.when(
        data: (providers) {
          if (providers.isEmpty) {
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
                      child: const Icon(Icons.store_outlined, size: 40, color: DEKATColors.primary),
                    ),
                    const SizedBox(height: 16),
                    const Text('Belum ada penyedia layanan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: DEKATColors.textPrimary), textAlign: TextAlign.center),
                    const SizedBox(height: 6),
                    Text('Coba lagi nanti atau jelajahi kategori lain', style: TextStyle(fontSize: 13, color: Colors.grey[500]), textAlign: TextAlign.center),
                  ],
                ),
              ),
            );
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: Text(
                  '${providers.length} penyedia layanan tersedia',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: DEKATColors.textPrimary),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  itemCount: providers.length,
                  itemBuilder: (context, index) => _providerCard(context, providers[index]),
                ),
              ),
            ],
          );
        },
        loading: () => const ShimmerCardList(),
        error: (e, _) => Center(
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
                Text('Error: $e', textAlign: TextAlign.center),
                TextButton(
                  onPressed: () => ref.invalidate(providerListProvider),
                  child: const Text('Coba Lagi'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
