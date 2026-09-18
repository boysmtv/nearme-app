import 'package:dartz/dartz.dart';
import '../entities/payment_entity.dart';
import '../repositories/payment_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class CreatePaymentIntent extends UseCase<PaymentIntent, CreatePaymentParams> {
  final PaymentRepository repository;
  CreatePaymentIntent(this.repository);
  @override
  Future<Either<Failure, PaymentIntent>> call(CreatePaymentParams params) =>
      repository.createPaymentIntent(params.bookingId, amount: params.amount, currency: params.currency);
}

class CreatePaymentParams {
  final String bookingId;
  final int amount;
  final String currency;
  const CreatePaymentParams({required this.bookingId, required this.amount, this.currency = 'IDR'});
}

class GetPaymentStatus extends UseCase<PaymentTransaction, String> {
  final PaymentRepository repository;
  GetPaymentStatus(this.repository);
  @override
  Future<Either<Failure, PaymentTransaction>> call(String paymentId) => repository.getPaymentStatus(paymentId);
}
