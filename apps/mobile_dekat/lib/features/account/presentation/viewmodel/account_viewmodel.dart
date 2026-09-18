import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/account_entity.dart';
import '../../domain/repositories/account_repository.dart';
import '../../data/repositories/account_repository_impl.dart';
import '../../../../core/di/providers.dart';

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  return AccountRepositoryImpl(ref.read(apiServiceProvider));
});

final profileProvider = FutureProvider<CustomerProfile>((ref) async {
  final repo = ref.read(accountRepositoryProvider);
  final result = await repo.getProfile();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final loyaltyProvider = FutureProvider<LoyaltyData>((ref) async {
  final repo = ref.read(accountRepositoryProvider);
  final result = await repo.getLoyalty();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final myReviewsProvider = FutureProvider<List<ReviewData>>((ref) async {
  final repo = ref.read(accountRepositoryProvider);
  final result = await repo.getMyReviews();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final feedProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.read(accountRepositoryProvider);
  final result = await repo.getFeed();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});

final trendingProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repo = ref.read(accountRepositoryProvider);
  final result = await repo.getTrending();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});
