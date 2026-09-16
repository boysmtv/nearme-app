import 'package:dartz/dartz.dart';
import '../repositories/shared_repository.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failure.dart';

class GetNotifications extends UseCase<List<Map<String, dynamic>>, GetNotificationsParams> {
  final SharedRepository repository;
  GetNotifications(this.repository);
  @override
  Future<Either<Failure, List<Map<String, dynamic>>>> call(GetNotificationsParams params) =>
      repository.getNotifications(params: params.params);
}

class GetNotificationsParams {
  final Map<String, dynamic>? params;
  const GetNotificationsParams({this.params});
}

class MarkNotificationRead extends UseCase<void, String> {
  final SharedRepository repository;
  MarkNotificationRead(this.repository);
  @override
  Future<Either<Failure, void>> call(String id) => repository.markNotificationRead(id);
}

class MarkAllRead extends UseCase<void, NoParams> {
  final SharedRepository repository;
  MarkAllRead(this.repository);
  @override
  Future<Either<Failure, void>> call(NoParams params) => repository.markAllNotificationsRead();
}

class GetUnreadCount extends UseCase<int, NoParams> {
  final SharedRepository repository;
  GetUnreadCount(this.repository);
  @override
  Future<Either<Failure, int>> call(NoParams params) => repository.getUnreadCount();
}
