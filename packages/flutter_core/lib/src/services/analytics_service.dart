import 'package:flutter/foundation.dart';

class AnalyticsService {
  AnalyticsService._();

  static bool _initialized = false;

  static Future<void> initialize() async {
    _initialized = true;
    debugPrint('[Analytics] Initialized (debug mode)');
  }

  static Future<void> logEvent(String name, {Map<String, dynamic>? parameters}) async {
    if (!_initialized) return;
    debugPrint('[Analytics] Event: $name ${parameters != null ? parameters.toString() : ''}');
  }

  static Future<void> logScreenView(String screenName) async {
    if (!_initialized) return;
    debugPrint('[Analytics] Screen: $screenName');
  }

  static Future<void> setUserProperty(String name, String value) async {
    if (!_initialized) return;
    debugPrint('[Analytics] Property: $name=$value');
  }
}
