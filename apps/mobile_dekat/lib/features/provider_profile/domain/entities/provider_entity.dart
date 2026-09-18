class ProviderEntity {
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
  final List<LocationEntity> locations;

  const ProviderEntity({
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
    this.locations = const [],
  });

  factory ProviderEntity.fromJson(Map<String, dynamic> json) {
    return ProviderEntity(
      id: json['id'] as String,
      slug: (json['slug'] ?? '') as String,
      name: json['name'] as String,
      category: json['category'] as String?,
      imageUrl: json['imageUrl'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      city: json['city'] as String?,
      address: json['address'] as String?,
      description: json['description'] as String?,
      minPrice: json['minPrice'] as num?,
      locations: ((json['locations'] ?? []) as List)
          .map((e) => LocationEntity.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  String? get firstLocationId =>
      locations.isNotEmpty ? locations.first.id : null;
}

class LocationEntity {
  final String id;
  final String? name;
  final String? address;

  const LocationEntity({required this.id, this.name, this.address});

  factory LocationEntity.fromJson(Map<String, dynamic> json) {
    return LocationEntity(
      id: json['id'] as String,
      name: json['name'] as String?,
      address: json['address'] as String?,
    );
  }
}
