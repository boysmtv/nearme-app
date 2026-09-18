import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_core/flutter_core.dart';
import 'package:flutter_api_client/flutter_api_client.dart';

import '../../app.dart';

/// Menjalankan semua init independen secara PARALEL.
///
/// Sebelumnya: Firebase → Hive → FCM (network!) → Localization dijalankan
/// serial dengan `await` di `main()`, sehingga frame pertama baru muncul
/// setelah semuanya selesai (black screen 3-8 detik di HP lama).
/// Sekarang: `main()` langsung `runApp(BootstrapGate)` (frame pertama
/// dalam milidetik), init di atas berjalan di background via [Future.wait].
///
/// Dependensi yang dihormati: [NotificationService] butuh Firebase siap
/// dulu; Hive boxes + SharedPreferences tidak bergantung siapa pun.
Future<void> initApp() async {
  final firebaseReady =
      Firebase.initializeApp().then<void>((_) {}, onError: (_) {});
  final localReady = Future.wait<void>([
    initFlutterCore(environment: Environment.development)
        .then<void>((_) {}, onError: (Object e) {
      // Degradasi, bukan mati total: dulu throw di sini = runApp tak jalan.
      debugPrint('Core init error: $e');
    }),
    LocalizationService.initialize().then<void>((_) {}, onError: (_) {}),
  ]);
  await Future.wait([firebaseReady, localReady]);

  try {
    await NotificationService.initialize(
      onForegroundMessage: (message) {
        // Show in-app banner or local notification
        debugPrint('FCM foreground: ${message.notification?.title}');
      },
      onNotificationOpened: (message) {
        final data = NotificationService.parsePayload(message);
        if (data == null) return;
        final type = data['type'] as String?;
        final id = data['bookingId'] as String? ?? data['notificationId'] as String?;
        // Navigation handled by router redirect; data stored for pickup
        debugPrint('FCM opened: type=$type, id=$id');
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
}

/// Gerbang startup: tampilkan splash seketika, ganti ke app asli
/// setelah [initApp] selesai. Future dibuat sekali (static) agar tidak
/// di-restart saat rebuild.
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
        return const DekaApp();
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
                'DEKAT',
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 4,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Booking Platform',
                style: TextStyle(fontSize: 14, color: Colors.white70),
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
