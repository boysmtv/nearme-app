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
  final List<String>? specialties;

  const PartnerStaffRow({
    required this.id,
    this.userId,
    required this.displayName,
    this.title,
    this.bio,
    this.avatarUrl,
    required this.isActive,
    this.specialties,
  });

  factory PartnerStaffRow.fromJson(Map<String, dynamic> json) {
    List<String>? specs;
    final raw = json['specialties'];
    if (raw is String && raw.isNotEmpty) {
      specs = raw.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    } else if (raw is List) {
      specs = raw.cast<String>();
    }
    return PartnerStaffRow(
      id: json['id'] as String,
      userId: json['userId'] as String?,
      displayName: (json['displayName'] ?? '') as String,
      title: json['title'] as String?,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      isActive: json['isActive'] == true,
      specialties: specs,
    );
  }
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

class ConversationRow {
  final String id;
  final String? bookingId;
  final String tenantId;
  final String customerId;
  final String providerId;
  final String? subject;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? lastMessageBody;
  final int messageCount;

  const ConversationRow({
    required this.id,
    this.bookingId,
    required this.tenantId,
    required this.customerId,
    required this.providerId,
    this.subject,
    required this.status,
    this.createdAt,
    this.updatedAt,
    this.lastMessageBody,
    this.messageCount = 0,
  });

  factory ConversationRow.fromJson(Map<String, dynamic> json) => ConversationRow(
        id: json['id'] as String,
        bookingId: json['bookingId'] as String?,
        tenantId: (json['tenantId'] ?? '') as String,
        customerId: (json['customerId'] ?? '') as String,
        providerId: (json['providerId'] ?? '') as String,
        subject: json['subject'] as String?,
        status: (json['status'] ?? 'OPEN') as String,
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
        updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'].toString()) : null,
        lastMessageBody: json['lastMessage'] is Map ? (json['lastMessage']['body'] as String?) : null,
        messageCount: (json['messageCount'] as num?)?.toInt() ?? 0,
      );
}

class ChatMessageRow {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderRole;
  final String body;
  final String messageType;
  final String? attachmentUrl;
  final DateTime? createdAt;

  const ChatMessageRow({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderRole,
    required this.body,
    required this.messageType,
    this.attachmentUrl,
    this.createdAt,
  });

  factory ChatMessageRow.fromJson(Map<String, dynamic> json) => ChatMessageRow(
        id: json['id'] as String,
        conversationId: (json['conversationId'] ?? '') as String,
        senderId: (json['senderId'] ?? '') as String,
        senderRole: (json['senderRole'] ?? 'CUSTOMER') as String,
        body: (json['body'] ?? '') as String,
        messageType: (json['messageType'] ?? 'TEXT') as String,
        attachmentUrl: json['attachmentUrl'] as String?,
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      );
}

class AnalyticsRow {
  final List<Map<String, dynamic>> revenueByDay;
  final Map<String, dynamic> bookingsByStatus;
  final Map<String, dynamic> retention;
  final Map<String, dynamic> funnel;
  final List<Map<String, dynamic>> topServices;
  final List<Map<String, dynamic>> staffUtilization;

  const AnalyticsRow({
    required this.revenueByDay,
    required this.bookingsByStatus,
    required this.retention,
    required this.funnel,
    required this.topServices,
    required this.staffUtilization,
  });

  factory AnalyticsRow.fromJson(Map<String, dynamic> json) => AnalyticsRow(
        revenueByDay: (json['revenueByDay'] as List?)?.cast<Map<String, dynamic>>() ?? [],
        bookingsByStatus: (json['bookingsByStatus'] as Map?)?.cast<String, dynamic>() ?? {},
        retention: (json['retention'] as Map?)?.cast<String, dynamic>() ?? {},
        funnel: (json['funnel'] as Map?)?.cast<String, dynamic>() ?? {},
        topServices: (json['topServices'] as List?)?.cast<Map<String, dynamic>>() ?? [],
        staffUtilization: (json['staffUtilization'] as List?)?.cast<Map<String, dynamic>>() ?? [],
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
