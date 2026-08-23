import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Shared editorial-luxury design tokens used across the Advaita app.
class AppColors {
  static const Color primary = Color(0xFF54234C);
  static const Color primaryLight = Color(0xFF6D2F63);
  static const Color primaryDark = Color(0xFF2A1526);

  static const Color accent = Color(0xFFD4577E);
  static const Color accentLight = Color(0xFFE8688F);

  static const Color gold = Color(0xFFC19A5B);
  static const Color goldLight = Color(0xFFE7CFA1);
  static const Color rose = Color(0xFFD4577E);
  static const Color green = Color(0xFF4C9B78);
  static const Color orange = Color(0xFFBE7048);

  static const Color background = Color(0xFFFBF7F1);
  static const Color surface = Color(0xFFFFFCF8);
  static const Color textPrimary = Color(0xFF1C1420);
  static const Color textSecondary = Color(0xFF756B72);
  static const Color textHint = Color(0xFFA69BA2);
  static const Color divider = Color(0xFFE9DDD3);
  static const Color cardBg = Color(0xFFFFFCF8);

  static const Color categoryGeneral = Color(0xFFD4577E);
  static const Color categoryPhysical = Color(0xFF6D2F63);
  static const Color categoryHearing = Color(0xFF4C9B78);
  static const Color categoryVitiligo = Color(0xFFC19A5B);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2A1526), Color(0xFF54234C), Color(0xFF6D2F63)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFE7CFA1), Color(0xFFC19A5B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient auroraGradient = LinearGradient(
    colors: [Color(0xFFF8E8E7), Color(0xFFF4EBDD), Color(0xFFEDE2EA)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppTheme {
  static TextTheme _textTheme(TextTheme base) {
    final sans = GoogleFonts.plusJakartaSansTextTheme(base).apply(
      bodyColor: AppColors.textPrimary,
      displayColor: AppColors.textPrimary,
    );
    return sans.copyWith(
      displayLarge: GoogleFonts.cormorantGaramond(textStyle: sans.displayLarge, fontWeight: FontWeight.w600),
      displayMedium: GoogleFonts.cormorantGaramond(textStyle: sans.displayMedium, fontWeight: FontWeight.w600),
      headlineLarge: GoogleFonts.cormorantGaramond(textStyle: sans.headlineLarge, fontWeight: FontWeight.w600),
      headlineMedium: GoogleFonts.cormorantGaramond(textStyle: sans.headlineMedium, fontWeight: FontWeight.w600),
      headlineSmall: GoogleFonts.cormorantGaramond(textStyle: sans.headlineSmall, fontWeight: FontWeight.w600),
      titleLarge: GoogleFonts.cormorantGaramond(textStyle: sans.titleLarge, fontWeight: FontWeight.w700),
    );
  }

  static ThemeData get lightTheme {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      secondary: AppColors.gold,
      surface: AppColors.surface,
      error: AppColors.rose,
      brightness: Brightness.light,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: scheme,
      textTheme: _textTheme(ThemeData.light().textTheme),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background.withOpacity(0.94),
        foregroundColor: AppColors.textPrimary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.cormorantGaramond(
          color: AppColors.textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.surface,
        elevation: 0,
        shadowColor: AppColors.primary.withOpacity(0.12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: AppColors.divider),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.background,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.divider, width: 1.2),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: AppColors.primary),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        labelStyle: const TextStyle(color: AppColors.textSecondary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.6),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        hintStyle: const TextStyle(color: AppColors.textHint),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textHint,
        selectedLabelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
        unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.goldLight.withOpacity(0.45),
        surfaceTintColor: Colors.transparent,
        labelTextStyle: MaterialStateProperty.all(
          GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w700),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface,
        selectedColor: AppColors.goldLight.withOpacity(0.45),
        side: const BorderSide(color: AppColors.divider),
        labelStyle: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.gold,
        linearTrackColor: AppColors.divider,
      ),
      dividerTheme: const DividerThemeData(color: AppColors.divider),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.gold,
      scaffoldBackgroundColor: AppColors.primaryDark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.gold,
        brightness: Brightness.dark,
        surface: const Color(0xFF351D31),
      ),
      textTheme: _textTheme(ThemeData.dark().textTheme),
    );
  }
}
