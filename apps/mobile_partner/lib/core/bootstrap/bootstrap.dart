import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

import '../../app.dart';

/// Lihat penjelasan di mobile_customer: init paralel + splash dulu,
/// frame pertama tidak menunggu Firebase/Hive/FCM-token selesai.
Future<void> initApp() async {
  final firebaseReady =
      Firebase.initializeApp().then<void>((_) {}, onError: (_) {});
  final localReady = Future.wait<void>([
    initFlutterCore(environment: Environment.development)
        .then<void>((_) {}, onError: (Object e) {
      debugPrint('Core init error: $e');
    }),
    LocalizationService.initialize().then<void>((_) {}, onError: (_) {}),
  ]);
  await Future.wait([firebaseReady, localReady]);

  try {
    await AnalyticsService.initialize();
  } catch (e) {
    debugPrint('Analytics init error: $e');
  }
  try {
    await NotificationService.initialize(
      onForegroundMessage: (message) {
        debugPrint('FCM foreground: ${message.notification?.title}');
      },
      onNotificationOpened: (message) {
        final data = NotificationService.parsePayload(message);
        if (data == null) return;
        final type = data['type'] as String?;
        final id = data['bookingId'] as String? ?? data['notificationId'] as String?;
        debugPrint('FCM opened: type=$type, id=$id');
      },
      onTokenRegistered: (token) async {
        try {
          final tokenStored = await SecureStorageService.read(StorageKeys.accessToken);
          if (tokenStored != null) {
            await ApiService().updateFcmToken(token);
          }
        } catch (e) {
          debugPrint('FCM token update error: $e');
        }
      },
    );
  } catch (e) {
    debugPrint('Notification init error: $e');
  }
}

/// Gerbang startup: splash seketika, app asli setelah [initApp] selesai.
class BootstrapGate extends StatelessWidget {
  const BootstrapGate({super.key});

  static final Future<void> _initFuture = initApp();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _initFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const _StartupSplash();
        }
        return const DekaPartnerApp();
      },
    );
  }
}

class _StartupSplash extends StatelessWidget {
  const _StartupSplash();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: const Color(0xFF6C63FF),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Text(
                'DEKAT Partner',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 2,
                ),
              ),
              SizedBox(height: 32),
              SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
