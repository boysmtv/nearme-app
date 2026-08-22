import 'package:dio/dio.dart';
import 'dio_client.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._();
  factory ApiClient() => _instance;

  late final Dio _dio;

  ApiClient._() {
    _dio = DioClient(_config).dio;
  }

  static final _config = AppConfig.development;

  void updateConfig(AppConfig config) {
    _dio.options.baseUrl = config.apiBaseUrl;
    _dio.options.connectTimeout = config.connectTimeout;
    _dio.options.receiveTimeout = config.receiveTimeout;
  }

  Dio get dio => _dio;

  // Auth
  Future<Response> login(String email, String password) {
    return _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register(Map<String, dynamic> data) {
    return _dio.post('/auth/register', data: data);
  }

  Future<Response> requestOtp(String email) {
    return _dio.post('/auth/request-otp', data: {'email': email});
  }

  Future<Response> verifyOtp(String email, String otp) {
    return _dio.post('/auth/verify-otp', data: {
      'email': email,
      'otp': otp,
    });
  }

  Future<Response> refreshToken(String refreshToken) {
    return _dio.post('/auth/refresh', data: {
      'refresh_token': refreshToken,
    });
  }

  Future<Response> logout() {
    return _dio.post('/auth/logout');
  }

  Future<Response> forgotPassword(String email) {
    return _dio.post('/auth/forgot-password', data: {'email': email});
  }

  // Providers
  Future<Response> getProviders({Map<String, dynamic>? params}) {
    return _dio.get('/providers', queryParameters: params);
  }

  Future<Response> getProvider(String id) {
    return _dio.get('/providers/$id');
  }

  Future<Response> getProviderServices(String providerId) {
    return _dio.get('/providers/$providerId/services');
  }

  Future<Response> getProviderStaff(String providerId) {
    return _dio.get('/providers/$providerId/staff');
  }

  Future<Response> getProviderAvailability(String providerId, String date) {
    return _dio.get('/providers/$providerId/availability', queryParameters: {
      'date': date,
    });
  }

  Future<Response> getProviderCalendar(String providerId, {Map<String, dynamic>? params}) {
    return _dio.get('/providers/$providerId/calendar', queryParameters: params);
  }

  // Search / Discovery
  Future<Response> search(String query, {Map<String, dynamic>? params}) {
    final queryParams = {'q': query, ...?params};
    return _dio.get('/search', queryParameters: queryParams);
  }

  Future<Response> getBusiness(String id) {
    return _dio.get('/businesses/$id');
  }

  Future<Response> getCategories() {
    return _dio.get('/categories');
  }

  Future<Response> getRecentSearches() {
    return _dio.get('/user/recent-searches');
  }

  Future<Response> saveRecentSearch(String query) {
    return _dio.post('/user/recent-searches', data: {'query': query});
  }

  // Bookings
  Future<Response> createHold(Map<String, dynamic> data) {
    return _dio.post('/bookings/hold', data: data);
  }

  Future<Response> createBooking(Map<String, dynamic> data) {
    return _dio.post('/bookings', data: data);
  }

  Future<Response> getBookings({Map<String, dynamic>? params}) {
    return _dio.get('/bookings', queryParameters: params);
  }

  Future<Response> getBooking(String id) {
    return _dio.get('/bookings/$id');
  }

  Future<Response> rescheduleBooking(String id, Map<String, dynamic> data) {
    return _dio.put('/bookings/$id/reschedule', data: data);
  }

  Future<Response> cancelBooking(String id, {String? reason}) {
    return _dio.post('/bookings/$id/cancel', data: {'reason': reason});
  }

  // Payments
  Future<Response> createPaymentIntent(String bookingId, String method) {
    return _dio.post('/payments/intent', data: {
      'booking_id': bookingId,
      'payment_method': method,
    });
  }

  Future<Response> getPayment(String id) {
    return _dio.get('/payments/$id');
  }

  // User Profile
  Future<Response> getProfile() {
    return _dio.get('/user/profile');
  }

  Future<Response> updateProfile(Map<String, dynamic> data) {
    return _dio.put('/user/profile', data: data);
  }

  Future<Response> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath),
    });
    return _dio.post('/user/profile/avatar', data: formData);
  }

  // Notifications
  Future<Response> getNotifications({Map<String, dynamic>? params}) {
    return _dio.get('/notifications', queryParameters: params);
  }

  Future<Response> markNotificationRead(String id) {
    return _dio.put('/notifications/$id/read');
  }

  Future<Response> markAllNotificationsRead() {
    return _dio.put('/notifications/read-all');
  }

  Future<Response> updateFcmToken(String token) {
    return _dio.post('/fcm-token', data: {'token': token});
  }

  // Support
  Future<Response> submitSupportTicket(Map<String, dynamic> data) {
    return _dio.post('/support/tickets', data: data);
  }

  // Partner
  Future<Response> getPartnerBookings({Map<String, dynamic>? params}) {
    return _dio.get('/partner/bookings', queryParameters: params);
  }

  Future<Response> acceptBooking(String id) {
    return _dio.post('/partner/bookings/$id/accept');
  }

  Future<Response> declineBooking(String id) {
    return _dio.post('/partner/bookings/$id/decline');
  }

  Future<Response> completeBooking(String id) {
    return _dio.post('/partner/bookings/$id/complete');
  }

  Future<Response> getPartnerEarnings({Map<String, dynamic>? params}) {
    return _dio.get('/partner/earnings', queryParameters: params);
  }

  Future<Response> getStaff({Map<String, dynamic>? params}) {
    return _dio.get('/partner/staff', queryParameters: params);
  }

  Future<Response> addStaff(Map<String, dynamic> data) {
    return _dio.post('/partner/staff', data: data);
  }

  Future<Response> updateStaff(String id, Map<String, dynamic> data) {
    return _dio.put('/partner/staff/$id', data: data);
  }

  Future<Response> deleteStaff(String id) {
    return _dio.delete('/partner/staff/$id');
  }

  Future<Response> getReports({Map<String, dynamic>? params}) {
    return _dio.get('/partner/reports', queryParameters: params);
  }
}
