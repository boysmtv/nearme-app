import 'package:flutter_core/flutter_core.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  try {
    await NotificationService.initialize();
  } catch (_) {}
  try {
    await LocalizationService.initialize();
  } catch (_) {}
}
