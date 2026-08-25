import 'package:dio/dio.dart';
import 'package:flutter_core/flutter_core.dart';
import 'endpoints.dart';

class ApiService {
  static final ApiService _instance = ApiService._();
  factory ApiService() => _instance;
  late final Dio _dio;

  ApiService._() {
    _dio = ApiClient().dio;
  }

  Dio get dio => _dio;

  Future<Response> login(String email, String password) {
    return _dio.post(Endpoints.login, data: {'email': email, 'password': password});
  }

  Future<Response> register(Map<String, dynamic> data) {
    return _dio.post(Endpoints.register, data: data);
  }

  Future<Response> requestOtp(String email) {
    return _dio.post(Endpoints.requestOtp, data: {'email': email});
  }

  Future<Response> verifyOtp(String email, String otp) {
    return _dio.post(Endpoints.verifyOtp, data: {'email': email, 'otp': otp});
  }

  Future<Response> forgotPassword(String email) {
    return _dio.post(Endpoints.forgotPassword, data: {'email': email});
  }

  Future<Response> refreshToken(String refreshToken) {
    return _dio.post(Endpoints.refreshToken, data: {'refresh_token': refreshToken});
  }

  Future<Response> logout() {
    return _dio.post(Endpoints.logout);
  }

  Future<Response> search(String query, {Map<String, dynamic>? params}) {
    final queryParams = {'q': query, ...?params};
    return _dio.get(Endpoints.search, queryParameters: queryParams);
  }

  Future<Response> getCategories() {
    return _dio.get(Endpoints.categories);
  }

  Future<Response> getProviders({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providers, queryParameters: params);
  }

  Future<Response> getProvider(String id) {
    return _dio.get('${Endpoints.providers}/$id');
  }

  Future<Response> getProviderServices(String providerId) {
    return _dio.get('${Endpoints.providers}/$providerId/services');
  }

  Future<Response> getProviderStaff(String providerId) {
    return _dio.get('${Endpoints.providers}/$providerId/staff');
  }

  Future<Response> getProviderAvailability(String providerId, String date) {
    return _dio.get('${Endpoints.providers}/$providerId/availability', queryParameters: {'date': date});
  }

  Future<Response> createHold(Map<String, dynamic> data) {
    return _dio.post(Endpoints.bookingHold, data: data);
  }

  Future<Response> createBooking(Map<String, dynamic> data) {
    return _dio.post(Endpoints.bookings, data: data);
  }

  Future<Response> getBookings({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.bookings, queryParameters: params);
  }

  Future<Response> getBooking(String id) {
    return _dio.get('${Endpoints.bookings}/$id');
  }

  Future<Response> rescheduleBooking(String id, Map<String, dynamic> data) {
    return _dio.put('${Endpoints.bookings}/$id/reschedule', data: data);
  }

  Future<Response> cancelBooking(String id, {String? reason}) {
    return _dio.post('${Endpoints.bookings}/$id/cancel', data: {'reason': reason});
  }

  Future<Response> createPaymentIntent(String bookingId, String method) {
    return _dio.post('$Endpoints.bookings/$bookingId/payment-intents', data: {'payment_method': method});
  }

  Future<Response> getPayment(String id) {
    return _dio.get('${Endpoints.payments}/$id');
  }

  Future<Response> getNotifications({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.notifications, queryParameters: params);
  }

  Future<Response> markNotificationRead(String id) {
    return _dio.put('${Endpoints.notifications}/$id/read');
  }

  Future<Response> markAllNotificationsRead() {
    return _dio.put('${Endpoints.notifications}/read-all');
  }

  Future<Response> updateFcmToken(String token) {
    return _dio.post(Endpoints.fcmToken, data: {'token': token});
  }

  Future<Response> submitSupportTicket(Map<String, dynamic> data) {
    return _dio.post(Endpoints.supportTickets, data: data);
  }

  // Provider dashboard (partner app)
  Future<Response> getPartnerBookings({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerBookings, queryParameters: params);
  }

  Future<Response> updateBookingStatus(String id, String status) {
    return _dio.put('${Endpoints.providerBookings}/$id/status', data: {'status': status});
  }

  Future<Response> getPartnerDashboardStats() {
    return _dio.get(Endpoints.providerDashboardStats);
  }

  Future<Response> getPartnerRecentBookings() {
    return _dio.get(Endpoints.providerRecentBookings);
  }

  Future<Response> getProviderServicesList({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerServices, queryParameters: params);
  }

  Future<Response> getStaff({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerStaff, queryParameters: params);
  }

  Future<Response> addStaff(Map<String, dynamic> data) {
    return _dio.post(Endpoints.providerStaff, data: data);
  }

  Future<Response> updateStaff(String id, Map<String, dynamic> data) {
    return _dio.put('${Endpoints.providerStaff}/$id', data: data);
  }

  Future<Response> deleteStaff(String id) {
    return _dio.delete('${Endpoints.providerStaff}/$id');
  }

  Future<Response> inviteStaff(Map<String, dynamic> data) {
    return _dio.post('${Endpoints.providerStaff}/invite', data: data);
  }

  Future<Response> getCustomers({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerCustomers, queryParameters: params);
  }

  Future<Response> getCalendar({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerCalendar, queryParameters: params);
  }

  Future<Response> getReports({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerReports, queryParameters: params);
  }

  Future<Response> getSettings() {
    return _dio.get(Endpoints.providerSettings);
  }

  Future<Response> updateSettings(Map<String, dynamic> data) {
    return _dio.put(Endpoints.providerSettings, data: data);
  }
}
