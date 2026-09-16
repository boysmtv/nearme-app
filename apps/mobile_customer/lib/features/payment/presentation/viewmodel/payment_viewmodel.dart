import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/payment_repository.dart';
import '../../data/repositories/payment_repository_impl.dart';
import '../../domain/use_cases/payment_use_cases.dart';
import '../../../../core/di/providers.dart';

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  return PaymentRepositoryImpl(ref.read(apiServiceProvider));
});

final createPaymentIntentUseCaseProvider = Provider((ref) {
  return CreatePaymentIntent(ref.read(paymentRepositoryProvider));
});
