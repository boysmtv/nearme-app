import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/booking_entity.dart';
import '../../domain/repositories/booking_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';
import '../../../shared/data/models/dto.dart';

class BookingRepositoryImpl implements BookingRepository {
  final ApiService _api;
  BookingRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<BookingEntity>>> getBookings({Map<String, dynamic>? params}) async {
    try {
      final response = await _api.getBookings(params: params ?? {});
      final data = response.data['data'];
      if (data is Map<String, dynamic>) {
        final list = (data['data'] ?? []) as List;
        return Right(list.map((e) => BookingDto.fromJson(e as Map<String, dynamic>)).toList());
      }
      if (data is List) {
        return Right(data.map((e) => BookingDto.fromJson(e as Map<String, dynamic>)).toList());
      }
      return const Right([]);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, BookingEntity>> getBooking(String id) async {
    try {
      final response = await _api.getBooking(id);
      final data = response.data['data'] as Map<String, dynamic>;
      return Right(BookingDto.fromJson(data));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, BookingEntity>> createBooking(Map<String, dynamic> data) async {
    try {
      final response = await _api.createBooking(data);
      final result = response.data['data'] as Map<String, dynamic>;
      return Right(BookingDto.fromJson(result));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, String>> createHold(Map<String, dynamic> data) async {
    try {
      final response = await _api.createHold(data);
      final holdId = response.data['data']['id'] as String;
      return Right(holdId);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> cancelBooking(String id, {String? reason, String? actorId}) async {
    try {
      await _api.dio.post(
        '/bookings/$id/cancel',
        queryParameters: {'reason': reason},
        options: Options(headers: {'X-Actor-Id': actorId}),
      );
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> verifyPin(String id, String pin) async {
    try {
      await _api.dio.post('/bookings/$id/verify-pin', data: {'pin': pin});
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> reschedule(String id, Map<String, dynamic> data) async {
    try {
      await _api.dio.post('/bookings/$id/reschedule', data: data);
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, String>> getBookingIcs(String id) async {
    try {
      final res = await _api.getBookingIcs(id);
      return Right(res.data as String);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> getBookingCalendarLink(String id) async {
    try {
      final res = await _api.getBookingCalendarLink(id);
      final data = res.data['data'] as Map<String, dynamic>?;
      return Right(data ?? {});
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> getBookingChat(String id) async {
    try {
      final res = await _api.getBookingChat(id);
      final data = (res.data['data']['id'] ?? res.data['id']) as String;
      return Right({'id': data});
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
