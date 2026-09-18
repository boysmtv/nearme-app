import 'package:dartz/dartz.dart';
import '../entities/booking_entity.dart';
import '../../../../core/error/failure.dart';

abstract class BookingRepository {
  Future<Either<Failure, List<BookingEntity>>> getBookings({Map<String, dynamic>? params});
  Future<Either<Failure, BookingEntity>> getBooking(String id);
  Future<Either<Failure, BookingEntity>> createBooking(Map<String, dynamic> data);
  Future<Either<Failure, String>> createHold(Map<String, dynamic> data);
  Future<Either<Failure, void>> cancelBooking(String id, {String? reason, String? actorId});
  Future<Either<Failure, void>> verifyPin(String id, String pin);
  Future<Either<Failure, void>> reschedule(String id, Map<String, dynamic> data);
  Future<Either<Failure, String>> getBookingIcs(String id);
  Future<Either<Failure, Map<String, dynamic>>> getBookingCalendarLink(String id);
  Future<Either<Failure, Map<String, dynamic>>> getBookingChat(String id);
}
