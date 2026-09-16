import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/notification_entity.dart';
import '../../../../core/di/providers.dart';
import '../../data/repositories/notification_repository_impl.dart';

final notificationsProvider = FutureProvider<List<NotificationEntity>>((ref) async {
  final repo = NotificationRepositoryImpl(ref.read(apiServiceProvider));
  final result = await repo.getNotifications();
  return result.fold((l) => throw Exception(l.message), (r) => r);
});
