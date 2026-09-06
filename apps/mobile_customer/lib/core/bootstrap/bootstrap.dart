import 'package:flutter_core/flutter_core.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  try {
    await NotificationService.initialize(
      onForegroundMessage: (message) {
        // Show local notification or in-app banner
      },
      onNotificationOpened: (message) {
        // Navigate to relevant screen based on payload
      },
      onTokenRegistered: (token) {
        // Token will be registered after login
      },
    );
  } catch (_) {}
  try {
    await LocalizationService.initialize();
  } catch (_) {}
}
