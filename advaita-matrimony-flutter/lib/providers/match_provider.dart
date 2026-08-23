import 'package:flutter/material.dart';
import '../services/api_service.dart';

class MatchProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<dynamic> _recommendations = [];
  List<dynamic> _searchResults = [];
  bool _isLoading = false;
  String? _error;
  Map<String, dynamic>? _filterOptions;

  List<dynamic> get recommendations => _recommendations;
  List<dynamic> get searchResults => _searchResults;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get filterOptions => _filterOptions;

  Future<void> loadRecommendations() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getRecommendations();
      if (response.data['success'] == true) {
        _recommendations = response.data['data'] ?? [];
      }
    } catch (e) {
      _error = 'Failed to load recommendations';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> search(Map<String, dynamic> filters) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.search(filters);
      if (response.data['success'] == true) {
        _searchResults = response.data['data']['data'] ?? [];
      }
    } catch (e) {
      _error = 'Search failed';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadFilterOptions() async {
    try {
      final response = await _api.getFilterOptions();
      if (response.data['success'] == true) {
        _filterOptions = response.data['data'];
      }
    } catch (e) {
      // Silent fail
    }
    notifyListeners();
  }

  Future<bool> sendInterest(int userId, {String? message}) async {
    try {
      final response = await _api.sendInterest(userId, message: message);
      return response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> addToShortlist(int userId) async {
    try {
      final response = await _api.addToShortlist(userId);
      return response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }
}
