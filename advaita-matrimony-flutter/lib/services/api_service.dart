import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'https://advaitamatrimony.com/api/v1';
  
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expired - redirect to login
          _storage.delete(key: 'auth_token');
        }
        return handler.next(error);
      },
    ));
  }

  // ============ AUTH ============
  Future<Response> sendOtp(String phone, {String purpose = 'login'}) {
    return _dio.post('/auth/send-otp', data: {'phone': phone, 'purpose': purpose});
  }

  Future<Response> verifyOtp(String phone, String otp) {
    return _dio.post('/auth/verify-otp', data: {'phone': phone, 'otp': otp});
  }

  Future<Response> register(Map<String, dynamic> data) {
    return _dio.post('/auth/register', data: data);
  }

  Future<Response> login(String login, String password) {
    return _dio.post('/auth/login', data: {'login': login, 'password': password});
  }

  Future<Response> logout() {
    return _dio.post('/auth/logout');
  }

  Future<Response> updateFcmToken(String token) {
    return _dio.post('/auth/fcm-token', data: {'token': token});
  }

  // ============ PROFILE ============
  Future<Response> getMyProfile() {
    return _dio.get('/profile/me');
  }

  Future<Response> updateProfile(Map<String, dynamic> data) {
    return _dio.put('/profile/update', data: data);
  }

  Future<Response> updatePartnerPreferences(Map<String, dynamic> data) {
    return _dio.put('/profile/partner-preferences', data: data);
  }

  Future<Response> uploadPhoto(String filePath, {bool isPrimary = false}) {
    return _dio.post('/profile/photo/upload',
      data: FormData.fromMap({
        'photo': MultipartFile.fromFileSync(filePath),
        'is_primary': isPrimary ? '1' : '0',
      }),
    );
  }

  Future<Response> deletePhoto(int photoId) {
    return _dio.delete('/profile/photo/$photoId');
  }

  Future<Response> getProfileViewers() {
    return _dio.get('/profile/viewers');
  }

  // ============ VIEW PROFILES ============
  Future<Response> viewProfile(int userId) {
    return _dio.get('/profiles/$userId');
  }

  Future<Response> requestPhotoAccess(int userId, {String? message}) {
    return _dio.post('/profiles/$userId/request-photo', data: {'message': message});
  }

  // ============ SEARCH ============
  Future<Response> getRecommendations() {
    return _dio.get('/matches/recommended');
  }

  Future<Response> search(Map<String, dynamic> filters, {int page = 1}) {
    filters['page'] = page;
    return _dio.get('/search', queryParameters: filters);
  }

  Future<Response> searchById(String profileId) {
    return _dio.get('/search/by-id', queryParameters: {'profile_id': profileId});
  }

  Future<Response> getFilterOptions() {
    return _dio.get('/filter-options');
  }

  // ============ INTERESTS ============
  Future<Response> sendInterest(int userId, {String? message}) {
    return _dio.post('/interests/send/$userId', data: {'message': message});
  }

  Future<Response> respondToInterest(int interestId, String status) {
    return _dio.put('/interests/$interestId/respond', data: {'status': status});
  }

  Future<Response> getSentInterests({int page = 1}) {
    return _dio.get('/interests/sent', queryParameters: {'page': page});
  }

  Future<Response> getReceivedInterests({int page = 1}) {
    return _dio.get('/interests/received', queryParameters: {'page': page});
  }

  Future<Response> getMutualMatches({int page = 1}) {
    return _dio.get('/interests/mutual', queryParameters: {'page': page});
  }

  // ============ CHAT ============
  Future<Response> getConversations({int page = 1}) {
    return _dio.get('/chat/conversations', queryParameters: {'page': page});
  }

  Future<Response> getMessages(int conversationId, {int page = 1}) {
    return _dio.get('/chat/conversations/$conversationId/messages', queryParameters: {'page': page});
  }

  Future<Response> sendMessage(int conversationId, String body, {String type = 'text'}) {
    return _dio.post('/chat/conversations/$conversationId/send', data: {'body': body, 'type': type});
  }

  Future<Response> getUnreadCount() {
    return _dio.get('/chat/unread-count');
  }

  // ============ PAYMENTS ============
  Future<Response> getPackages() {
    return _dio.get('/packages');
  }

  Future<Response> createRazorpayOrder(int packageId) {
    return _dio.post('/payments/razorpay/create-order', data: {'package_id': packageId});
  }

  Future<Response> verifyRazorpayPayment(Map<String, dynamic> data) {
    return _dio.post('/payments/razorpay/verify', data: data);
  }

  Future<Response> getPaymentHistory({int page = 1}) {
    return _dio.get('/payments/history', queryParameters: {'page': page});
  }

  Future<Response> getMySubscription() {
    return _dio.get('/my-subscription');
  }

  // ============ SHORTLIST & BLOCK ============
  Future<Response> addToShortlist(int userId) {
    return _dio.post('/shortlist/$userId');
  }

  Future<Response> removeFromShortlist(int userId) {
    return _dio.delete('/shortlist/$userId');
  }

  Future<Response> getShortlist({int page = 1}) {
    return _dio.get('/shortlist', queryParameters: {'page': page});
  }

  Future<Response> blockUser(int userId, {String? reason}) {
    return _dio.post('/block/$userId', data: {'reason': reason});
  }

  // ============ TOKEN MANAGEMENT ============
  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  Future<void> clearToken() async {
    await _storage.delete(key: 'auth_token');
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
