import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/slot_entity.dart';
import '../../../provider_profile/domain/entities/service_entity.dart';
import '../../../provider_profile/domain/entities/staff_entity.dart';
import '../../domain/repositories/availability_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';
import '../../../shared/data/models/dto.dart';

class AvailabilityRepositoryImpl implements AvailabilityRepository {
  final ApiService _api;
  AvailabilityRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<SlotEntity>>> getAvailability(String providerId, String date, {String? staffId}) async {
    try {
      final response = await _api.getProviderAvailability(providerId, date, staffId: staffId);
      final data = response.data['data'] as List? ?? [];
      return Right(data.map((e) => SlotDto.fromJson(e as Map<String, dynamic>)).toList());
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
}
