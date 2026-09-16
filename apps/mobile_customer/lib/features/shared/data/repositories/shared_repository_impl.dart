import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/repositories/shared_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';

class SharedRepositoryImpl implements SharedRepository {
  final ApiService _api;
  SharedRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> getNotifications({Map<String, dynamic>? params}) async {
    try {
      final res = await _api.getNotifications(params: params ?? {});
      final data = res.data['data'];
      if (data is List) return Right(data.cast<Map<String, dynamic>>());
      if (data is Map<String, dynamic>) {
        final list = (data['data'] ?? []) as List;
        return Right(list.cast<Map<String, dynamic>>());
      }
      return const Right([]);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> markNotificationRead(String id) async {
    try {
      await _api.dio.put('/notifications/$id/read');
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> markAllNotificationsRead() async {
    try {
      await _api.dio.put('/notifications/read-all');
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, int>> getUnreadCount() async {
    try {
      final res = await _api.dio.get('/notifications/unread-count');
      return Right((res.data['data'] as num?)?.toInt() ?? 0);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
