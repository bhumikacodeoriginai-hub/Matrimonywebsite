import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'providers/auth_provider.dart';
import 'providers/profile_provider.dart';
import 'providers/match_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/subscription_provider.dart';
import 'localization/app_localizations.dart';
import 'screens/splash/splash_screen.dart';
import 'theme/app_theme.dart';

const bool designPreview = bool.fromEnvironment('ADVAITA_DESIGN_PREVIEW', defaultValue: false);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb) {
    // Lock orientation to portrait
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // Set system UI overlay style
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: AppColors.background,
    ));
  }

  final languageProvider = AppLanguageProvider();
  await languageProvider.load();
  runApp(AdvaitaMatrimonyApp(languageProvider: languageProvider));
}

class AdvaitaMatrimonyApp extends StatelessWidget {
  final AppLanguageProvider languageProvider;

  const AdvaitaMatrimonyApp({super.key, required this.languageProvider});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProfileProvider()),
        ChangeNotifierProvider(create: (_) => MatchProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => SubscriptionProvider()),
        ChangeNotifierProvider.value(value: languageProvider),
      ],
      child: Consumer<AppLanguageProvider>(
        builder: (_, language, __) => MaterialApp(
          title: 'Advaita Matrimony',
          locale: language.locale,
          supportedLocales: const [Locale('en'), Locale('kn')],
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.light,
          home: const SplashScreen(designPreview: designPreview),
        ),
      ),
    );
  }
}
