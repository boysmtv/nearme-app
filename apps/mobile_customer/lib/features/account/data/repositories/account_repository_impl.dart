import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/account_entity.dart';
import '../../domain/repositories/account_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';

class AccountRepositoryImpl implements AccountRepository {
  final ApiService _api;
  AccountRepositoryImpl(this._api);

  @override
  Future<Either<Failure, CustomerProfile>> getProfile() async {
    try {
      final res = await _api.getCustomerProfile();
      final data = res.data['data'] as Map<String, dynamic>;
      return Right(CustomerProfile.fromJson(data));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, CustomerProfile>> updateProfile(Map<String, dynamic> data) async {
    try {
      final res = await _api.dio.put('/customer/profile', data: data);
      final result = res.data['data'] as Map<String, dynamic>;
      return Right(CustomerProfile.fromJson(result));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, LoyaltyData>> getLoyalty() async {
    try {
      final res = await _api.dio.get('/customer/loyalty');
      final data = res.data['data'] as Map<String, dynamic>;
      return Right(LoyaltyData.fromJson(data));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> redeemLoyalty(int points) async {
    try {
      await _api.dio.post('/customer/loyalty/redeem', data: {'points': points});
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> birthdayBonus() async {
    try {
      await _api.dio.post('/customer/loyalty/birthday-bonus');
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<ReviewData>>> getMyReviews() async {
    try {
      final res = await _api.dio.get('/customer/reviews');
      final list = (res.data['data'] ?? []) as List;
      return Right(list.map((e) => ReviewData.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> getFeed({int page = 1, int limit = 20}) async {
    try {
      final res = await _api.dio.get('/social/feed', queryParameters: {'page': page, 'limit': limit});
      final list = (res.data['data'] ?? []) as List;
      return Right(list.cast<Map<String, dynamic>>());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> getTrending() async {
    try {
      final res = await _api.dio.get('/social/trending');
      final list = (res.data['data'] ?? []) as List;
      return Right(list.cast<Map<String, dynamic>>());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> likePost(String postId) async {
    try {
      await _api.dio.post('/social/feed/$postId/like');
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> followProvider(String providerId) async {
    try {
      await _api.dio.post('/social/follow/$providerId');
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
