import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final providerDetailProvider = FutureProvider.autoDispose.family<Provider?, String>((ref, id) async {
  try {
    final response = await ApiService().getProvider(id);
    return Provider.fromJson(response.data['data']);
  } catch (e) {
    return null;
  }
});

final providerServicesProvider = FutureProvider.autoDispose.family<List<Service>, String>((ref, id) async {
  try {
    final response = await ApiService().getProviderServices(id);
    final data = response.data['data'] as List;
    return data.map((e) => Service.fromJson(e)).toList();
  } catch (e) {
    return [];
  }
});

String _formatPrice(int price) {
  return 'Rp ${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
}

class ProviderDetailPage extends ConsumerWidget {
  final String providerId;
  const ProviderDetailPage({super.key, required this.providerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providerAsync = ref.watch(providerDetailProvider(providerId));
    final servicesAsync = ref.watch(providerServicesProvider(providerId));

    return Scaffold(
      body: providerAsync.when(
        data: (provider) {
          if (provider == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('Provider not found'),
                  TextButton(onPressed: () => context.pop(), child: const Text('Go Back')),
                ],
              ),
            );
          }
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
                      if (provider.rating != null) ...[
                        const SizedBox(height: 8),
                        Row(children: [
                          Icon(Icons.star, size: 18, color: Colors.amber[600]),
                          const SizedBox(width: 4),
                          Text('${provider.rating!.toStringAsFixed(1)} (${provider.reviewCount ?? 0} reviews)',
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                        ]),
                      ],
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
                          trailing: Text(_formatPrice(s.price),
                              style: TextStyle(fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
                          onTap: () => context.push('/booking/new?providerId=$providerId&serviceId=${s.id}'),
                        ),
                      );
                    },
                    childCount: services.length,
                  ),
                ),
                loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
                error: (_, __) => const SliverToBoxAdapter(child: Text('Failed to load services')),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
