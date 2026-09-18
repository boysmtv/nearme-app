import 'package:dartz/dartz.dart';
import '../entities/provider_entity.dart';
import '../entities/service_entity.dart';
import '../repositories/provider_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/constants/app_constants.dart';

class GetProviders extends UseCase<List<ProviderEntity>, GetProvidersParams> {
  final ProviderRepository repository;
  GetProviders(this.repository);

  @override
  Future<Either<Failure, List<ProviderEntity>>> call(GetProvidersParams params) {
    return repository.getProviders(page: params.page, limit: params.limit, params: params.extra);
  }
}

class GetProvidersParams {
  final int page;
  final int limit;
  final Map<String, dynamic>? extra;
  const GetProvidersParams({this.page = 1, this.limit = AppConstants.defaultPageSize, this.extra});
}

class GetProviderDetail extends UseCase<ProviderEntity, String> {
  final ProviderRepository repository;
  GetProviderDetail(this.repository);

  @override
  Future<Either<Failure, ProviderEntity>> call(String slug) {
    return repository.getProvider(slug);
  }
}

class GetProviderServices extends UseCase<List<ServiceEntity>, String> {
  final ProviderRepository repository;
  GetProviderServices(this.repository);

  @override
  Future<Either<Failure, List<ServiceEntity>>> call(String providerId) {
    return repository.getProviderServices(providerId);
  }
}

class SearchProviders extends UseCase<List<ProviderEntity>, SearchProvidersParams> {
  final ProviderRepository repository;
  SearchProviders(this.repository);

  @override
  Future<Either<Failure, List<ProviderEntity>>> call(SearchProvidersParams params) {
    return repository.searchProviders(params.query, params: params.extra);
  }
}

class SearchProvidersParams {
  final String query;
  final Map<String, dynamic>? extra;
  const SearchProvidersParams({required this.query, this.extra});
}
