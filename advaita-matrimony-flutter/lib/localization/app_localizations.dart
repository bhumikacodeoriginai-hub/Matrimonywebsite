import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Persisted language state shared by the mobile shell and future feature screens.
class AppLanguageProvider extends ChangeNotifier {
  Locale _locale = const Locale('en');

  Locale get locale => _locale;
  bool get isKannada => _locale.languageCode == 'kn';

  Future<void> load() async {
    final preferences = await SharedPreferences.getInstance();
    final languageCode = preferences.getString('advaita-language') ?? 'en';
    _locale = Locale(languageCode == 'kn' ? 'kn' : 'en');
    notifyListeners();
  }

  Future<void> setLocale(Locale locale) async {
    final languageCode = locale.languageCode == 'kn' ? 'kn' : 'en';
    if (_locale.languageCode == languageCode) return;
    _locale = Locale(languageCode);
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString('advaita-language', languageCode);
    notifyListeners();
  }

  Future<void> toggle() => setLocale(Locale(isKannada ? 'en' : 'kn'));
}

/// Small shared dictionary for the mobile preview. Feature modules can extend
/// this map without coupling UI widgets to hard-coded copy.
class AppStrings {
  final bool isKannada;
  const AppStrings(this.isKannada);

  static AppStrings of(BuildContext context) {
    return AppStrings(Provider.of<AppLanguageProvider>(context).isKannada);
  }

  String get languageLabel => isKannada ? 'English' : 'ಕನ್ನಡ';
  String get myProfile => isKannada ? 'ನನ್ನ ಪ್ರೊಫೈಲ್' : 'My Profile';
  String get premiumMember => isKannada ? 'ಪ್ರೀಮಿಯಂ ಸದಸ್ಯ' : 'Premium Member';
  String get profileComplete => isKannada ? 'ಪ್ರೊಫೈಲ್ ಪೂರ್ಣತೆ' : 'Profile';
  String get complete => isKannada ? 'ಪೂರ್ಣ' : 'Complete';
  String get myActivity => isKannada ? 'ನನ್ನ ಚಟುವಟಿಕೆ' : 'My Activity';
  String get account => isKannada ? 'ಖಾತೆ' : 'Account';
  String get whoViewedMe => isKannada ? 'ನನ್ನನ್ನು ನೋಡಿದವರು' : 'Who Viewed Me';
  String get interestsReceived => isKannada ? 'ಸ್ವೀಕರಿಸಿದ ಆಸಕ್ತಿಗಳು' : 'Interests Received';
  String get interestsSent => isKannada ? 'ಕಳುಹಿಸಿದ ಆಸಕ್ತಿಗಳು' : 'Interests Sent';
  String get shortlisted => isKannada ? 'ಶಾರ್ಟ್‌ಲಿಸ್ಟ್ ಮಾಡಿದವರು' : 'Shortlisted';
  String get subscription => isKannada ? 'ನನ್ನ ಚಂದಾದಾರಿಕೆ' : 'My Subscription';
  String get paymentHistory => isKannada ? 'ಪಾವತಿ ಇತಿಹಾಸ' : 'Payment History';
  String get privacySettings => isKannada ? 'ಗೌಪ್ಯತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು' : 'Privacy Settings';
  String get notifications => isKannada ? 'ಅಧಿಸೂಚನೆಗಳು' : 'Notifications';
  String get helpSupport => isKannada ? 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ' : 'Help & Support';
  String get logout => isKannada ? 'ಲಾಗ್‌ಔಟ್' : 'Logout';
}
