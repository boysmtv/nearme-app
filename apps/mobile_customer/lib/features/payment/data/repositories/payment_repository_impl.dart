import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/payment_entity.dart';
import '../../domain/repositories/payment_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final ApiService _api;
  PaymentRepositoryImpl(this._api);

  @override
  Future<Either<Failure, PaymentIntent>> createPaymentIntent(String bookingId, {required int amount, String currency = 'IDR'}) async {
    try {
      final res = await _api.createPaymentIntent(bookingId, 'bank_transfer', amount: amount, currency: currency);
      final data = res.data['data'] as Map<String, dynamic>;
      return Right(PaymentIntent.fromJson(data));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, PaymentTransaction>> getPaymentStatus(String paymentId) async {
    try {
      final res = await _api.getPayment(paymentId);
      final data = res.data['data'] as Map<String, dynamic>;
      return Right(PaymentTransaction.fromJson(data));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
