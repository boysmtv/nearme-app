import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/repositories/discovery_repository.dart';
import '../../data/repositories/discovery_repository_impl.dart';
import '../../../provider_profile/domain/entities/provider_entity.dart';
import '../../../../core/di/providers.dart';

final discoveryRepositoryProvider = Provider<DiscoveryRepository>((ref) {
  return DiscoveryRepositoryImpl(ref.read(apiServiceProvider));
});

class DiscoveryProvidersNotifier extends AsyncNotifier<List<ProviderEntity>> {
  int _page = 1;
  bool _hasMore = true;
  bool _isLoadingMore = false;

  @override
  Future<List<ProviderEntity>> build() async {
    _page = 1;
    _hasMore = true;
    final repo = ref.read(discoveryRepositoryProvider);
    final result = await repo.getProviders(page: 1, limit: 20);
    return result.fold(
      (l) => throw Exception(l.message),
      (items) {
        _hasMore = items.length >= 20;
        return items;
      },
    );
  }

  Future<void> loadMore() async {
    if (_isLoadingMore || !_hasMore) return;
    _isLoadingMore = true;
    try {
      _page++;
      final repo = ref.read(discoveryRepositoryProvider);
      final result = await repo.getProviders(page: _page, limit: 20);
      result.fold(
        (l) => _page--,
        (newItems) {
          _hasMore = newItems.length >= 20;
          state = AsyncData([...state.value ?? [], ...newItems]);
        },
      );
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
    AsyncNotifierProvider<DiscoveryProvidersNotifier, List<ProviderEntity>>(
  DiscoveryProvidersNotifier.new,
);

class CategoriesNotifier extends AsyncNotifier<List<CategoryEntity>> {
  @override
  Future<List<CategoryEntity>> build() async {
    final repo = ref.read(discoveryRepositoryProvider);
    final result = await repo.getCategories();
    return result.fold((l) => throw Exception(l.message), (r) => r);
  }
}

final categoriesProvider =
    AsyncNotifierProvider<CategoriesNotifier, List<CategoryEntity>>(
  CategoriesNotifier.new,
);

final dashboardProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repo = ref.read(discoveryRepositoryProvider);
  final result = await repo.getDashboardProfile();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});
