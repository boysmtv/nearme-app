import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive/hive.dart';

class StorageService {
  static const _secureStorage = FlutterSecureStorage();
  static late Box _cacheBox;
  static late Box _settingsBox;

  static Future<void> initialize() async {
    _cacheBox = await Hive.openBox('cache');
    _settingsBox = await Hive.openBox('settings');
  }

  // Secure Storage
  static Future<void> writeSecure(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  static Future<String?> readSecure(String key) async {
    return await _secureStorage.read(key: key);
  }

  static Future<void> deleteSecure(String key) async {
    await _secureStorage.delete(key: key);
  }

  static Future<void> clearSecure() async {
    await _secureStorage.deleteAll();
  }

  // Cache
  static Future<void> writeCache(String key, dynamic value) async {
    await _cacheBox.put(key, value);
  }

  static dynamic readCache(String key) {
    return _cacheBox.get(key);
  }

  static Future<void> deleteCache(String key) async {
    await _cacheBox.delete(key);
  }

  static Future<void> clearCache() async {
    await _cacheBox.clear();
  }

  // Settings
  static Future<void> writeSetting(String key, dynamic value) async {
    await _settingsBox.put(key, value);
  }

  static dynamic readSetting(String key) {
    return _settingsBox.get(key);
  }

  static Future<void> deleteSetting(String key) async {
    await _settingsBox.delete(key);
  }
}
