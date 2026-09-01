class ProviderRow {
  final String id;
  final String slug;
  final String name;
  final String? category;
  final String? imageUrl;
  final double rating;
  final int reviewCount;
  final String? city;
  final String? address;
  final String? description;
  final num? minPrice;

  const ProviderRow({
    required this.id,
    required this.slug,
    required this.name,
    this.category,
    this.imageUrl,
    required this.rating,
    required this.reviewCount,
    this.city,
    this.address,
    this.description,
    this.minPrice,
  });

  factory ProviderRow.fromJson(Map<String, dynamic> json) => ProviderRow(
        id: json['id'] as String,
        slug: (json['slug'] ?? json['id']) as String,
        name: json['name'] as String,
        category: json['category'] as String?,
        imageUrl: json['imageUrl'] as String?,
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
        city: json['city'] as String?,
        address: json['address'] as String?,
        description: json['description'] as String?,
        minPrice: json['minPrice'] as num?,
      );
}

class ServiceRow {
  final String id;
  final String name;
  final String? description;
  final int price;
  final int durationMinutes;
  final String currency;
  final String? imageUrl;
  final int depositAmount;

  const ServiceRow({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.durationMinutes,
    required this.currency,
    this.imageUrl,
    this.depositAmount = 0,
  });

  factory ServiceRow.fromJson(Map<String, dynamic> json) => ServiceRow(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        price: (json['price'] as num?)?.toInt() ?? 0,
        durationMinutes: (json['duration'] as num?)?.toInt() ?? 0,
        currency: (json['currency'] ?? 'IDR') as String,
        imageUrl: json['imageUrl'] as String?,
        depositAmount: _toInt(json['depositAmount'] ?? json['deposit_amount']),
      );
}

class PublicStaffRow {
  final String id;
  final String name;
  final String? title;
  final String? bio;
  final String? avatar;

  const PublicStaffRow({
    required this.id,
    required this.name,
    this.title,
    this.bio,
    this.avatar,
  });

  factory PublicStaffRow.fromJson(Map<String, dynamic> json) => PublicStaffRow(
        id: json['id'] as String,
        name: json['name'] as String,
        title: json['title'] as String?,
        bio: json['bio'] as String?,
        avatar: json['avatar'] as String?,
      );
}

class SlotRow {
  final String time;
  final bool available;

  const SlotRow({required this.time, required this.available});

  factory SlotRow.fromJson(Map<String, dynamic> json) => SlotRow(
        time: json['time'] as String,
        available: json['available'] == true,
      );
}

class BookingRow {
  final String id;
  final String bookingCode;
  final String status;
  final String currency;
  final int subtotal;
  final int discount;
  final int tax;
  final int fee;
  final int total;
  final int depositAmount;
  final bool depositRequired;
  final DateTime? cancelDeadline;
  final int rescheduleCount;
  final int maxReschedule;
  final String? cancelPolicy;
  final int version;
  final DateTime? startsAt;
  final DateTime? endsAt;
  final DateTime? createdAt;
  final String? confirmationPin;
  final bool? pinVerified;

  const BookingRow({
    required this.id,
    required this.bookingCode,
    required this.status,
    required this.currency,
    required this.subtotal,
    required this.discount,
    required this.tax,
    required this.fee,
    required this.total,
    this.depositAmount = 0,
    this.depositRequired = false,
    this.cancelDeadline,
    this.rescheduleCount = 0,
    this.maxReschedule = 1,
    this.cancelPolicy,
    this.version = 1,
    this.startsAt,
    this.endsAt,
    this.createdAt,
    this.confirmationPin,
    this.pinVerified,
  });

  factory BookingRow.fromJson(Map<String, dynamic> json) => BookingRow(
        id: json['id'] as String,
        bookingCode: (json['bookingCode'] ?? '') as String,
        status: (json['status'] ?? '') as String,
        currency: (json['currency'] ?? 'IDR') as String,
        subtotal: _toInt(json['subtotal']),
        discount: _toInt(json['discount']),
        tax: _toInt(json['tax']),
        fee: _toInt(json['fee']),
        total: _toInt(json['total']),
        depositAmount: _toInt(json['depositAmount'] ?? json['deposit_amount']),
        depositRequired: json['depositRequired'] == true || json['deposit_required'] == true,
        cancelDeadline: _parseDate(json['cancelDeadline'] ?? json['cancel_deadline']),
        rescheduleCount: _toInt(json['rescheduleCount'] ?? json['reschedule_count']),
        maxReschedule: _toInt(json['maxReschedule'] ?? json['max_reschedule'] ?? 1),
        cancelPolicy: json['cancelPolicy'] as String? ?? json['cancel_policy'] as String?,
        version: _toInt(json['version'] ?? 1),
        startsAt: _parseDate(json['startsAt']),
        endsAt: _parseDate(json['endsAt']),
        createdAt: _parseDate(json['createdAt']),
        confirmationPin: json['confirmationPin'] as String?,
        pinVerified: json['pinVerified'] as bool?,
      );
}

class FaqRow {
  final String id;
  final String question;
  final String answer;
  final String? category;
  final int sortOrder;
  final bool isActive;

  const FaqRow({required this.id, required this.question, required this.answer, this.category, this.sortOrder = 0, this.isActive = true});

  factory FaqRow.fromJson(Map<String, dynamic> json) => FaqRow(
        id: json['id'] as String,
        question: json['question'] as String,
        answer: json['answer'] as String,
        category: json['category'] as String?,
        sortOrder: _toInt(json['sortOrder'] ?? json['sort_order']),
        isActive: json['isActive'] == true || json['is_active'] == true,
      );
}

class PolicyRow {
  final String id;
  final String title;
  final String body;
  final String type;
  final int version;
  final bool isActive;

  const PolicyRow({required this.id, required this.title, required this.body, required this.type, this.version = 1, this.isActive = true});

  factory PolicyRow.fromJson(Map<String, dynamic> json) => PolicyRow(
        id: json['id'] as String,
        title: json['title'] as String,
        body: json['body'] as String,
        type: json['type'] as String,
        version: _toInt(json['version'] ?? 1),
        isActive: json['isActive'] == true || json['is_active'] == true,
      );
}

class NotificationRow {
  final String id;
  final String channel;
  final String subject;
  final String body;
  final bool read;
  final DateTime? createdAt;

  const NotificationRow({
    required this.id,
    required this.channel,
    required this.subject,
    required this.body,
    required this.read,
    this.createdAt,
  });

  factory NotificationRow.fromJson(Map<String, dynamic> json) => NotificationRow(
        id: json['id'] as String,
        channel: (json['channel'] ?? '') as String,
        subject: (json['subject'] ?? '') as String,
        body: (json['body'] ?? '') as String,
        read: json['read'] == true,
        createdAt: _parseDate(json['createdAt']),
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
        createdAt: _parseDate(json['createdAt']),
        updatedAt: _parseDate(json['updatedAt']),
        lastMessageBody: json['lastMessage'] is Map ? (json['lastMessage']['body'] as String?) : null,
        messageCount: _toInt(json['messageCount']),
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
        createdAt: _parseDate(json['createdAt']),
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
  final totalRaw = map['pagination']?['total'];
  int total;
  if (totalRaw is num) {
    total = totalRaw.toInt();
  } else {
    // string "10" etc considered invalid -> fallback to list.length per weird test spec
    total = list.length;
  }
  return PageData(
    items: list.map((e) => fromJson(e as Map<String, dynamic>)).toList(),
    total: total,
  );
}

String formatRupiah(num amount) {
  final value = amount.round().toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]}.',
      );
  return 'Rp $value';
}

DateTime? _parseDate(dynamic v) {
  if (v == null) return null;
  final parsed = DateTime.tryParse(v.toString());
  if (parsed == null) return null;
  // preserve local isUtc false for test expectation where +07:00 should be local
  if (v.toString().contains('+') || v.toString().contains('Z')) {
    return parsed.toLocal();
  }
  return parsed;
}

int _toInt(dynamic v) => (v as num?)?.toInt() ?? 0;
