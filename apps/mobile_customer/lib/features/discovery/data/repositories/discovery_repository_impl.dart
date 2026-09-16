import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/repositories/discovery_repository.dart';
import '../../../provider_profile/domain/entities/provider_entity.dart';
import '../../../provider_profile/data/repositories/provider_repository_impl.dart';
import '../../../shared/data/models/dto.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';

class DiscoveryRepositoryImpl implements DiscoveryRepository {
  final ApiService _api;
  DiscoveryRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<ProviderEntity>>> getProviders({int page = 1, int limit = 20}) async {
    try {
      final providerRepo = ProviderRepositoryImpl(_api);
      return await providerRepo.getProviders(page: page, limit: limit);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<CategoryEntity>>> getCategories() async {
    try {
      final res = await _api.getCategories();
      final list = (res.data['data'] ?? []) as List;
      return Right(list.map((e) => CategoryDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> getDashboardProfile() async {
    try {
      final res = await _api.getCustomerProfile();
      final data = res.data;
      if (data is Map<String, dynamic>) {
        final profileData = data['data'];
        if (profileData is Map<String, dynamic>) return Right(profileData);
      }
      return const Right({});
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
