import 'package:dartz/dartz.dart';
import '../entities/slot_entity.dart';
import '../../../provider_profile/domain/entities/service_entity.dart';
import '../../../provider_profile/domain/entities/staff_entity.dart';
import '../repositories/availability_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetAvailability extends UseCase<List<SlotEntity>, AvailabilityParams> {
  final AvailabilityRepository repository;
  GetAvailability(this.repository);

  @override
  Future<Either<Failure, List<SlotEntity>>> call(AvailabilityParams params) {
    return repository.getAvailability(params.providerId, params.date, staffId: params.staffId);
  }
}

class AvailabilityParams {
  final String providerId;
  final String date;
  final String? staffId;
  const AvailabilityParams({required this.providerId, required this.date, this.staffId});
}

class GetAvailabilityServices extends UseCase<List<ServiceEntity>, String> {
  final AvailabilityRepository repository;
  GetAvailabilityServices(this.repository);

  @override
  Future<Either<Failure, List<ServiceEntity>>> call(String providerId) {
    return repository.getProviderServices(providerId);
  }
}

class GetAvailabilityStaff extends UseCase<List<StaffEntity>, String> {
  final AvailabilityRepository repository;
  GetAvailabilityStaff(this.repository);

  @override
  Future<Either<Failure, List<StaffEntity>>> call(String providerId) {
    return repository.getProviderStaff(providerId);
  }
}
