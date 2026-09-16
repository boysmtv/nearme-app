class CustomerProfile {
  final String id;
  final String? name;
  final String? email;
  final String? phone;
  final String? avatarUrl;
  final bool hasProfile;
  final String? gender;
  final DateTime? birthDate;

  const CustomerProfile({
    required this.id,
    this.name,
    this.email,
    this.phone,
    this.avatarUrl,
    this.hasProfile = false,
    this.gender,
    this.birthDate,
  });

  factory CustomerProfile.fromJson(Map<String, dynamic> json) => CustomerProfile(
        id: json['id'] as String,
        name: json['name'] as String?,
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        hasProfile: json['hasProfile'] == true,
        gender: json['gender'] as String?,
        birthDate: _parseDate(json['birthDate']),
      );

  CustomerProfile copyWith({String? name, String? phone, String? gender, DateTime? birthDate, bool? hasProfile}) =>
      CustomerProfile(
        id: id,
        name: name ?? this.name,
        email: email,
        phone: phone ?? this.phone,
        avatarUrl: avatarUrl,
        hasProfile: hasProfile ?? this.hasProfile,
        gender: gender ?? this.gender,
        birthDate: birthDate ?? this.birthDate,
      );
}

DateTime? _parseDate(dynamic v) {
  if (v == null) return null;
  return DateTime.tryParse(v.toString());
}

class LoyaltyData {
  final int points;
  final String tier;
  final List<LoyaltyTransaction> transactions;

  const LoyaltyData({required this.points, required this.tier, required this.transactions});

  factory LoyaltyData.fromJson(Map<String, dynamic> json) => LoyaltyData(
        points: (json['points'] as num?)?.toInt() ?? 0,
        tier: (json['tier'] ?? 'BRONZE') as String,
        transactions: ((json['transactions'] ?? []) as List)
            .map((e) => LoyaltyTransaction.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class LoyaltyTransaction {
  final String id;
  final String type;
  final int points;
  final String? description;
  final DateTime? createdAt;

  const LoyaltyTransaction({required this.id, required this.type, required this.points, this.description, this.createdAt});

  factory LoyaltyTransaction.fromJson(Map<String, dynamic> json) => LoyaltyTransaction(
        id: json['id'] as String,
        type: (json['type'] ?? '') as String,
        points: (json['points'] as num?)?.toInt() ?? 0,
        description: json['description'] as String?,
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      );
}

class ReviewData {
  final String id;
  final int rating;
  final String? title;
  final String? body;
  final DateTime? createdAt;

  const ReviewData({required this.id, required this.rating, this.title, this.body, this.createdAt});

  factory ReviewData.fromJson(Map<String, dynamic> json) => ReviewData(
        id: json['id'] as String,
        rating: (json['rating'] as num?)?.toInt() ?? 0,
        title: json['title'] as String?,
        body: json['body'] as String?,
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      );
}
