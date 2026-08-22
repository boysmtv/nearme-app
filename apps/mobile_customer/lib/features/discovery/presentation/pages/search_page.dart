import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

final searchQueryProvider = StateProvider<String>((ref) => '');
final searchResultsProvider = FutureProvider.autoDispose<List<Provider>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) return [];
  try {
    final response = await ApiService().search(query);
    final data = response.data['data'] as List;
    return data.map((e) => Provider.fromJson(e)).toList();
  } catch (e) {
    return [];
  }
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
  void initState() { super.initState(); _focusNode.requestFocus(); }
  @override
  void dispose() { _searchController.dispose(); _focusNode.dispose(); super.dispose(); }
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
              child: Row(
                children: [
                  IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
                  Expanded(
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
                ],
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
              Expanded(child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.search, size: 64, color: Colors.grey[300]), const SizedBox(height: 16), Text('Search for services or providers', style: TextStyle(color: Colors.grey[500]))]))),
            ] else ...[
              Expanded(
                child: searchResults.when(
                  data: (results) {
                    if (results.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.search_off, size: 64, color: Colors.grey[300]), const SizedBox(height: 16), Text('No results found', style: TextStyle(color: Colors.grey[500]))]));
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: results.length,
                      itemBuilder: (context, index) {
                        final p = results[index];
                        return ListTile(
                          leading: Container(width: 48, height: 48, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.store)),
                          title: Text(p.name), subtitle: Text(p.category ?? 'General'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => context.push('/provider/${p.id}'),
                        );
                      },
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (_, __) => const Center(child: Text('Failed to search')),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}