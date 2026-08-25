class Endpoints {
  Endpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String requestOtp = '/auth/otp/request';
  static const String verifyOtp = '/auth/otp/verify';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';

  // Public discovery
  static const String search = '/public/providers';
  static const String categories = '/public/categories';
  static const String featuredProviders = '/public/providers/featured';
  static const String providers = '/public/providers';
  static const String publicBookings = '/public/bookings';

  // Bookings
  static const String bookingHold = '/bookings/holds';
  static const String bookings = '/bookings';

  // Payments
  static const String payments = '/payments';

  // Provider dashboard
  static const String providerDashboardStats = '/provider/dashboard/stats';
  static const String providerRecentBookings = '/provider/dashboard/recent-bookings';
  static const String providerBookings = '/provider/bookings';
  static const String providerServices = '/provider/services';
  static const String providerStaff = '/provider/staff';
  static const String providerCustomers = '/provider/customers';
  static const String providerCalendar = '/provider/calendar';
  static const String providerReports = '/provider/reports';
  static const String providerSettings = '/provider/settings';

  // Support
  static const String supportCases = '/support/cases';

  // Notifications (device tokens)
  static const String notifications = '/notifications';
  static const String fcmToken = '/devices/token';
}
