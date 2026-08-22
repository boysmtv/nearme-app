import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  NotificationService._();

  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static Function(RemoteMessage)? _onMessageHandler;
  static Function(RemoteMessage)? _onMessageOpenedAppHandler;
  static String? _fcmToken;

  static String? get fcmToken => _fcmToken;

  static Future<void> initialize({
    Function(RemoteMessage)? onForegroundMessage,
    Function(RemoteMessage)? onNotificationOpened,
  }) async {
    _onMessageHandler = onForegroundMessage;
    _onMessageOpenedAppHandler = onNotificationOpened;

    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
      criticalAlert: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional) {
      _fcmToken = await _messaging.getToken();
      debugPrint('FCM Token: $_fcmToken');

      _messaging.onTokenRefresh.listen((token) {
        _fcmToken = token;
        debugPrint('FCM Token refreshed: $token');
      });
    }

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Foreground message: ${message.notification?.title}');
      _onMessageHandler?.call(message);
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Notification opened: ${message.notification?.title}');
      _onMessageOpenedAppHandler?.call(message);
    });

    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      debugPrint('Initial message: ${initialMessage.notification?.title}');
      _onMessageOpenedAppHandler?.call(initialMessage);
    }
  }

  static Future<String?> getToken() async {
    _fcmToken = await _messaging.getToken();
    return _fcmToken;
  }

  static Future<void> deleteToken() async {
    await _messaging.deleteToken();
    _fcmToken = null;
  }

  static Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }

  static Map<String, dynamic>? parsePayload(RemoteMessage message) {
    if (message.data.isNotEmpty) {
      return Map<String, dynamic>.from(message.data);
    }
    return null;
  }
}
