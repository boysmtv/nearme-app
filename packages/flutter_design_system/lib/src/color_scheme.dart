import 'package:flutter/material.dart';
import 'colors.dart';

class DEKATColorScheme {
  DEKATColorScheme._();

  static const lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: DEKATColors.primary,
    onPrimary: Colors.white,
    secondary: DEKATColors.secondary,
    onSecondary: Colors.white,
    error: DEKATColors.error,
    onError: Colors.white,
    surface: DEKATColors.surfaceLight,
    onSurface: DEKATColors.textPrimary,
  );

  static const darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: DEKATColors.primary,
    onPrimary: Colors.white,
    secondary: DEKATColors.secondary,
    onSecondary: Colors.white,
    error: DEKATColors.error,
    onError: Colors.white,
    surface: DEKATColors.surfaceDark,
    onSurface: Colors.white,
  );
}
