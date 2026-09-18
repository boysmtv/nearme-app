import 'package:dartz/dartz.dart';
import '../entities/account_entity.dart';
import '../../../../core/error/failure.dart';

abstract class AccountRepository {
  Future<Either<Failure, CustomerProfile>> getProfile();
  Future<Either<Failure, CustomerProfile>> updateProfile(Map<String, dynamic> data);
  Future<Either<Failure, LoyaltyData>> getLoyalty();
  Future<Either<Failure, void>> redeemLoyalty(int points);
  Future<Either<Failure, void>> birthdayBonus();
  Future<Either<Failure, List<ReviewData>>> getMyReviews();
  Future<Either<Failure, List<Map<String, dynamic>>>> getFeed({int page = 1, int limit = 20});
  Future<Either<Failure, List<Map<String, dynamic>>>> getTrending();
  Future<Either<Failure, void>> likePost(String postId);
  Future<Either<Failure, void>> followProvider(String providerId);
}
