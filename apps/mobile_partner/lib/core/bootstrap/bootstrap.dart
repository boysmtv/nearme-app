import 'package:flutter/foundation.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  try {
    await AnalyticsService.initialize();
  } catch (e) {
    debugPrint('Analytics init error: $e');
  }
  try {
    await NotificationService.initialize(
      onForegroundMessage: (message) {
        debugPrint('FCM foreground: ${message.notification?.title}');
      },
      onNotificationOpened: (message) {
        final data = NotificationService.parsePayload(message);
        if (data == null) return;
        final type = data['type'] as String?;
        final id = data['bookingId'] as String? ?? data['notificationId'] as String?;
        debugPrint('FCM opened: type=$type, id=$id');
      },
      onTokenRegistered: (token) async {
        try {
          final tokenStored = await SecureStorageService.read(StorageKeys.accessToken);
          if (tokenStored != null) {
            await ApiService().updateFcmToken(token);
          }
        } catch (e) {
          debugPrint('FCM token update error: $e');
        }
      },
    );
  } catch (e) {
    debugPrint('Notification init error: $e');
  }
  try {
    await LocalizationService.initialize();
  } catch (e) {
    debugPrint('Localization init error: $e');
  }
}
