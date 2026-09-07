import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  try {
    await AnalyticsService.initialize();
  } catch (_) {}
  try {
    await NotificationService.initialize(
      onForegroundMessage: (message) {
        // Show local notification or in-app banner
      },
      onNotificationOpened: (message) {
        // Navigate to relevant screen based on payload
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
