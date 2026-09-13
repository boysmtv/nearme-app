import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../../../shared/models/rows.dart';

class DiscoveryProvidersNotifier extends AsyncNotifier<List<ProviderRow>> {
  int _page = 1;
  bool _hasMore = true;
  bool _isLoadingMore = false;

  @override
  Future<List<ProviderRow>> build() async {
    _page = 1;
    _hasMore = true;
    final response = await ApiService().getProviders(params: {'page': 1, 'limit': 20});
    final items = ((response.data['data'] ?? []) as List)
        .map((e) => ProviderRow.fromJson(e as Map<String, dynamic>))
        .toList();
    _hasMore = items.length >= 20;
    return items;
  }

  Future<void> loadMore() async {
    if (_isLoadingMore || !_hasMore) return;
    _isLoadingMore = true;
    try {
      _page++;
      final response = await ApiService().getProviders(params: {'page': _page, 'limit': 20});
      final newItems = ((response.data['data'] ?? []) as List)
          .map((e) => ProviderRow.fromJson(e as Map<String, dynamic>))
          .toList();
      _hasMore = newItems.length >= 20;
      state = AsyncData([...state.value ?? [], ...newItems]);
    } catch (e) {
      _page--;
    } finally {
      _isLoadingMore = false;
    }
  }

  bool get hasMore => _hasMore;
  bool get isLoadingMore => _isLoadingMore;
}

final discoveryProvidersProvider =
    AsyncNotifierProvider<DiscoveryProvidersNotifier, List<ProviderRow>>(
  DiscoveryProvidersNotifier.new,
);

class CategoriesNotifier extends AsyncNotifier<List<Category>> {
  @override
  Future<List<Category>> build() async {
    final response = await ApiService().getCategories();
    return ((response.data['data'] ?? []) as List)
        .map((e) => Category.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}

final categoriesProvider =
    AsyncNotifierProvider<CategoriesNotifier, List<Category>>(
  CategoriesNotifier.new,
);

final dashboardProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  try {
    final res = await ApiService().getCustomerProfile();
    final data = res.data;
    if (data is Map<String, dynamic>) {
      final profileData = data['data'];
      if (profileData is Map<String, dynamic>) return profileData;
    }
    return {};
  } catch (_) {
    return {};
  }
});
