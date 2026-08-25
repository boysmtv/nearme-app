import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
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
      body: providerAsync.when(
        data: (provider) {
          final servicesAsync = ref.watch(providerServicesProvider(provider.id));
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 250,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    color: Colors.grey[300],
                    child: const Center(child: Icon(Icons.store, size: 80, color: Colors.grey)),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(provider.name, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text('${provider.category ?? "General"}${provider.address != null ? " - ${provider.address}" : ""}',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey)),
                      const SizedBox(height: 8),
                      Row(children: [
                        Icon(Icons.star, size: 18, color: Colors.amber[600]),
                        const SizedBox(width: 4),
                        Text('${provider.rating.toStringAsFixed(1)} (${provider.reviewCount} reviews)',
                            style: const TextStyle(fontWeight: FontWeight.bold)),
                      ]),
                      if (provider.description != null) ...[
                        const SizedBox(height: 16),
                        const Text('About', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(provider.description!),
                      ],
                      const SizedBox(height: 24),
                      const Text('Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              servicesAsync.when(
                data: (services) => SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final s = services[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(12),
                          leading: Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                            child: Icon(Icons.spa, color: Theme.of(context).colorScheme.primary),
                          ),
                          title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${s.durationMinutes} min'),
                          trailing: Text(formatRupiah(s.price),
                              style: TextStyle(fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
                          onTap: () => context.push(
                            '/provider/${provider.id}/availability?serviceId=${s.id}${provider.firstLocationId != null ? '&locationId=${provider.firstLocationId}' : ''}',
                          ),
                        ),
                      );
                    },
                    childCount: services.length,
                  ),
                ),
                loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
                error: (e, _) => SliverToBoxAdapter(
                  child: Center(
                    child: TextButton(
                      onPressed: () => ref.invalidate(providerServicesProvider(provider.id)),
                      child: const Text('Failed to load services - Retry'),
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
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
