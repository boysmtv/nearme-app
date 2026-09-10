import 'package:flutter/foundation.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  try {
    await NotificationService.initialize(
      onForegroundMessage: (message) {
        // Show in-app banner or local notification
        debugPrint('FCM foreground: ${message.notification?.title}');
      },
      onNotificationOpened: (message) {
        final data = NotificationService.parsePayload(message);
        if (data == null) return;
        final type = data['type'] as String?;
        final id = data['bookingId'] as String? ?? data['notificationId'] as String?;
        // Navigation handled by router redirect; data stored for pickup
        debugPrint('FCM opened: type=$type, id=$id');
      },
      onTokenRegistered: (token) async {
        try {
          final tokenStored = await SecureStorageService.read(StorageKeys.accessToken);
          if (tokenStored != null) {
            await ApiService().updateFcmToken(token);
          }
        } catch (_) {}
      },
    );
  } catch (_) {}
  try {
    await LocalizationService.initialize();
  } catch (_) {}
}
