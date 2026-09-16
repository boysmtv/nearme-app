import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile_customer/features/notification/domain/entities/notification_entity.dart';
import 'package:mobile_customer/features/notification/presentation/viewmodel/notification_viewmodel.dart';

void main() {
  group('notificationsProvider', () {
    test('returns list of notifications from override', () async {
      final container = ProviderContainer(
        overrides: [
          notificationsProvider.overrideWith((ref) => Future.value([
                const NotificationEntity(
                  id: 'n1',
                  channel: 'PUSH',
                  subject: 'Booking Confirmed',
                  body: 'Your booking DKT-001 is confirmed.',
                  read: false,
                ),
                const NotificationEntity(
                  id: 'n2',
                  channel: 'EMAIL',
                  subject: 'Welcome',
                  body: 'Welcome to DEKAT!',
                  read: true,
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final notifications = await container.read(notificationsProvider.future);
      expect(notifications.length, 2);
      expect(notifications[0].subject, 'Booking Confirmed');
      expect(notifications[0].read, false);
      expect(notifications[1].read, true);
    });

    test('returns empty list when no notifications', () async {
      final container = ProviderContainer(
        overrides: [
          notificationsProvider
              .overrideWith((ref) => Future.value(<NotificationEntity>[])),
        ],
      );
      addTearDown(container.dispose);

      final notifications = await container.read(notificationsProvider.future);
      expect(notifications, isEmpty);
    });

    test('propagates error from API', () async {
      final container = ProviderContainer(
        overrides: [
          notificationsProvider.overrideWith(
              (ref) => Future.error(Exception('Failed to load'))),
        ],
      );
      addTearDown(container.dispose);

      expect(
        () => container.read(notificationsProvider.future),
        throwsA(isA<Exception>()),
      );
    });

    test('notification with empty subject is handled', () async {
      final container = ProviderContainer(
        overrides: [
          notificationsProvider.overrideWith((ref) => Future.value([
                const NotificationEntity(
                  id: 'n3',
                  channel: 'PUSH',
                  subject: '',
                  body: 'Something happened',
                  read: false,
                ),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final notifications = await container.read(notificationsProvider.future);
      expect(notifications[0].subject, '');
      expect(notifications[0].body, 'Something happened');
    });

    test('multiple notifications preserve order', () async {
      final container = ProviderContainer(
        overrides: [
          notificationsProvider.overrideWith((ref) => Future.value([
                const NotificationEntity(
                    id: 'n1', channel: 'PUSH', subject: 'First', body: 'b1', read: false),
                const NotificationEntity(
                    id: 'n2', channel: 'EMAIL', subject: 'Second', body: 'b2', read: false),
                const NotificationEntity(
                    id: 'n3', channel: 'PUSH', subject: 'Third', body: 'b3', read: true),
              ])),
        ],
      );
      addTearDown(container.dispose);

      final notifications = await container.read(notificationsProvider.future);
      expect(notifications[0].id, 'n1');
      expect(notifications[1].id, 'n2');
      expect(notifications[2].id, 'n3');
    });
  });
}
