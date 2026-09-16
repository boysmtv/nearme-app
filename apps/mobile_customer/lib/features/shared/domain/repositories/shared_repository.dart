import 'package:dartz/dartz.dart';
import '../../../../core/error/failure.dart';

abstract class SharedRepository {
  Future<Either<Failure, List<Map<String, dynamic>>>> getNotifications({Map<String, dynamic>? params});
  Future<Either<Failure, void>> markNotificationRead(String id);
  Future<Either<Failure, void>> markAllNotificationsRead();
  Future<Either<Failure, int>> getUnreadCount();
}
