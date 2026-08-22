import 'package:freezed_annotation/freezed_annotation.dart';

part 'models.freezed.dart';
part 'models.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    String? name,
    String? phone,
    String? avatarUrl,
    String? role,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@freezed
class Provider with _$Provider {
  const factory Provider({
    required String id,
    required String name,
    String? description,
    String? category,
    String? imageUrl,
    double? rating,
    int? reviewCount,
    String? address,
    double? latitude,
    double? longitude,
    List<String>? operatingHours,
    List<Service>? services,
    List<Staff>? staff,
  }) = _Provider;

  factory Provider.fromJson(Map<String, dynamic> json) => _$ProviderFromJson(json);
}

@freezed
class Service with _$Service {
  const factory Service({
    required String id,
    required String name,
    String? description,
    required int price,
    required int durationMinutes,
    String? imageUrl,
    String? category,
  }) = _Service;

  factory Service.fromJson(Map<String, dynamic> json) => _$ServiceFromJson(json);
}

@freezed
class Booking with _$Booking {
  const factory Booking({
    required String id,
    required String providerId,
    required String serviceId,
    required String customerId,
    required DateTime date,
    required String time,
    required int amount,
    required String status,
    String? notes,
    String? cancelReason,
    DateTime? createdAt,
    DateTime? updatedAt,
    Provider? provider,
    Service? service,
    Staff? staff,
    Payment? payment,
  }) = _Booking;

  factory Booking.fromJson(Map<String, dynamic> json) => _$BookingFromJson(json);
}

@freezed
class TimeSlot with _$TimeSlot {
  const factory TimeSlot({
    required String time,
    required bool isAvailable,
    String? staffId,
  }) = _TimeSlot;

  factory TimeSlot.fromJson(Map<String, dynamic> json) => _$TimeSlotFromJson(json);
}

@freezed
class Payment with _$Payment {
  const factory Payment({
    required String id,
    required String bookingId,
    required int amount,
    required String method,
    required String status,
    DateTime? paidAt,
    String? transactionId,
    String? paymentUrl,
  }) = _Payment;

  factory Payment.fromJson(Map<String, dynamic> json) => _$PaymentFromJson(json);
}

@freezed
class AppNotification with _$AppNotification {
  const factory AppNotification({
    required String id,
    required String title,
    required String message,
    String? type,
    required bool isRead,
    DateTime? createdAt,
    Map<String, dynamic>? data,
  }) = _AppNotification;

  factory AppNotification.fromJson(Map<String, dynamic> json) => _$AppNotificationFromJson(json);
}

@freezed
class Staff with _$Staff {
  const factory Staff({
    required String id,
    required String name,
    String? email,
    String? phone,
    String? role,
    String? status,
    String? avatarUrl,
    double? rating,
    int? bookingsCompleted,
  }) = _Staff;

  factory Staff.fromJson(Map<String, dynamic> json) => _$StaffFromJson(json);
}

@freezed
class Earnings with _$Earnings {
  const factory Earnings({
    required int totalEarnings,
    required int thisWeek,
    required int thisMonth,
    List<Transaction>? recentTransactions,
  }) = _Earnings;

  factory Earnings.fromJson(Map<String, dynamic> json) => _$EarningsFromJson(json);
}

@freezed
class Transaction with _$Transaction {
  const factory Transaction({
    required String id,
    required String customerName,
    required String service,
    required int amount,
    required DateTime date,
    required String status,
  }) = _Transaction;

  factory Transaction.fromJson(Map<String, dynamic> json) => _$TransactionFromJson(json);
}

@freezed
class Report with _$Report {
  const factory Report({
    required int revenue,
    required int bookings,
    required int customers,
    required double avgRating,
    List<ServiceStat>? popularServices,
    List<StaffStat>? topStaff,
  }) = _Report;

  factory Report.fromJson(Map<String, dynamic> json) => _$ReportFromJson(json);
}

@freezed
class ServiceStat with _$ServiceStat {
  const factory ServiceStat({
    required String name,
    required int count,
    required String revenue,
    required int percentage,
  }) = _ServiceStat;

  factory ServiceStat.fromJson(Map<String, dynamic> json) => _$ServiceStatFromJson(json);
}

@freezed
class StaffStat with _$StaffStat {
  const factory StaffStat({
    required String name,
    required int bookings,
    required double rating,
    required int rank,
  }) = _StaffStat;

  factory StaffStat.fromJson(Map<String, dynamic> json) => _$StaffStatFromJson(json);
}

@freezed
class Category with _$Category {
  const factory Category({
    required String id,
    required String name,
    String? icon,
    String? imageUrl,
  }) = _Category;

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
}

@freezed
class PaginatedResponse<T> with _$PaginatedResponse {
  const factory PaginatedResponse({
    required List<T> data,
    required int page,
    required int limit,
    required int total,
    required int totalPages,
  }) = _PaginatedResponse;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) => _$PaginatedResponseFromJson(json, fromJsonT);
}

@freezed
class ApiResponse<T> with _$ApiResponse {
  const factory ApiResponse({
    required bool success,
    String? message,
    T? data,
  }) = _ApiResponse;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);
}
