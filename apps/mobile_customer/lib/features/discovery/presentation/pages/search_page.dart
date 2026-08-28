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
  void initState() { super.initState(); _focusNode.requestFocus(); }
  @override
  void dispose() { _searchController.dispose(); _focusNode.dispose(); super.dispose(); }

  static const _grads = [
    DEKATColors.softViolet,
    DEKATColors.softPink,
    DEKATColors.softMint,
    DEKATColors.softPeach,
    DEKATColors.softSky,
    DEKATColors.softLavender,
  ];

  @override
  Widget build(BuildContext context) {
    final recentSearches = ref.watch(recentSearchesProvider);
    final searchResults = ref.watch(searchResultsProvider);
    return Scaffold(
      backgroundColor: DEKATColors.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [Color(0xFFE8E8FF), Color(0xFFFFE8EC)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              ),
              padding: const EdgeInsets.fromLTRB(8, 12, 16, 14),
              child: Row(
                children: [
                  Expanded(
                    child: Hero(
                      tag: 'search-bar',
                      child: Material(
                        color: Colors.transparent,
                        child: TextField(
                          controller: _searchController, focusNode: _focusNode,
                          decoration: InputDecoration(
                            hintText: 'Cari layanan, salon, spa...',
                            hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
                            prefixIcon: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.search_rounded, color: DEKATColors.primary, size: 18)),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(icon: Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle), child: Icon(Icons.close_rounded, size: 14, color: Colors.grey[600])), onPressed: () { _searchController.clear(); ref.read(searchQueryProvider.notifier).state = ''; setState(() {}); })
                                : null,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                            filled: true, fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          onChanged: (v) { setState(() {}); ref.read(searchQueryProvider.notifier).state = v; },
                          onSubmitted: (v) { if (v.isNotEmpty) ref.read(recentSearchesProvider.notifier).add(v); },
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (_searchController.text.isEmpty && recentSearches.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(children: [Container(width: 4, height: 16, decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softPeach), borderRadius: BorderRadius.circular(4))), const SizedBox(width: 8), Text('Pencarian Terbaru', style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800))]),
                    TextButton(onPressed: () => ref.read(recentSearchesProvider.notifier).clear(), style: TextButton.styleFrom(foregroundColor: DEKATColors.secondary), child: const Text('Hapus Semua', style: TextStyle(fontWeight: FontWeight.w600))),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: recentSearches.length,
                  itemBuilder: (context, index) => TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: 1),
                    duration: Duration(milliseconds: 280 + index * 40),
                    curve: Curves.easeOutCubic,
                    builder: (context, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 8*(1-v)), child: child)),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[100]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))]),
                      child: ListTile(
                        leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DEKATColors.primaryLight, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.history_rounded, color: DEKATColors.primary, size: 18)),
                        title: Text(recentSearches[index], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        trailing: IconButton(icon: Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.close_rounded, size: 14, color: DEKATColors.error)), onPressed: () => ref.read(recentSearchesProvider.notifier).remove(recentSearches[index])),
                        onTap: () { _searchController.text = recentSearches[index]; ref.read(searchQueryProvider.notifier).state = recentSearches[index]; setState(() {}); },
                      ),
                    ),
                  ),
                ),
              ),
            ] else if (_searchController.text.isEmpty) ...[
              Expanded(child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 500), curve: Curves.easeOutBack, builder: (c,v,ch)=> Transform.scale(scale: 0.9+0.1*v, child: Opacity(opacity: v, child: ch)), child: Container(padding: const EdgeInsets.all(22), decoration: BoxDecoration(gradient: const LinearGradient(colors: DEKATColors.softSky, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(22), boxShadow: [BoxShadow(color: DEKATColors.info.withValues(alpha: 0.18), blurRadius: 16, offset: const Offset(0, 6))]), child: const Icon(Icons.search_rounded, size: 40, color: Colors.white))),
                const SizedBox(height: 16),
                Text('Cari layanan favoritmu', style: TextStyle(color: DEKATColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 15)),
                const SizedBox(height: 6),
                Text('Ketik salon, spa, barbershop ✨', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
              ]))),
            ] else ...[
              Expanded(
                child: searchResults.when(
                  data: (results) {
                    if (results.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: DEKATColors.warningLight, borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.search_off_rounded, size: 32, color: Color(0xFFFF9F43))), const SizedBox(height: 12), Text('Tidak ada hasil', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600)), const SizedBox(height: 4), Text('Coba kata kunci lain', style: TextStyle(color: Colors.grey[500], fontSize: 13))]));
                    return ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      itemCount: results.length,
                      itemBuilder: (context, index) {
                        final p = results[index];
                        final grad = _grads[index % _grads.length];
                        return TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1), duration: Duration(milliseconds: 300+index*40), curve: Curves.easeOutCubic, builder: (c,v,ch)=> Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 12*(1-v)), child: ch)), child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: grad.last.withValues(alpha: 0.6)), boxShadow: [BoxShadow(color: grad.first.withValues(alpha: 0.12), blurRadius: 12, offset: const Offset(0, 4))]),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(12),
                            leading: Container(width: 52, height: 52, decoration: BoxDecoration(gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.storefront_rounded, color: Colors.white)),
                            title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            subtitle: Container(margin: const EdgeInsets.only(top: 4), padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: grad.last, borderRadius: BorderRadius.circular(6)), child: Text(p.category ?? 'General', style: TextStyle(color: grad.first, fontSize: 11, fontWeight: FontWeight.w600))),
                            trailing: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.grey[50], shape: BoxShape.circle, border: Border.all(color: Colors.grey[200]!)), child: Icon(Icons.chevron_right_rounded, size: 16, color: Colors.grey[600])),
                            onTap: () => context.push('/provider/${p.slug}'),
                          ),
                        ));
                      },
                    );
                  },
                  loading: () => Center(child: Column(mainAxisSize: MainAxisSize.min, children: [const CircularProgressIndicator(color: DEKATColors.primary), const SizedBox(height: 12), Text('Mencari...', style: TextStyle(color: Colors.grey[500], fontSize: 13))])),
                  error: (e, _) => Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: DEKATColors.errorLight, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.wifi_off_rounded, color: DEKATColors.error)),
                        const SizedBox(height: 10),
                        const Text('Gagal mencari', style: TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        FilledButton.icon(onPressed: () => ref.invalidate(searchResultsProvider), icon: const Icon(Icons.refresh_rounded, size: 16), label: const Text('Coba Lagi')),
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
