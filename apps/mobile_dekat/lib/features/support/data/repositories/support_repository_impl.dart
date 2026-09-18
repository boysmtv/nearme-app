import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/support_entity.dart';
import '../../domain/repositories/support_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';

class SupportRepositoryImpl implements SupportRepository {
  final ApiService _api;
  SupportRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<SupportTicket>>> getTickets() async {
    try {
      final res = await _api.dio.get('/support/cases');
      final list = (res.data['data'] ?? []) as List;
      return Right(list.map((e) => SupportTicket.fromJson(e as Map<String, dynamic>)).toList());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, SupportTicket>> createTicket(Map<String, dynamic> data) async {
    try {
      final res = await _api.submitSupportTicket(data);
      final result = res.data['data'] as Map<String, dynamic>;
      return Right(SupportTicket.fromJson(result));
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> getFaqs() async {
    try {
      final res = await _api.getPublicFaqs();
      final list = (res.data['data'] ?? []) as List;
      return Right(list.cast<Map<String, dynamic>>());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> getPolicies() async {
    try {
      final res = await _api.getPublicPolicies();
      final list = (res.data['data'] ?? []) as List;
      return Right(list.cast<Map<String, dynamic>>());
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
