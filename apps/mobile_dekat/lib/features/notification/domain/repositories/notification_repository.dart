import 'package:dartz/dartz.dart';
import '../entities/notification_entity.dart';
import '../../../../core/error/failure.dart';

abstract class NotificationRepository {
  Future<Either<Failure, List<NotificationEntity>>> getNotifications({Map<String, dynamic>? params});
  Future<Either<Failure, void>> markAsRead(String id);
  Future<Either<Failure, void>> markAllAsRead();
  Future<Either<Failure, int>> getUnreadCount();
}
