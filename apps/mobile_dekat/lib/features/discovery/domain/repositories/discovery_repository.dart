import 'package:dartz/dartz.dart';
import '../entities/category_entity.dart';
import '../../../provider_profile/domain/entities/provider_entity.dart';
import '../../../../core/error/failure.dart';

abstract class DiscoveryRepository {
  Future<Either<Failure, List<ProviderEntity>>> getProviders({int page = 1, int limit = 20});
  Future<Either<Failure, List<CategoryEntity>>> getCategories();
  Future<Either<Failure, Map<String, dynamic>>> getDashboardProfile();
}
