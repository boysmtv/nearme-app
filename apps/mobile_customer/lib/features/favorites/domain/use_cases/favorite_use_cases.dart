import 'package:dartz/dartz.dart';
import '../entities/favorite_entity.dart';
import '../repositories/favorites_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetFavorites extends UseCase<List<FavoriteItem>, NoParams> {
  final FavoritesRepository repository;
  GetFavorites(this.repository);
  @override
  Future<Either<Failure, List<FavoriteItem>>> call(NoParams params) => repository.getFavorites();
}

class AddFavorite extends UseCase<void, String> {
  final FavoritesRepository repository;
  AddFavorite(this.repository);
  @override
  Future<Either<Failure, void>> call(String staffId) => repository.addFavorite(staffId);
}

class RemoveFavorite extends UseCase<void, String> {
  final FavoritesRepository repository;
  RemoveFavorite(this.repository);
  @override
  Future<Either<Failure, void>> call(String staffId) => repository.removeFavorite(staffId);
}
