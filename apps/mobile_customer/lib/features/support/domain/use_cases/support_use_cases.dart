import 'package:dartz/dartz.dart';
import '../entities/support_entity.dart';
import '../repositories/support_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetFaqs extends UseCase<List<Map<String, dynamic>>, NoParams> {
  final SupportRepository repository;
  GetFaqs(this.repository);
  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> call(NoParams params) => repository.getFaqs();
}

class GetPolicies extends UseCase<List<Map<String, dynamic>>, NoParams> {
  final SupportRepository repository;
  GetPolicies(this.repository);
  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> call(NoParams params) => repository.getPolicies();
}

class CreateTicket extends UseCase<SupportTicket, Map<String, dynamic>> {
  final SupportRepository repository;
  CreateTicket(this.repository);
  @override
  Future<Either<Failure, SupportTicket>> call(Map<String, dynamic> data) => repository.createTicket(data);
}
