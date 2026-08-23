import 'package:flutter/material.dart';
import '../services/api_service.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, otpSent, otpVerified, registering }

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  AuthStatus _status = AuthStatus.initial;
  Map<String, dynamic>? _userData;
  String? _errorMessage;
  String? _verifiedPhone;

  AuthStatus get status => _status;
  Map<String, dynamic>? get userData => _userData;
  String? get errorMessage => _errorMessage;
  String? get verifiedPhone => _verifiedPhone;
  bool get isLoggedIn => _status == AuthStatus.authenticated;
  bool get isPremium => _userData?['is_premium'] == true;

  /// Check if user is already logged in
  Future<void> checkAuthStatus() async {
    try {
      final isLoggedIn = await _api.isLoggedIn();
      if (isLoggedIn) {
        final response = await _api.getMyProfile();
        if (response.statusCode == 200) {
          _userData = response.data['data']['user'];
          _status = AuthStatus.authenticated;
        } else {
          await _api.clearToken();
          _status = AuthStatus.unauthenticated;
        }
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  /// Send OTP
  Future<bool> sendOtp(String phone, {String purpose = 'login'}) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _api.sendOtp(phone, purpose: purpose);
      if (response.data['success'] == true) {
        _status = AuthStatus.otpSent;
        _verifiedPhone = phone;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response.data['message'] ?? 'Failed to send OTP';
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Network error. Please try again.';
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  /// Verify OTP
  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _api.verifyOtp(phone, otp);
      final data = response.data;

      if (data['success'] == true) {
        if (data['is_new_user'] == true) {
          _status = AuthStatus.otpVerified;
          _verifiedPhone = phone;
          notifyListeners();
          return {'success': true, 'is_new_user': true};
        } else {
          // Existing user - login
          await _api.saveToken(data['token']);
          _userData = data['user'];
          _status = AuthStatus.authenticated;
          notifyListeners();
          return {'success': true, 'is_new_user': false};
        }
      } else {
        _errorMessage = data['message'] ?? 'Invalid OTP';
        _status = AuthStatus.otpSent;
        notifyListeners();
        return {'success': false, 'message': _errorMessage};
      }
    } catch (e) {
      _errorMessage = 'Verification failed. Please try again.';
      _status = AuthStatus.otpSent;
      notifyListeners();
      return {'success': false, 'message': _errorMessage};
    }
  }

  /// Register new user
  Future<bool> register(Map<String, dynamic> data) async {
    _status = AuthStatus.registering;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _api.register(data);
      final responseData = response.data;

      if (responseData['success'] == true) {
        await _api.saveToken(responseData['token']);
        _userData = responseData['user'];
        _status = AuthStatus.authenticated;
        notifyListeners();
        return true;
      } else {
        _errorMessage = responseData['message'] ?? 'Registration failed';
        _status = AuthStatus.otpVerified;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Registration failed. Please try again.';
      _status = AuthStatus.otpVerified;
      notifyListeners();
      return false;
    }
  }

  /// Login with email/phone and password
  Future<bool> loginWithPassword(String login, String password) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _api.login(login, password);
      final data = response.data;

      if (data['success'] == true) {
        await _api.saveToken(data['token']);
        _userData = data['user'];
        _status = AuthStatus.authenticated;
        notifyListeners();
        return true;
      } else {
        _errorMessage = data['message'] ?? 'Invalid credentials';
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Login failed. Please check your credentials.';
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _api.logout();
    } catch (_) {}
    await _api.clearToken();
    _userData = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void resetState() {
    _status = AuthStatus.unauthenticated;
    _errorMessage = null;
    notifyListeners();
  }
}
