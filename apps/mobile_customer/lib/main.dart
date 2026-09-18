import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/bootstrap/bootstrap.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Frame pertama (splash) dirender seketika; init berat (Firebase, Hive,
  // FCM token network, dsb.) berjalan paralel di background via BootstrapGate.
  // Jangan await apa pun di sini — itu yang dulu bikin black screen lama.
  runApp(const ProviderScope(child: BootstrapGate()));
}
