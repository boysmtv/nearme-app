import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Background message: ${message.notification?.title}');
}

class NotificationService {
  NotificationService._();

  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static Function(RemoteMessage)? _onMessageHandler;
  static Function(RemoteMessage)? _onMessageOpenedAppHandler;
  static String? _fcmToken;
  static Function(String token)? _onTokenRegistered;

  static String? get fcmToken => _fcmToken;

  static Future<void> initialize({
    Function(RemoteMessage)? onForegroundMessage,
    Function(RemoteMessage)? onNotificationOpened,
    Function(String token)? onTokenRegistered,
  }) async {
    _onMessageHandler = onForegroundMessage;
    _onMessageOpenedAppHandler = onNotificationOpened;
    _onTokenRegistered = onTokenRegistered;

    // Register background handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

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

      if (_fcmToken != null) {
        _onTokenRegistered?.call(_fcmToken!);
      }

      _messaging.onTokenRefresh.listen((token) {
        _fcmToken = token;
        debugPrint('FCM Token refreshed: $token');
        _onTokenRegistered?.call(token);
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
