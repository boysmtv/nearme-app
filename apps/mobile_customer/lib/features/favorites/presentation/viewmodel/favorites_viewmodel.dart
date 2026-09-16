import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/repositories/favorites_repository.dart';
import '../../data/repositories/favorites_repository_impl.dart';
import '../../../../core/di/providers.dart';

final favoritesRepositoryProvider = Provider<FavoritesRepository>((ref) {
  return FavoritesRepositoryImpl(ref.read(apiServiceProvider));
});

class FavoritesNotifier extends AsyncNotifier<List<FavoriteItem>> {
  @override
  Future<List<FavoriteItem>> build() async {
    final repo = ref.read(favoritesRepositoryProvider);
    final result = await repo.getFavorites();
    return result.fold((l) => throw Exception(l.message), (r) => r);
  }

  Future<void> addFavorite(String staffId) async {
    final repo = ref.read(favoritesRepositoryProvider);
    await repo.addFavorite(staffId);
    ref.invalidateSelf();
  }

  Future<void> removeFavorite(String staffId) async {
    final repo = ref.read(favoritesRepositoryProvider);
    await repo.removeFavorite(staffId);
    ref.invalidateSelf();
  }
}

final favoritesProvider = AsyncNotifierProvider<FavoritesNotifier, List<FavoriteItem>>(
  FavoritesNotifier.new,
);
