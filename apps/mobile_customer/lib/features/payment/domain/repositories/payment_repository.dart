import 'package:dartz/dartz.dart';
import '../entities/payment_entity.dart';
import '../../../../core/error/failure.dart';

abstract class PaymentRepository {
  Future<Either<Failure, PaymentIntent>> createPaymentIntent(String bookingId, {required int amount, String currency = 'IDR'});
  Future<Either<Failure, PaymentTransaction>> getPaymentStatus(String paymentId);
}
