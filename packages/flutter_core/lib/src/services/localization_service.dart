import 'package:shared_preferences/shared_preferences.dart';

class LocalizationService {
  LocalizationService._();

  static const String _languageKey = 'language';
  static String _currentLanguage = 'id';

  static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLanguage = prefs.getString(_languageKey) ?? 'id';
  }

  static Future<void> setLanguage(String languageCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, languageCode);
    _currentLanguage = languageCode;
  }

  static Future<String> getLanguage() async {
    return _currentLanguage;
  }

  static String get currentLanguage => _currentLanguage;
}
