import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_core/bootstrap.dart';
import 'package:flutter_core/services/notification_service.dart';
import 'package:flutter_core/services/localization_service.dart';
import 'package:flutter_core/config/environment.dart';

Future<void> initCore() async {
  await initFlutterCore(
    environment: Environment.development,
  );

  await NotificationService.initialize();
  await LocalizationService.initialize();
}
