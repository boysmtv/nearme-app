import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/repositories/favorites_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';

class FavoritesRepositoryImpl implements FavoritesRepository {
  final ApiService _api;
  FavoritesRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<FavoriteItem>>> getFavorites() async {
    try {
      final res = await _api.getFavorites();
      final data = res.data['data'];
      if (data is List) {
        return Right(data.map((e) => FavoriteItem.fromJson(e as Map<String, dynamic>)).toList());
      }
      return const Right([]);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> addFavorite(String staffId) async {
    try {
      await _api.addFavorite(staffId);
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> removeFavorite(String staffId) async {
    try {
      await _api.removeFavorite(staffId);
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
