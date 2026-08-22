import 'package:shared_preferences/shared_preferences.dart';

class LocalizationService {
  LocalizationService._();

  static const String _languageKey = 'language';

  static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    final language = prefs.getString(_languageKey) ?? 'en';
    // TODO: Initialize localization with saved language
  }

  static Future<void> setLanguage(String languageCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, languageCode);
    // TODO: Update localization
  }

  static Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_languageKey) ?? 'en';
  }
}
