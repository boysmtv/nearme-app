import 'package:dartz/dartz.dart';
import '../entities/account_entity.dart';
import '../repositories/account_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetProfile extends UseCase<CustomerProfile, NoParams> {
  final AccountRepository repository;
  GetProfile(this.repository);
  @override
  Future<Either<Failure, CustomerProfile>> call(NoParams params) => repository.getProfile();
}

class UpdateProfile extends UseCase<CustomerProfile, Map<String, dynamic>> {
  final AccountRepository repository;
  UpdateProfile(this.repository);
  @override
  Future<Either<Failure, CustomerProfile>> call(Map<String, dynamic> data) => repository.updateProfile(data);
}

class GetLoyalty extends UseCase<LoyaltyData, NoParams> {
  final AccountRepository repository;
  GetLoyalty(this.repository);
  @override
  Future<Either<Failure, LoyaltyData>> call(NoParams params) => repository.getLoyalty();
}

class RedeemLoyalty extends UseCase<void, int> {
  final AccountRepository repository;
  RedeemLoyalty(this.repository);
  @override
  Future<Either<Failure, void>> call(int points) => repository.redeemLoyalty(points);
}

class GetMyReviews extends UseCase<List<ReviewData>, NoParams> {
  final AccountRepository repository;
  GetMyReviews(this.repository);
  @override
  Future<Either<Failure, List<ReviewData>>> call(NoParams params) => repository.getMyReviews();
}

class GetFeed extends UseCase<List<Map<String, dynamic>>, GetFeedParams> {
  final AccountRepository repository;
  GetFeed(this.repository);
  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> call(GetFeedParams params) =>
      repository.getFeed(page: params.page, limit: params.limit);
}

class GetFeedParams {
  final int page;
  final int limit;
  const GetFeedParams({this.page = 1, this.limit = 20});
}

class GetTrending extends UseCase<List<Map<String, dynamic>>, NoParams> {
  final AccountRepository repository;
  GetTrending(this.repository);
  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> call(NoParams params) => repository.getTrending();
}

class LikePost extends UseCase<void, String> {
  final AccountRepository repository;
  LikePost(this.repository);
  @override
  Future<Either<Failure, void>> call(String postId) => repository.likePost(postId);
}

class FollowProvider extends UseCase<void, String> {
  final AccountRepository repository;
  FollowProvider(this.repository);
  @override
  Future<Either<Failure, void>> call(String providerId) => repository.followProvider(providerId);
}
