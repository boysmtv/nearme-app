import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import '../../../../shared/models/rows.dart';

final searchQueryProvider = StateProvider<String>((ref) => '');
final searchResultsProvider = FutureProvider.autoDispose<List<ProviderRow>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) {
    final response = await ApiService().getProviders();
    return ((response.data['data'] ?? []) as List)
        .map((e) => ProviderRow.fromJson(e as Map<String, dynamic>))
        .toList();
  }
  final response = await ApiService().search(query);
  return ((response.data['data'] ?? []) as List)
      .map((e) => ProviderRow.fromJson(e as Map<String, dynamic>))
      .toList();
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
  @override
  void initState() { super.initState(); }
  @override
  void dispose() { _searchController.dispose(); _focusNode.dispose(); super.dispose(); }

  String _formatPrice(num? price) {
    if (price == null) return '';
    final v = price.toDouble().toStringAsFixed(0);
    return v.replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }

  Widget _providerCard(BuildContext context, ProviderRow p) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.push('/provider/${p.slug}'),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: DEKATColors.primary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    image: p.imageUrl != null ? DecorationImage(image: NetworkImage(p.imageUrl!), fit: BoxFit.cover) : null,
                  ),
                  child: p.imageUrl == null ? const Icon(Icons.storefront_rounded, color: DEKATColors.primary, size: 28) : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: DEKATColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: DEKATColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                            child: Text((p.category ?? 'General').toUpperCase(), style: const TextStyle(color: DEKATColors.primary, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.3)),
                          ),
                          if (p.city != null) ...[
                            const SizedBox(width: 6),
                            Icon(Icons.location_on_outlined, size: 12, color: Colors.grey[500]),
                            const SizedBox(width: 2),
                            Expanded(child: Text(p.city!, style: TextStyle(color: Colors.grey[600], fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          ],
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.star_rounded, size: 14, color: Colors.amber[700]),
                          const SizedBox(width: 2),
                          Text(p.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                          Text(' (${p.reviewCount})', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                          const Spacer(),
                          if (p.minPrice != null && p.minPrice! > 0)
                            Text('Mulai Rp ${_formatPrice(p.minPrice)}', style: const TextStyle(color: DEKATColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: Colors.grey[50], shape: BoxShape.circle, border: Border.all(color: Colors.grey[200]!)),
                  child: Icon(Icons.chevron_right_rounded, size: 16, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final recentSearches = ref.watch(recentSearchesProvider);
    final searchResults = ref.watch(searchResultsProvider);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController, focusNode: _focusNode,
                decoration: InputDecoration(
                  hintText: 'Search services, providers...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchController.clear(); ref.read(searchQueryProvider.notifier).state = ''; setState(() {}); })
                      : null,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  filled: true, fillColor: Colors.grey[200],
                ),
                onChanged: (v) { setState(() {}); ref.read(searchQueryProvider.notifier).state = v; },
                onSubmitted: (v) { if (v.isNotEmpty) ref.read(recentSearchesProvider.notifier).add(v); },
              ),
            ),
            if (_searchController.text.isEmpty && recentSearches.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Recent Searches', style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                    TextButton(onPressed: () => ref.read(recentSearchesProvider.notifier).clear(), child: const Text('Clear All')),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: recentSearches.length,
                  itemBuilder: (context, index) => ListTile(
                    leading: const Icon(Icons.history, color: Colors.grey),
                    title: Text(recentSearches[index]),
                    trailing: IconButton(icon: const Icon(Icons.close, size: 18), onPressed: () => ref.read(recentSearchesProvider.notifier).remove(recentSearches[index])),
                    onTap: () { _searchController.text = recentSearches[index]; ref.read(searchQueryProvider.notifier).state = recentSearches[index]; setState(() {}); },
                  ),
                ),
              ),
            ] else if (_searchController.text.isEmpty) ...[
              Expanded(
                child: searchResults.when(
                  data: (results) {
                    if (results.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.search_off, size: 64, color: Colors.grey[300]), const SizedBox(height: 16), Text('No providers found', style: TextStyle(color: Colors.grey[500]))]));
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: results.length,
                      itemBuilder: (context, index) => _providerCard(context, results[index]),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
                  error: (e, _) => Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Failed to load providers'),
                        TextButton(
                          onPressed: () => ref.invalidate(searchResultsProvider),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ] else ...[
              Expanded(
                child: searchResults.when(
                  data: (results) {
                    if (results.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.search_off, size: 64, color: Colors.grey[300]), const SizedBox(height: 16), Text('No results found', style: TextStyle(color: Colors.grey[500]))]));
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: results.length,
                      itemBuilder: (context, index) => _providerCard(context, results[index]),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator(color: DEKATColors.primary)),
                  error: (e, _) => Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Failed to search'),
                        TextButton(
                          onPressed: () => ref.invalidate(searchResultsProvider),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}