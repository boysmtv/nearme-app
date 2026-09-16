import 'package:dartz/dartz.dart';
import '../entities/provider_entity.dart';
import '../entities/service_entity.dart';
import '../entities/staff_entity.dart';
import '../../../../core/error/failure.dart';

abstract class ProviderRepository {
  Future<Either<Failure, List<ProviderEntity>>> getProviders({int page = 1, int limit = 20, Map<String, dynamic>? params});
  Future<Either<Failure, ProviderEntity>> getProvider(String slug);
  Future<Either<Failure, List<ServiceEntity>>> getProviderServices(String providerId);
  Future<Either<Failure, List<StaffEntity>>> getProviderStaff(String providerId);
  Future<Either<Failure, List<Map<String, dynamic>>>> getProviderMedia(String providerId);
  Future<Either<Failure, List<ProviderEntity>>> searchProviders(String query, {Map<String, dynamic>? params});
  Future<Either<Failure, List<ProviderEntity>>> getNearbyProviders({double? lat, double? lng, double? radiusKm});
}
