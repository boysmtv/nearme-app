import 'package:flutter_core/src/config/app_config.dart';
import 'package:flutter_core/src/config/environment.dart';
import 'package:flutter_core/src/services/secure_storage_service.dart';
import 'package:hive_flutter/hive_flutter.dart';

late AppConfig appConfig;

Future<void> initFlutterCore({
  required Environment environment,
}) async {
  appConfig = AppConfig.fromEnvironment(environment);

  await Hive.initFlutter();
  await Hive.openBox('cache');
  await Hive.openBox('settings');
}

class StorageKeys {
  StorageKeys._();

  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';
  static const String userName = 'user_name';
  static const String userRole = 'user_role';
  static const String language = 'language';
  static const String theme = 'theme';
  static const String fcmToken = 'fcm_token';
  static const String isLoggedIn = 'is_logged_in';
}
