import 'package:dartz/dartz.dart';
import '../entities/category_entity.dart';
import '../repositories/discovery_repository.dart';
import '../../../provider_profile/domain/entities/provider_entity.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetProviders extends UseCase<List<ProviderEntity>, GetProvidersParams> {
  final DiscoveryRepository repository;
  GetProviders(this.repository);
  @override
  Future<Either<Failure, List<ProviderEntity>>> call(GetProvidersParams params) =>
      repository.getProviders(page: params.page, limit: params.limit);
}

class GetProvidersParams {
  final int page;
  final int limit;
  const GetProvidersParams({this.page = 1, this.limit = 20});
}

class GetCategories extends UseCase<List<CategoryEntity>, NoParams> {
  final DiscoveryRepository repository;
  GetCategories(this.repository);
  @override
  Future<Either<Failure, List<CategoryEntity>>> call(NoParams params) => repository.getCategories();
}

class GetDashboardProfile extends UseCase<Map<String, dynamic>, NoParams> {
  final DiscoveryRepository repository;
  GetDashboardProfile(this.repository);
  @override
  Future<Either<Failure, Map<String, dynamic>>> call(NoParams params) => repository.getDashboardProfile();
}
