import 'package:dartz/dartz.dart';
import '../entities/slot_entity.dart';
import '../../../provider_profile/domain/entities/service_entity.dart';
import '../../../provider_profile/domain/entities/staff_entity.dart';
import '../../../../core/error/failure.dart';

abstract class AvailabilityRepository {
  Future<Either<Failure, List<SlotEntity>>> getAvailability(String providerId, String date, {String? staffId});
  Future<Either<Failure, List<ServiceEntity>>> getProviderServices(String providerId);
  Future<Either<Failure, List<StaffEntity>>> getProviderStaff(String providerId);
}
