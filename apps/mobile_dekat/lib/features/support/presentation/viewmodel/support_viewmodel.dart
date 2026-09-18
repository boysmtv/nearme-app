import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/support_repository.dart';
import '../../data/repositories/support_repository_impl.dart';
import '../../domain/use_cases/support_use_cases.dart';
import '../../../../core/di/providers.dart';

final supportRepositoryProvider = Provider<SupportRepository>((ref) {
  return SupportRepositoryImpl(ref.read(apiServiceProvider));
});

final getFaqsUseCaseProvider = Provider((ref) {
  return GetFaqs(ref.read(supportRepositoryProvider));
});

final getPoliciesUseCaseProvider = Provider((ref) {
  return GetPolicies(ref.read(supportRepositoryProvider));
});
