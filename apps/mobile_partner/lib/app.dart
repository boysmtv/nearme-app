import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/router/app_router.dart';

final lightTheme = ThemeData(
  useMaterial3: true,
  scaffoldBackgroundColor: DEKATColors.backgroundLight,
  colorScheme: DEKATColorScheme.lightColorScheme,
  textTheme: GoogleFonts.poppinsTextTheme(),
  appBarTheme: AppBarTheme(
    elevation: 0,
    scrolledUnderElevation: 0,
    centerTitle: true,
    backgroundColor: DEKATColors.backgroundLight,
    surfaceTintColor: Colors.transparent,
    titleTextStyle: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700, color: DEKATColors.textPrimary, letterSpacing: -0.3),
    iconTheme: const IconThemeData(color: DEKATColors.textPrimary),
  ),
  dividerTheme: DividerThemeData(color: Colors.grey[200], thickness: 1, space: 1),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: Colors.white,
    hintStyle: GoogleFonts.poppins(color: DEKATColors.textHint, fontSize: 14),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey[200]!)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey[200]!)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: DEKATColors.primary, width: 1.6)),
    errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: DEKATColors.error, width: 1)),
    focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: DEKATColors.error, width: 1.6)),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: DEKATColors.primary,
      foregroundColor: Colors.white,
      elevation: 0,
      shadowColor: DEKATColors.primary.withValues(alpha: 0.3),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      textStyle: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, letterSpacing: -0.2),
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: DEKATColors.primary,
      side: BorderSide(color: DEKATColors.primary.withValues(alpha: 0.5)),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      textStyle: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600),
    ),
  ),
  chipTheme: ChipThemeData(
    backgroundColor: Colors.white,
    selectedColor: DEKATColors.primary,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    side: BorderSide(color: Colors.grey[200]!),
    labelStyle: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600),
  ),
  cardTheme: CardThemeData(
    elevation: 0,
    color: Colors.white,
    surfaceTintColor: Colors.white,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    margin: EdgeInsets.zero,
  ),
  bottomNavigationBarTheme: BottomNavigationBarThemeData(
    backgroundColor: Colors.white,
    selectedItemColor: DEKATColors.primary,
    unselectedItemColor: DEKATColors.textHint,
    type: BottomNavigationBarType.fixed,
    showUnselectedLabels: true,
    selectedLabelStyle: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w700),
    unselectedLabelStyle: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500),
  ),
  navigationBarTheme: NavigationBarThemeData(
    backgroundColor: Colors.white,
    indicatorColor: DEKATColors.primary.withValues(alpha: 0.12),
    labelTextStyle: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w700, color: DEKATColors.primary);
      }
      return GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500, color: DEKATColors.textHint);
    }),
    iconTheme: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return const IconThemeData(color: DEKATColors.primary, size: 22);
      }
      return const IconThemeData(color: DEKATColors.textHint, size: 22);
    }),
    elevation: 0,
    height: 72,
  ),
  floatingActionButtonTheme: FloatingActionButtonThemeData(
    backgroundColor: DEKATColors.primary,
    foregroundColor: Colors.white,
    elevation: 4,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
  ),
);

final darkTheme = ThemeData(
  useMaterial3: true,
  scaffoldBackgroundColor: DEKATColors.backgroundDark,
  colorScheme: DEKATColorScheme.darkColorScheme,
  textTheme: GoogleFonts.poppinsTextTheme(ThemeData.dark().textTheme),
  appBarTheme: AppBarTheme(
    elevation: 0,
    scrolledUnderElevation: 0,
    centerTitle: true,
    backgroundColor: DEKATColors.backgroundDark,
    titleTextStyle: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: const Color(0xFF242424),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: DEKATColors.primary, width: 2)),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: DEKATColors.primary,
      foregroundColor: Colors.white,
      elevation: 0,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      textStyle: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
    ),
  ),
  cardTheme: CardThemeData(elevation: 0, color: const Color(0xFF1E1E1E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), margin: EdgeInsets.zero),
);

final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

class DekaPartnerApp extends ConsumerWidget {
  const DekaPartnerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);
    return MaterialApp.router(
      title: 'DEKAT Partner',
      debugShowCheckedModeBanner: false,
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
