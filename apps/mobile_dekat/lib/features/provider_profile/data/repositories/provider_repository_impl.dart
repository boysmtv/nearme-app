import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/provider_entity.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/entities/staff_entity.dart';
import '../../domain/repositories/provider_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';
import '../../../shared/data/models/dto.dart';

class ProviderRepositoryImpl implements ProviderRepository {
  final ApiService _api;
  ProviderRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<ProviderEntity>>> getProviders({int page = 1, int limit = 20, Map<String, dynamic>? params}) async {
    try {
      final allParams = <String, dynamic>{'page': page, 'limit': limit, ...?params};
      final response = await _api.getProviders(params: allParams);
      final data = response.data['data'] as List? ?? [];
      return Right(data.map((e) => ProviderDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, ProviderEntity>> getProvider(String slug) async {
    try {
      final response = await _api.getProvider(slug);
      final data = response.data['data'] as Map<String, dynamic>;
      return Right(ProviderDto.fromJson(data));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<ServiceEntity>>> getProviderServices(String providerId) async {
    try {
      final response = await _api.getProviderServices(providerId);
      final data = response.data['data'] as List? ?? [];
      return Right(data.map((e) => ServiceDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<StaffEntity>>> getProviderStaff(String providerId) async {
    try {
      final response = await _api.getProviderStaff(providerId);
      final data = response.data['data'] as List? ?? [];
      return Right(data.map((e) => StaffDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> getProviderMedia(String providerId) async {
    try {
      final response = await _api.getProviderMedia(providerId);
      final data = response.data['data'] as List?;
      if (data == null) return const Right([]);
      return Right(data.cast<Map<String, dynamic>>());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<ProviderEntity>>> searchProviders(String query, {Map<String, dynamic>? params}) async {
    try {
      final allParams = <String, dynamic>{'q': query, ...?params};
      final response = await _api.getProviders(params: allParams);
      final data = response.data['data'] as List? ?? [];
      return Right(data.map((e) => ProviderDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<ProviderEntity>>> getNearbyProviders({double? lat, double? lng, double? radiusKm}) async {
    try {
      final params = <String, dynamic>{};
      if (lat != null) params['lat'] = lat;
      if (lng != null) params['lng'] = lng;
      if (radiusKm != null) params['radiusKm'] = radiusKm;
      final response = await _api.getProviders(params: params);
      final data = response.data['data'] as List? ?? [];
      return Right(data.map((e) => ProviderDto.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
