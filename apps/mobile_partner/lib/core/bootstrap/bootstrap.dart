import 'package:flutter_core/bootstrap.dart';
import 'package:flutter_core/services/analytics_service.dart';
import 'package:flutter_core/services/notification_service.dart';
import 'package:flutter_core/services/localization_service.dart';
import 'package:flutter_core/config/environment.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  await AnalyticsService.initialize();
  await NotificationService.initialize();
  await LocalizationService.initialize();
}
