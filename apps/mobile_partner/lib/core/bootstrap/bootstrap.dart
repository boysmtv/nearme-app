import 'package:flutter_core/flutter_core.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  await AnalyticsService.initialize();
  await NotificationService.initialize();
  await LocalizationService.initialize();
}
