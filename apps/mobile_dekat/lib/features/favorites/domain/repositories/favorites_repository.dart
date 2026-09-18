import 'package:dartz/dartz.dart';
import '../entities/favorite_entity.dart';
import '../../../../core/error/failure.dart';

abstract class FavoritesRepository {
  Future<Either<Failure, List<FavoriteItem>>> getFavorites();
  Future<Either<Failure, void>> addFavorite(String staffId);
  Future<Either<Failure, void>> removeFavorite(String staffId);
}
