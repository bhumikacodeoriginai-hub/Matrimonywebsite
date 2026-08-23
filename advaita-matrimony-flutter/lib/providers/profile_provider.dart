import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProfileProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _profile;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProfile() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getMyProfile();
      if (response.data['success'] == true) {
        _profile = response.data['data'];
      }
    } catch (e) {
      _error = 'Failed to load profile';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _api.updateProfile(data);
      if (response.data['success'] == true) {
        await loadProfile(); // Reload
        return true;
      }
    } catch (e) {
      _error = 'Failed to update profile';
    }
    return false;
  }

  Future<bool> uploadPhoto(String filePath, {bool isPrimary = false}) async {
    try {
      final response = await _api.uploadPhoto(filePath, isPrimary: isPrimary);
      if (response.data['success'] == true) {
        await loadProfile();
        return true;
      }
    } catch (e) {
      _error = 'Failed to upload photo';
    }
    return false;
  }
}
