import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  SecureStorageService._();

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  static Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  static Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  static Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  static Future<void> deleteAll() async {
    await _storage.deleteAll();
  }

  static Future<bool> containsKey(String key) async {
    return await _storage.containsKey(key: key);
  }

  static Future<Map<String, String>> readAll() async {
    return await _storage.readAll();
  }

  static Future<void> writeMultiple(Map<String, String> entries) async {
    for (final entry in entries.entries) {
      await _storage.write(key: entry.key, value: entry.value);
    }
  }

  static Future<void> deleteMultiple(List<String> keys) async {
    for (final key in keys) {
      await _storage.delete(key: key);
    }
  }
}
