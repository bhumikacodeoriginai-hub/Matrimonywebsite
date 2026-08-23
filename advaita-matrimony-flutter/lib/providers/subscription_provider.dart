import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<dynamic> _packages = [];
  Map<String, dynamic>? _mySubscription;
  bool _isLoading = false;
  bool _freeMode = false;

  List<dynamic> get packages => _packages;
  Map<String, dynamic>? get mySubscription => _mySubscription;
  bool get isLoading => _isLoading;
  bool get freeMode => _freeMode;
  bool get hasActiveSubscription => _mySubscription?['has_subscription'] == true;

  Future<void> loadPackages() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getPackages();
      if (response.data['success'] == true) {
        _packages = response.data['data'] ?? [];
        _freeMode = response.data['free_mode'] == true;
      }
    } catch (e) {
      // Handle error
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadMySubscription() async {
    try {
      final response = await _api.getMySubscription();
      if (response.data['success'] == true) {
        _mySubscription = response.data;
      }
    } catch (e) {
      // Handle error
    }
    notifyListeners();
  }

  Future<Map<String, dynamic>?> createRazorpayOrder(int packageId) async {
    try {
      final response = await _api.createRazorpayOrder(packageId);
      if (response.data['success'] == true) {
        return response.data;
      }
    } catch (e) {
      // Handle error
    }
    return null;
  }

  Future<bool> verifyPayment(Map<String, dynamic> paymentData) async {
    try {
      final response = await _api.verifyRazorpayPayment(paymentData);
      if (response.data['success'] == true) {
        await loadMySubscription();
        return true;
      }
    } catch (e) {
      // Handle error
    }
    return false;
  }
}
