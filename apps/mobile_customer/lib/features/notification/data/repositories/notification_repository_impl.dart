import 'package:dartz/dartz.dart';
import 'package:flutter_api_client/flutter_api_client.dart';
import '../../domain/entities/notification_entity.dart';
import '../../domain/repositories/notification_repository.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/error/error_handler.dart';
import '../../../shared/data/models/dto.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final ApiService _api;
  NotificationRepositoryImpl(this._api);

  @override
  Future<Either<Failure, List<NotificationEntity>>> getNotifications({Map<String, dynamic>? params}) async {
    try {
      final response = await _api.getNotifications(params: params ?? {'page': 1, 'limit': 50});
      final data = response.data['data'];
      if (data is Map<String, dynamic>) {
        final list = (data['data'] ?? []) as List;
        return Right(list.map((e) => NotificationDto.fromJson(e as Map<String, dynamic>)).toList());
      }
      if (data is List) {
        return Right(data.map((e) => NotificationDto.fromJson(e as Map<String, dynamic>)).toList());
      }
      return const Right([]);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> markAsRead(String id) async {
    try {
      await _api.markNotificationRead(id);
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, void>> markAllAsRead() async {
    try {
      await _api.markAllNotificationsRead();
      return const Right(null);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }

  @override
  Future<Either<Failure, int>> getUnreadCount() async {
    try {
      final response = await _api.getNotifications(params: {'page': 1, 'limit': 1, 'unreadOnly': true});
      final data = response.data['data'];
      if (data is Map<String, dynamic>) {
        final total = data['pagination']?['total'];
        if (total is num) return Right(total.toInt());
      }
      return const Right(0);
    } catch (e) {
      return Left(Failure.fromException(ErrorHandler.handle(e)));
    }
  }
}
