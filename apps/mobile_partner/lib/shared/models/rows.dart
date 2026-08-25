class PartnerBookingRow {
  final String id;
  final String customerName;
  final String serviceName;
  final String status;
  final String time;
  final int amount;
  final String bookingCode;

  const PartnerBookingRow({
    required this.id,
    required this.customerName,
    required this.serviceName,
    required this.status,
    required this.time,
    required this.amount,
    required this.bookingCode,
  });

  factory PartnerBookingRow.fromJson(Map<String, dynamic> json) => PartnerBookingRow(
        id: json['id'] as String,
        customerName: (json['customerName'] ?? '-') as String,
        serviceName: (json['serviceName'] ?? '') as String,
        status: (json['status'] ?? '') as String,
        time: (json['time'] ?? '') as String,
        amount: (json['amount'] as num?)?.toInt() ?? 0,
        bookingCode: (json['bookingCode'] ?? '') as String,
      );
}

class PartnerStaffRow {
  final String id;
  final String? userId;
  final String displayName;
  final String? title;
  final String? bio;
  final String? avatarUrl;
  final bool isActive;

  const PartnerStaffRow({
    required this.id,
    this.userId,
    required this.displayName,
    this.title,
    this.bio,
    this.avatarUrl,
    required this.isActive,
  });

  factory PartnerStaffRow.fromJson(Map<String, dynamic> json) => PartnerStaffRow(
        id: json['id'] as String,
        userId: json['userId'] as String?,
        displayName: (json['displayName'] ?? '') as String,
        title: json['title'] as String?,
        bio: json['bio'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        isActive: json['isActive'] == true,
      );
}

class PartnerReportRow {
  final int totalBookings;
  final int completedBookings;
  final int cancelledBookings;
  final int totalRevenue;
  final double avgRating;
  final String currency;

  const PartnerReportRow({
    required this.totalBookings,
    required this.completedBookings,
    required this.cancelledBookings,
    required this.totalRevenue,
    required this.avgRating,
    required this.currency,
  });

  factory PartnerReportRow.fromJson(Map<String, dynamic> json) => PartnerReportRow(
        totalBookings: (json['totalBookings'] as num?)?.toInt() ?? 0,
        completedBookings: (json['completedBookings'] as num?)?.toInt() ?? 0,
        cancelledBookings: (json['cancelledBookings'] as num?)?.toInt() ?? 0,
        totalRevenue: (json['totalRevenue'] as num?)?.toInt() ?? 0,
        avgRating: (json['avgRating'] as num?)?.toDouble() ?? 0,
        currency: (json['currency'] ?? 'IDR') as String,
      );
}

class PageData<T> {
  final List<T> items;
  final int total;
  const PageData({required this.items, required this.total});
}

PageData<T> parsePaginated<T>(dynamic payload, T Function(Map<String, dynamic>) fromJson) {
  final map = payload as Map<String, dynamic>;
  final list = (map['data'] ?? []) as List;
  return PageData(
    items: list.map((e) => fromJson(e as Map<String, dynamic>)).toList(),
    total: (map['pagination']?['total'] as num?)?.toInt() ?? list.length,
  );
}

String formatRupiah(num amount) {
  final value = amount.round().toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]}.',
      );
  return 'Rp $value';
}
