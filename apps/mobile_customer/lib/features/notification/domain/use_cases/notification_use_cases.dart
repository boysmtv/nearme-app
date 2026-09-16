import 'package:dartz/dartz.dart';
import '../entities/notification_entity.dart';
import '../repositories/notification_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetNotifications extends UseCase<List<NotificationEntity>, GetNotificationsParams> {
  final NotificationRepository repository;
  GetNotifications(this.repository);

  @override
  Future<Either<Failure, List<NotificationEntity>>> call(GetNotificationsParams params) {
    return repository.getNotifications(params: params.params);
  }
}

class GetNotificationsParams {
  final Map<String, dynamic>? params;
  const GetNotificationsParams({this.params});
}

class MarkNotificationRead extends UseCase<void, String> {
  final NotificationRepository repository;
  MarkNotificationRead(this.repository);

  @override
  Future<Either<Failure, void>> call(String id) {
    return repository.markAsRead(id);
  }
}

class MarkAllNotificationsRead extends UseCase<void, NoParams> {
  final NotificationRepository repository;
  MarkAllNotificationsRead(this.repository);

  @override
  Future<Either<Failure, void>> call(NoParams params) {
    return repository.markAllAsRead();
  }
}

class GetUnreadNotificationCount extends UseCase<int, NoParams> {
  final NotificationRepository repository;
  GetUnreadNotificationCount(this.repository);

  @override
  Future<Either<Failure, int>> call(NoParams params) {
    return repository.getUnreadCount();
  }
}
