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

  const ServiceRow({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.durationMinutes,
    required this.currency,
    this.imageUrl,
  });

  factory ServiceRow.fromJson(Map<String, dynamic> json) => ServiceRow(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        price: (json['price'] as num?)?.toInt() ?? 0,
        durationMinutes: (json['duration'] as num?)?.toInt() ?? 0,
        currency: (json['currency'] ?? 'IDR') as String,
        imageUrl: json['imageUrl'] as String?,
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
  final DateTime? startsAt;
  final DateTime? endsAt;
  final DateTime? createdAt;

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
    this.startsAt,
    this.endsAt,
    this.createdAt,
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
        startsAt: _parseDate(json['startsAt']),
        endsAt: _parseDate(json['endsAt']),
        createdAt: _parseDate(json['createdAt']),
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

DateTime? _parseDate(dynamic v) => v == null ? null : DateTime.tryParse(v.toString());

int _toInt(dynamic v) => (v as num?)?.toInt() ?? 0;
