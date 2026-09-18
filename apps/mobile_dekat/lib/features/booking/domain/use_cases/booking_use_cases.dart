import 'package:dartz/dartz.dart';
import '../entities/booking_entity.dart';
import '../repositories/booking_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetBookings extends UseCase<List<BookingEntity>, GetBookingsParams> {
  final BookingRepository repository;
  GetBookings(this.repository);

  @override
  Future<Either<Failure, List<BookingEntity>>> call(GetBookingsParams params) {
    return repository.getBookings(params: params.params);
  }
}

class GetBookingsParams {
  final Map<String, dynamic>? params;
  const GetBookingsParams({this.params});
}

class GetBookingDetail extends UseCase<BookingEntity, String> {
  final BookingRepository repository;
  GetBookingDetail(this.repository);

  @override
  Future<Either<Failure, BookingEntity>> call(String id) {
    return repository.getBooking(id);
  }
}

class CreateBooking extends UseCase<BookingEntity, CreateBookingParams> {
  final BookingRepository repository;
  CreateBooking(this.repository);

  @override
  Future<Either<Failure, BookingEntity>> call(CreateBookingParams params) {
    return repository.createBooking(params.data);
  }
}

class CreateBookingParams {
  final Map<String, dynamic> data;
  const CreateBookingParams({required this.data});
}

class CreateHold extends UseCase<String, Map<String, dynamic>> {
  final BookingRepository repository;
  CreateHold(this.repository);

  @override
  Future<Either<Failure, String>> call(Map<String, dynamic> data) {
    return repository.createHold(data);
  }
}

class CancelBooking extends UseCase<void, CancelBookingParams> {
  final BookingRepository repository;
  CancelBooking(this.repository);

  @override
  Future<Either<Failure, void>> call(CancelBookingParams params) {
    return repository.cancelBooking(params.id, reason: params.reason, actorId: params.actorId);
  }
}

class CancelBookingParams {
  final String id;
  final String? reason;
  final String? actorId;
  const CancelBookingParams({required this.id, this.reason, this.actorId});
}

class VerifyBookingPin extends UseCase<void, VerifyPinParams> {
  final BookingRepository repository;
  VerifyBookingPin(this.repository);

  @override
  Future<Either<Failure, void>> call(VerifyPinParams params) {
    return repository.verifyPin(params.id, params.pin);
  }
}

class VerifyPinParams {
  final String id;
  final String pin;
  const VerifyPinParams({required this.id, required this.pin});
}

class RescheduleBooking extends UseCase<void, RescheduleParams> {
  final BookingRepository repository;
  RescheduleBooking(this.repository);

  @override
  Future<Either<Failure, void>> call(RescheduleParams params) {
    return repository.reschedule(params.id, params.data);
  }
}

class RescheduleParams {
  final String id;
  final Map<String, dynamic> data;
  const RescheduleParams({required this.id, required this.data});
}
