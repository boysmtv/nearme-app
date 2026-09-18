class ServiceEntity {
  final String id;
  final String name;
  final String? description;
  final int price;
  final int durationMinutes;
  final String currency;
  final String? imageUrl;
  final int depositAmount;

  const ServiceEntity({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.durationMinutes,
    required this.currency,
    this.imageUrl,
    this.depositAmount = 0,
  });

  factory ServiceEntity.fromJson(Map<String, dynamic> json) {
    // Backend tidak konsisten: endpoint publik mengirim `duration`,
    // endpoint provider/dashboard mengirim `durationMinutes`.
    // Tanpa fallback ini durasi = 0 → endsAt == startsAt → backend 400
    // "Start time must be before end time" di SEMUA booking.
    final durationRaw = json['durationMinutes'] ?? json['duration'];
    return ServiceEntity(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toInt() ?? 0,
      durationMinutes: (durationRaw as num?)?.toInt() ?? 0,
      currency: (json['currency'] ?? 'IDR') as String,
      imageUrl: json['imageUrl'] as String?,
      depositAmount: (json['depositAmount'] as num?)?.toInt() ?? 0,
    );
  }
}
