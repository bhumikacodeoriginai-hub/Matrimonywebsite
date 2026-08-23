import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ChatProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<dynamic> _conversations = [];
  Map<int, List<dynamic>> _messages = {};
  int _unreadCount = 0;
  bool _isLoading = false;

  List<dynamic> get conversations => _conversations;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  List<dynamic> getMessages(int conversationId) => _messages[conversationId] ?? [];

  Future<void> loadConversations() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.getConversations();
      if (response.data['success'] == true) {
        _conversations = response.data['data']['data'] ?? [];
      }
    } catch (e) {
      // Handle error
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadMessages(int conversationId) async {
    try {
      final response = await _api.getMessages(conversationId);
      if (response.data['success'] == true) {
        _messages[conversationId] = response.data['data']['data'] ?? [];
      }
    } catch (e) {
      // Handle error
    }
    notifyListeners();
  }

  Future<bool> sendMessage(int conversationId, String body) async {
    try {
      final response = await _api.sendMessage(conversationId, body);
      if (response.data['success'] == true) {
        // Add message to local list
        _messages[conversationId]?.insert(0, response.data['data']);
        notifyListeners();
        return true;
      }
    } catch (e) {
      // Handle error
    }
    return false;
  }

  Future<void> loadUnreadCount() async {
    try {
      final response = await _api.getUnreadCount();
      if (response.data['success'] == true) {
        _unreadCount = response.data['count'] ?? 0;
      }
    } catch (e) {
      // Silent
    }
    notifyListeners();
  }
}
