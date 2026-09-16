import 'package:dartz/dartz.dart';
import '../entities/support_entity.dart';
import '../../../../core/error/failure.dart';

abstract class SupportRepository {
  Future<Either<Failure, List<SupportTicket>>> getTickets();
  Future<Either<Failure, SupportTicket>> createTicket(Map<String, dynamic> data);
  Future<Either<Failure, List<Map<String, dynamic>>>> getFaqs();
  Future<Either<Failure, List<Map<String, dynamic>>>> getPolicies();
}
