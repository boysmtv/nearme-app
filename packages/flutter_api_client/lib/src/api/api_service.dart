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
    return _dio.post(Endpoints.refreshToken, queryParameters: {'refreshToken': refreshToken});
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
    // BookingController uses POST /bookings/{id}/reschedule with expectedVersion
    return _dio.post('${Endpoints.bookings}/$id/reschedule', data: data);
  }

  Future<Response> cancelBooking(String id, {String? reason}) {
    return _dio.post('${Endpoints.bookings}/$id/cancel', data: {'reason': reason});
  }

  Future<Response> getBookingIcs(String id) {
    return _dio.get('${Endpoints.bookings}/$id/ics', options: Options(responseType: ResponseType.plain));
  }

  Future<Response> getBookingCalendarLink(String id) {
    return _dio.get('${Endpoints.bookings}/$id/calendar-link');
  }

  // Bundle B - FAQ & Policies
  Future<Response> getPublicFaqs({String? tenantId, String? category}) {
    return _dio.get(Endpoints.publicFaqs, queryParameters: {
      if (tenantId != null) 'tenantId': tenantId,
      if (category != null) 'category': category,
    });
  }

  Future<Response> getPublicPolicies({String? tenantId, String? type}) {
    return _dio.get(Endpoints.publicPolicies, queryParameters: {
      if (tenantId != null) 'tenantId': tenantId,
      if (type != null) 'type': type,
    });
  }

  Future<Response> getProviderFaqs() {
    return _dio.get(Endpoints.providerFaqs);
  }

  Future<Response> createProviderFaq(Map<String, dynamic> data) {
    return _dio.post(Endpoints.providerFaqs, data: data);
  }

  Future<Response> updateProviderFaq(String id, Map<String, dynamic> data) {
    return _dio.put('${Endpoints.providerFaqs}/$id', data: data);
  }

  Future<Response> deleteProviderFaq(String id) {
    return _dio.delete('${Endpoints.providerFaqs}/$id');
  }

  Future<Response> getProviderPolicies() {
    return _dio.get(Endpoints.providerPolicies);
  }

  Future<Response> createProviderPolicy(Map<String, dynamic> data) {
    return _dio.post(Endpoints.providerPolicies, data: data);
  }

  Future<Response> updateProviderPolicy(String id, Map<String, dynamic> data) {
    return _dio.put('${Endpoints.providerPolicies}/$id', data: data);
  }

  Future<Response> deleteProviderPolicy(String id) {
    return _dio.delete('${Endpoints.providerPolicies}/$id');
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

  Future<Response> getCustomerProfile() {
    return _dio.get(Endpoints.customerProfile);
  }

  Future<Response> updateCustomerProfile(Map<String, dynamic> data) {
    return _dio.put(Endpoints.customerProfile, data: data);
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

  Future<Response> getProviderMedia(String providerId) {
    return _dio.get('${Endpoints.publicProviderMedia}/$providerId/media');
  }

  Future<Response> getStaffPortfolio(String staffId) {
    return _dio.get('${Endpoints.publicStaffMedia}/$staffId/media');
  }

  Future<Response> getProviderGallery() {
    return _dio.get(Endpoints.providerMedia);
  }

  Future<Response> uploadMedia(String filePath, String ownerType, String ownerId, {int sortOrder = 0}) async {
    final form = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
      'ownerType': ownerType,
      'ownerId': ownerId,
      'sortOrder': sortOrder,
    });
    return _dio.post(Endpoints.mediaUpload, data: form);
  }

  Future<Response> deleteMedia(String mediaId) {
    return _dio.delete('${Endpoints.providerMedia}/$mediaId');
  }

  Future<Response> reorderMedia(List<String> orderedIds) {
    return _dio.put('${Endpoints.providerMedia}/reorder', data: {'orderedIds': orderedIds});
  }

  Future<Response> getFavorites() {
    return _dio.get(Endpoints.customerFavorites);
  }

  Future<Response> addFavorite(String staffId) {
    return _dio.post('${Endpoints.customerFavorites}/$staffId');
  }

  Future<Response> removeFavorite(String staffId) {
    return _dio.delete('${Endpoints.customerFavorites}/$staffId');
  }

  Future<Response> getReviewPhotos(String reviewId) {
    return _dio.get('/reviews/$reviewId/photos');
  }

  // Bundle C - Chat
  Future<Response> getChats() {
    return _dio.get(Endpoints.chats);
  }

  Future<Response> getChat(String id) {
    return _dio.get('${Endpoints.chats}/$id');
  }

  Future<Response> createChat(Map<String, dynamic> data) {
    return _dio.post(Endpoints.chats, data: data);
  }

  Future<Response> getChatMessages(String id, {int page = 1, int limit = 50}) {
    return _dio.get('${Endpoints.chats}/$id/messages', queryParameters: {'page': page, 'limit': limit});
  }

  Future<Response> sendChatMessage(String id, Map<String, dynamic> data) {
    return _dio.post('${Endpoints.chats}/$id/messages', data: data);
  }

  Future<Response> getBookingChat(String bookingId) {
    return _dio.get('${Endpoints.bookings}/$bookingId/chat');
  }

  Future<Response> getAnalytics({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerAnalytics, queryParameters: params);
  }

  Future<Response> exportAnalytics({Map<String, dynamic>? params}) {
    return _dio.get(Endpoints.providerReportsExport, queryParameters: params);
  }

  // Provider reviews
  Future<Response> getProviderReviews(String providerId) {
    return _dio.get('${Endpoints.providers}/$providerId/reviews');
  }

  Future<Response> getPartnerReviews({Map<String, dynamic>? params}) {
    return _dio.get('/provider/reviews', queryParameters: params);
  }

  Future<Response> respondToReview(String reviewId, Map<String, dynamic> data) {
    return _dio.post('/provider/reviews/$reviewId/respond', data: data);
  }

  // Provider services management
  Future<Response> createService(Map<String, dynamic> data) {
    return _dio.post(Endpoints.providerServices, data: data);
  }

  Future<Response> updateService(String id, Map<String, dynamic> data) {
    return _dio.put('${Endpoints.providerServices}/$id', data: data);
  }

  Future<Response> deleteService(String id) {
    return _dio.delete('${Endpoints.providerServices}/$id');
  }

  // Customer loyalty
  Future<Response> getCustomerLoyalty() {
    return _dio.get('/customer/loyalty');
  }
}
