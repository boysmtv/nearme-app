import 'dart:convert';

class User {
  final String id;
  final String email;
  final String? name;
  final String? phone;
  final String? avatarUrl;
  final String? role;

  const User({
    required this.id,
    required this.email,
    this.name,
    this.phone,
    this.avatarUrl,
    this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        email: json['email'] as String,
        name: json['name'] as String?,
        phone: json['phone'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        role: json['role'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
        if (role != null) 'role': role,
      };
}

class ProviderModel {
  final String id;
  final String name;
  final String? description;
  final String? category;
  final String? imageUrl;
  final double? rating;
  final int? reviewCount;
  final String? address;
  final double? latitude;
  final double? longitude;
  final List<String>? operatingHours;
  final List<Service>? services;
  final List<Staff>? staff;

  const   ProviderModel({
    required this.id,
    required this.name,
    this.description,
    this.category,
    this.imageUrl,
    this.rating,
    this.reviewCount,
    this.address,
    this.latitude,
    this.longitude,
    this.operatingHours,
    this.services,
    this.staff,
  });

  factory ProviderModel.fromJson(Map<String, dynamic> json) => ProviderModel(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        category: json['category'] as String?,
        imageUrl: json['imageUrl'] as String?,
        rating: (json['rating'] as num?)?.toDouble(),
        reviewCount: json['reviewCount'] as int?,
        address: json['address'] as String?,
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        operatingHours: (json['operatingHours'] as List<dynamic>?)?.map((e) => e as String).toList(),
        services: (json['services'] as List<dynamic>?)?.map((e) => Service.fromJson(e as Map<String, dynamic>)).toList(),
        staff: (json['staff'] as List<dynamic>?)?.map((e) => Staff.fromJson(e as Map<String, dynamic>)).toList(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (description != null) 'description': description,
        if (category != null) 'category': category,
        if (imageUrl != null) 'imageUrl': imageUrl,
        if (rating != null) 'rating': rating,
        if (reviewCount != null) 'reviewCount': reviewCount,
        if (address != null) 'address': address,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (operatingHours != null) 'operatingHours': operatingHours,
        if (services != null) 'services': services!.map((e) => e.toJson()).toList(),
        if (staff != null) 'staff': staff!.map((e) => e.toJson()).toList(),
      };
}

class Service {
  final String id;
  final String name;
  final String? description;
  final int price;
  final int durationMinutes;
  final String? imageUrl;
  final String? category;

  const Service({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.durationMinutes,
    this.imageUrl,
    this.category,
  });

  factory Service.fromJson(Map<String, dynamic> json) => Service(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        price: json['price'] as int,
        durationMinutes: json['durationMinutes'] as int,
        imageUrl: json['imageUrl'] as String?,
        category: json['category'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (description != null) 'description': description,
        'price': price,
        'durationMinutes': durationMinutes,
        if (imageUrl != null) 'imageUrl': imageUrl,
        if (category != null) 'category': category,
      };
}

class Booking {
  final String id;
  final String providerId;
  final String serviceId;
  final String customerId;
  final DateTime date;
  final String time;
  final int amount;
  final String status;
  final String? notes;
  final String? cancelReason;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final ProviderModel? provider;
  final Service? service;
  final Staff? staff;
  final Payment? payment;

  const Booking({
    required this.id,
    required this.providerId,
    required this.serviceId,
    required this.customerId,
    required this.date,
    required this.time,
    required this.amount,
    required this.status,
    this.notes,
    this.cancelReason,
    this.createdAt,
    this.updatedAt,
    this.provider,
    this.service,
    this.staff,
    this.payment,
  });

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
        id: json['id'] as String,
        providerId: json['providerId'] as String,
        serviceId: json['serviceId'] as String,
        customerId: json['customerId'] as String,
        date: DateTime.parse(json['date'] as String),
        time: json['time'] as String,
        amount: json['amount'] as int,
        status: json['status'] as String,
        notes: json['notes'] as String?,
        cancelReason: json['cancelReason'] as String?,
        createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
        updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'] as String) : null,
        provider: json['provider'] != null ? ProviderModel.fromJson(json['provider'] as Map<String, dynamic>) : null,
        service: json['service'] != null ? Service.fromJson(json['service'] as Map<String, dynamic>) : null,
        staff: json['staff'] != null ? Staff.fromJson(json['staff'] as Map<String, dynamic>) : null,
        payment: json['payment'] != null ? Payment.fromJson(json['payment'] as Map<String, dynamic>) : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'providerId': providerId,
        'serviceId': serviceId,
        'customerId': customerId,
        'date': date.toIso8601String(),
        'time': time,
        'amount': amount,
        'status': status,
        if (notes != null) 'notes': notes,
        if (cancelReason != null) 'cancelReason': cancelReason,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
        if (provider != null) 'provider': provider!.toJson(),
        if (service != null) 'service': service!.toJson(),
        if (staff != null) 'staff': staff!.toJson(),
        if (payment != null) 'payment': payment!.toJson(),
      };
}

class TimeSlot {
  final String time;
  final bool isAvailable;
  final String? staffId;

  const TimeSlot({
    required this.time,
    required this.isAvailable,
    this.staffId,
  });

  factory TimeSlot.fromJson(Map<String, dynamic> json) => TimeSlot(
        time: json['time'] as String,
        isAvailable: json['isAvailable'] as bool,
        staffId: json['staffId'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'time': time,
        'isAvailable': isAvailable,
        if (staffId != null) 'staffId': staffId,
      };
}

class Payment {
  final String id;
  final String bookingId;
  final int amount;
  final String method;
  final String status;
  final DateTime? paidAt;
  final String? transactionId;
  final String? paymentUrl;

  const Payment({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.method,
    required this.status,
    this.paidAt,
    this.transactionId,
    this.paymentUrl,
  });

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
        id: json['id'] as String,
        bookingId: json['bookingId'] as String,
        amount: json['amount'] as int,
        method: json['method'] as String,
        status: json['status'] as String,
        paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt'] as String) : null,
        transactionId: json['transactionId'] as String?,
        paymentUrl: json['paymentUrl'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'bookingId': bookingId,
        'amount': amount,
        'method': method,
        'status': status,
        if (paidAt != null) 'paidAt': paidAt!.toIso8601String(),
        if (transactionId != null) 'transactionId': transactionId,
        if (paymentUrl != null) 'paymentUrl': paymentUrl,
      };
}

class AppNotification {
  final String id;
  final String title;
  final String message;
  final String? type;
  final bool isRead;
  final DateTime? createdAt;
  final Map<String, dynamic>? data;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    this.type,
    required this.isRead,
    this.createdAt,
    this.data,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] as String,
        title: json['title'] as String,
        message: json['message'] as String,
        type: json['type'] as String?,
        isRead: json['isRead'] as bool,
        createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
        data: json['data'] as Map<String, dynamic>?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'message': message,
        if (type != null) 'type': type,
        'isRead': isRead,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (data != null) 'data': data,
      };
}

class Staff {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? role;
  final String? status;
  final String? avatarUrl;
  final double? rating;
  final int? bookingsCompleted;

  const Staff({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.role,
    this.status,
    this.avatarUrl,
    this.rating,
    this.bookingsCompleted,
  });

  factory Staff.fromJson(Map<String, dynamic> json) => Staff(
        id: json['id'] as String,
        name: json['name'] as String,
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        role: json['role'] as String?,
        status: json['status'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        rating: (json['rating'] as num?)?.toDouble(),
        bookingsCompleted: json['bookingsCompleted'] as int?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (role != null) 'role': role,
        if (status != null) 'status': status,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
        if (rating != null) 'rating': rating,
        if (bookingsCompleted != null) 'bookingsCompleted': bookingsCompleted,
      };
}

class Earnings {
  final int totalEarnings;
  final int thisWeek;
  final int thisMonth;
  final List<Transaction>? recentTransactions;

  const Earnings({
    required this.totalEarnings,
    required this.thisWeek,
    required this.thisMonth,
    this.recentTransactions,
  });

  factory Earnings.fromJson(Map<String, dynamic> json) => Earnings(
        totalEarnings: json['totalEarnings'] as int,
        thisWeek: json['thisWeek'] as int,
        thisMonth: json['thisMonth'] as int,
        recentTransactions: (json['recentTransactions'] as List<dynamic>?)
            ?.map((e) => Transaction.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'totalEarnings': totalEarnings,
        'thisWeek': thisWeek,
        'thisMonth': thisMonth,
        if (recentTransactions != null)
          'recentTransactions': recentTransactions!.map((e) => e.toJson()).toList(),
      };
}

class Transaction {
  final String id;
  final String customerName;
  final String service;
  final int amount;
  final DateTime date;
  final String status;

  const Transaction({
    required this.id,
    required this.customerName,
    required this.service,
    required this.amount,
    required this.date,
    required this.status,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) => Transaction(
        id: json['id'] as String,
        customerName: json['customerName'] as String,
        service: json['service'] as String,
        amount: json['amount'] as int,
        date: DateTime.parse(json['date'] as String),
        status: json['status'] as String,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'customerName': customerName,
        'service': service,
        'amount': amount,
        'date': date.toIso8601String(),
        'status': status,
      };
}

class Report {
  final int revenue;
  final int bookings;
  final int customers;
  final double avgRating;
  final List<ServiceStat>? popularServices;
  final List<StaffStat>? topStaff;

  const Report({
    required this.revenue,
    required this.bookings,
    required this.customers,
    required this.avgRating,
    this.popularServices,
    this.topStaff,
  });

  factory Report.fromJson(Map<String, dynamic> json) => Report(
        revenue: json['revenue'] as int,
        bookings: json['bookings'] as int,
        customers: json['customers'] as int,
        avgRating: (json['avgRating'] as num).toDouble(),
        popularServices: (json['popularServices'] as List<dynamic>?)
            ?.map((e) => ServiceStat.fromJson(e as Map<String, dynamic>))
            .toList(),
        topStaff: (json['topStaff'] as List<dynamic>?)
            ?.map((e) => StaffStat.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'revenue': revenue,
        'bookings': bookings,
        'customers': customers,
        'avgRating': avgRating,
        if (popularServices != null)
          'popularServices': popularServices!.map((e) => e.toJson()).toList(),
        if (topStaff != null) 'topStaff': topStaff!.map((e) => e.toJson()).toList(),
      };
}

class ServiceStat {
  final String name;
  final int count;
  final String revenue;
  final int percentage;

  const ServiceStat({
    required this.name,
    required this.count,
    required this.revenue,
    required this.percentage,
  });

  factory ServiceStat.fromJson(Map<String, dynamic> json) => ServiceStat(
        name: json['name'] as String,
        count: json['count'] as int,
        revenue: json['revenue'] as String,
        percentage: json['percentage'] as int,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'count': count,
        'revenue': revenue,
        'percentage': percentage,
      };
}

class StaffStat {
  final String name;
  final int bookings;
  final double rating;
  final int rank;

  const StaffStat({
    required this.name,
    required this.bookings,
    required this.rating,
    required this.rank,
  });

  factory StaffStat.fromJson(Map<String, dynamic> json) => StaffStat(
        name: json['name'] as String,
        bookings: json['bookings'] as int,
        rating: (json['rating'] as num).toDouble(),
        rank: json['rank'] as int,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'bookings': bookings,
        'rating': rating,
        'rank': rank,
      };
}

class Category {
  final String id;
  final String name;
  final String? icon;
  final String? imageUrl;

  const Category({
    required this.id,
    required this.name,
    this.icon,
    this.imageUrl,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as String,
        name: json['name'] as String,
        icon: json['icon'] as String?,
        imageUrl: json['imageUrl'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (icon != null) 'icon': icon,
        if (imageUrl != null) 'imageUrl': imageUrl,
      };
}

class PaginatedResponse<T> {
  final List<T> data;
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginatedResponse({
    required this.data,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) =>
      PaginatedResponse(
        data: (json['data'] as List<dynamic>).map(fromJsonT).toList(),
        page: json['page'] as int,
        limit: json['limit'] as int,
        total: json['total'] as int,
        totalPages: json['totalPages'] as int,
      );

  Map<String, dynamic> toJson(Map<String, dynamic> Function(T) toJsonT) => {
        'data': data.map(toJsonT).toList(),
        'page': page,
        'limit': limit,
        'total': total,
        'totalPages': totalPages,
      };
}

class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;

  const ApiResponse({
    required this.success,
    this.message,
    this.data,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) =>
      ApiResponse(
        success: json['success'] as bool,
        message: json['message'] as String?,
        data: json['data'] != null && fromJsonT != null
            ? fromJsonT(json['data'])
            : json['data'] as T?,
      );

  Map<String, dynamic> toJson(Map<String, dynamic> Function(T)? toJsonT) => {
        'success': success,
        if (message != null) 'message': message,
        if (data != null && toJsonT != null) 'data': toJsonT(data as T),
      };
}
