class Endpoints {
  Endpoints._();

  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String requestOtp = '/auth/request-otp';
  static const String verifyOtp = '/auth/verify-otp';
  static const String forgotPassword = '/auth/forgot-password';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';

  static const String search = '/search';
  static const String categories = '/categories';

  static const String providers = '/providers';
  static const String services = '/services';

  static const String bookingHold = '/bookings/hold';
  static const String bookings = '/bookings';

  static const String paymentIntent = '/payments/intent';
  static const String payments = '/payments';

  static const String profile = '/user/profile';
  static const String notifications = '/notifications';
  static const String fcmToken = '/fcm-token';
  static const String supportTickets = '/support/tickets';

  static const String partnerBookings = '/partner/bookings';
  static const String partnerEarnings = '/partner/earnings';
  static const String partnerStaff = '/partner/staff';
  static const String partnerReports = '/partner/reports';
}
